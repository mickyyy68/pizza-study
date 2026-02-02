import { zValidator } from "@hono/zod-validator";
import {
  DEFAULT_MODEL_ID,
  isValidModelId,
  openrouter,
  SYSTEM_PROMPT,
} from "@repo/ai";
import { chatRequestSchema } from "@repo/contracts";
import { conversations, db, messages } from "@repo/database";
import { retrieveContext } from "@repo/rag";
import { streamText } from "ai";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

/**
 * Extract the latest user message from the messages array.
 * Returns undefined if no user message is found.
 */
function getLatestUserMessage(
  messages: Array<{ role: string; content: string }>,
): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user" && messages[i].content.trim()) {
      return messages[i].content;
    }
  }
  return undefined;
}

/**
 * Build system prompt with optional RAG context.
 */
function buildSystemPrompt(
  basePrompt: string,
  ragContext: string | null,
): string {
  if (!ragContext) {
    return basePrompt;
  }

  return `${basePrompt}

## Retrieved Study Materials

${ragContext}

Use the above excerpts to answer the user's question when relevant. If the excerpts don't contain relevant information, you can still answer based on your general knowledge, but mention that the information isn't from the user's study materials.`;
}

const chat = new Hono()
  .post("/", zValidator("json", chatRequestSchema), async (c) => {
    const {
      messages: chatMessages,
      conversationId: providedConvoId,
      model: requestedModel,
    } = c.req.valid("json");

    // Validate and select model
    const modelId =
      requestedModel && isValidModelId(requestedModel)
        ? requestedModel
        : DEFAULT_MODEL_ID;
    const selectedModel = openrouter(modelId);
    console.log("[Chat] Using model:", modelId);

    // Get or create conversation
    let conversationId = providedConvoId;
    if (!conversationId) {
      // Extract first user message for title
      const firstUserMsg = chatMessages.find((m) => m.role === "user");
      const title = firstUserMsg?.content.slice(0, 50) || "New conversation";

      const [newConvo] = await db
        .insert(conversations)
        .values({ title })
        .returning();
      conversationId = newConvo.id;
      console.log("[Chat] Created new conversation:", conversationId);
    }

    // Extract the latest user message for RAG and persistence
    const userMessage = getLatestUserMessage(chatMessages);
    let ragContext: string | null = null;

    if (userMessage) {
      console.log(
        "[Chat] Processing message:",
        userMessage.slice(0, 100) + (userMessage.length > 100 ? "..." : ""),
      );

      // Save user message to database
      await db.insert(messages).values({
        conversationId,
        role: "user",
        content: userMessage,
      });

      try {
        console.log("[Chat] Retrieving context...");
        const retrievalResult = await retrieveContext(userMessage, {
          limit: 5,
          threshold: 0.8,
        });

        if (retrievalResult.hasContext) {
          ragContext = retrievalResult.context;
          console.log(
            `[Chat] ✓ Found ${retrievalResult.sources.length} source(s):`,
            retrievalResult.sources.map((s) => s.title).join(", "),
          );
        } else {
          console.log("[Chat] No relevant context found");
        }
      } catch (error) {
        // Log the error but continue without RAG context
        console.error(
          "[Chat] ✗ RAG retrieval failed:",
          error instanceof Error ? error.message : error,
        );
      }
    } else {
      console.log("[Chat] No user message found, skipping RAG");
    }

    // Build system prompt with optional RAG context
    const systemPrompt = buildSystemPrompt(SYSTEM_PROMPT, ragContext);

    const result = streamText({
      model: selectedModel,
      system: systemPrompt,
      messages: chatMessages,
      maxRetries: 0,
      onFinish: async ({ text }) => {
        // Save assistant message after streaming completes
        if (text && conversationId) {
          await db.insert(messages).values({
            conversationId,
            role: "assistant",
            content: text,
          });

          // Update conversation timestamp
          await db
            .update(conversations)
            .set({ updatedAt: new Date() })
            .where(eq(conversations.id, conversationId));

          console.log(
            "[Chat] Saved assistant response to conversation:",
            conversationId,
          );
        }
      },
    });

    // Create response with conversation ID header
    const response = result.toDataStreamResponse({
      getErrorMessage: (error) => {
        console.error("AI chat error:", error);
        if (error instanceof Error) {
          return error.message;
        }
        try {
          return JSON.stringify(error);
        } catch {
          return "Unknown error";
        }
      },
    });

    // Add conversation ID header
    response.headers.set("X-Conversation-Id", conversationId);

    return response;
  })
  // Delete chat conversation (messages cascade)
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    const [deleted] = await db
      .delete(conversations)
      .where(eq(conversations.id, id))
      .returning({ id: conversations.id });

    if (!deleted) {
      return c.json({ error: "Conversation not found" }, 404);
    }

    return c.json({ deleted: true });
  });

export default chat;
