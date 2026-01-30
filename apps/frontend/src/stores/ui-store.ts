import { create } from "zustand";

/**
 * UI Store for global UI state in Pizza Study.
 *
 * Manages:
 * - Sidebar collapsed state
 * - Chat slide-over visibility
 * - Theme (light/dark/system)
 * - Mobile menu state
 */

type Theme = "light" | "dark" | "system";

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Chat SlideOver
  chatSlideOverOpen: boolean;
  openChatSlideOver: () => void;
  closeChatSlideOver: () => void;
  toggleChatSlideOver: () => void;

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
  // Sidebar
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Chat SlideOver
  chatSlideOverOpen: false,
  openChatSlideOver: () => set({ chatSlideOverOpen: true }),
  closeChatSlideOver: () => set({ chatSlideOverOpen: false }),
  toggleChatSlideOver: () =>
    set((state) => ({ chatSlideOverOpen: !state.chatSlideOverOpen })),

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
