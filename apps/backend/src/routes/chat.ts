import { zValidator } from "@hono/zod-validator";
import { chatModel, SYSTEM_PROMPT } from "@repo/ai";
import { chatRequestSchema } from "@repo/contracts";
import { retrieveContext } from "@repo/rag";
import { streamText } from "ai";
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
function buildSystemPrompt(basePrompt: string, ragContext: string | null): string {
  if (!ragContext) {
    return basePrompt;
  }

  return `${basePrompt}

## Retrieved Study Materials

${ragContext}

Use the above excerpts to answer the user's question when relevant. If the excerpts don't contain relevant information, you can still answer based on your general knowledge, but mention that the information isn't from the user's study materials.`;
}

const chat = new Hono().post(
  "/",
  zValidator("json", chatRequestSchema),
  async (c) => {
    const { messages } = c.req.valid("json");

    // Extract the latest user message for RAG
    const userMessage = getLatestUserMessage(messages);
    let ragContext: string | null = null;

    if (userMessage) {
      console.log("[Chat] Processing message:", userMessage.slice(0, 100) + (userMessage.length > 100 ? "..." : ""));

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
        console.error("[Chat] ✗ RAG retrieval failed:", error instanceof Error ? error.message : error);
      }
    } else {
      console.log("[Chat] No user message found, skipping RAG");
    }

    // Build system prompt with optional RAG context
    const systemPrompt = buildSystemPrompt(SYSTEM_PROMPT, ragContext);

    const result = streamText({
      model: chatModel,
      system: systemPrompt,
      messages,
      maxRetries: 0,
    });

    return result.toDataStreamResponse({
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
  },
);

export default chat;
