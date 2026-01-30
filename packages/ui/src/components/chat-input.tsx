import { forwardRef, useCallback, useEffect, useRef } from "react";
import { cn } from "../lib/utils";

/**
 * ChatInput component for Pizza Study.
 *
 * An auto-growing textarea with send button for chat interfaces.
 * Handles Enter to submit, Shift+Enter for newlines.
 */

export interface ChatInputProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Submit handler */
  onSubmit: () => void;
  /** Maximum rows before scrolling */
  maxRows?: number;
  /** Show send button */
  showSendButton?: boolean;
  /** Loading state (disables input) */
  isLoading?: boolean;
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  (
    {
      className,
      value,
      onChange,
      onSubmit,
      maxRows = 5,
      showSendButton = true,
      isLoading,
      placeholder = "Type a message...",
      disabled,
      ...props
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef =
      (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    // Auto-resize textarea
    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get correct scrollHeight
      textarea.style.height = "auto";

      // Calculate max height based on maxRows
      const lineHeight =
        parseInt(getComputedStyle(textarea).lineHeight, 10) || 24;
      const maxHeight = lineHeight * maxRows;

      // Set new height, capped at maxHeight
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }, [maxRows, textareaRef]);

    // Adjust height when value changes
    // biome-ignore lint/correctness/useExhaustiveDependencies: value triggers height adjustment
    useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    // Handle key down
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !isLoading && !disabled) {
          onSubmit();
        }
      }
    };

    const isDisabled = disabled || isLoading;
    const canSubmit = value.trim().length > 0 && !isDisabled;

    return (
      <div
        className={cn(
          "flex items-end gap-2 p-2",
          "bg-background border border-input rounded-xl",
          "focus-within:ring-2 focus-within:ring-ring/30 focus-within:border-primary",
          "transition-all duration-200",
          isDisabled && "opacity-50",
          className,
        )}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent",
            "text-sm text-foreground placeholder:text-muted-foreground",
            "focus:outline-none",
            "disabled:cursor-not-allowed",
            "py-2 px-2",
            "max-h-32 overflow-y-auto",
          )}
          {...props}
        />

        {/* Send button */}
        {showSendButton && (
          <button
            type="button"
            onClick={() => canSubmit && onSubmit()}
            disabled={!canSubmit}
            className={cn(
              "shrink-0 h-9 w-9 rounded-lg",
              "flex items-center justify-center",
              "bg-primary text-primary-foreground",
              "transition-all duration-150",
              "hover:bg-primary/90 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
            aria-label="Send message"
          >
            {isLoading ? (
              // Loading spinner
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              // Send icon
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    );
  },
);

ChatInput.displayName = "ChatInput";
