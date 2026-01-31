import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    dueDate: timestamp("due_date").notNull(),
    completed: boolean("completed").notNull().default(false),
    priority: text("priority").notNull().default("medium"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    documentId: uuid("document_id"),
    userId: uuid("user_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("tasks_due_date_idx").on(table.dueDate),
    index("tasks_completed_idx").on(table.completed),
  ],
);
