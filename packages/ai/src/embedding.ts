import { createOpenAI } from "@ai-sdk/openai";
import { type EmbeddingModel, embed } from "ai";

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const EMBEDDING_MODEL = "openai/text-embedding-3-small";

// Log configuration on module load
console.log("[Embedding] Initializing embedding module...");
console.log("[Embedding] API Key configured:", OPENROUTER_API_KEY ? "Yes (length: " + OPENROUTER_API_KEY.length + ")" : "NO - MISSING!");
console.log("[Embedding] Base URL:", OPENROUTER_BASE_URL);
console.log("[Embedding] Model:", EMBEDDING_MODEL);

if (!OPENROUTER_API_KEY) {
  console.error("[Embedding] ⚠️  WARNING: OPENROUTER_API_KEY is not set! Embeddings will fail.");
}

/**
 * OpenRouter-compatible OpenAI client for embeddings.
 *
 * OpenRouter's embeddings API is OpenAI-compatible at /api/v1/embeddings.
 * We use the @ai-sdk/openai provider with OpenRouter's base URL.
 */
const openrouterEmbeddings = createOpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: OPENROUTER_BASE_URL,
});

// OpenAI text-embedding-3-small produces 1536-dimensional vectors
// Note: OpenRouter requires the full model path "openai/text-embedding-3-small"
export const embeddingModel: EmbeddingModel<string> =
  openrouterEmbeddings.embedding(EMBEDDING_MODEL);

/**
 * Generate an embedding vector for the given text.
 *
 * @param text - The text to embed
 * @returns 1536-dimensional embedding vector
 * @throws Error with detailed message if embedding fails
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const startTime = Date.now();
  const textPreview = text.length > 100 ? text.slice(0, 100) + "..." : text;

  console.log("[Embedding] Generating embedding...");
  console.log("[Embedding] Text length:", text.length, "chars");
  console.log("[Embedding] Text preview:", textPreview);

  try {
    const { embedding } = await embed({
      model: embeddingModel,
      value: text,
    });

    const duration = Date.now() - startTime;
    console.log("[Embedding] ✓ Success! Generated", embedding.length, "dimensions in", duration, "ms");

    return embedding;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("[Embedding] ✗ Failed after", duration, "ms");
    console.error("[Embedding] Error type:", error?.constructor?.name);
    console.error("[Embedding] Error message:", error instanceof Error ? error.message : String(error));

    // Log full error details for debugging
    if (error && typeof error === "object") {
      console.error("[Embedding] Full error:", JSON.stringify(error, null, 2));
    }

    // Re-throw with more context
    throw new Error(
      `Embedding generation failed: ${error instanceof Error ? error.message : "Unknown error"}. ` +
      `Model: ${EMBEDDING_MODEL}, Text length: ${text.length} chars`
    );
  }
}
