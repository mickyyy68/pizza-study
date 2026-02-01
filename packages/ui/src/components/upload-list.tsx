import { cn } from "../lib/utils";

/**
 * UploadList - Container for upload list items.
 *
 * Provides accessible list semantics and consistent spacing.
 * Use with UploadListItem components as children.
 */
export interface UploadListProps {
  /** UploadListItem components */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Accessible label for the list */
  "aria-label"?: string;
}

export function UploadList({
  children,
  className,
  "aria-label": ariaLabel = "Upload queue",
}: UploadListProps) {
  return (
    <ul
      aria-label={ariaLabel}
      className={cn("flex flex-col gap-3 list-none p-0 m-0", className)}
    >
      {children}
    </ul>
  );
}
