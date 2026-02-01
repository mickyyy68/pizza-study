import {
  AlertCircle,
  Check,
  File,
  FileCode,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import {
  formatFileSize,
  getFileExtension,
  getFileTypeLabel,
} from "../utils/file-validation";
import { Badge } from "./badge";

/**
 * Upload status types for tracking file upload progress.
 */
export type UploadStatus =
  | "pending"
  | "uploading"
  | "processing"
  | "complete"
  | "error";

/**
 * UploadListItem - Displays a single file in the upload queue.
 *
 * Shows file info, progress, status, and actions (remove/retry).
 * Follows the Trattoria warm theme with terracotta progress bars.
 */
export interface UploadListItemProps {
  /** File name to display */
  fileName: string;
  /** File size in bytes */
  fileSize: number;
  /** File type/extension (e.g., ".pdf") */
  fileType: string;
  /** Current upload status */
  status: UploadStatus;
  /** Upload progress (0-100) */
  progress?: number;
  /** Error message if status is "error" */
  error?: string;
  /** Called when remove button is clicked */
  onRemove?: () => void;
  /** Called when retry button is clicked (only shown on error) */
  onRetry?: () => void;
  /** Additional class names */
  className?: string;
}

// Map file extensions to Lucide icons
function getFileIcon(extension: string) {
  const ext = extension.startsWith(".")
    ? extension.toLowerCase()
    : `.${extension.toLowerCase()}`;

  switch (ext) {
    case ".pdf":
      return <FileText className="h-5 w-5 text-rose-600 dark:text-rose-400" />;
    case ".json":
      return (
        <FileJson className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      );
    case ".md":
    case ".markdown":
      return <FileCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    case ".csv":
      return (
        <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      );
    case ".txt":
      return <FileText className="h-5 w-5 text-muted-foreground" />;
    default:
      return <File className="h-5 w-5 text-muted-foreground" />;
  }
}

// Status badge configurations
const statusConfig: Record<
  UploadStatus,
  {
    label: string;
    variant: "warning" | "success" | "destructive" | "muted" | "secondary";
    icon?: React.ReactNode;
  }
> = {
  pending: {
    label: "Pending",
    variant: "muted",
  },
  uploading: {
    label: "Uploading",
    variant: "warning",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  processing: {
    label: "Processing",
    variant: "secondary",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  complete: {
    label: "Complete",
    variant: "success",
    icon: <Check className="h-3 w-3" />,
  },
  error: {
    label: "Failed",
    variant: "destructive",
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

export function UploadListItem({
  fileName,
  fileSize,
  fileType,
  status,
  progress = 0,
  error,
  onRemove,
  onRetry,
  className,
}: UploadListItemProps) {
  const extension = fileType.startsWith(".")
    ? fileType
    : getFileExtension(fileName);
  const typeLabel = getFileTypeLabel(extension);
  const config = statusConfig[status];

  // Truncate long file names
  const displayName =
    fileName.length > 35 ? `${fileName.slice(0, 32)}...${extension}` : fileName;

  const showProgress = status === "uploading" || status === "processing";

  return (
    <li
      className={cn(
        // Layout
        "group relative flex items-center gap-4 p-4",
        // Mobile: stack vertically
        "sm:flex-row flex-col sm:items-center items-start",
        // Appearance
        "bg-card rounded-lg border border-border",
        // Animations
        "transition-all duration-200",
        "animate-in fade-in-0 slide-in-from-top-2",
        // Hover states
        "hover:border-border/80 hover:shadow-sm",
        // Status-specific styles
        status === "error" && "border-destructive/30 bg-destructive/5",
        status === "complete" && "border-emerald-500/30 bg-emerald-500/5",
        className,
      )}
    >
      {/* File icon - larger on mobile for better tap target */}
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center",
          "w-12 h-12 sm:w-10 sm:h-10 rounded-lg",
          "bg-muted/50",
        )}
      >
        {getFileIcon(extension)}
      </div>

      {/* File info - full width on mobile */}
      <div className="flex-1 min-w-0 w-full sm:w-auto">
        {/* File name and type badge */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className="font-medium text-sm text-foreground truncate"
            title={fileName}
          >
            {displayName}
          </span>
          <Badge variant="outline" size="sm" className="flex-shrink-0">
            {typeLabel}
          </Badge>
        </div>

        {/* File size and status */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatFileSize(fileSize)}</span>
          <Badge variant={config.variant} size="sm" icon={config.icon}>
            {config.label}
          </Badge>
        </div>

        {/* Error message */}
        {status === "error" && error && (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        )}

        {/* Progress bar */}
        {showProgress && (
          <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300 ease-out",
                "bg-primary",
              )}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>

      {/* Actions - positioned absolutely on mobile for better layout */}
      <div className="flex-shrink-0 flex items-center gap-1 sm:relative absolute top-3 right-3 sm:top-auto sm:right-auto">
        {/* Retry button (only on error) */}
        {status === "error" && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              // Larger tap target on mobile (min 44px)
              "p-2.5 sm:p-1.5 rounded-md",
              "text-muted-foreground hover:text-primary",
              "hover:bg-primary/10",
              "transition-colors duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label="Retry upload"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}

        {/* Remove button - always visible on mobile */}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              // Larger tap target on mobile (min 44px)
              "p-2.5 sm:p-1.5 rounded-md",
              "text-muted-foreground hover:text-destructive",
              "hover:bg-destructive/10",
              "transition-colors duration-150",
              // Always visible on mobile, fade on hover on desktop
              "sm:opacity-0 sm:group-hover:opacity-100",
              "focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </li>
  );
}
