import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    date: timestamp("date").notNull(),
    startTime: text("start_time"),
    endTime: text("end_time"),
    type: text("type").notNull(),
    documentIds: jsonb("document_ids").$type<string[]>().notNull().default([]),
    color: text("color"),
    userId: uuid("user_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("calendar_events_date_idx").on(table.date)],
);
