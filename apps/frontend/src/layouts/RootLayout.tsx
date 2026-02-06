import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { useInitialize } from "../hooks/useInitialize";
import { useTheme } from "../hooks/useTheme";
import { useUIStore } from "../stores/ui-store";
import { AppNavbar } from "./AppNavbar";

/**
 * RootLayout - Main application shell for Pizza Study.
 *
 * Provides:
 * - Sticky top navbar for global navigation
 * - Main content area (via Outlet)
 * - Theme management
 */
export function RootLayout() {
  const { closeMobileMenu } = useUIStore();
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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <AppNavbar />
      <main className="flex-1 min-h-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
