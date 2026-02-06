import { create } from "zustand";

/**
 * UI Store for global UI state in Pizza Study.
 *
 * Manages:
 * - Theme (light/dark/system)
 * - Mobile navbar menu state
 */

type Theme = "light" | "dark" | "system";

interface UIState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Mobile Menu
  mobileMenuOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
}

/**
 * Get initial theme from localStorage or default to system.
 */
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";

  const stored = localStorage.getItem("pizza-study-theme") as Theme | null;
  if (stored && ["light", "dark", "system"].includes(stored)) {
    return stored;
  }
  return "system";
}

export const useUIStore = create<UIState>((set) => ({
  // Theme
  theme: getInitialTheme(),
  setTheme: (theme) => set({ theme }),

  // Mobile Menu
  mobileMenuOpen: false,
  openMobileMenu: () => set({ mobileMenuOpen: true }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  toggleMobileMenu: () =>
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
}));
