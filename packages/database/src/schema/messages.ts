import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { conversations } from "./conversations";

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role").notNull(), // "user" | "assistant" | "system"
    content: text("content").notNull(),
    citations: jsonb("citations").$type<{ documentId: string; chunk: string }[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("messages_conversation_idx").on(table.conversationId),
    index("messages_created_at_idx").on(table.createdAt),
  ],
);
