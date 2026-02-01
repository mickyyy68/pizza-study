import {
  Books01Icon,
  Calendar03Icon,
  Cancel01Icon,
  Chat01Icon,
  DashboardSquare01Icon,
  File02Icon,
  FileUploadIcon,
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
    path: "/documents/upload",
    label: "Upload",
    icon: FileUploadIcon,
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
      <SidebarHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <HugeiconsIcon icon={Books01Icon} size={20} />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-serif font-semibold text-foreground">
                  Pizza Study
                </span>
                <span className="text-xs text-muted-foreground">
                  Learn deliciously
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          {onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              className="md:hidden p-2 -mr-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              aria-label="Close menu"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={20} />
            </button>
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
