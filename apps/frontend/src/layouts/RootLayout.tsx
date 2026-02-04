import { Cancel01Icon, Menu02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn, type SidebarConversation, type SidebarDocument } from "@repo/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { ChatSlideOver } from "../components/chat/ChatSlideOver";
import { ConfirmDialog } from "../components/dialogs/ConfirmDialog";
import { PromptDialog } from "../components/dialogs/PromptDialog";
import { useInitialize } from "../hooks/useInitialize";
import { useTheme } from "../hooks/useTheme";
import { useChatStore } from "../stores/chat-store";
import { useUIStore } from "../stores/ui-store";
import { AppSidebar } from "./AppSidebar";

type DialogState =
  | { type: "none" }
  | { type: "rename"; conversation: SidebarConversation }
  | { type: "delete"; conversation: SidebarConversation };

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
  const navigate = useNavigate();

  // Chat store state (for sidebar when on /chat)
  const {
    documents: chatDocuments,
    history: chatHistory,
    historySearchQuery,
    setHistorySearchQuery,
    setCurrentChat,
    setCurrentConversationId,
    toggleDocumentSelection,
    deleteConversation,
    renameConversation,
  } = useChatStore();

  // Dialog state for rename/delete confirmations
  const [dialogState, setDialogState] = useState<DialogState>({ type: "none" });

  // Check if we're on the chat route
  const isChatRoute = location.pathname === "/chat";

  // Convert chat documents to sidebar format
  const sidebarDocuments: SidebarDocument[] = useMemo(
    () =>
      chatDocuments.map((doc) => ({
        id: doc.id,
        name: doc.name,
        pageCount: doc.pageCount,
        type: "pdf" as const,
      })),
    [chatDocuments],
  );

  // Convert chat history to sidebar conversations format
  const sidebarConversations: SidebarConversation[] = useMemo(
    () =>
      chatHistory.map((item) => ({
        id: item.id,
        title: item.preview || "New conversation",
        messageCount: item.messageCount || 0,
        lastMessageAt: item.timestamp,
      })),
    [chatHistory],
  );

  // Chat sidebar callbacks
  const handleNewChat = useCallback(() => {
    setCurrentChat(null);
    setCurrentConversationId(null);
    // Navigate to chat if not already there
    if (!isChatRoute) {
      navigate("/chat");
    }
  }, [setCurrentChat, setCurrentConversationId, isChatRoute, navigate]);

  const handleSelectDocument = useCallback(
    (doc: SidebarDocument) => {
      toggleDocumentSelection(doc.id);
    },
    [toggleDocumentSelection],
  );

  const handleUploadDocument = useCallback(() => {
    navigate("/documents/upload");
  }, [navigate]);

  const handleSelectConversation = useCallback(
    (conv: SidebarConversation) => {
      setCurrentChat(conv.id);
      setCurrentConversationId(conv.id);
      // Navigate to chat if not already there
      if (!isChatRoute) {
        navigate("/chat");
      }
    },
    [setCurrentChat, setCurrentConversationId, isChatRoute, navigate],
  );

  const handleEditConversation = useCallback((conv: SidebarConversation) => {
    setDialogState({ type: "rename", conversation: conv });
  }, []);

  const handleDeleteConversation = useCallback((conv: SidebarConversation) => {
    setDialogState({ type: "delete", conversation: conv });
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogState({ type: "none" });
  }, []);

  const handleRenameSubmit = useCallback(
    async (newTitle: string) => {
      if (dialogState.type === "rename") {
        await renameConversation(dialogState.conversation.id, newTitle);
      }
      setDialogState({ type: "none" });
    },
    [dialogState, renameConversation],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (dialogState.type === "delete") {
      await deleteConversation(dialogState.conversation.id);
    }
    setDialogState({ type: "none" });
  }, [dialogState, deleteConversation]);

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
        <AppSidebar
          onMobileClose={closeMobileMenu}
          showChatSections={isChatRoute}
          documents={sidebarDocuments}
          conversations={sidebarConversations}
          historySearchQuery={historySearchQuery}
          onHistorySearchChange={setHistorySearchQuery}
          onNewChat={handleNewChat}
          onSelectDocument={handleSelectDocument}
          onUploadDocument={handleUploadDocument}
          onSelectConversation={handleSelectConversation}
          onEditConversation={handleEditConversation}
          onDeleteConversation={handleDeleteConversation}
        />
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

      {/* Rename dialog */}
      <PromptDialog
        open={dialogState.type === "rename"}
        title="Rename chat"
        defaultValue={
          dialogState.type === "rename" ? dialogState.conversation.title : ""
        }
        placeholder="Enter a new name"
        submitLabel="Rename"
        onSubmit={handleRenameSubmit}
        onCancel={handleDialogClose}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={dialogState.type === "delete"}
        title="Delete chat"
        message={
          dialogState.type === "delete"
            ? `Delete "${dialogState.conversation.title}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDialogClose}
      />
    </div>
  );
}
