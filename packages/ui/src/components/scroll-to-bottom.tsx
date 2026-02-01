import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";

export interface ScrollToBottomProps {
  /** Whether to show the button */
  visible: boolean;
  /** Click handler to scroll to bottom */
  onClick: () => void;
  /** Show new message indicator (bounces the button) */
  hasNewMessages?: boolean;
  /** Number of new messages (optional badge) */
  newMessageCount?: number;
  /** Additional class names */
  className?: string;
}

/**
 * Floating action button that scrolls to the bottom of a chat.
 *
 * Features:
 * - Appears when user scrolls up
 * - Bounces when new messages arrive while scrolled up
 * - Optional badge showing unread message count
 */
export function ScrollToBottom({
  visible,
  onClick,
  hasNewMessages = false,
  newMessageCount,
  className,
}: ScrollToBottomProps) {
  // Track if we should animate (only after first render)
  const [shouldAnimate, setShouldAnimate] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      // Delay animation enable to prevent initial mount animation
      const timer = setTimeout(() => setShouldAnimate(true), 100);
      return () => clearTimeout(timer);
    }
    setShouldAnimate(false);
  }, [visible]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "absolute bottom-4 right-4 z-10",
        "flex items-center justify-center",
        "h-10 w-10 rounded-full",
        "bg-background border shadow-lg",
        "text-muted-foreground hover:text-foreground",
        "transition-all duration-200",
        "hover:shadow-xl hover:scale-105",
        "active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        // Entrance animation
        shouldAnimate && "animate-in fade-in-0 slide-in-from-bottom-4 duration-200",
        // Bounce when new messages
        hasNewMessages && "animate-bounce",
        className
      )}
      aria-label={
        newMessageCount
          ? `Scroll to bottom (${newMessageCount} new messages)`
          : "Scroll to bottom"
      }
    >
      <ChevronDown className="h-5 w-5" />

      {/* New message count badge */}
      {newMessageCount && newMessageCount > 0 && (
        <span
          className={cn(
            "absolute -top-1 -right-1",
            "flex items-center justify-center",
            "min-w-5 h-5 px-1.5 rounded-full",
            "bg-primary text-primary-foreground",
            "text-xs font-medium",
            "animate-in zoom-in-50 duration-150"
          )}
        >
          {newMessageCount > 99 ? "99+" : newMessageCount}
        </span>
      )}
    </button>
  );
}
