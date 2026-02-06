import {
  Calendar03Icon,
  Cancel01Icon,
  Chat01Icon,
  DashboardSquare01Icon,
  File02Icon,
  Menu02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn, ThemeToggle } from "@repo/ui";
import { NavLink } from "react-router";
import { useUIStore } from "../stores/ui-store";

const navItems: { path: string; label: string; icon: IconSvgElement }[] = [
  { path: "/dashboard", label: "Dashboard", icon: DashboardSquare01Icon },
  { path: "/documents", label: "Documents", icon: File02Icon },
  { path: "/calendar", label: "Calendar", icon: Calendar03Icon },
  { path: "/chat", label: "Chat", icon: Chat01Icon },
];

export function AppNavbar() {
  const { theme, setTheme, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } =
    useUIStore();

  const cycleTheme = () => {
    const order = ["light", "dark", "system"] as const;
    const currentIndex = order.indexOf(theme);
    const nextIndex = (currentIndex + 1) % order.length;
    setTheme(order[nextIndex]);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2 min-w-0"
          onClick={closeMobileMenu}
        >
          <img
            src="/logo_nobg_compressed.png"
            alt="Pizza Study"
            className="h-10 w-10 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="font-serif text-base font-semibold text-foreground truncate">
              Pizza Study
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Learn deliciously
            </p>
          </div>
        </NavLink>

        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                )
              }
            >
              <HugeiconsIcon icon={item.icon} size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle
            theme={theme}
            onToggle={cycleTheme}
            showLabel={false}
            size="sm"
          />
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent md:hidden"
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
          >
            <HugeiconsIcon
              icon={mobileMenuOpen ? Cancel01Icon : Menu02Icon}
              size={18}
            />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="space-y-1 p-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )
                }
              >
                <HugeiconsIcon icon={item.icon} size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
