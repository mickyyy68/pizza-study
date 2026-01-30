import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * Avatar component for Pizza Study.
 *
 * Displays user or AI avatars with image or initials fallback.
 */

const avatarVariants = cva(
  [
    "relative inline-flex items-center justify-center",
    "rounded-full overflow-hidden",
    "bg-muted text-muted-foreground",
    "font-medium",
    "shrink-0",
  ],
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /** Image source URL */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** Fallback text (usually initials) */
  fallback?: string;
  /** Show online status indicator */
  status?: "online" | "offline" | "away" | "busy";
}

export function Avatar({
  className,
  size,
  src,
  alt,
  fallback,
  status,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const statusColors = {
    online: "bg-emerald-500",
    offline: "bg-gray-400",
    away: "bg-amber-500",
    busy: "bg-destructive",
  };

  const showFallback = !src || imageError;

  return (
    <div className={cn(avatarVariants({ size }), className)} {...props}>
      {!showFallback ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="select-none">{fallback || "?"}</span>
      )}

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0",
            "h-2.5 w-2.5 rounded-full",
            "ring-2 ring-background",
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}

/**
 * Avatar Group - displays multiple avatars stacked
 */
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum avatars to show before +N indicator */
  max?: number;
}

export function AvatarGroup({
  className,
  max = 4,
  children,
  ...props
}: AvatarGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const visibleAvatars = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  return (
    <div className={cn("flex -space-x-2", className)} {...props}>
      {visibleAvatars.map((child, index) => (
        <div key={index} className="ring-2 ring-background rounded-full">
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground text-sm font-medium flex items-center justify-center ring-2 ring-background">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export { avatarVariants };
