import { generateEmbedding } from "@repo/ai";
import { db, documents } from "@repo/database";
import { count } from "drizzle-orm";
import { type SearchOptions, type SearchResult, vectorSearch } from "./search";

export interface RetrievalOptions extends SearchOptions {
  /** Maximum context length in characters (default: 4000) */
  maxContextLength?: number;
}

/**
 * Structured citation data for a retrieved chunk.
 * Used by the backend to build MessageCitation objects.
 */
export interface RetrievalCitation {
  /** Citation number as string ("1", "2", etc.) matching the [N] in context */
  id: string;
  /** UUID of the source document */
  documentId: string;
  /** Document title for display */
  documentName: string;
  /** Full chunk text */
  chunk: string;
  /** Position in retrieval results (0-indexed) */
  chunkIndex: number;
}

export interface RetrievalResult {
  /** Formatted context string for the prompt */
  context: string;
  /** Source documents for attribution (legacy) */
  sources: { title: string; documentId: string }[];
  /** Structured citations for each numbered excerpt */
  citations: RetrievalCitation[];
  /** Whether any relevant context was found */
  hasContext: boolean;
  /** Raw search results */
  results: SearchResult[];
}

/**
 * Check if any documents exist in the database.
 * Used to skip embedding generation when there's nothing to search.
 */
export async function hasDocuments(): Promise<boolean> {
  console.log("[RAG] Checking if documents exist...");
  const [result] = await db.select({ count: count() }).from(documents);
  const exists = (result?.count ?? 0) > 0;
  console.log(
    `[RAG] Documents exist: ${exists} (count: ${result?.count ?? 0})`,
  );
  return exists;
}

/**
 * Format search results into context for the LLM prompt.
 *
 * Excerpts are numbered [1], [2], etc. so the LLM can reference them
 * using [[cite:N]] markers in its response.
 */
function formatContext(
  results: SearchResult[],
  maxLength: number,
): {
  context: string;
  sources: { title: string; documentId: string }[];
  citations: RetrievalCitation[];
} {
  if (results.length === 0) {
    return { context: "", sources: [], citations: [] };
  }

  const sources: { title: string; documentId: string }[] = [];
  const citations: RetrievalCitation[] = [];
  const seenDocIds = new Set<string>();
  const chunks: string[] = [];
  let totalLength = 0;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const citationNumber = i + 1; // 1-indexed for human readability

    // Track unique sources (legacy)
    if (!seenDocIds.has(result.documentId)) {
      seenDocIds.add(result.documentId);
      sources.push({
        title: result.document?.title ?? "Untitled Document",
        documentId: result.documentId,
      });
    }

    // Format chunk with numbered reference: [N] From "Title":
    const title = result.document?.title ?? "Untitled Document";
    const formattedChunk = `---\n[${citationNumber}] From "${title}":\n${result.chunk}\n`;

    // Check if adding this chunk would exceed max length
    if (totalLength + formattedChunk.length > maxLength) {
      console.log(
        `[RAG] Context truncated at ${chunks.length} chunks (max length: ${maxLength})`,
      );
      break;
    }

    chunks.push(formattedChunk);
    totalLength += formattedChunk.length;

    // Build citation for this chunk
    citations.push({
      id: String(citationNumber),
      documentId: result.documentId,
      documentName: title,
      chunk: result.chunk,
      chunkIndex: i,
    });
  }

  const context =
    chunks.length > 0
      ? `The following numbered excerpts from the user's study materials may be relevant:\n\n${chunks.join("\n")}---`
      : "";

  return { context, sources, citations };
}

/**
 * Full retrieval pipeline: query → embed → search → format context.
 */
export async function retrieve(
  query: string,
  options: RetrievalOptions = {},
): Promise<RetrievalResult> {
  const startTime = Date.now();
  console.log(
    "[RAG] Starting retrieval for query:",
    query.slice(0, 100) + (query.length > 100 ? "..." : ""),
  );

  // Check if there are any documents first
  const docsExist = await hasDocuments();
  if (!docsExist) {
    console.log("[RAG] No documents in database, skipping search");
    return {
      context: "",
      sources: [],
      citations: [],
      hasContext: false,
      results: [],
    };
  }

  // Generate embedding for query
  console.log("[RAG] Generating embedding for query...");
  const queryEmbedding = await generateEmbedding(query);
  console.log(
    `[RAG] Embedding generated (${queryEmbedding.length} dimensions)`,
  );

  // Search for similar chunks
  console.log("[RAG] Searching for similar chunks...");
  const results = await vectorSearch(queryEmbedding, {
    limit: options.limit ?? 5,
    threshold: options.threshold ?? 0.8,
    includeDocument: true,
  });
  console.log(`[RAG] Found ${results.length} relevant chunks`);

  // Format context for LLM with numbered excerpts [1], [2], etc.
  // LLM should use [[cite:N]] markers to reference these excerpts
  const maxLength = options.maxContextLength ?? 4000;
  const { context, sources, citations } = formatContext(results, maxLength);

  const duration = Date.now() - startTime;
  console.log(
    `[RAG] Retrieval complete in ${duration}ms (chunks: ${citations.length}, hasContext: ${results.length > 0})`,
  );

  return {
    context,
    sources,
    citations,
    hasContext: results.length > 0,
    results,
  };
}

/**
 * Retrieve context formatted for RAG prompting.
 * This is a convenience wrapper around retrieve().
 */
export async function retrieveContext(
  query: string,
  options: RetrievalOptions = {},
): Promise<RetrievalResult> {
  return retrieve(query, options);
}
