import * as React from "react";
import { cn } from "../lib/utils";

/* =============================================================================
   ChatLayout - Two-panel layout for chat interface
   ============================================================================= */

export interface ChatLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Root container for the two-panel chat layout.
 * Contains sidebar and main content area.
 */
export function ChatLayout({ className, children, ...props }: ChatLayoutProps) {
  return (
    <div className={cn("flex h-full min-h-0", className)} {...props}>
      {children}
    </div>
  );
}

/* =============================================================================
   ChatLayoutSidebar - Left sidebar panel
   ============================================================================= */

export interface ChatLayoutSidebarProps
  extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  children: React.ReactNode;
}

/**
 * Sidebar panel for documents and chat history.
 * Collapsible on desktop, overlay on mobile.
 */
export function ChatLayoutSidebar({
  className,
  collapsed = false,
  mobileOpen = false,
  onMobileClose,
  children,
  ...props
}: ChatLayoutSidebarProps) {
  // Handle escape key to close mobile sidebar
  React.useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onMobileClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen, onMobileClose]);

  // Prevent body scroll when mobile sidebar is open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        role="complementary"
        aria-label="Chat sidebar"
        aria-modal={mobileOpen ? "true" : undefined}
        className={cn(
          // Base styles - always show on desktop
          "flex flex-col border-r border-border bg-muted/30",
          collapsed ? "w-0 overflow-hidden" : "w-[280px] min-w-[280px]",
          // Transition
          "transition-[width] duration-200 ease-out",
          className,
        )}
        style={{ "--sidebar-width": "280px" } as React.CSSProperties}
        {...props}
      >
        {children}
      </aside>

      {/* Mobile sidebar (overlay) */}
      <aside
        role="complementary"
        aria-label="Chat sidebar"
        aria-modal="true"
        className={cn(
          // Base styles
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-background",
          // Mobile only (hidden on md+ screens)
          "md:hidden",
          // Slide animation
          "transition-transform duration-200 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {children}
      </aside>
    </>
  );
}

/* =============================================================================
   ChatLayoutMain - Main content area
   ============================================================================= */

export interface ChatLayoutMainProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

/**
 * Main content area containing messages and input.
 */
export function ChatLayoutMain({
  className,
  children,
  ...props
}: ChatLayoutMainProps) {
  return (
    <main
      role="main"
      className={cn("relative flex flex-1 flex-col min-h-0 min-w-0", className)}
      {...props}
    >
      {children}
    </main>
  );
}

/* =============================================================================
   ChatLayoutMessages - Scrollable messages area
   ============================================================================= */

export interface ChatLayoutMessagesProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Show shadow at top when content is scrolled */
  showTopShadow?: boolean;
  /** Show shadow at bottom when more content below */
  showBottomShadow?: boolean;
}

/**
 * Scrollable container for chat messages.
 * Designed to support virtualization.
 * Supports scroll shadows via props (from useAutoScroll hook).
 *
 * Note: Uses an outer wrapper without overflow to allow sibling dropdowns
 * to render above this component without being clipped.
 */
export const ChatLayoutMessages = React.forwardRef<
  HTMLDivElement,
  ChatLayoutMessagesProps
>(({ className, children, showTopShadow, showBottomShadow, ...props }, ref) => {
  return (
    <div className="relative flex-1 min-h-0">
      {/* Inner scrollable container */}
      <div
        ref={ref}
        className={cn(
          "absolute inset-0 overflow-y-auto overflow-x-hidden px-4 py-6",
          className,
        )}
        {...props}
      >
        {/* Top scroll shadow */}
        <div
          className={cn(
            "pointer-events-none sticky top-0 -mt-6 h-6 w-full",
            "bg-gradient-to-b from-background to-transparent",
            "transition-opacity duration-200",
            showTopShadow ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
        />

        <div className="mx-auto w-full max-w-[720px]">{children}</div>

        {/* Bottom scroll shadow */}
        <div
          className={cn(
            "pointer-events-none sticky bottom-0 -mb-6 h-6 w-full",
            "bg-gradient-to-t from-background to-transparent",
            "transition-opacity duration-200",
            showBottomShadow ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
        />
      </div>
    </div>
  );
});
ChatLayoutMessages.displayName = "ChatLayoutMessages";

/* =============================================================================
   ChatLayoutFooter - Sticky input area
   ============================================================================= */

export interface ChatLayoutFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Sticky footer for chat input.
 * Uses z-index layering to ensure dropdowns render above the messages area.
 */
export function ChatLayoutFooter({
  className,
  children,
  ...props
}: ChatLayoutFooterProps) {
  return (
    <div
      className={cn(
        "relative z-10 border-t border-border bg-background px-4 py-3",
        className,
      )}
      {...props}
    >
      <div className="mx-auto w-full max-w-[720px]">{children}</div>
    </div>
  );
}
