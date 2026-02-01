import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
  Menu02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Input } from "./input";

/* =============================================================================
   ChatSidebarHeader - Top section with collapse toggle
   ============================================================================= */

export interface ChatSidebarHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onMobileClose?: () => void;
  showMobileClose?: boolean;
}

/**
 * Header section of chat sidebar with collapse/close controls.
 */
export function ChatSidebarHeader({
  className,
  collapsed,
  onToggleCollapse,
  onMobileClose,
  showMobileClose = false,
  children,
  ...props
}: ChatSidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border px-3 py-2",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2 font-medium text-sm">
        {children}
      </div>
      <div className="flex items-center gap-1">
        {/* Mobile close button */}
        {showMobileClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileClose}
            className="md:hidden"
            aria-label="Close sidebar"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </Button>
        )}
        {/* Desktop collapse button */}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="hidden md:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={16}
              className={cn("transition-transform", collapsed && "rotate-180")}
            />
          </Button>
        )}
      </div>
    </div>
  );
}

/* =============================================================================
   ChatSidebarSection - Collapsible section
   ============================================================================= */

export interface ChatSidebarSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  action?: React.ReactNode;
}

/**
 * Collapsible section within the sidebar (Documents, History, etc.).
 */
export function ChatSidebarSection({
  className,
  title,
  collapsed = false,
  onToggleCollapse,
  action,
  children,
  ...props
}: ChatSidebarSectionProps) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {/* Section header */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={!collapsed}
      >
        <span className="flex items-center gap-2">
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={16}
            className={cn("transition-transform", collapsed && "-rotate-90")}
          />
          {title}
        </span>
        {action && <span onClick={(e) => e.stopPropagation()}>{action}</span>}
      </button>

      {/* Section content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          collapsed ? "max-h-0" : "max-h-[500px]",
        )}
      >
        <div className="px-2 pb-2">{children}</div>
      </div>
    </div>
  );
}

/* =============================================================================
   ChatSidebarSearch - Search input for history
   ============================================================================= */

export interface ChatSidebarSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Search input for filtering chat history.
 */
export function ChatSidebarSearch({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: ChatSidebarSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <HugeiconsIcon
        icon={Search01Icon}
        size={16}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8 pr-8 h-8 text-sm"
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </button>
      )}
    </div>
  );
}

/* =============================================================================
   ChatSidebarNewButton - New chat button
   ============================================================================= */

export interface ChatSidebarNewButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Prominent "New Chat" button.
 */
export function ChatSidebarNewButton({
  onClick,
  className,
}: ChatSidebarNewButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn("w-full justify-start gap-2", className)}
      size="sm"
    >
      <HugeiconsIcon icon={Add01Icon} size={16} />
      New Chat
    </Button>
  );
}

/* =============================================================================
   MobileSidebarTrigger - Hamburger button for mobile
   ============================================================================= */

export interface MobileSidebarTriggerProps {
  onClick: () => void;
  className?: string;
}

/**
 * Hamburger menu button to open mobile sidebar.
 */
export function MobileSidebarTrigger({
  onClick,
  className,
}: MobileSidebarTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn("lg:hidden", className)}
      aria-label="Open sidebar"
    >
      <HugeiconsIcon icon={Menu02Icon} size={20} />
    </Button>
  );
}
