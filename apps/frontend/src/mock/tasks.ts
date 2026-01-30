import type { CalendarEvent, StudyStats, Task } from "../types";

/**
 * Helper to create dates relative to today.
 */
function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Mock tasks for Pizza Study.
 */
export const mockTasks: Task[] = [
  // Today's tasks
  {
    id: "task-1",
    title: "Review Calculus Chapter 3",
    description: "Focus on integration by parts and u-substitution",
    dueDate: daysFromNow(0),
    completed: false,
    priority: "high",
    tags: ["calculus", "study"],
    documentId: "doc-1",
  },
  {
    id: "task-2",
    title: "Complete Physics Problem Set",
    description: "Problems 15-25 from the textbook",
    dueDate: daysFromNow(0),
    completed: true,
    priority: "medium",
    tags: ["physics", "homework"],
  },
  {
    id: "task-3",
    title: "Review matrix multiplication",
    dueDate: daysFromNow(0),
    completed: false,
    priority: "low",
    tags: ["linear-algebra"],
    documentId: "doc-3",
  },

  // Tomorrow's tasks
  {
    id: "task-4",
    title: "Practice eigenvalue problems",
    description: "Do at least 10 problems",
    dueDate: daysFromNow(1),
    completed: false,
    priority: "medium",
    tags: ["linear-algebra", "practice"],
    documentId: "doc-8",
  },
  {
    id: "task-5",
    title: "Read thermodynamics chapter",
    dueDate: daysFromNow(1),
    completed: false,
    priority: "high",
    tags: ["physics", "reading"],
    documentId: "doc-7",
  },

  // This week
  {
    id: "task-6",
    title: "Finish history essay outline",
    dueDate: daysFromNow(3),
    completed: false,
    priority: "medium",
    tags: ["history", "writing"],
  },
  {
    id: "task-7",
    title: "Study for calculus quiz",
    description: "Covers chapters 1-4",
    dueDate: daysFromNow(4),
    completed: false,
    priority: "high",
    tags: ["calculus", "exam"],
    documentId: "doc-1",
  },
  {
    id: "task-8",
    title: "Review Newton's Laws",
    dueDate: daysFromNow(5),
    completed: false,
    priority: "low",
    tags: ["physics", "review"],
    documentId: "doc-4",
  },
];

/**
 * Mock calendar events for Pizza Study.
 */
export const mockEvents: CalendarEvent[] = [
  // Today
  {
    id: "event-1",
    title: "Calculus Study Session",
    date: daysFromNow(0),
    startTime: "14:00",
    endTime: "16:00",
    type: "study-session",
    documentIds: ["doc-1"],
  },
  {
    id: "event-2",
    title: "Physics Office Hours",
    date: daysFromNow(0),
    startTime: "17:00",
    endTime: "18:00",
    type: "review",
  },

  // Tomorrow
  {
    id: "event-3",
    title: "Linear Algebra Quiz",
    date: daysFromNow(1),
    startTime: "10:00",
    endTime: "11:00",
    type: "exam",
    documentIds: ["doc-3", "doc-8"],
  },

  // This week
  {
    id: "event-4",
    title: "History Essay Deadline",
    date: daysFromNow(3),
    type: "deadline",
  },
  {
    id: "event-5",
    title: "Study Group: Physics",
    date: daysFromNow(4),
    startTime: "15:00",
    endTime: "17:00",
    type: "study-session",
    documentIds: ["doc-2", "doc-4"],
  },
  {
    id: "event-6",
    title: "Calculus Midterm",
    date: daysFromNow(7),
    startTime: "09:00",
    endTime: "11:00",
    type: "exam",
    documentIds: ["doc-1", "doc-6"],
  },

  // Next week
  {
    id: "event-7",
    title: "Physics Lab Report Due",
    date: daysFromNow(10),
    type: "deadline",
  },
  {
    id: "event-8",
    title: "History Presentation",
    date: daysFromNow(12),
    startTime: "13:00",
    endTime: "14:00",
    type: "exam",
    documentIds: ["doc-5"],
  },
];

/**
 * Mock study statistics.
 */
export const mockStats: StudyStats = {
  tasksCompletedToday: 3,
  tasksCompletedThisWeek: 12,
  studyStreak: 7,
  documentsReviewed: 5,
  totalStudyMinutes: 180,
};
