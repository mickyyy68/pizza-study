import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { conversations } from "./conversations";

/**
 * Citation reference linking an assistant response to a source document chunk.
 */
export interface MessageCitation {
  /** Citation number as string ("1", "2", etc.) for UI matching */
  id: string;
  /** UUID of the source document */
  documentId: string;
  /** Document title for display */
  documentName: string;
  /** Chunk text excerpt for preview (trimmed) */
  quote: string;
  /** Human-readable label, e.g. "Excerpt 1" */
  locationLabel: string;
  /** Position in retrieval results (0-indexed) */
  chunkIndex: number;
  /** Page number if available from document metadata */
  pageNumber?: number;
}

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role").notNull(), // "user" | "assistant" | "system"
    content: text("content").notNull(),
    citations: jsonb("citations").$type<MessageCitation[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("messages_conversation_idx").on(table.conversationId),
    index("messages_created_at_idx").on(table.createdAt),
  ],
);
