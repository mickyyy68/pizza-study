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
        "group relative flex items-center gap-4 p-4",
        "bg-card rounded-lg border border-border",
        "transition-all duration-200",
        "hover:border-border/80 hover:shadow-sm",
        status === "error" && "border-destructive/30 bg-destructive/5",
        status === "complete" && "border-emerald-500/30 bg-emerald-500/5",
        className,
      )}
    >
      {/* File icon */}
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center",
          "w-10 h-10 rounded-lg",
          "bg-muted/50",
        )}
      >
        {getFileIcon(extension)}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
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

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {/* Retry button (only on error) */}
        {status === "error" && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              "p-1.5 rounded-md",
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

        {/* Remove button */}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              "p-1.5 rounded-md",
              "text-muted-foreground hover:text-destructive",
              "hover:bg-destructive/10",
              "transition-colors duration-150",
              "opacity-0 group-hover:opacity-100",
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
