import * as React from "react";
import { cn } from "../lib/utils";
import { type Citation, CitationSources, parseCitations } from "./citation";
import { MarkdownRenderer } from "./markdown-renderer";
import { MessageActions } from "./message-actions";
import { MessageErrorBoundary } from "./message-error-boundary";

/**
 * ChatMessage component for Pizza Study.
 *
 * Clean, ChatGPT-style alternating row design:
 * - Full-width rows with generous whitespace (py-8, max-w-2xl)
 * - No avatars — minimal uppercase role labels with ✦ sparkle for assistant
 * - Icon-only hover actions positioned top-right
 * - Subtle background differentiation (assistant: bg-muted/30)
 * - Optimized typography for long-form study content (text-base, leading-loose)
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
  timestamp: _timestamp,
  isStreaming,
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

  // Handle citation badge click - scroll to sources (not yet wired up)
  const _handleCitationClick = (citationId: string) => {
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
            <div className="mt-4 pt-4 border-t border-border/50">
              <CitationSources
                citations={citations}
                highlightedId={highlightedCitation || undefined}
                onSourceClick={onCitationClick}
              />
            </div>
          )}
        </div>
      </MessageErrorBoundary>
    );
  };

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
        "group relative py-8 animate-in fade-in-0 duration-200",
        isAssistant && "bg-muted/30",
        className,
      )}
      role="article"
      aria-label={`${variant} message`}
      {...props}
    >
      <div className="max-w-2xl mx-auto px-8 space-y-2 relative">
        {/* Actions (show on hover) - positioned top-right */}
        {!isStreaming && (
          <MessageActions
            role={isUser ? "user" : "assistant"}
            content={content}
            onEdit={isUser ? onEdit : undefined}
            onRegenerate={isAssistant ? onRegenerate : undefined}
            className="absolute top-0 right-0"
          />
        )}

        {/* Role label */}
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {isUser ? "You" : "✦ Assistant"}
        </div>

        {/* Message content */}
        <div className="text-base text-foreground leading-loose">
          {renderContent()}

          {/* Streaming indicator */}
          {isStreaming && (
            <span className="inline-block ml-0.5 text-primary animate-pulse">
              █
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Typing indicator component
 */
export function ChatTypingIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "py-8 bg-muted/30 animate-in fade-in-0 duration-200",
        className,
      )}
    >
      <div className="max-w-2xl mx-auto px-8 space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          ✦ Assistant
        </div>
        <div className="text-base text-foreground leading-loose">
          <span className="inline-block text-primary animate-pulse">█</span>
        </div>
      </div>
    </div>
  );
}
