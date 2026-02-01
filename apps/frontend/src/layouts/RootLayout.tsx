import { Cancel01Icon, Menu02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@repo/ui";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { ChatSlideOver } from "../components/chat/ChatSlideOver";
import { useInitialize } from "../hooks/useInitialize";
import { useTheme } from "../hooks/useTheme";
import { useUIStore } from "../stores/ui-store";
import { AppSidebar } from "./AppSidebar";

/**
 * RootLayout - Main application layout for Pizza Study.
 *
 * Provides:
 * - Sidebar navigation (responsive - overlay on mobile)
 * - Main content area (via Outlet)
 * - Chat slide-over panel
 * - Global keyboard shortcuts (Cmd/Ctrl + K for chat)
 * - Theme management
 */
export function RootLayout() {
  const {
    toggleChatSlideOver,
    mobileMenuOpen,
    closeMobileMenu,
    toggleMobileMenu,
  } = useUIStore();
  const location = useLocation();

  // Initialize app data (tasks, events, stats)
  useInitialize();

  // Initialize theme system
  useTheme();

  // Close mobile menu on route change
  // biome-ignore lint/correctness/useExhaustiveDependencies: location.pathname triggers menu close on navigation
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, closeMobileMenu]);

  // Global keyboard shortcut: Cmd/Ctrl + K to toggle chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleChatSlideOver();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleChatSlideOver]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - hidden on mobile unless menu is open */}
      <div
        className={cn(
          // Mobile: fixed overlay
          "fixed inset-y-0 left-0 z-50 md:relative md:z-auto",
          // Mobile: slide in/out
          "transform transition-transform duration-300 ease-in-out",
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
        )}
      >
        <AppSidebar onMobileClose={closeMobileMenu} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto relative">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={toggleMobileMenu}
          className={cn(
            "fixed top-4 left-4 z-30 md:hidden",
            "h-10 w-10 rounded-lg",
            "bg-card border border-border shadow-sm",
            "flex items-center justify-center",
            "text-foreground hover:bg-muted",
            "transition-colors",
          )}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          ) : (
            <HugeiconsIcon icon={Menu02Icon} size={20} />
          )}
        </button>

        <Outlet />
      </main>

      {/* Chat slide-over */}
      <ChatSlideOver />
    </div>
  );
}
