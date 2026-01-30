import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * Button variants using the Pizza Study theme tokens.
 *
 * The theme provides:
 * - primary/primary-foreground: Terracotta red for main actions
 * - secondary/secondary-foreground: Warm wheat for secondary actions
 * - accent/accent-foreground: Golden for highlights
 * - destructive/destructive-foreground: Deep red for dangerous actions
 * - muted/muted-foreground: Soft warm gray for subtle actions
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-lg text-sm font-medium",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90",
          "shadow-sm hover:shadow-md",
        ],
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80",
          "shadow-sm",
        ],
        outline: [
          "border-2 border-border bg-transparent",
          "text-foreground",
          "hover:bg-accent/30 hover:border-accent",
        ],
        ghost: ["text-foreground", "hover:bg-muted"],
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90",
          "shadow-sm",
        ],
        link: ["text-primary underline-offset-4", "hover:underline"],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
