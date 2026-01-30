import { cn } from "../lib/utils";
import { Button, type ButtonProps } from "./button";

/**
 * EmptyState Component for Pizza Study.
 *
 * A consistent layout for empty states across the app.
 * Used when there's no data to display (no tasks, no documents, etc.)
 *
 * Supports:
 * - Custom icon or emoji
 * - Title and description
 * - Optional action button
 */

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: ButtonProps["variant"];
}

export interface EmptyStateProps {
  /** Icon element (from lucide-react) or emoji string */
  icon?: React.ReactNode;
  /** Main title */
  title: string;
  /** Supporting description */
  description?: string;
  /** Primary action button */
  action?: EmptyStateAction;
  /** Secondary action button */
  secondaryAction?: EmptyStateAction;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Children for custom content below description */
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: {
    container: "py-6 px-4",
    icon: "h-10 w-10 mb-3",
    title: "text-base",
    description: "text-sm max-w-[200px]",
  },
  md: {
    container: "py-10 px-6",
    icon: "h-14 w-14 mb-4",
    title: "text-lg",
    description: "text-sm max-w-[280px]",
  },
  lg: {
    container: "py-16 px-8",
    icon: "h-20 w-20 mb-6",
    title: "text-xl",
    description: "text-base max-w-[350px]",
  },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  className,
  children,
}: EmptyStateProps) {
  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div
          className={cn(
            "rounded-full bg-muted flex items-center justify-center text-muted-foreground",
            sizes.icon,
            // If icon is a string (emoji), increase font size
            typeof icon === "string" && "text-3xl"
          )}
        >
          {icon}
        </div>
      )}

      {/* Title */}
      <h3
        className={cn(
          "font-serif font-semibold text-foreground",
          sizes.title
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            "text-muted-foreground mt-2",
            sizes.description
          )}
        >
          {description}
        </p>
      )}

      {/* Custom children */}
      {children && <div className="mt-4">{children}</div>}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-6">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant ?? "default"}
              size={size === "sm" ? "sm" : "default"}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant ?? "outline"}
              size={size === "sm" ? "sm" : "default"}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
