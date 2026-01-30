import { create } from "zustand";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import type { Task, CalendarEvent } from "../types";
import { mockTasks, mockEvents } from "../mock/tasks";

/**
 * Calendar Store for Pizza Study.
 *
 * Manages calendar and task state including:
 * - Current view date
 * - Selected date
 * - Tasks and events
 * - Task completion
 */

interface CalendarState {
  // Data
  tasks: Task[];
  events: CalendarEvent[];

  // View state
  currentMonth: Date;
  selectedDate: Date;

  // Actions
  setSelectedDate: (date: Date) => void;
  navigateMonth: (direction: "prev" | "next") => void;
  goToToday: () => void;
  toggleTaskComplete: (taskId: string) => void;
  addTask: (task: Omit<Task, "id" | "completed">) => void;

  // Computed
  getCalendarDays: () => Date[];
  getTasksForDate: (date: Date) => Task[];
  getEventsForDate: (date: Date) => CalendarEvent[];
  getTodaysTasks: () => Task[];
  getUpcomingEvents: (limit?: number) => CalendarEvent[];
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  // Initialize with mock data
  tasks: mockTasks,
  events: mockEvents,

  // Initial view state
  currentMonth: new Date(),
  selectedDate: new Date(),

  // Actions
  setSelectedDate: (date) => set({ selectedDate: date }),

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

  toggleTaskComplete: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    })),

  addTask: (task) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          ...task,
          id: crypto.randomUUID(),
          completed: false,
        },
      ],
    })),

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
