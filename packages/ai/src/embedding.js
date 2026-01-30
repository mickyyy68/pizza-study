import { createOpenAI } from "@ai-sdk/openai";
import { embed } from "ai";
// Use OpenAI SDK with OpenRouter base URL for embeddings
const openai = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});
// OpenAI text-embedding-3-small produces 1536-dimensional vectors
export const embeddingModel = openai.embedding("text-embedding-3-small");
export async function generateEmbedding(text) {
    const { embedding } = await embed({
        model: embeddingModel,
        value: text,
    });
    return embedding;
}
