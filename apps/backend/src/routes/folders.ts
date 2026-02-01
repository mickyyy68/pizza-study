import { zValidator } from "@hono/zod-validator";
import { db, folders } from "@repo/database";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────────────

const createFolderSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().uuid().nullable().optional(),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

const updateFolderSchema = z.object({
  name: z.string().min(1).optional(),
  parentId: z.string().uuid().nullable().optional(),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

const foldersRoute = new Hono()
  // List all folders
  .get("/", async (c) => {
    const allFolders = await db.select().from(folders);
    return c.json(allFolders);
  })

  // Get single folder
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const [folder] = await db.select().from(folders).where(eq(folders.id, id));

    if (!folder) {
      return c.json({ error: "Folder not found" }, 404);
    }

    return c.json(folder);
  })

  // Create folder
  .post("/", zValidator("json", createFolderSchema), async (c) => {
    const data = c.req.valid("json");

    const [created] = await db
      .insert(folders)
      .values({
        name: data.name,
        parentId: data.parentId ?? null,
        color: data.color ?? null,
        icon: data.icon ?? null,
      })
      .returning();

    return c.json(created, 201);
  })

  // Update folder
  .patch("/:id", zValidator("json", updateFolderSchema), async (c) => {
    const id = c.req.param("id");
    const updates = c.req.valid("json");

    // Check folder exists
    const [existing] = await db
      .select()
      .from(folders)
      .where(eq(folders.id, id));

    if (!existing) {
      return c.json({ error: "Folder not found" }, 404);
    }

    const [updated] = await db
      .update(folders)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(folders.id, id))
      .returning();

    return c.json(updated);
  })

  // Delete folder
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    const [deleted] = await db
      .delete(folders)
      .where(eq(folders.id, id))
      .returning({ id: folders.id });

    if (!deleted) {
      return c.json({ error: "Folder not found" }, 404);
    }

    return c.json({ deleted: true });
  });

export default foldersRoute;
