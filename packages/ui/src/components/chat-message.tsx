import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * ChatMessage component for Pizza Study.
 *
 * Displays individual chat messages with role-based styling.
 * User messages have terracotta background, assistant messages use muted.
 */

const chatMessageVariants = cva(
  [
    "relative px-4 py-3 rounded-2xl",
    "text-sm leading-relaxed",
    "max-w-[85%]",
    "animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
  ],
  {
    variants: {
      variant: {
        user: [
          "bg-primary text-primary-foreground",
          "rounded-br-md",
          "ml-auto",
        ],
        assistant: ["bg-muted text-foreground", "rounded-bl-md", "mr-auto"],
        system: [
          "bg-accent/30 text-accent-foreground",
          "mx-auto text-center",
          "max-w-[90%]",
        ],
      },
    },
    defaultVariants: {
      variant: "assistant",
    },
  },
);

export interface ChatMessageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "role">,
    VariantProps<typeof chatMessageVariants> {
  /** Message role (user, assistant, or system) */
  role?: "user" | "assistant" | "system";
  /** Message content */
  content: string;
  /** Optional timestamp */
  timestamp?: Date;
  /** Show streaming indicator */
  isStreaming?: boolean;
  /** Avatar to display */
  avatar?: React.ReactNode;
}

export function ChatMessage({
  className,
  variant,
  role,
  content,
  timestamp,
  isStreaming,
  avatar,
  ...props
}: ChatMessageProps) {
  // Use role as variant if variant not specified
  const messageVariant = variant || role || "assistant";

  return (
    <div
      className={cn(
        "flex gap-3",
        messageVariant === "user" ? "flex-row-reverse" : "flex-row",
        messageVariant === "system" && "justify-center",
      )}
    >
      {/* Avatar */}
      {avatar && messageVariant !== "system" && (
        <div className="shrink-0 mt-1">{avatar}</div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          chatMessageVariants({ variant: messageVariant }),
          className,
        )}
        {...props}
      >
        {/* Content */}
        <div className="whitespace-pre-wrap break-words">{content}</div>

        {/* Streaming indicator */}
        {isStreaming && (
          <span className="inline-flex gap-1 ml-1">
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s] opacity-60" />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s] opacity-60" />
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce opacity-60" />
          </span>
        )}

        {/* Timestamp */}
        {timestamp && !isStreaming && (
          <div
            className={cn(
              "mt-1 text-xs opacity-60",
              messageVariant === "user" ? "text-right" : "text-left",
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
