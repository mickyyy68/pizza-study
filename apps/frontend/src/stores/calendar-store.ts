import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { create } from "zustand";
import { client } from "../lib/api";
import { parseEventFromApi, parseTaskFromApi } from "../lib/parse";
import type { CalendarEvent, StudyStats, Task } from "../types";

/**
 * Calendar Store for Pizza Study.
 *
 * Manages calendar and task state including:
 * - Current view date
 * - Selected date
 * - Tasks and events (fetched from API)
 * - Task completion with optimistic updates
 * - Loading and error states
 */

interface CalendarState {
  // Data
  tasks: Task[];
  events: CalendarEvent[];
  stats: StudyStats | null;

  // Loading states
  tasksLoading: boolean;
  eventsLoading: boolean;
  statsLoading: boolean;
  error: string | null;

  // View state
  currentMonth: Date;
  selectedDate: Date;

  // Fetch actions
  fetchTasks: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchStats: () => Promise<void>;

  // Mutation actions
  addTask: (
    task: Omit<Task, "id" | "completed" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addEvent: (
    event: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;

  // UI actions
  setSelectedDate: (date: Date) => void;
  navigateMonth: (direction: "prev" | "next") => void;
  goToToday: () => void;
  clearError: () => void;

  // Computed
  getCalendarDays: () => Date[];
  getTasksForDate: (date: Date) => Task[];
  getEventsForDate: (date: Date) => CalendarEvent[];
  getTodaysTasks: () => Task[];
  getUpcomingEvents: (limit?: number) => CalendarEvent[];
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  // Initialize with empty data (will be fetched from API)
  tasks: [],
  events: [],
  stats: null,

  // Loading states
  tasksLoading: false,
  eventsLoading: false,
  statsLoading: false,
  error: null,

  // Initial view state
  currentMonth: new Date(),
  selectedDate: new Date(),

  // Fetch actions
  fetchTasks: async () => {
    set({ tasksLoading: true, error: null });
    try {
      const res = await client.api.tasks.$get({ query: {} });
      if (!res.ok) {
        throw new Error(`Failed to fetch tasks: ${res.status}`);
      }
      const data = await res.json();
      const tasks = data.map((task) =>
        parseTaskFromApi(task as Parameters<typeof parseTaskFromApi>[0]),
      );
      set({ tasks, tasksLoading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to fetch tasks",
        tasksLoading: false,
      });
    }
  },

  fetchEvents: async () => {
    set({ eventsLoading: true, error: null });
    try {
      const res = await client.api.events.$get({ query: {} });
      if (!res.ok) {
        throw new Error(`Failed to fetch events: ${res.status}`);
      }
      const data = await res.json();
      const events = data.map((event) =>
        parseEventFromApi(event as Parameters<typeof parseEventFromApi>[0]),
      );
      set({ events, eventsLoading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to fetch events",
        eventsLoading: false,
      });
    }
  },

  fetchStats: async () => {
    set({ statsLoading: true });
    try {
      const res = await client.api.tasks.stats.$get();
      if (!res.ok) {
        throw new Error(`Failed to fetch stats: ${res.status}`);
      }
      const stats = await res.json();
      set({ stats, statsLoading: false });
    } catch {
      // Stats failure is non-critical, don't set error
      set({ statsLoading: false });
    }
  },

  // Mutation actions
  addTask: async (task) => {
    try {
      const res = await client.api.tasks.$post({
        json: {
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          tags: task.tags,
          documentId: task.documentId,
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to create task: ${res.status}`);
      }
      const data = await res.json();
      const created = parseTaskFromApi(
        data as Parameters<typeof parseTaskFromApi>[0],
      );
      set((state) => ({ tasks: [...state.tasks, created] }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to create task" });
    }
  },

  toggleTaskComplete: async (taskId) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      ),
    }));

    try {
      const res = await client.api.tasks[":id"].$patch({
        param: { id: taskId },
        json: { completed: !task.completed },
      });
      if (!res.ok) {
        throw new Error(`Failed to update task: ${res.status}`);
      }
      // Refresh stats after completion toggle
      get().fetchStats();
    } catch (e) {
      // Rollback on failure
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: task.completed } : t,
        ),
        error: e instanceof Error ? e.message : "Failed to update task",
      }));
    }
  },

  deleteTask: async (taskId) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    }));

    try {
      const res = await client.api.tasks[":id"].$delete({
        param: { id: taskId },
      });
      if (!res.ok) {
        throw new Error(`Failed to delete task: ${res.status}`);
      }
    } catch (e) {
      // Rollback on failure
      set((state) => ({
        tasks: [...state.tasks, task],
        error: e instanceof Error ? e.message : "Failed to delete task",
      }));
    }
  },

  addEvent: async (event) => {
    try {
      const res = await client.api.events.$post({
        json: {
          title: event.title,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          type: event.type,
          documentIds: event.documentIds,
          color: event.color,
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to create event: ${res.status}`);
      }
      const data = await res.json();
      const created = parseEventFromApi(
        data as Parameters<typeof parseEventFromApi>[0],
      );
      set((state) => ({ events: [...state.events, created] }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to create event" });
    }
  },

  deleteEvent: async (eventId) => {
    const { events } = get();
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    // Optimistic update
    set((state) => ({
      events: state.events.filter((e) => e.id !== eventId),
    }));

    try {
      const res = await client.api.events[":id"].$delete({
        param: { id: eventId },
      });
      if (!res.ok) {
        throw new Error(`Failed to delete event: ${res.status}`);
      }
    } catch (e) {
      // Rollback on failure
      set((state) => ({
        events: [...state.events, event],
        error: e instanceof Error ? e.message : "Failed to delete event",
      }));
    }
  },

  // UI actions
  setSelectedDate: (date) => set({ selectedDate: date, currentMonth: date }),

  navigateMonth: (direction) =>
    set((state) => ({
      currentMonth:
        direction === "next"
          ? addMonths(state.currentMonth, 1)
          : subMonths(state.currentMonth, 1),
    })),

  goToToday: () =>
    set({
      currentMonth: new Date(),
      selectedDate: new Date(),
    }),

  clearError: () => set({ error: null }),

  // Computed: calendar grid days (6 weeks for consistent layout)
  getCalendarDays: () => {
    const { currentMonth } = get();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  },

  // Computed: tasks for a specific date
  getTasksForDate: (date) => {
    const { tasks } = get();
    return tasks.filter((task) => isSameDay(task.dueDate, date));
  },

  // Computed: events for a specific date
  getEventsForDate: (date) => {
    const { events } = get();
    return events.filter((event) => isSameDay(event.date, date));
  },

  // Computed: today's tasks
  getTodaysTasks: () => {
    const { tasks } = get();
    const today = new Date();
    return tasks.filter((task) => isSameDay(task.dueDate, today));
  },

  // Computed: upcoming events
  getUpcomingEvents: (limit = 5) => {
    const { events } = get();
    const now = new Date();

    return events
      .filter((event) => event.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, limit);
  },
}));

/**
 * Helper to format date for display.
 */
export function formatDate(date: Date, formatString: string = "PPP"): string {
  return format(date, formatString);
}
