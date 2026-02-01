import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { MarkdownRenderer } from "./markdown-renderer";
import { MessageActions } from "./message-actions";
import { MessageErrorBoundary } from "./message-error-boundary";
import { Citation, CitationSources, parseCitations, CitationBadge } from "./citation";

/**
 * ChatMessage component for Pizza Study.
 *
 * Displays individual chat messages with:
 * - Role-based styling (user/assistant/system)
 * - Markdown rendering for assistant messages
 * - Citation support with inline badges and sources
 * - Hover actions (copy, edit, regenerate)
 * - Error boundary for graceful failures
 */

const chatMessageVariants = cva(
  [
    "relative px-4 py-3 rounded-2xl",
    "text-sm leading-relaxed",
    "max-w-[85%]",
    "animate-in fade-in-0 duration-200",
  ],
  {
    variants: {
      variant: {
        user: [
          "bg-primary/10 text-foreground",
          "rounded-br-md",
          "ml-auto",
          "slide-in-from-right-2",
        ],
        assistant: [
          "bg-muted text-foreground",
          "rounded-bl-md",
          "mr-auto",
          "slide-in-from-left-2",
        ],
        system: [
          "bg-accent/30 text-accent-foreground",
          "mx-auto text-center",
          "max-w-[90%]",
          "slide-in-from-bottom-2",
        ],
      },
    },
    defaultVariants: {
      variant: "assistant",
    },
  }
);

export interface ChatMessageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role" | "content">,
    VariantProps<typeof chatMessageVariants> {
  /** Message role (user, assistant, or system) */
  role?: "user" | "assistant" | "system";
  /** Message content (plain text or markdown) */
  content: string;
  /** Optional timestamp */
  timestamp?: Date;
  /** Show streaming indicator */
  isStreaming?: boolean;
  /** Avatar to display */
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
  variant,
  role,
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
  const [showTimestamp, setShowTimestamp] = React.useState(false);
  const [highlightedCitation, setHighlightedCitation] = React.useState<string | null>(null);
  const messageRef = React.useRef<HTMLDivElement>(null);

  // Use role as variant if variant not specified
  const messageVariant = variant || role || "assistant";
  const isUser = messageVariant === "user";
  const isAssistant = messageVariant === "assistant";
  const isSystem = messageVariant === "system";

  // Handle citation badge click - scroll to sources
  const handleCitationClick = (citationId: string) => {
    setHighlightedCitation(citationId);
    const sourceEl = document.getElementById(`source-${citationId}`);
    sourceEl?.scrollIntoView({ behavior: "smooth", block: "center" });

    // Clear highlight after animation
    setTimeout(() => setHighlightedCitation(null), 2000);
  };

  // Render content with citations for assistant messages
  const renderContent = () => {
    if (isUser || isSystem) {
      // User and system messages: plain text
      return <div className="whitespace-pre-wrap break-words">{content}</div>;
    }

    // Assistant messages: markdown with citations
    const citationMatches = parseCitations(content);
    let processedContent = content;

    // Replace citation markers with placeholder that won't be processed as markdown
    citationMatches.forEach((match, i) => {
      processedContent = processedContent.replace(
        `[[cite:${match.id}]]`,
        `‹CITE:${match.id}:${i}›`
      );
    });

    return (
      <MessageErrorBoundary fallbackContent={content}>
        <div className="space-y-0">
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

  return (
    <div
      ref={messageRef}
      className={cn(
        "group relative flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
        isSystem && "justify-center"
      )}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
      role="article"
      aria-label={`${messageVariant} message`}
    >
      {/* Avatar */}
      {avatar && !isSystem && (
        <div className="shrink-0 mt-1">{avatar}</div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          chatMessageVariants({ variant: messageVariant }),
          className
        )}
        {...props}
      >
        {/* Message actions (hover) */}
        {!isStreaming && !isSystem && (
          <MessageActions
            role={isUser ? "user" : "assistant"}
            content={content}
            onEdit={isUser ? onEdit : undefined}
            onRegenerate={isAssistant ? onRegenerate : undefined}
          />
        )}

        {/* Content */}
        {renderContent()}

        {/* Streaming indicator */}
        {isStreaming && (
          <span className="inline-flex gap-1 ml-1">
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s] opacity-60" />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s] opacity-60" />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce opacity-60" />
          </span>
        )}

        {/* Timestamp (shown on hover) */}
        {timestamp && !isStreaming && (
          <div
            className={cn(
              "absolute -bottom-5 text-xs text-muted-foreground",
              "transition-opacity duration-150",
              showTimestamp ? "opacity-100" : "opacity-0",
              isUser ? "right-0" : "left-0"
            )}
          >
            {formatTime(timestamp)}
          </div>
        )}
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
    <div className={cn("flex gap-3", className)}>
      <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s] opacity-40" />
          <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s] opacity-40" />
          <span className="w-2 h-2 bg-current rounded-full animate-bounce opacity-40" />
        </div>
      </div>
    </div>
  );
}

export { chatMessageVariants };
