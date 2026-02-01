import * as React from "react";
import { cn } from "../lib/utils";

export interface MessageSkeletonProps {
  variant?: "user" | "assistant";
  className?: string;
}

/**
 * Skeleton loader for chat messages.
 * Mimics the shape of a message bubble while loading.
 */
export function MessageSkeleton({
  variant = "assistant",
  className,
}: MessageSkeletonProps) {
  const isUser = variant === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-pulse",
        isUser ? "flex-row-reverse" : "flex-row",
        className,
      )}
    >
      {/* Avatar skeleton */}
      <div className="shrink-0 h-10 w-10 rounded-full bg-muted" />

      {/* Message bubble skeleton */}
      <div
        className={cn(
          "flex flex-col gap-2 rounded-2xl px-4 py-3",
          "max-w-[70%]",
          isUser
            ? "bg-primary/10 rounded-br-md ml-auto"
            : "bg-muted rounded-bl-md mr-auto",
        )}
      >
        {/* Text lines */}
        <div className="h-4 bg-foreground/10 rounded w-48" />
        <div className="h-4 bg-foreground/10 rounded w-36" />
        <div className="h-4 bg-foreground/10 rounded w-24" />
      </div>
    </div>
  );
}

/**
 * Multiple skeleton messages for loading history.
 */
export function MessageSkeletonList({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <MessageSkeleton key={i} variant={i % 2 === 0 ? "assistant" : "user"} />
      ))}
    </div>
  );
}

/**
 * Thinking indicator shown before first token arrives.
 * Matches ChatMessage design: no avatar, role label, blinking cursor.
 */
export function ThinkingIndicator({ className }: { className?: string }) {
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
