import { cva, type VariantProps } from "class-variance-authority";
import { Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "../lib/utils";

/**
 * FileDropzone - A warm, inviting drag-and-drop file upload zone.
 *
 * Follows the Trattoria theme with terracotta accents and subtle glow effects.
 * Supports both drag-and-drop and click-to-upload interactions.
 */

const fileDropzoneVariants = cva(
  [
    // Base styles
    "relative flex flex-col items-center justify-center",
    "border-2 border-dashed rounded-xl",
    "cursor-pointer select-none",
    "transition-all duration-200 ease-out",
    // Focus styles
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        default: [
          "border-border bg-card/50",
          "hover:border-primary/50 hover:bg-accent/20",
        ],
        compact: [
          "border-border/70 bg-muted/30",
          "hover:border-primary/40 hover:bg-accent/10",
        ],
      },
      size: {
        // Reduced heights on mobile for better viewport fit
        sm: "min-h-24 sm:min-h-32 p-3 sm:p-4 gap-2",
        md: "min-h-36 sm:min-h-48 p-4 sm:p-6 gap-2 sm:gap-3",
        lg: "min-h-48 sm:min-h-64 p-6 sm:p-8 gap-3 sm:gap-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface FileDropzoneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop">,
    VariantProps<typeof fileDropzoneVariants> {
  /** Callback when files are selected (via drop or file picker) */
  onFilesSelected?: (files: File[]) => void;
  /** Accepted file types (e.g., ".pdf,.txt") */
  accept?: string;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Disable the dropzone */
  disabled?: boolean;
  /** Custom content to render inside the dropzone */
  children?: React.ReactNode;
}

export function FileDropzone({
  className,
  variant,
  size,
  onFilesSelected,
  accept,
  multiple = true,
  disabled = false,
  children,
  ...props
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Handle file selection from input
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFilesSelected?.(Array.from(files));
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [onFilesSelected],
  );

  // Handle click to open file picker
  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  // Handle keyboard activation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!disabled && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [disabled],
  );

  // Drag event handlers with counter to handle nested elements
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      dragCounterRef.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      dragCounterRef.current--;
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    },
    [disabled],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      setIsDragging(false);
      dragCounterRef.current = 0;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const fileArray = Array.from(files);
        // If not multiple, only take the first file
        onFilesSelected?.(multiple ? fileArray : [fileArray[0]]);
      }
    },
    [disabled, multiple, onFilesSelected],
  );

  return (
    <div
      className={cn(
        fileDropzoneVariants({ variant, size }),
        // Dragging state styles - subtle glow effect
        isDragging && [
          "border-primary border-solid",
          "bg-accent/30",
          "shadow-lg shadow-primary/10",
          "scale-[1.01]",
        ],
        // Disabled state
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label="Upload files by dropping or clicking"
      aria-disabled={disabled}
      {...props}
    >
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Default content or custom children */}
      {children || (
        <DefaultDropzoneContent isDragging={isDragging} size={size} />
      )}
    </div>
  );
}

// Default content shown when no children are provided
function DefaultDropzoneContent({
  isDragging,
  size,
}: {
  isDragging: boolean;
  size: "sm" | "md" | "lg" | null | undefined;
}) {
  const iconSize =
    size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const titleSize =
    size === "lg" ? "text-lg" : size === "sm" ? "text-sm" : "text-base";

  return (
    <>
      {/* Upload icon with animation */}
      <div
        className={cn(
          "rounded-full p-3",
          "bg-primary/10 text-primary",
          "transition-all duration-200",
          isDragging && "bg-primary/20 scale-110",
        )}
      >
        <Upload
          className={cn(
            iconSize,
            "transition-transform duration-200",
            isDragging && "-translate-y-1",
          )}
        />
      </div>

      {/* Text content */}
      <div className="text-center space-y-1">
        <p
          className={cn(
            "font-medium text-foreground",
            titleSize,
            "transition-colors duration-200",
          )}
        >
          {isDragging ? "Drop to upload" : "Drop your study materials here"}
        </p>
        {!isDragging && (
          <p className="text-sm text-muted-foreground">
            or <span className="text-primary font-medium">click to browse</span>
          </p>
        )}
      </div>

      {/* Accepted formats hint */}
      {!isDragging && size !== "sm" && (
        <p className="text-xs text-muted-foreground/70 mt-2">
          PDF, Markdown, Text, CSV, JSON
        </p>
      )}
    </>
  );
}

export { fileDropzoneVariants };
