import * as React from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "../lib/utils";

/* =============================================================================
   Types
   ============================================================================= */

export interface ChatHistoryItemData {
  id: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
}

/* =============================================================================
   ChatHistoryList - Container for history items
   ============================================================================= */

export interface ChatHistoryListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: ChatHistoryItemData[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  emptyMessage?: string;
}

/**
 * List of previous chat conversations.
 */
export function ChatHistoryList({
  className,
  items,
  currentChatId,
  onSelectChat,
  emptyMessage = "No conversations yet",
  ...props
}: ChatHistoryListProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)} {...props}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground px-2 py-3 text-center">
          {emptyMessage}
        </p>
      ) : (
        <div role="list" aria-label="Chat history">
          {items.map((item) => (
            <ChatHistoryItem
              key={item.id}
              item={item}
              isActive={item.id === currentChatId}
              onClick={() => onSelectChat(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =============================================================================
   ChatHistoryItem - Individual history row
   ============================================================================= */

interface ChatHistoryItemProps {
  item: ChatHistoryItemData;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Single chat history item with preview and metadata.
 */
function ChatHistoryItem({ item, isActive, onClick }: ChatHistoryItemProps) {
  return (
    <button
      type="button"
      role="listitem"
      aria-current={isActive ? "true" : undefined}
      onClick={onClick}
      className={cn(
        "group w-full flex items-start gap-2 rounded-md px-2 py-2 text-left transition-all duration-150",
        "hover:bg-muted/50 hover:-translate-y-px hover:shadow-sm",
        "active:scale-[0.98]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        isActive && "bg-primary/10 border-l-2 border-primary"
      )}
    >
      {/* Icon */}
      <MessageSquare
        className={cn(
          "h-4 w-4 flex-shrink-0 mt-0.5",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Preview */}
        <p
          className={cn(
            "text-sm truncate",
            isActive ? "text-foreground font-medium" : "text-foreground"
          )}
        >
          {item.preview || "New conversation"}
        </p>

        {/* Metadata row */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(item.timestamp)}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {item.messageCount} {item.messageCount === 1 ? "msg" : "msgs"}
          </span>
        </div>
      </div>
    </button>
  );
}

/* =============================================================================
   Utilities
   ============================================================================= */

/**
 * Format a date as a relative time string.
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
