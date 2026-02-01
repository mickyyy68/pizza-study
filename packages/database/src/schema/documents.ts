import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { folders } from "./folders";

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  folderId: uuid("folder_id").references(() => folders.id, { onDelete: "set null" }),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
