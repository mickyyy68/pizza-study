import {
  Add01Icon,
  ArrowDown01Icon,
  Cancel01Icon,
  Chat01Icon,
  Delete02Icon,
  Edit02Icon,
  Pdf02Icon,
  Search01Icon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  cn,
  Input,
  type SidebarConversation,
  type SidebarDocument,
} from "@repo/ui";
import { type ReactNode, useState } from "react";

interface ChatSidebarPanelProps {
  documents?: SidebarDocument[];
  conversations?: SidebarConversation[];
  historySearchQuery?: string;
  onHistorySearchChange?: (query: string) => void;
  onNewChat?: () => void;
  onSelectDocument?: (doc: SidebarDocument) => void;
  onUploadDocument?: () => void;
  onSelectConversation?: (conv: SidebarConversation) => void;
  onEditConversation?: (conv: SidebarConversation) => void;
  onDeleteConversation?: (conv: SidebarConversation) => void;
  onMobileClose?: () => void;
  className?: string;
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 flex w-full items-center justify-between text-muted-foreground"
      >
        <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
          {title}
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={14}
          className={cn(
            "cursor-pointer transition-transform hover:text-primary",
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

function NewChatButton({ onClick }: { onClick?: () => void }) {
  return (
    <div className="mb-4 px-1">
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-lg bg-gradient-to-r from-destructive to-primary py-2.5 font-medium text-primary-foreground shadow-glow transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
      >
        <span className="inline-flex items-center gap-2">
          <HugeiconsIcon icon={Add01Icon} size={16} />
          <span>New Chat</span>
        </span>
      </button>
    </div>
  );
}

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
      className="group flex w-full cursor-pointer items-center justify-between rounded px-2 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <HugeiconsIcon
          icon={Pdf02Icon}
          size={16}
          className="shrink-0 text-red-400"
        />
        <span className="truncate transition-colors group-hover:text-sidebar-foreground">
          {document.name}
        </span>
      </div>
      <span className="shrink-0 text-[10px] opacity-50">
        {document.pageCount ?? 0}p
      </span>
    </button>
  );
}

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
          <p className="py-2 text-center text-xs text-muted-foreground opacity-50">
            No documents yet
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onUploadDocument}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-dashed border-border py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <HugeiconsIcon icon={Upload04Icon} size={14} />
        Upload Document
      </button>
    </CollapsibleSection>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.max(0, Math.floor(diffMs / 60000));
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
      className="group relative flex w-full cursor-pointer flex-col gap-1 rounded-lg border border-transparent bg-sidebar-accent/30 p-2 text-left transition-all hover:border-border"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <HugeiconsIcon
            icon={Chat01Icon}
            size={14}
            className="shrink-0 text-primary"
          />
          <span className="max-w-[10rem] truncate text-sm font-medium text-sidebar-foreground">
            {conversation.title}
          </span>
        </div>
        <div className="hidden items-center gap-1 text-muted-foreground group-hover:flex">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit?.();
            }}
            className="p-0.5 hover:text-primary"
            aria-label="Edit conversation"
          >
            <HugeiconsIcon icon={Edit02Icon} size={12} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.();
            }}
            className="p-0.5 hover:text-destructive"
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
      <div className="relative mb-3">
        <HugeiconsIcon
          icon={Search01Icon}
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="Search conversations..."
          className="h-8 w-full border-transparent bg-sidebar-accent/30 py-2 pl-8 pr-3 text-xs focus:border-primary/50"
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
          <p className="py-2 text-center text-xs text-muted-foreground opacity-50">
            {searchQuery ? "No conversations found" : "No conversations yet"}
          </p>
        )}
      </div>
    </CollapsibleSection>
  );
}

export function ChatSidebarPanel({
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
  onMobileClose,
  className,
}: ChatSidebarPanelProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-sidebar-foreground">
            Chat Workspace
          </h2>
          <p className="text-xs text-sidebar-foreground/70">
            History and documents
          </p>
        </div>
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground lg:hidden"
            aria-label="Close chat sidebar"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
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
      </div>
    </aside>
  );
}
