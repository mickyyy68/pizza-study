import {
  Attachment01Icon,
  Cancel01Icon,
  File02Icon,
  Loading01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import { cn } from "../lib/utils";

/* =============================================================================
   DocumentChip - Refined pill for @ mentioned documents
   ============================================================================= */

export interface DocumentChipProps {
  id: string;
  name: string;
  onRemove: (id: string) => void;
  className?: string;
}

/**
 * Truncate filename to a max length, preserving extension.
 */
function truncateName(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) return name;

  const extMatch = name.match(/\.[^.]+$/);
  const ext = extMatch ? extMatch[0] : "";
  const baseName = name.slice(0, name.length - ext.length);

  const availableLength = maxLength - ext.length - 1;
  if (availableLength <= 3) return name.slice(0, maxLength - 1) + "…";

  return baseName.slice(0, availableLength) + "…" + ext;
}

/**
 * Paper tag style chip showing a mentioned document.
 * Features a folded corner visual and warm parchment background.
 */
export function DocumentChip({
  id,
  name,
  onRemove,
  className,
}: DocumentChipProps) {
  return (
    <span
      className={cn(
        "group relative inline-flex items-center gap-1.5",
        "h-7 pl-2.5 pr-1.5",
        // Paper tag shape - asymmetric radius for folded corner effect
        "rounded-md rounded-tr-sm",
        // Warm parchment background
        "bg-gradient-to-br from-secondary/60 to-secondary/40",
        "border border-primary/20",
        // Typography
        "text-xs font-medium text-secondary-foreground",
        // Transitions
        "transition-all duration-200",
        // Hover - lift effect
        "hover:shadow-sm hover:-translate-y-px",
        "hover:border-primary/30 hover:from-secondary/70 hover:to-secondary/50",
        className,
      )}
    >
      {/* Folded corner visual */}
      <span
        className={cn(
          "absolute -top-px -right-px w-2 h-2",
          "bg-gradient-to-br from-primary/30 to-primary/20",
          "rounded-bl-md",
          "opacity-60 group-hover:opacity-80",
          "transition-opacity duration-200",
        )}
        aria-hidden="true"
      />

      {/* Document icon */}
      <HugeiconsIcon
        icon={File02Icon}
        size={13}
        className="shrink-0 text-primary/70"
      />

      {/* Document name */}
      <span className="truncate max-w-[120px]">{truncateName(name, 18)}</span>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(id)}
        className={cn(
          "shrink-0 size-[18px] rounded-sm",
          "flex items-center justify-center",
          "text-muted-foreground/50",
          "transition-all duration-150",
          "hover:text-destructive hover:bg-destructive/10",
          "opacity-50 group-hover:opacity-100",
        )}
        aria-label={`Remove ${name}`}
      >
        <HugeiconsIcon icon={Cancel01Icon} size={10} />
      </button>
    </span>
  );
}

/* =============================================================================
   AttachmentChip - For uploaded files with progress indicator
   ============================================================================= */

export interface AttachmentChipProps {
  id: string;
  name: string;
  status: "uploading" | "complete" | "error";
  progress?: number;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
  className?: string;
}

/**
 * Chip showing an attached file with upload progress overlay.
 */
export function AttachmentChip({
  id,
  name,
  status,
  progress = 0,
  onRemove,
  onRetry,
  className,
}: AttachmentChipProps) {
  return (
    <span
      className={cn(
        "group relative inline-flex items-center gap-1.5 overflow-hidden",
        "h-7 pl-2.5 pr-1.5 rounded-md",
        "text-xs font-medium",
        "transition-all duration-200",
        // Status-based styling
        status === "error"
          ? "bg-destructive/10 border border-destructive/30 text-destructive"
          : status === "uploading"
            ? "bg-muted/60 border border-border/50 text-muted-foreground"
            : "bg-muted/80 border border-border text-foreground",
        // Hover lift when complete
        status === "complete" && "hover:shadow-sm hover:-translate-y-px",
        className,
      )}
    >
      {/* Progress bar overlay for uploading state */}
      {status === "uploading" && (
        <span
          className="absolute inset-y-0 left-0 bg-primary/15 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <span className="relative shrink-0">
        {status === "uploading" ? (
          <HugeiconsIcon
            icon={Loading01Icon}
            size={13}
            className="animate-spin text-primary"
          />
        ) : (
          <HugeiconsIcon
            icon={Attachment01Icon}
            size={13}
            className={status === "error" ? "text-destructive" : "opacity-70"}
          />
        )}
      </span>

      {/* File name */}
      <span className="relative truncate max-w-[100px]">{name}</span>

      {/* Progress indicator */}
      {status === "uploading" && (
        <span className="relative text-primary tabular-nums font-mono text-[10px]">
          {Math.round(progress)}%
        </span>
      )}

      {/* Error retry button */}
      {status === "error" && onRetry && (
        <button
          type="button"
          onClick={() => onRetry(id)}
          className="relative text-[10px] font-medium underline underline-offset-2 hover:no-underline"
        >
          Retry
        </button>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(id)}
        className={cn(
          "relative shrink-0 size-[18px] rounded-sm",
          "flex items-center justify-center",
          "transition-all duration-150",
          "opacity-50 group-hover:opacity-100",
          status === "error"
            ? "text-destructive/50 hover:text-destructive hover:bg-destructive/15"
            : "text-muted-foreground hover:text-foreground hover:bg-foreground/10",
        )}
        aria-label={`Remove ${name}`}
      >
        <HugeiconsIcon icon={Cancel01Icon} size={10} />
      </button>
    </span>
  );
}

/* =============================================================================
   ChipsContainer - Wrapper for chips inline with input
   ============================================================================= */

export interface ChipsContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container for displaying chips inline with staggered entrance animation.
 */
export function ChipsContainer({ children, className }: ChipsContainerProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        "empty:hidden",
        className,
      )}
    >
      {React.Children.map(children, (child, index) => (
        <div
          className="animate-in fade-in-0 slide-in-from-left-2 duration-200"
          style={{ animationDelay: `${index * 30}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
