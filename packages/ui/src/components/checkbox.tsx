import { forwardRef, useId } from "react";
import { cn } from "../lib/utils";

/**
 * Checkbox component for Pizza Study.
 *
 * A warm, friendly checkbox used primarily for task completion.
 * Features a smooth check animation and terracotta accent color.
 */

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Label text to display next to checkbox */
  label?: string;
  /** Description text below the label */
  description?: string;
  /** Error state */
  error?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            ref={ref}
            id={inputId}
            className={cn(
              // Base styles
              "peer h-5 w-5 shrink-0",
              "appearance-none cursor-pointer",
              "rounded border-2",
              // Colors
              "border-border bg-background",
              "checked:bg-primary checked:border-primary",
              // Focus
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              // Hover
              "hover:border-primary/50",
              // Disabled
              "disabled:cursor-not-allowed disabled:opacity-50",
              // Transition
              "transition-all duration-150",
              // Error state
              error && "border-destructive",
              className,
            )}
            {...props}
          />
          {/* Checkmark icon */}
          <svg
            className={cn(
              "absolute h-3.5 w-3.5 text-primary-foreground",
              "pointer-events-none",
              "opacity-0 scale-50 peer-checked:opacity-100 peer-checked:scale-100",
              "transition-all duration-150",
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  "text-sm font-medium leading-none cursor-pointer",
                  "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                  error && "text-destructive",
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
