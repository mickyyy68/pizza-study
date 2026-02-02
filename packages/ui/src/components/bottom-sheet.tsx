import * as React from "react";
import { cn } from "../lib/utils";

export interface BottomSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Called when the sheet should close */
  onClose: () => void;
  /** Optional title displayed at the top */
  title?: string;
  /** Content to render inside the sheet */
  children: React.ReactNode;
  /** Additional class names for the sheet container */
  className?: string;
}

/**
 * Mobile-friendly bottom sheet component.
 * Slides up from the bottom with a backdrop overlay.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  // Lock body scroll when open
  React.useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  // Handle escape key
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm",
          "animate-in fade-in-0 duration-200",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute bottom-0 left-0 right-0",
          "bg-popover border-t border-border/50 rounded-t-2xl",
          "shadow-2xl shadow-black/30",
          "animate-in slide-in-from-bottom duration-300 ease-out",
          "max-h-[80vh] overflow-hidden flex flex-col",
          className,
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/25" />
        </div>

        {/* Title */}
        {title && (
          <div className="px-4 py-2 border-b border-border/30">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </h2>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
}
