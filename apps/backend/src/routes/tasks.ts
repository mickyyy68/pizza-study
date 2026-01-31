import { zValidator } from "@hono/zod-validator";
import { createTaskSchema, updateTaskSchema } from "@repo/contracts";
import { db, tasks } from "@repo/database";
import { and, count, eq, gte, isNotNull, lte, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const querySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

const tasksRoute = new Hono()
  .get("/", zValidator("query", querySchema), async (c) => {
    const { from, to } = c.req.valid("query");

    let query = db.select().from(tasks);

    if (from || to) {
      const conditions = [];
      if (from) {
        conditions.push(gte(tasks.dueDate, new Date(from)));
      }
      if (to) {
        conditions.push(lte(tasks.dueDate, new Date(to)));
      }
      query = query.where(and(...conditions)) as typeof query;
    }

    const results = await query.orderBy(tasks.dueDate);
    return c.json(results);
  })
  // Stats endpoint - MUST be before /:id to avoid being caught by param route
  .get("/stats", async (c) => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    // Tasks completed today
    const [todayResult] = await db
      .select({ count: count() })
      .from(tasks)
      .where(
        and(eq(tasks.completed, true), gte(tasks.updatedAt, startOfToday)),
      );

    // Tasks completed this week
    const [weekResult] = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(eq(tasks.completed, true), gte(tasks.updatedAt, startOfWeek)));

    // Documents reviewed (distinct documentIds from completed tasks)
    const [docsResult] = await db
      .select({ count: sql<number>`count(distinct ${tasks.documentId})` })
      .from(tasks)
      .where(and(eq(tasks.completed, true), isNotNull(tasks.documentId)));

    return c.json({
      tasksCompletedToday: todayResult?.count ?? 0,
      tasksCompletedThisWeek: weekResult?.count ?? 0,
      studyStreak: 0, // TODO: implement streak calculation
      documentsReviewed: Number(docsResult?.count ?? 0),
      totalStudyMinutes: 0, // TODO: calculate from study-session events
    });
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));

    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }

    return c.json(task);
  })
  .post("/", zValidator("json", createTaskSchema), async (c) => {
    const body = c.req.valid("json");

    const [created] = await db
      .insert(tasks)
      .values({
        ...body,
        description: body.description ?? null,
        documentId: body.documentId ?? null,
      })
      .returning();

    return c.json(created, 201);
  })
  .patch("/:id", zValidator("json", updateTaskSchema), async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");

    const [updated] = await db
      .update(tasks)
      .set({
        ...body,
        description: body.description ?? undefined,
        documentId: body.documentId ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Task not found" }, 404);
    }

    return c.json(updated);
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    const [deleted] = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });

    if (!deleted) {
      return c.json({ error: "Task not found" }, 404);
    }

    return c.json({ deleted: true });
  });

export default tasksRoute;
