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
  console.log("[RAG] Starting embedDocument for document:", options.documentId);
  console.log("[RAG] Content length:", content.length, "chars");

  const chunks = chunkText(content, options);
  console.log("[RAG] Created", chunks.length, "chunks");

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`[RAG] Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);

    try {
      const embedding = await generateEmbedding(chunk);
      console.log(`[RAG] ✓ Got embedding for chunk ${i + 1} (${embedding.length} dimensions)`);

      await db.insert(embeddings).values({
        documentId: options.documentId,
        chunk,
        embedding,
      });
      console.log(`[RAG] ✓ Stored embedding for chunk ${i + 1}`);
    } catch (error) {
      console.error(`[RAG] ✗ Failed on chunk ${i + 1}/${chunks.length}`);
      console.error("[RAG] Chunk preview:", chunk.slice(0, 100) + "...");
      throw error; // Re-throw to propagate the error
    }
  }

  console.log("[RAG] ✓ All embeddings stored for document:", options.documentId);
}

/**
 * Create a document and generate embeddings for it.
 */
export async function createDocumentWithEmbeddings(
  title: string,
  content: string,
  metadata?: Record<string, unknown>,
): Promise<string> {
  console.log("[RAG] === createDocumentWithEmbeddings ===");
  console.log("[RAG] Title:", title);
  console.log("[RAG] Content length:", content.length, "chars");
  console.log("[RAG] Has metadata:", !!metadata);

  // Step 1: Insert document
  console.log("[RAG] Step 1: Inserting document into database...");
  let doc: { id: string };
  try {
    [doc] = await db
      .insert(documents)
      .values({ title, content, metadata })
      .returning({ id: documents.id });
    console.log("[RAG] ✓ Document inserted with ID:", doc.id);
  } catch (error) {
    console.error("[RAG] ✗ Failed to insert document");
    console.error("[RAG] Database error:", error instanceof Error ? error.message : error);
    throw error;
  }

  // Step 2: Generate and store embeddings
  console.log("[RAG] Step 2: Generating embeddings...");
  try {
    await embedDocument(content, { documentId: doc.id });
    console.log("[RAG] ✓ Embeddings complete for document:", doc.id);
  } catch (error) {
    console.error("[RAG] ✗ Failed to generate embeddings for document:", doc.id);
    console.error("[RAG] Embedding error:", error instanceof Error ? error.message : error);
    // Note: Document is already inserted, but embeddings failed
    // In production, you might want to delete the document or mark it as incomplete
    throw error;
  }

  return doc.id;
}
