import { z } from "zod";

export const calendarEventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  date: z.coerce.date(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  type: z.enum(["study-session", "exam", "deadline", "review"]),
  documentIds: z.array(z.string()),
  color: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createEventSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  type: z.enum(["study-session", "exam", "deadline", "review"]),
  documentIds: z.array(z.string()).default([]),
  color: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export type CalendarEvent = z.infer<typeof calendarEventSchema>;
export type CreateEvent = z.infer<typeof createEventSchema>;
export type UpdateEvent = z.infer<typeof updateEventSchema>;
