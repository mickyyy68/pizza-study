import { useEffect } from "react";
import { useUIStore } from "../stores/ui-store";

/**
 * useTheme Hook for Pizza Study.
 *
 * Manages theme state with:
 * - System preference detection
 * - localStorage persistence
 * - Document class updates for Tailwind dark mode
 *
 * The hook syncs the Zustand store with the DOM and localStorage,
 * providing a single source of truth for theme state.
 */

const STORAGE_KEY = "pizza-study-theme";

type Theme = "light" | "dark" | "system";

/**
 * Get the resolved theme (light or dark) based on current setting.
 */
function getResolvedTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

/**
 * Apply theme to document element.
 */
function applyTheme(theme: Theme) {
  const resolved = getResolvedTheme(theme);
  const root = document.documentElement;

  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

/**
 * Initialize theme from localStorage or system preference.
 */
export function initializeTheme(): Theme {
  // Check localStorage first
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored && ["light", "dark", "system"].includes(stored)) {
    return stored;
  }

  // Default to system
  return "system";
}

/**
 * Hook to manage theme with side effects.
 *
 * Call this once in your app root (RootLayout) to:
 * - Apply theme on mount
 * - Listen for system preference changes
 * - Sync theme changes to DOM and localStorage
 */
export function useTheme() {
  const { theme, setTheme } = useUIStore();

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Cycle through themes: light → dark → system
  const cycleTheme = () => {
    const order: Theme[] = ["light", "dark", "system"];
    const currentIndex = order.indexOf(theme);
    const nextIndex = (currentIndex + 1) % order.length;
    setTheme(order[nextIndex]);
  };

  return {
    theme,
    setTheme,
    cycleTheme,
    resolvedTheme: getResolvedTheme(theme),
  };
}
