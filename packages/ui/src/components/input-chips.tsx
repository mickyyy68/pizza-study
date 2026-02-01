import {
  Attachment01Icon,
  Cancel01Icon,
  File02Icon,
  Loading01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type * as React from "react";
import { cn } from "../lib/utils";

/* =============================================================================
   DocumentChip - For @ mentioned documents
   ============================================================================= */

export interface DocumentChipProps {
  id: string;
  name: string;
  onRemove: (id: string) => void;
  className?: string;
}

/**
 * Chip showing a mentioned document in the input area.
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        "bg-primary/10 text-primary text-xs font-medium",
        "animate-in zoom-in-95 duration-150",
        className,
      )}
    >
      <HugeiconsIcon icon={File02Icon} size={12} />
      <span className="max-w-32 truncate">{name}</span>
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="rounded-full p-0.5 hover:bg-primary/20 transition-colors"
        aria-label={`Remove ${name}`}
      >
        <HugeiconsIcon icon={Cancel01Icon} size={12} />
      </button>
    </span>
  );
}

/* =============================================================================
   AttachmentChip - For uploaded files
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
 * Chip showing an attached file with upload progress.
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        "text-xs font-medium",
        "animate-in zoom-in-95 duration-150",
        status === "error"
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-foreground",
        className,
      )}
    >
      {/* Icon based on status */}
      {status === "uploading" ? (
        <HugeiconsIcon
          icon={Loading01Icon}
          size={12}
          className="animate-spin"
        />
      ) : (
        <HugeiconsIcon icon={Attachment01Icon} size={12} />
      )}

      {/* File name */}
      <span className="max-w-32 truncate">{name}</span>

      {/* Progress or status indicator */}
      {status === "uploading" && (
        <span className="text-muted-foreground">{Math.round(progress)}%</span>
      )}

      {/* Error retry button */}
      {status === "error" && onRetry && (
        <button
          type="button"
          onClick={() => onRetry(id)}
          className="text-xs underline hover:no-underline"
        >
          Retry
        </button>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(id)}
        className={cn(
          "rounded-full p-0.5 transition-colors",
          status === "error"
            ? "hover:bg-destructive/20"
            : "hover:bg-foreground/10",
        )}
        aria-label={`Remove ${name}`}
      >
        <HugeiconsIcon icon={Cancel01Icon} size={12} />
      </button>
    </span>
  );
}

/* =============================================================================
   ChipsContainer - Wrapper for chips above input
   ============================================================================= */

export interface ChipsContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container for displaying chips above the input textarea.
 */
export function ChipsContainer({ children, className }: ChipsContainerProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 px-2 pt-2 pb-1",
        "empty:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
