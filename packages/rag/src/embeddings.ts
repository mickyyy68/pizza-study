import { generateEmbedding } from "@repo/ai";
import { db, documents, embeddings } from "@repo/database";
import { type ChunkOptions, chunkText } from "./chunking";

export interface EmbedDocumentOptions extends ChunkOptions {
  documentId: string;
}

/**
 * Generate embeddings for a document's content and store them.
 */
export async function embedDocument(
  content: string,
  options: EmbedDocumentOptions,
): Promise<void> {
  const chunks = chunkText(content, options);

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk);

    await db.insert(embeddings).values({
      documentId: options.documentId,
      chunk,
      embedding,
    });
  }
}

/**
 * Create a document and generate embeddings for it.
 */
export async function createDocumentWithEmbeddings(
  title: string,
  content: string,
  metadata?: Record<string, unknown>,
): Promise<string> {
  const [doc] = await db
    .insert(documents)
    .values({ title, content, metadata })
    .returning({ id: documents.id });

  await embedDocument(content, { documentId: doc.id });

  return doc.id;
}
