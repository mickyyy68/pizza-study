/**
 * Frontend type definitions for Pizza Study.
 *
 * These types represent the data structures used throughout the app.
 * In production, many of these would come from @repo/contracts.
 */

/* =============================================================================
   Documents
   ============================================================================= */

export interface Document {
  id: string;
  title: string;
  folderId: string | null;
  tags: string[];
  type: "pdf" | "note" | "flashcard-deck" | "image";
  previewUrl?: string;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
  icon?: string;
}

/* =============================================================================
   Tasks & Calendar
   ============================================================================= */

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  priority: "low" | "medium" | "high";
  tags: string[];
  /** Link to related document */
  documentId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  type: "study-session" | "exam" | "deadline" | "review";
  /** Related document IDs */
  documentIds?: string[];
  color?: string;
}

/* =============================================================================
   Chat
   ============================================================================= */

export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

/* =============================================================================
   User & Progress
   ============================================================================= */

export interface StudyStats {
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  studyStreak: number;
  documentsReviewed: number;
  totalStudyMinutes: number;
}

/* =============================================================================
   Navigation
   ============================================================================= */

export interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}
