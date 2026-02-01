import { SparklesIcon, User03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import { cn } from "../lib/utils";
import {
  type Citation,
  CitationSources,
  parseCitations,
} from "./citation";
import { MarkdownRenderer } from "./markdown-renderer";
import { MessageActions } from "./message-actions";
import { MessageErrorBoundary } from "./message-error-boundary";

/**
 * ChatMessage component for Pizza Study.
 *
 * Flat/linear design with:
 * - Full-width rows (no bubbles)
 * - Icon avatars (sparkle for AI, user icon for you)
 * - Hover actions below content
 * - Subtle background differentiation
 */

export interface ChatMessageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role" | "content"> {
  /** Message role (user, assistant, or system) */
  variant?: "user" | "assistant" | "system";
  /** Message content (plain text or markdown) */
  content: string;
  /** Optional timestamp */
  timestamp?: Date;
  /** Show streaming indicator */
  isStreaming?: boolean;
  /** Custom avatar (overrides default icon) */
  avatar?: React.ReactNode;
  /** Citations for this message */
  citations?: Citation[];
  /** Callback when user clicks edit */
  onEdit?: () => void;
  /** Callback when user clicks regenerate */
  onRegenerate?: () => void;
  /** Callback when user clicks a citation source */
  onCitationClick?: (citation: Citation) => void;
}

export function ChatMessage({
  className,
  variant = "assistant",
  content,
  timestamp,
  isStreaming,
  avatar,
  citations = [],
  onEdit,
  onRegenerate,
  onCitationClick,
  ...props
}: ChatMessageProps) {
  const [highlightedCitation, setHighlightedCitation] = React.useState<
    string | null
  >(null);

  const isUser = variant === "user";
  const isAssistant = variant === "assistant";
  const isSystem = variant === "system";

  // Handle citation badge click - scroll to sources
  const handleCitationClick = (citationId: string) => {
    setHighlightedCitation(citationId);
    const sourceEl = document.getElementById(`source-${citationId}`);
    sourceEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlightedCitation(null), 2000);
  };

  // Render content with citations for assistant messages
  const renderContent = () => {
    if (isUser || isSystem) {
      return <div className="whitespace-pre-wrap break-words">{content}</div>;
    }

    // Assistant messages: markdown with citations
    const citationMatches = parseCitations(content);
    let processedContent = content;

    citationMatches.forEach((match, i) => {
      processedContent = processedContent.replace(
        `[[cite:${match.id}]]`,
        `‹CITE:${match.id}:${i}›`,
      );
    });

    return (
      <MessageErrorBoundary fallbackContent={content}>
        <div className="space-y-3">
          <MarkdownRenderer content={processedContent} />
          {citations.length > 0 && (
            <CitationSources
              citations={citations}
              highlightedId={highlightedCitation || undefined}
              onSourceClick={onCitationClick}
            />
          )}
        </div>
      </MessageErrorBoundary>
    );
  };

  // Default avatar icons
  const defaultAvatar = isUser ? (
    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
      <HugeiconsIcon icon={User03Icon} size={16} className="text-primary" />
    </div>
  ) : (
    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
      <HugeiconsIcon icon={SparklesIcon} size={16} className="text-primary" />
    </div>
  );

  // System messages (centered, no avatar)
  if (isSystem) {
    return (
      <div
        className={cn(
          "flex justify-center py-2 animate-in fade-in-0 duration-200",
          className,
        )}
        role="article"
        aria-label="System message"
        {...props}
      >
        <div className="text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative py-6 animate-in fade-in-0 duration-200",
        isAssistant && "bg-muted/40",
        className,
      )}
      role="article"
      aria-label={`${variant} message`}
      {...props}
    >
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="shrink-0 pt-0.5">
            {avatar || defaultAvatar}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Role label */}
            <div className="text-sm font-medium text-foreground">
              {isUser ? "You" : "Assistant"}
            </div>

            {/* Message content */}
            <div className="text-sm text-foreground/90 leading-relaxed">
              {renderContent()}

              {/* Streaming indicator */}
              {isStreaming && (
                <span className="inline-flex gap-1 ml-1 align-middle">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                </span>
              )}
            </div>

            {/* Actions (show on hover) */}
            {!isStreaming && (
              <MessageActions
                role={isUser ? "user" : "assistant"}
                content={content}
                onEdit={isUser ? onEdit : undefined}
                onRegenerate={isAssistant ? onRegenerate : undefined}
              />
            )}

            {/* Timestamp */}
            {timestamp && !isStreaming && (
              <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {formatTime(timestamp)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Format timestamp for display
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Typing indicator component
 */
export function ChatTypingIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "py-6 bg-muted/30 animate-in fade-in-0 duration-200",
        className,
      )}
    >
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex gap-4">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={SparklesIcon} size={16} className="text-primary" />
          </div>
          <div className="flex-1 pt-1">
            <div className="text-sm font-medium text-foreground mb-2">Assistant</div>
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
