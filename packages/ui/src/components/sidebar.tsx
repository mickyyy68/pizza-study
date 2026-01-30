import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * Sidebar component system for Pizza Study.
 *
 * A composable sidebar with header, content, footer, and navigation items.
 * Supports collapsed state for more content space.
 */

/* =============================================================================
   Sidebar Container
   ============================================================================= */

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
}

export function Sidebar({ className, collapsed, ...props }: SidebarProps) {
  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "flex h-full flex-col bg-sidebar border-r border-sidebar-border",
        "transition-all duration-200 ease-out",
        collapsed ? "w-16" : "w-64",
        className,
      )}
      {...props}
    />
  );
}

/* =============================================================================
   Sidebar Header
   ============================================================================= */

export interface SidebarHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "h-16 flex items-center px-4 border-b border-sidebar-border",
        "shrink-0",
        className,
      )}
      {...props}
    />
  );
}

/* =============================================================================
   Sidebar Content
   ============================================================================= */

export interface SidebarContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({ className, ...props }: SidebarContentProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto p-3",
        "scrollbar-thin scrollbar-thumb-sidebar-border",
        className,
      )}
      {...props}
    />
  );
}

/* =============================================================================
   Sidebar Footer
   ============================================================================= */

export interface SidebarFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return (
    <div
      className={cn(
        "p-3 border-t border-sidebar-border",
        "shrink-0",
        className,
      )}
      {...props}
    />
  );
}

/* =============================================================================
   Sidebar Group
   ============================================================================= */

export interface SidebarGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function SidebarGroup({
  className,
  label,
  children,
  ...props
}: SidebarGroupProps) {
  return (
    <div className={cn("py-2", className)} {...props}>
      {label && (
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

/* =============================================================================
   Sidebar Item
   ============================================================================= */

const sidebarItemVariants = cva(
  [
    "flex items-center gap-3 px-3 py-2.5 rounded-lg",
    "text-sm font-medium",
    "transition-colors duration-150",
    "cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
  ],
  {
    variants: {
      active: {
        true: "bg-sidebar-accent text-sidebar-accent-foreground",
        false:
          "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export interface SidebarItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarItemVariants> {
  icon?: React.ReactNode;
  label: string;
  badge?: string | number;
  collapsed?: boolean;
  asChild?: boolean;
}

export function SidebarItem({
  className,
  icon,
  label,
  badge,
  collapsed,
  active,
  asChild,
  children,
  ...props
}: SidebarItemProps) {
  // If asChild, render children directly (for use with Link components)
  if (asChild && children) {
    return <>{children}</>;
  }

  return (
    <button
      className={cn(sidebarItemVariants({ active }), className)}
      {...props}
    >
      {icon && (
        <span className="shrink-0 w-5 h-5 flex items-center justify-center">
          {icon}
        </span>
      )}
      {!collapsed && (
        <>
          <span className="flex-1 text-left truncate">{label}</span>
          {badge !== undefined && (
            <span className="shrink-0 min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-medium">
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}

/* =============================================================================
   Sidebar Separator
   ============================================================================= */

export interface SidebarSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarSeparator({
  className,
  ...props
}: SidebarSeparatorProps) {
  return (
    <div
      className={cn("h-px mx-3 my-2 bg-sidebar-border", className)}
      {...props}
    />
  );
}
