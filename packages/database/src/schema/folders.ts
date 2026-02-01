import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const folders = pgTable("folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  parentId: uuid("parent_id"),
  color: text("color"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
