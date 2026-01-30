import { cn } from "../lib/utils";

/**
 * Input component using Pizza Study theme tokens.
 *
 * Inputs have warm borders that glow with the primary terracotta
 * color on focus, creating a cozy, inviting feel.
 */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        // Base styles
        "flex h-10 w-full rounded-lg border bg-background px-3 py-2",
        "text-sm text-foreground",
        // Border
        "border-input",
        // Placeholder
        "placeholder:text-muted-foreground",
        // Focus state - warm glow
        "focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary",
        // Transitions
        "transition-all duration-200",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        // File input special styling
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
