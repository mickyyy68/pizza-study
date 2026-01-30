import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";

/**
 * SlideOver component for Pizza Study.
 *
 * A slide-in panel from the edge of the screen, used for the chat
 * panel and other contextual content without leaving the current page.
 */

/* =============================================================================
   SlideOver Container
   ============================================================================= */

const slideOverVariants = cva(
  [
    "fixed inset-y-0 z-50",
    "flex flex-col",
    "bg-background border-border shadow-xl",
    "transition-transform duration-300 ease-out",
  ],
  {
    variants: {
      side: {
        left: "left-0 border-r",
        right: "right-0 border-l",
      },
      size: {
        sm: "w-80",
        md: "w-96",
        lg: "w-[28rem]",
        xl: "w-[32rem]",
      },
    },
    defaultVariants: {
      side: "right",
      size: "md",
    },
  },
);

export interface SlideOverProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof slideOverVariants> {
  open: boolean;
  onClose: () => void;
  /** Close when clicking outside the panel */
  closeOnOutsideClick?: boolean;
  /** Close when pressing Escape key */
  closeOnEscape?: boolean;
  /** Show backdrop overlay */
  showBackdrop?: boolean;
}

export function SlideOver({
  className,
  children,
  open,
  onClose,
  side = "right",
  size = "md",
  closeOnOutsideClick = true,
  closeOnEscape = true,
  showBackdrop = true,
  ...props
}: SlideOverProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle Escape key
  useEffect(() => {
    if (!closeOnEscape || !open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose, closeOnEscape]);

  // Handle click outside
  useEffect(() => {
    if (!closeOnOutsideClick || !open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Delay adding listener to avoid immediate close
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose, closeOnOutsideClick]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!open) return null;

  const translateClass =
    side === "right"
      ? "translate-x-0 data-[state=closed]:translate-x-full"
      : "-translate-x-0 data-[state=closed]:-translate-x-full";

  const content = (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className={cn(
            "absolute inset-0 bg-black/20 backdrop-blur-[2px]",
            "transition-opacity duration-300",
            "animate-in fade-in-0",
          )}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        data-state={open ? "open" : "closed"}
        className={cn(
          slideOverVariants({ side, size }),
          translateClass,
          "animate-in",
          side === "right" ? "slide-in-from-right" : "slide-in-from-left",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );

  // Portal to body to avoid z-index issues
  if (typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}

/* =============================================================================
   SlideOver Header
   ============================================================================= */

export interface SlideOverHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export function SlideOverHeader({
  className,
  children,
  onClose,
  ...props
}: SlideOverHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-4",
        "border-b border-border",
        "shrink-0",
        className,
      )}
      {...props}
    >
      <div className="flex-1 font-semibold text-lg">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "h-8 w-8 rounded-lg",
            "flex items-center justify-center",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-muted transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-label="Close"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

/* =============================================================================
   SlideOver Content
   ============================================================================= */

export interface SlideOverContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SlideOverContent({
  className,
  ...props
}: SlideOverContentProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto p-4", className)} {...props} />
  );
}

/* =============================================================================
   SlideOver Footer
   ============================================================================= */

export interface SlideOverFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SlideOverFooter({ className, ...props }: SlideOverFooterProps) {
  return (
    <div
      className={cn(
        "p-4 border-t border-border",
        "shrink-0 bg-background",
        className,
      )}
      {...props}
    />
  );
}
