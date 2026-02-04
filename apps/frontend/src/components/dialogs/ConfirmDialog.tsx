import { Button, cn } from "@repo/ui";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "destructive",
}: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Escape key to cancel
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onCancel]);

  // Click outside to cancel
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onCancel]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  // Auto-focus confirm button
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => confirmButtonRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  if (!open) return null;

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm",
          "animate-in fade-in-0 duration-200",
        )}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className={cn(
          "relative z-10 w-full max-w-md mx-4",
          "bg-background border border-border rounded-xl shadow-xl",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          "p-6",
        )}
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold text-foreground"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-message"
          className="mt-2 text-sm text-muted-foreground"
        >
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            className={cn(
              "inline-flex items-center justify-center gap-2",
              "rounded-lg text-sm font-medium",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              "active:scale-[0.98]",
              "h-10 px-4 py-2 shadow-sm",
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
