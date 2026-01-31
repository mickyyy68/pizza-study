import type { CalendarEvent, Task } from "../types";

/**
 * API response types have:
 * - null instead of undefined for optional fields
 * - ISO strings instead of Date objects
 * - string (not enums) for priority/type fields (from Drizzle schema)
 *
 * These utilities convert API responses to frontend types.
 */

interface ApiTask {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  completed: boolean;
  priority: string;
  tags: string[];
  documentId: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiEvent {
  id: string;
  title: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  type: string;
  documentIds: string[];
  color: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function parseTaskFromApi(task: ApiTask): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? undefined,
    dueDate: new Date(task.dueDate),
    completed: task.completed,
    priority: task.priority as Task["priority"],
    tags: task.tags,
    documentId: task.documentId ?? undefined,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  };
}

export function parseEventFromApi(event: ApiEvent): CalendarEvent {
  return {
    id: event.id,
    title: event.title,
    date: new Date(event.date),
    startTime: event.startTime ?? undefined,
    endTime: event.endTime ?? undefined,
    type: event.type as CalendarEvent["type"],
    documentIds: event.documentIds,
    color: event.color ?? undefined,
    createdAt: new Date(event.createdAt),
    updatedAt: new Date(event.updatedAt),
  };
}
