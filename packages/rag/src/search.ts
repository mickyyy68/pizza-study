import { db } from "@repo/database";
import { sql } from "drizzle-orm";

export interface SearchResult {
  id: string;
  documentId: string;
  chunk: string;
  distance: number;
  document?: {
    id: string;
    title: string;
  };
}

export interface SearchOptions {
  limit?: number;
  threshold?: number;
  includeDocument?: boolean;
}

interface SearchRow {
  id: string;
  document_id: string;
  chunk: string;
  distance: number;
  doc_id: string | null;
  doc_title: string | null;
}

/**
 * Search for similar chunks using pgvector cosine distance.
 */
export async function vectorSearch(
  queryEmbedding: number[],
  options: SearchOptions = {},
): Promise<SearchResult[]> {
  const limit = options.limit ?? 5;
  const threshold = options.threshold ?? 0.8;

  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const results = await db.execute(sql`
    SELECT
      e.id,
      e.document_id,
      e.chunk,
      e.embedding <=> ${embeddingStr}::vector AS distance,
      d.id AS doc_id,
      d.title AS doc_title
    FROM embeddings e
    LEFT JOIN documents d ON e.document_id = d.id
    WHERE e.embedding <=> ${embeddingStr}::vector < ${threshold}
    ORDER BY distance
    LIMIT ${limit}
  `);

  return (results as unknown as SearchRow[]).map((row) => ({
    id: row.id,
    documentId: row.document_id,
    chunk: row.chunk,
    distance: row.distance,
    ...(options.includeDocument && row.doc_id
      ? { document: { id: row.doc_id, title: row.doc_title ?? "" } }
      : {}),
  }));
}
