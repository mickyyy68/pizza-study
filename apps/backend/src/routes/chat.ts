import { zValidator } from "@hono/zod-validator";
import {
  DEFAULT_MODEL_ID,
  isValidModelId,
  openrouter,
  SYSTEM_PROMPT,
} from "@repo/ai";
import { chatRequestSchema } from "@repo/contracts";
import {
  conversations,
  db,
  type MessageCitation,
  messages,
} from "@repo/database";
import { type RetrievalCitation, retrieveContext } from "@repo/rag";
import { StreamData, streamText } from "ai";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

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
 * Parse [[cite:N]] markers from model output.
 * Returns unique citation numbers that are valid (within maxCitations range).
 * Invalid or out-of-range markers are silently ignored.
 */
function parseCiteMarkers(text: string, maxCitations: number): number[] {
  const regex = /\[\[cite:(\d+)\]\]/g;
  const cited = new Set<number>();

  let match;
  while ((match = regex.exec(text)) !== null) {
    const num = parseInt(match[1], 10);
    // Only include valid citation numbers (1-indexed, within range)
    if (num >= 1 && num <= maxCitations) {
      cited.add(num);
    }
  }

  return Array.from(cited).sort((a, b) => a - b);
}

/** Maximum length for quote preview in citations */
const MAX_QUOTE_LENGTH = 200;

/**
 * Build MessageCitation objects from retrieval citations based on cited numbers.
 * Only includes citations that were actually referenced in the response.
 */
function buildMessageCitations(
  citedNumbers: number[],
  retrievalCitations: RetrievalCitation[],
): MessageCitation[] {
  return citedNumbers
    .map((num) => {
      // Citation numbers are 1-indexed, array is 0-indexed
      const citation = retrievalCitations[num - 1];
      if (!citation) return null;

      // Trim quote to preview length
      const quote =
        citation.chunk.length > MAX_QUOTE_LENGTH
          ? citation.chunk.slice(0, MAX_QUOTE_LENGTH) + "..."
          : citation.chunk;

      return {
        id: citation.id,
        documentId: citation.documentId,
        documentName: citation.documentName,
        quote,
        locationLabel: `Excerpt ${num}`,
        chunkIndex: citation.chunkIndex,
      };
    })
    .filter((c): c is MessageCitation => c !== null);
}

/**
 * Build system prompt with optional RAG context and citation instructions.
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

## Citation Instructions

When answering, follow these rules:

1. **Cite your sources**: When you use information from the excerpts above, add a citation marker immediately after the statement using the format \`[[cite:N]]\` where N is the excerpt number shown in brackets (e.g., [1], [2]).

2. **Be accurate**: Only cite an excerpt if you actually used information from it. Do not cite excerpts you didn't reference.

3. **Disclaim general knowledge**: If you answer using your general knowledge (not from the excerpts), briefly note that the information is not from the user's study materials.

Example response with citations:
"The mitochondria is responsible for producing ATP through cellular respiration [[cite:1]]. This process is essential for providing energy to cells [[cite:2]]."`;
}

const updateChatSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
});

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
    }

    // Extract the latest user message for RAG and persistence
    const userMessage = getLatestUserMessage(chatMessages);
    let ragContext: string | null = null;
    let ragCitations: RetrievalCitation[] = [];

    if (userMessage) {
      // Save user message to database
      await db.insert(messages).values({
        conversationId,
        role: "user",
        content: userMessage,
      });

      try {
        const retrievalResult = await retrieveContext(userMessage, {
          limit: 5,
          threshold: 0.8,
        });

        if (retrievalResult.hasContext) {
          ragContext = retrievalResult.context;
          ragCitations = retrievalResult.citations;
        }
      } catch (error) {
        console.error(
          "[Chat] RAG retrieval failed:",
          error instanceof Error ? error.message : error,
        );
      }
    }

    // Build system prompt with optional RAG context
    const systemPrompt = buildSystemPrompt(SYSTEM_PROMPT, ragContext);

    // Create stream data for sending citations as message annotations
    const data = new StreamData();

    try {
      const result = streamText({
        model: selectedModel,
        system: systemPrompt,
        messages: chatMessages,
        maxRetries: 0,
        onError: (error) => {
          console.error("[Chat] Stream error:", error);
        },
        onFinish: async ({ text }) => {
          try {
            // Save assistant message after streaming completes
            if (text && conversationId) {
              // Parse citation markers and build citation objects
              const citedNumbers = parseCiteMarkers(text, ragCitations.length);
              const citations = buildMessageCitations(citedNumbers, ragCitations);

              if (citations.length > 0) {
                // Stream citations to client as message annotation
                // Use JSON round-trip to create plain object compatible with JSONValue
                const annotationData = JSON.parse(
                  JSON.stringify({ type: "citations", citations }),
                );
                data.appendMessageAnnotation(annotationData);
              }

              await db.insert(messages).values({
                conversationId,
                role: "assistant",
                content: text,
                citations: citations.length > 0 ? citations : undefined,
              });

              // Update conversation timestamp
              await db
                .update(conversations)
                .set({ updatedAt: new Date() })
                .where(eq(conversations.id, conversationId));
            }
          } catch (error) {
            console.error("[Chat] Error saving message:", error);
          } finally {
            data.close();
          }
        },
      });

      // Create response with conversation ID header and stream data for citations
      const response = result.toDataStreamResponse({
        data,
        getErrorMessage: (error) => {
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
    } catch (error) {
      // Ensure StreamData is closed if an error occurs before streaming starts
      data.close();
      throw error;
    }
  })
  // Update chat metadata (e.g., title)
  .patch("/:id", zValidator("json", updateChatSchema), async (c) => {
    const id = c.req.param("id");
    const { title } = c.req.valid("json");

    const [updated] = await db
      .update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning({ id: conversations.id, title: conversations.title });

    if (!updated) {
      return c.json({ error: "Conversation not found" }, 404);
    }

    return c.json(updated);
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
