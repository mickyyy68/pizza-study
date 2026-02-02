import { zValidator } from "@hono/zod-validator";
import { db, documents } from "@repo/database";
import { createDocumentWithEmbeddings } from "@repo/rag";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Maximum file size for PDFs (10MB) */
const MAX_FILE_SIZE_PDF = 10 * 1024 * 1024;

/** Maximum file size for text files (1MB) */
const MAX_FILE_SIZE_TEXT = 1 * 1024 * 1024;

/** Accepted MIME types for file uploads */
const ACCEPTED_MIME_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/pdf",
]);

// ─────────────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────────────

const createDocumentSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

const updateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sanitize filename to prevent path traversal and special character issues.
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .slice(0, 255);
}

/**
 * Extract text content from a PDF file buffer.
 * Uses dynamic import to avoid loading pdf-parse unless needed.
 */
async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: Buffer.from(buffer) });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

const documentsRoute = new Hono()
  .get("/", async (c) => {
    const docs = await db.select().from(documents);
    return c.json(docs);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));

    if (!doc) {
      return c.json({ error: "Document not found" }, 404);
    }

    return c.json(doc);
  })
  .post("/", async (c) => {
    const contentType = c.req.header("Content-Type") || "";

    // ─────────────────────────────────────────────────────────────────────────
    // JSON path (backward compatibility with existing API)
    // ─────────────────────────────────────────────────────────────────────────
    if (contentType.includes("application/json")) {
      const body = await c.req.json();
      const parsed = createDocumentSchema.safeParse(body);

      if (!parsed.success) {
        return c.json(
          { error: "Invalid request", details: parsed.error.flatten() },
          400,
        );
      }

      const { title, content, metadata } = parsed.data;

      console.log("[Documents] Creating document via JSON...");
      console.log("[Documents] Title:", title);
      console.log("[Documents] Content length:", content.length, "chars");

      try {
        const id = await createDocumentWithEmbeddings(title, content, metadata);
        console.log("[Documents] ✓ Document created:", id);
        return c.json({ id }, 201);
      } catch (error) {
        console.error("[Documents] ✗ Failed to create document");
        console.error(
          "[Documents] Error:",
          error instanceof Error ? error.message : error,
        );
        return c.json(
          {
            error: "Failed to create document",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          500,
        );
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FormData path (new file upload with progress support)
    // ─────────────────────────────────────────────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      const formData = await c.req.formData();
      const file = formData.get("file");
      const titleFromForm = formData.get("title");

      // Validate file exists
      if (!file || !(file instanceof File)) {
        return c.json({ error: "No file provided" }, 400);
      }

      // Validate MIME type
      if (!ACCEPTED_MIME_TYPES.has(file.type)) {
        return c.json(
          {
            error: `Unsupported file type: ${file.type}. Accepted: ${[...ACCEPTED_MIME_TYPES].join(", ")}`,
          },
          400,
        );
      }

      // Validate file size
      const isPdf = file.type === "application/pdf";
      const maxSize = isPdf ? MAX_FILE_SIZE_PDF : MAX_FILE_SIZE_TEXT;
      if (file.size > maxSize) {
        const maxSizeLabel = isPdf ? "10MB" : "1MB";
        return c.json({ error: `File exceeds ${maxSizeLabel} limit` }, 400);
      }

      // Extract text content
      let content: string;
      try {
        if (isPdf) {
          content = await extractPdfText(await file.arrayBuffer());
        } else {
          content = await file.text();
        }
      } catch (err) {
        return c.json(
          {
            error: "Failed to read file content",
            details: err instanceof Error ? err.message : "Unknown error",
          },
          400,
        );
      }

      // Validate content is not empty
      if (!content.trim()) {
        return c.json({ error: "File content is empty" }, 400);
      }

      // Build title from form field or filename
      const sanitizedName = sanitizeFilename(file.name);
      const title =
        typeof titleFromForm === "string" && titleFromForm.trim()
          ? titleFromForm.trim()
          : sanitizedName.replace(/\.[^/.]+$/, "");

      // Store file metadata
      const metadata = {
        originalFilename: file.name,
        mimeType: file.type,
        fileSize: file.size,
      };

      console.log("[Documents] Creating document via FormData...");
      console.log("[Documents] Title:", title);
      console.log(
        "[Documents] File:",
        file.name,
        "-",
        file.type,
        "-",
        file.size,
        "bytes",
      );
      console.log("[Documents] Content length:", content.length, "chars");

      try {
        const id = await createDocumentWithEmbeddings(title, content, metadata);
        console.log("[Documents] ✓ Document created:", id);
        return c.json({ id }, 201);
      } catch (error) {
        console.error("[Documents] ✗ Failed to create document");
        console.error(
          "[Documents] Error:",
          error instanceof Error ? error.message : error,
        );
        if (error && typeof error === "object" && "cause" in error) {
          console.error("[Documents] Cause:", error.cause);
        }
        return c.json(
          {
            error: "Failed to create document",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          500,
        );
      }
    }

    // Unsupported content type
    return c.json(
      {
        error:
          "Unsupported Content-Type. Use application/json or multipart/form-data",
      },
      415,
    );
  })
  .patch("/:id", zValidator("json", updateDocumentSchema), async (c) => {
    const id = c.req.param("id");
    const updates = c.req.valid("json");

    // Check document exists
    const [existing] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));

    if (!existing) {
      return c.json({ error: "Document not found" }, 404);
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updates.title) {
      updateData.title = updates.title;
    }

    if (updates.metadata) {
      // Merge with existing metadata (shallow merge)
      updateData.metadata = {
        ...((existing.metadata as Record<string, unknown>) || {}),
        ...updates.metadata,
      };
    }

    // Update document
    const [updated] = await db
      .update(documents)
      .set(updateData)
      .where(eq(documents.id, id))
      .returning();

    return c.json(updated);
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    const [deleted] = await db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning({ id: documents.id });

    if (!deleted) {
      return c.json({ error: "Document not found" }, 404);
    }

    return c.json({ deleted: true });
  });

export default documentsRoute;
