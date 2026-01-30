import { zValidator } from "@hono/zod-validator";
import { db, documents } from "@repo/database";
import { createDocumentWithEmbeddings } from "@repo/rag";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
const createDocumentSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    metadata: z.record(z.unknown()).optional(),
});
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
    .post("/", zValidator("json", createDocumentSchema), async (c) => {
    const { title, content, metadata } = c.req.valid("json");
    const id = await createDocumentWithEmbeddings(title, content, metadata);
    return c.json({ id }, 201);
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
