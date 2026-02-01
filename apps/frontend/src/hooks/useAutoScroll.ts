import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook for smart auto-scrolling in chat interfaces.
 *
 * Only auto-scrolls when the user is already at the bottom.
 * Provides a scroll-to-bottom function and tracks scroll position.
 */

interface UseAutoScrollOptions {
  /** Distance from bottom (px) to consider "at bottom". Default: 100 */
  threshold?: number;
  /** Scroll behavior. Default: "smooth" */
  behavior?: ScrollBehavior;
}

interface UseAutoScrollReturn {
  /** Ref to attach to the scrollable container */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Whether the user is currently at/near the bottom */
  isAtBottom: boolean;
  /** Scroll to bottom programmatically */
  scrollToBottom: () => void;
  /** Whether there's content above the viewport (for scroll shadows) */
  canScrollUp: boolean;
  /** Whether there's content below the viewport (for scroll shadows) */
  canScrollDown: boolean;
}

export function useAutoScroll(
  triggerValue: unknown = 0,
  options: UseAutoScrollOptions = {}
): UseAutoScrollReturn {
  const { threshold = 100, behavior = "smooth" } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  // Track whether user was at bottom before content update
  const wasAtBottomRef = useRef(true);

  // Check scroll position and update state
  const checkScrollPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    const atBottom = distanceFromBottom < threshold;
    setIsAtBottom(atBottom);
    wasAtBottomRef.current = atBottom;

    // Update shadow states
    setCanScrollUp(scrollTop > 10);
    setCanScrollDown(distanceFromBottom > 10);
  }, [threshold]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, [behavior]);

  // Auto-scroll when trigger value changes (e.g., messages.length)
  useEffect(() => {
    if (wasAtBottomRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [triggerValue, scrollToBottom]);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial check
    checkScrollPosition();

    container.addEventListener("scroll", checkScrollPosition, { passive: true });
    return () => container.removeEventListener("scroll", checkScrollPosition);
  }, [checkScrollPosition]);

  // Handle resize (content might change scroll position)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      checkScrollPosition();
      // If was at bottom, stay at bottom after resize
      if (wasAtBottomRef.current) {
        scrollToBottom();
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [checkScrollPosition, scrollToBottom]);

  return {
    containerRef,
    isAtBottom,
    scrollToBottom,
    canScrollUp,
    canScrollDown,
  };
}
