import { cn } from "../lib/utils";

/**
 * ThemeToggle Component for Pizza Study.
 *
 * A button that cycles through light → dark → system themes.
 * Displays the appropriate icon for the current theme.
 *
 * Note: This component is presentation-only. The actual theme
 * logic (localStorage, system detection) is handled by the
 * useTheme hook in the frontend app.
 */

export type Theme = "light" | "dark" | "system";

export interface ThemeToggleProps {
  /** Current theme */
  theme: Theme;
  /** Called when theme should change */
  onToggle: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Show label next to icon */
  showLabel?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-5 w-5",
};

/**
 * Sun icon for light mode.
 */
function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

/**
 * Moon icon for dark mode.
 */
function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

/**
 * Monitor icon for system mode.
 */
function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

const themeLabels: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function ThemeToggle({
  theme,
  onToggle,
  className,
  showLabel = false,
  size = "md",
}: ThemeToggleProps) {
  const Icon = theme === "light" ? SunIcon : theme === "dark" ? MoonIcon : MonitorIcon;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg",
        "text-sidebar-foreground/70 hover:text-sidebar-foreground",
        "hover:bg-sidebar-accent/50 transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        showLabel ? "px-3 py-2" : sizeClasses[size],
        className
      )}
      title={`Theme: ${themeLabels[theme]}. Click to change.`}
      aria-label={`Current theme: ${themeLabels[theme]}. Click to cycle themes.`}
    >
      <Icon className={iconSizeClasses[size]} />
      {showLabel && (
        <span className="text-sm font-medium">{themeLabels[theme]}</span>
      )}
    </button>
  );
}
