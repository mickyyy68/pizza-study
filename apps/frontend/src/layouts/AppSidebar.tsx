import {
  Add01Icon,
  ArrowDown01Icon,
  Calendar03Icon,
  Cancel01Icon,
  Chat01Icon,
  DashboardSquare01Icon,
  Delete02Icon,
  Edit02Icon,
  File02Icon,
  Pdf02Icon,
  Search01Icon,
  SparklesIcon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Button,
  cn,
  Input,
  Separator,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  type SidebarConversation,
  type SidebarDocument,
  ThemeToggle,
} from "@repo/ui";
import { useState } from "react";
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
  /** Whether to show chat-specific sections (documents, history, new chat) */
  showChatSections?: boolean;
  /** Documents list for chat sidebar */
  documents?: SidebarDocument[];
  /** Conversation history for chat sidebar */
  conversations?: SidebarConversation[];
  /** Search query for filtering history */
  historySearchQuery?: string;
  /** Called when history search query changes */
  onHistorySearchChange?: (query: string) => void;
  /** Called when new chat button is clicked */
  onNewChat?: () => void;
  /** Called when a document is selected */
  onSelectDocument?: (doc: SidebarDocument) => void;
  /** Called when upload document is clicked */
  onUploadDocument?: () => void;
  /** Called when a conversation is selected */
  onSelectConversation?: (conv: SidebarConversation) => void;
  /** Called when edit conversation is clicked */
  onEditConversation?: (conv: SidebarConversation) => void;
  /** Called when delete conversation is clicked */
  onDeleteConversation?: (conv: SidebarConversation) => void;
}

/* =============================================================================
   Chat Section Sub-components
   ============================================================================= */

/**
 * Collapsible section wrapper for Documents and History
 */
function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-2 text-muted-foreground"
      >
        <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
          {title}
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={14}
          className={cn(
            "transition-transform cursor-pointer hover:text-primary",
            !isOpen && "-rotate-90",
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-[500px]" : "max-h-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * New Chat button with gradient glow effect
 */
function NewChatButton({ onClick }: { onClick?: () => void }) {
  return (
    <div className="px-1 mb-4">
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-destructive to-primary text-primary-foreground font-medium shadow-glow hover:shadow-lg hover:opacity-90 transition-all transform active:scale-[0.98]"
      >
        <HugeiconsIcon icon={Add01Icon} size={16} />
        <span>New Chat</span>
      </button>
    </div>
  );
}

/**
 * Document item in the documents section
 */
function DocumentItem({
  document,
  onClick,
}: {
  document: SidebarDocument;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between w-full px-2 py-2 rounded hover:bg-sidebar-accent/50 cursor-pointer text-sm text-sidebar-foreground/70 group"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <HugeiconsIcon icon={Pdf02Icon} size={16} className="text-red-400 shrink-0" />
        <span className="truncate group-hover:text-sidebar-foreground transition-colors">
          {document.name}
        </span>
      </div>
      <span className="text-[10px] opacity-50 shrink-0">
        {document.pageCount ?? 0}p
      </span>
    </button>
  );
}

/**
 * Documents section with list and upload button
 */
function DocumentsSection({
  documents = [],
  onSelectDocument,
  onUploadDocument,
}: {
  documents?: SidebarDocument[];
  onSelectDocument?: (doc: SidebarDocument) => void;
  onUploadDocument?: () => void;
}) {
  return (
    <CollapsibleSection title="Documents">
      <div className="space-y-1">
        {documents.map((doc) => (
          <DocumentItem
            key={doc.id}
            document={doc}
            onClick={() => onSelectDocument?.(doc)}
          />
        ))}
        {documents.length === 0 && (
          <p className="text-xs text-muted-foreground opacity-50 text-center py-2">
            No documents yet
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onUploadDocument}
        className="w-full mt-2 flex items-center justify-center gap-2 py-1.5 border border-dashed border-border rounded text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        <HugeiconsIcon icon={Upload04Icon} size={14} />
        Upload Document
      </button>
    </CollapsibleSection>
  );
}

/**
 * Format relative time (e.g., "12m ago", "2h ago", "3d ago")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return `${diffDays}d ago`;
}

/**
 * History item for a conversation
 */
function HistoryItem({
  conversation,
  onClick,
  onEdit,
  onDelete,
}: {
  conversation: SidebarConversation;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col gap-1 w-full p-2 rounded-lg bg-sidebar-accent/30 border border-transparent hover:border-border transition-all cursor-pointer text-left"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <HugeiconsIcon
            icon={Chat01Icon}
            size={14}
            className="text-primary shrink-0"
          />
          <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[8rem]">
            {conversation.title}
          </span>
        </div>
        <div className="hidden group-hover:flex items-center gap-1 text-muted-foreground">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="hover:text-primary p-0.5"
            aria-label="Edit conversation"
          >
            <HugeiconsIcon icon={Edit02Icon} size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="hover:text-destructive p-0.5"
            aria-label="Delete conversation"
          >
            <HugeiconsIcon icon={Delete02Icon} size={12} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground opacity-70">
        <span>{formatRelativeTime(conversation.lastMessageAt)}</span>
        <span>•</span>
        <span>{conversation.messageCount} msgs</span>
      </div>
    </button>
  );
}

/**
 * History section with search and conversation list
 */
function HistorySection({
  conversations = [],
  searchQuery = "",
  onSearchChange,
  onSelectConversation,
  onEditConversation,
  onDeleteConversation,
}: {
  conversations?: SidebarConversation[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSelectConversation?: (conv: SidebarConversation) => void;
  onEditConversation?: (conv: SidebarConversation) => void;
  onDeleteConversation?: (conv: SidebarConversation) => void;
}) {
  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <CollapsibleSection title="History">
      {/* Search input */}
      <div className="relative mb-3">
        <HugeiconsIcon
          icon={Search01Icon}
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search conversations..."
          className="w-full bg-sidebar-accent/30 border-transparent focus:border-primary/50 text-xs py-2 pl-8 pr-3 h-8"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange?.("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} />
          </button>
        )}
      </div>

      {/* Conversation list */}
      <div className="space-y-1">
        {filteredConversations.map((conv) => (
          <HistoryItem
            key={conv.id}
            conversation={conv}
            onClick={() => onSelectConversation?.(conv)}
            onEdit={() => onEditConversation?.(conv)}
            onDelete={() => onDeleteConversation?.(conv)}
          />
        ))}
        {filteredConversations.length === 0 && (
          <p className="text-xs text-muted-foreground opacity-50 text-center py-2">
            {searchQuery ? "No conversations found" : "No conversations yet"}
          </p>
        )}
      </div>
    </CollapsibleSection>
  );
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
 * - Conditional chat sections (documents, history) when on /chat route
 */
export function AppSidebar({
  onMobileClose,
  showChatSections = false,
  documents,
  conversations,
  historySearchQuery,
  onHistorySearchChange,
  onNewChat,
  onSelectDocument,
  onUploadDocument,
  onSelectConversation,
  onEditConversation,
  onDeleteConversation,
}: AppSidebarProps) {
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

        {/* Chat-specific sections - only shown on /chat route */}
        {showChatSections && !sidebarCollapsed && (
          <SidebarGroup className="mt-4">
            <NewChatButton onClick={onNewChat} />
            <DocumentsSection
              documents={documents}
              onSelectDocument={onSelectDocument}
              onUploadDocument={onUploadDocument}
            />
            <HistorySection
              conversations={conversations}
              searchQuery={historySearchQuery}
              onSearchChange={onHistorySearchChange}
              onSelectConversation={onSelectConversation}
              onEditConversation={onEditConversation}
              onDeleteConversation={onDeleteConversation}
            />
          </SidebarGroup>
        )}
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
