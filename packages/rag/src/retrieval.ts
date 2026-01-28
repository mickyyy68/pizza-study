import { generateEmbedding } from "@repo/ai";
import { type SearchOptions, type SearchResult, vectorSearch } from "./search";

export interface RetrievalOptions extends SearchOptions {}

export interface RetrievalResult {
  results: SearchResult[];
  context: string;
}

/**
 * Full retrieval pipeline: query → embed → search → format context.
 */
export async function retrieve(
  query: string,
  options: RetrievalOptions = {},
): Promise<RetrievalResult> {
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
export async function retrieveContext(
  query: string,
  options: RetrievalOptions = {},
): Promise<string> {
  const { context } = await retrieve(query, options);
  return context;
}
