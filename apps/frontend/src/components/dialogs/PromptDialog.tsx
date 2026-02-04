import { Button, cn } from "@repo/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface PromptDialogProps {
  open: boolean;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  title: string;
  message?: string;
  defaultValue?: string;
  submitLabel?: string;
  cancelLabel?: string;
  placeholder?: string;
}

export function PromptDialog({
  open,
  onSubmit,
  onCancel,
  title,
  message,
  defaultValue = "",
  submitLabel = "Save",
  cancelLabel = "Cancel",
  placeholder,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset value when dialog opens with new defaultValue
  useEffect(() => {
    if (open) {
      setValue(defaultValue);
    }
  }, [open, defaultValue]);

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

  // Auto-focus and select input on open
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = useCallback(() => {
    onSubmit(value.trim());
  }, [value, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

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
        aria-labelledby="prompt-dialog-title"
        className={cn(
          "relative z-10 w-full max-w-md mx-4",
          "bg-background border border-border rounded-xl shadow-xl",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          "p-6",
        )}
      >
        <h2
          id="prompt-dialog-title"
          className="text-lg font-semibold text-foreground"
        >
          {title}
        </h2>
        {message && (
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        )}
        <div className="mt-4">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "flex h-10 w-full rounded-lg border bg-background px-3 py-2",
              "text-sm text-foreground",
              "border-input",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary",
              "transition-all duration-200",
            )}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button onClick={handleSubmit} disabled={!value.trim()}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
