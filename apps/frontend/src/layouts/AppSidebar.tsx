import {
  Calendar03Icon,
  Cancel01Icon,
  Chat01Icon,
  DashboardSquare01Icon,
  File02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Button,
  cn,
  Separator,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  ThemeToggle,
} from "@repo/ui";
import { NavLink } from "react-router";
import { useTheme } from "../hooks/useTheme";
import { useUIStore } from "../stores/ui-store";

/**
 * Navigation items for the sidebar.
 */
const navItems: { path: string; label: string; icon: IconSvgElement }[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: DashboardSquare01Icon,
  },
  {
    path: "/documents",
    label: "Documents",
    icon: File02Icon,
  },
  {
    path: "/calendar",
    label: "Calendar",
    icon: Calendar03Icon,
  },
  {
    path: "/chat",
    label: "Chat",
    icon: Chat01Icon,
  },
];

interface AppSidebarProps {
  /** Called when mobile close button is clicked */
  onMobileClose?: () => void;
}

/**
 * AppSidebar - Main navigation sidebar for Pizza Study.
 *
 * Features:
 * - App branding/logo
 * - Navigation links with active states
 * - Theme toggle (light/dark/system)
 * - Quick Chat button to open slide-over
 * - Mobile close button
 */
export function AppSidebar({ onMobileClose }: AppSidebarProps) {
  const { sidebarCollapsed, openChatSlideOver } = useUIStore();
  const { theme, cycleTheme } = useTheme();

  return (
    <Sidebar collapsed={sidebarCollapsed}>
      {/* Header with logo */}
      <SidebarHeader
        className={cn(
          "relative",
          sidebarCollapsed ? "h-20" : "h-auto min-h-[160px] py-4",
        )}
      >
        {/* Mobile close button - positioned absolute */}
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="md:hidden absolute top-2 right-2 p-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors z-10"
            aria-label="Close menu"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        )}

        <div
          className={cn(
            "flex flex-col items-center w-full",
            sidebarCollapsed ? "justify-center" : "gap-2",
          )}
        >
          <img
            src="/logo_nobg_compressed.png"
            alt="Pizza Study"
            className={cn(
              "object-contain transition-all duration-200",
              sidebarCollapsed ? "h-20 w-20" : "h-28 w-28",
            )}
          />
          {!sidebarCollapsed && (
            <div className="flex flex-col items-center text-center">
              <span className="font-serif font-semibold text-foreground">
                Pizza Study
              </span>
              <span className="text-xs text-muted-foreground">
                Learn deliciously
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                  )
                }
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={20}
                  className="shrink-0"
                />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Theme Toggle and Quick Chat */}
      <SidebarFooter>
        {/* Theme toggle */}
        <div
          className={cn(
            "flex items-center mb-3",
            sidebarCollapsed ? "justify-center" : "justify-between px-1",
          )}
        >
          {!sidebarCollapsed && (
            <span className="text-xs text-muted-foreground">Theme</span>
          )}
          <ThemeToggle
            theme={theme}
            onToggle={cycleTheme}
            showLabel={!sidebarCollapsed}
            size="sm"
          />
        </div>

        <Separator className="mb-3" />

        {/* Quick Chat button */}
        <Button
          onClick={openChatSlideOver}
          variant="outline"
          className={cn(
            "w-full",
            sidebarCollapsed ? "justify-center px-0" : "justify-between",
          )}
        >
          <span className="inline-flex items-center gap-2">
            <HugeiconsIcon icon={SparklesIcon} size={16} />
            {!sidebarCollapsed && <span>Quick Chat</span>}
          </span>
          {!sidebarCollapsed && (
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
