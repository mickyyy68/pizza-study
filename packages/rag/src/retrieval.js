import { generateEmbedding } from "@repo/ai";
import { vectorSearch } from "./search";
/**
 * Full retrieval pipeline: query → embed → search → format context.
 */
export async function retrieve(query, options = {}) {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);
    // Search for similar chunks
    const results = await vectorSearch(queryEmbedding, {
        ...options,
        includeDocument: true,
    });
    // Format context for LLM
    const context = results.map((r, i) => `[${i + 1}] ${r.chunk}`).join("\n\n");
    return { results, context };
}
/**
 * Retrieve context formatted for RAG prompting.
 */
export async function retrieveContext(query, options = {}) {
    const { context } = await retrieve(query, options);
    return context;
}
