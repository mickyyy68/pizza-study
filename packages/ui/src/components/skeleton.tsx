import { cn } from "../lib/utils";

/**
 * Skeleton Component for Pizza Study.
 *
 * A placeholder that mimics content layout while loading.
 * Uses pulse animation to indicate loading state.
 *
 * Use this to prevent layout shift and provide visual feedback
 * during data fetching.
 */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shape variant */
  variant?: "text" | "circular" | "rectangular";
  /** Animation style */
  animation?: "pulse" | "wave" | "none";
  /** Width (for text/rectangular) */
  width?: string | number;
  /** Height */
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "text",
  animation = "pulse",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  return (
    <div
      className={cn(
        "bg-muted",
        variantClasses[variant],
        animationClasses[animation],
        className,
      )}
      style={{
        width: width,
        height: height ?? (variant === "text" ? "1em" : undefined),
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * SkeletonText - Multiple lines of skeleton text.
 */
export interface SkeletonTextProps {
  /** Number of lines */
  lines?: number;
  /** Gap between lines */
  gap?: "sm" | "md" | "lg";
  /** Last line width (percentage) */
  lastLineWidth?: string;
  className?: string;
}

export function SkeletonText({
  lines = 3,
  gap = "sm",
  lastLineWidth = "60%",
  className,
}: SkeletonTextProps) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
  };

  return (
    <div className={cn("flex flex-col", gapClasses[gap], className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          // biome-ignore lint/suspicious/noArrayIndexKey: Static array based on count, no reordering
          key={i}
          variant="text"
          height="0.875rem"
          style={{
            width: i === lines - 1 ? lastLineWidth : "100%",
          }}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard - Card-shaped skeleton with common layout.
 */
export interface SkeletonCardProps {
  /** Show header with avatar */
  showHeader?: boolean;
  /** Number of content lines */
  contentLines?: number;
  /** Show footer */
  showFooter?: boolean;
  className?: string;
}

export function SkeletonCard({
  showHeader = true,
  contentLines = 3,
  showFooter = false,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn("rounded-xl border border-border bg-card p-4", className)}
    >
      {showHeader && (
        <div className="flex items-center gap-3 mb-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1">
            <Skeleton
              variant="text"
              width="60%"
              height="1rem"
              className="mb-2"
            />
            <Skeleton variant="text" width="40%" height="0.75rem" />
          </div>
        </div>
      )}
      <SkeletonText lines={contentLines} />
      {showFooter && (
        <div className="flex gap-2 mt-4">
          <Skeleton variant="rectangular" width={60} height={24} />
          <Skeleton variant="rectangular" width={60} height={24} />
        </div>
      )}
    </div>
  );
}
