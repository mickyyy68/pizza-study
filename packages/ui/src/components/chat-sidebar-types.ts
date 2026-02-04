/** Shared types for chat sidebar components */

export interface SidebarDocument {
  id: string;
  name: string;
  pageCount?: number;
  type?: "pdf" | "doc" | "other";
}

export interface SidebarConversation {
  id: string;
  title: string;
  messageCount: number;
  lastMessageAt: Date;
}
