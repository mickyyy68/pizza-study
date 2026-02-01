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
import {
  Calendar,
  FileText,
  FileUp,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  X,
} from "lucide-react";
import { NavLink } from "react-router";
import { useTheme } from "../hooks/useTheme";
import { useUIStore } from "../stores/ui-store";

/**
 * Navigation items for the sidebar.
 */
const navItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/documents",
    label: "Documents",
    icon: FileText,
  },
  {
    path: "/documents/upload",
    label: "Upload",
    icon: FileUp,
  },
  {
    path: "/calendar",
    label: "Calendar",
    icon: Calendar,
  },
  {
    path: "/chat",
    label: "Chat",
    icon: MessageSquare,
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
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-lg">📚</span>
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
              <X className="h-5 w-5" />
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
                <item.icon className="h-5 w-5 shrink-0" />
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
            "w-full gap-2",
            sidebarCollapsed && "justify-center px-0",
          )}
        >
          <Sparkles className="h-4 w-4" />
          {!sidebarCollapsed && (
            <div className="grid w-full grid-cols-[1fr_auto] items-center">
              <span className="text-center">Quick Chat</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
