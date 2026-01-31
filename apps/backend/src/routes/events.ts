import { zValidator } from "@hono/zod-validator";
import { createEventSchema, updateEventSchema } from "@repo/contracts";
import { calendarEvents, db } from "@repo/database";
import { and, eq, gte, lte } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const querySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

const eventsRoute = new Hono()
  .get("/", zValidator("query", querySchema), async (c) => {
    const { from, to } = c.req.valid("query");

    let query = db.select().from(calendarEvents);

    if (from || to) {
      const conditions = [];
      if (from) {
        conditions.push(gte(calendarEvents.date, new Date(from)));
      }
      if (to) {
        conditions.push(lte(calendarEvents.date, new Date(to)));
      }
      query = query.where(and(...conditions)) as typeof query;
    }

    const results = await query.orderBy(calendarEvents.date);
    return c.json(results);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const [event] = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.id, id));

    if (!event) {
      return c.json({ error: "Event not found" }, 404);
    }

    return c.json(event);
  })
  .post("/", zValidator("json", createEventSchema), async (c) => {
    const body = c.req.valid("json");

    const [created] = await db
      .insert(calendarEvents)
      .values({
        ...body,
        startTime: body.startTime ?? null,
        endTime: body.endTime ?? null,
        color: body.color ?? null,
      })
      .returning();

    return c.json(created, 201);
  })
  .patch("/:id", zValidator("json", updateEventSchema), async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");

    const [updated] = await db
      .update(calendarEvents)
      .set({
        ...body,
        startTime: body.startTime ?? undefined,
        endTime: body.endTime ?? undefined,
        color: body.color ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(calendarEvents.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Event not found" }, 404);
    }

    return c.json(updated);
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    const [deleted] = await db
      .delete(calendarEvents)
      .where(eq(calendarEvents.id, id))
      .returning({ id: calendarEvents.id });

    if (!deleted) {
      return c.json({ error: "Event not found" }, 404);
    }

    return c.json({ deleted: true });
  });

export default eventsRoute;
