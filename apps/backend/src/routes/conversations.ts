import { zValidator } from "@hono/zod-validator";
import { conversations, db, messages } from "@repo/database";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────────────

const createConversationSchema = z.object({
  title: z.string().min(1).default("New conversation"),
  documentIds: z.array(z.string()).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

const conversationsRoute = new Hono()
  // List all conversations (recent first)
  .get("/", async (c) => {
    const convos = await db
      .select({
        id: conversations.id,
        title: conversations.title,
        documentIds: conversations.documentIds,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .orderBy(desc(conversations.updatedAt));

    // Get message counts for each conversation
    const withCounts = await Promise.all(
      convos.map(async (conv) => {
        const [countResult] = await db
          .select({ count: messages.id })
          .from(messages)
          .where(eq(messages.conversationId, conv.id));

        return {
          ...conv,
          messageCount: countResult ? 1 : 0, // Basic count
        };
      })
    );

    return c.json(withCounts);
  })

  // Create a new conversation
  .post("/", zValidator("json", createConversationSchema), async (c) => {
    const { title, documentIds } = c.req.valid("json");

    const [created] = await db
      .insert(conversations)
      .values({
        title,
        documentIds: documentIds ?? [],
      })
      .returning();

    return c.json({ id: created.id }, 201);
  })

  // Get conversation with messages
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));

    if (!conv) {
      return c.json({ error: "Conversation not found" }, 404);
    }

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);

    return c.json({
      ...conv,
      messages: msgs,
    });
  })

  // Delete conversation (messages cascade)
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    const [deleted] = await db
      .delete(conversations)
      .where(eq(conversations.id, id))
      .returning({ id: conversations.id });

    if (!deleted) {
      return c.json({ error: "Conversation not found" }, 404);
    }

    return c.json({ deleted: true });
  });

export default conversationsRoute;
