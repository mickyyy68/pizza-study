import { cn } from "../lib/utils";

/**
 * UploadList - Container for upload list items.
 *
 * Provides accessible list semantics, consistent spacing, and screen reader
 * announcements for upload status changes via aria-live region.
 *
 * Use with UploadListItem components as children.
 */
export interface UploadListProps {
  /** UploadListItem components */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Accessible label for the list */
  "aria-label"?: string;
  /** Status message to announce to screen readers */
  statusMessage?: string;
}

export function UploadList({
  children,
  className,
  "aria-label": ariaLabel = "Upload queue",
  statusMessage,
}: UploadListProps) {
  return (
    <div className="relative">
      {/* Screen reader announcements for status changes */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>

      <ul
        aria-label={ariaLabel}
        className={cn("flex flex-col gap-3 list-none p-0 m-0", className)}
      >
        {children}
      </ul>
    </div>
  );
}
