import { useChat } from "@ai-sdk/react";
import { Menu02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from "@repo/ai/models";
import {
  type AttachedFile,
  ChatInputGlow,
  ChatMessage,
  ChatWelcome,
  type Citation,
  cn,
  type MentionedDocument,
  ModelSelector,
  type PickerDocument,
  ScrollToBottom,
  type SidebarConversation,
  type SidebarDocument,
  ThinkingIndicator,
} from "@repo/ui";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { ChatSidebarPanel } from "../../components/chat/ChatSidebarPanel";
import { ConfirmDialog } from "../../components/dialogs/ConfirmDialog";
import { PromptDialog } from "../../components/dialogs/PromptDialog";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import type { Attachment } from "../../stores/chat-store";
import { useChatStore } from "../../stores/chat-store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type DialogState =
  | { type: "none" }
  | { type: "rename"; conversation: SidebarConversation }
  | { type: "delete"; conversation: SidebarConversation };

/**
 * ChatPageNew - Full-page chat workspace with chat-only sidebar.
 */
export function ChatPageNew() {
  const navigate = useNavigate();

  // Track new messages for FAB indicator
  const [newMessageCount, setNewMessageCount] = useState(0);
  const prevMessageCountRef = useRef(0);

  // Dialog state for rename/delete confirmations
  const [dialogState, setDialogState] = useState<DialogState>({ type: "none" });

  // Chat store state
  const {
    documents,
    history,
    currentConversationId,
    historySearchQuery,
    mentionedDocIds,
    attachments,
    sidebarMobileOpen,
    setDocuments,
    setCurrentChat,
    setCurrentConversationId,
    setHistorySearchQuery,
    fetchConversations,
    deleteConversation,
    renameConversation,
    toggleDocumentSelection,
    openMobileSidebar,
    closeMobileSidebar,
    addMentionedDoc,
    removeMentionedDoc,
    clearMentionedDocs,
    addAttachment,
    updateAttachment,
    removeAttachment,
    clearAttachments,
    selectedModelId,
    setSelectedModelId,
  } = useChatStore();

  // Local state for thinking indicator
  const [isThinking, setIsThinking] = useState(false);

  // Fetch documents and conversations from API on mount
  useEffect(() => {
    const fetchDocumentsData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/documents`);
        if (!response.ok) throw new Error("Failed to fetch documents");
        const docs = await response.json();
        setDocuments(
          docs.map(
            (d: {
              id: string;
              title: string;
              metadata?: { pageCount?: number };
            }) => ({
              id: d.id,
              name: d.title,
              pageCount: d.metadata?.pageCount || 0,
              isSelected: true,
              recentlyCited: false,
            }),
          ),
        );
      } catch (error) {
        console.error("Failed to load documents:", error);
        toast.error("Failed to load documents");
      }
    };

    fetchDocumentsData();
    fetchConversations();
  }, [setDocuments, fetchConversations]);

  // Vercel AI SDK chat hook
  const activeModelId = selectedModelId || DEFAULT_MODEL_ID;

  const {
    messages,
    input,
    handleInputChange,
    append,
    isLoading,
    setMessages,
    setInput,
    stop,
  } = useChat({
    api: `${API_URL}/api/chat`,
    body: {
      conversationId: currentConversationId,
      model: activeModelId,
    },
    onResponse: (response) => {
      setIsThinking(false);

      const newConvoId = response.headers.get("X-Conversation-Id");
      if (newConvoId && !currentConversationId) {
        setCurrentConversationId(newConvoId);
        setCurrentChat(newConvoId);
        fetchConversations();
      }
    },
    onError: (error) => {
      setIsThinking(false);
      toast.error(error.message || "Failed to send message. Please try again.");
    },
  });

  // Smart auto-scroll hook
  const {
    containerRef: messagesContainerRef,
    isAtBottom,
    scrollToBottom,
    canScrollUp,
    canScrollDown,
  } = useAutoScroll(messages.length);

  // Track new message indicator for FAB
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current && !isAtBottom) {
      setNewMessageCount(
        (prev) => prev + (messages.length - prevMessageCountRef.current),
      );
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, isAtBottom]);

  useEffect(() => {
    if (isAtBottom) {
      setNewMessageCount(0);
    }
  }, [isAtBottom]);

  const sidebarDocuments: SidebarDocument[] = useMemo(
    () =>
      documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        pageCount: doc.pageCount,
        type: "pdf" as const,
      })),
    [documents],
  );

  const sidebarConversations: SidebarConversation[] = useMemo(
    () =>
      history.map((item) => ({
        id: item.id,
        title: item.preview || "New conversation",
        messageCount: item.messageCount || 0,
        lastMessageAt: item.timestamp,
      })),
    [history],
  );

  // Convert store documents to picker format
  const pickerDocuments: PickerDocument[] = documents.map((doc) => ({
    id: doc.id,
    name: doc.name,
    pageCount: doc.pageCount,
  }));

  // Get mentioned documents with full info
  const mentionedDocs: MentionedDocument[] = mentionedDocIds
    .map((id) => {
      const doc = documents.find((d) => d.id === id);
      return doc ? { id: doc.id, name: doc.name } : null;
    })
    .filter((d): d is MentionedDocument => d !== null);

  // Convert store attachments to input format
  const inputAttachments: AttachedFile[] = attachments.map((att) => ({
    id: att.id,
    name: att.name,
    status: att.status,
    progress: att.progress,
  }));

  const onSubmit = useCallback(() => {
    if (input.trim() || attachments.length > 0) {
      setIsThinking(true);
      const mentionAnnotations =
        mentionedDocs.length > 0
          ? [
              {
                type: "mentioned-docs",
                docs: mentionedDocs.map((doc) => ({
                  id: doc.id,
                  name: doc.name,
                })),
              },
            ]
          : undefined;
      void append(
        {
          role: "user",
          content: input.trim() ? input : "",
          annotations: mentionAnnotations,
        },
        {
          allowEmptySubmit: true,
          body: {
            conversationId: currentConversationId,
            model: activeModelId,
          },
        },
      );
      setInput("");
      clearMentionedDocs();
      clearAttachments();
    }
  }, [
    input,
    attachments.length,
    append,
    setInput,
    mentionedDocs,
    clearMentionedDocs,
    clearAttachments,
    currentConversationId,
    activeModelId,
  ]);

  const getTaggedDocs = useCallback((message: { annotations?: unknown[] }) => {
    if (!message.annotations) return [];
    const taggedDocs: { id: string; name: string }[] = [];

    for (const annotation of message.annotations) {
      if (!annotation || typeof annotation !== "object") continue;
      const typed = annotation as { type?: unknown; docs?: unknown };
      if (typed.type !== "mentioned-docs" || !Array.isArray(typed.docs)) {
        continue;
      }
      for (const doc of typed.docs) {
        if (!doc || typeof doc !== "object") continue;
        const docTyped = doc as { id?: unknown; name?: unknown };
        if (typeof docTyped.id !== "string") continue;
        if (typeof docTyped.name !== "string") continue;
        taggedDocs.push({ id: docTyped.id, name: docTyped.name });
      }
    }

    return taggedDocs;
  }, []);

  const getCitations = useCallback((message: { annotations?: unknown[] }) => {
    if (!message.annotations) return [];
    const citations: Citation[] = [];

    for (const annotation of message.annotations) {
      if (!annotation || typeof annotation !== "object") continue;
      const typed = annotation as { type?: unknown; citations?: unknown };
      if (typed.type !== "citations" || !Array.isArray(typed.citations)) {
        continue;
      }
      for (const cite of typed.citations) {
        if (!cite || typeof cite !== "object") continue;
        const citeTyped = cite as {
          id?: unknown;
          documentId?: unknown;
          documentName?: unknown;
          quote?: unknown;
          locationLabel?: unknown;
          chunkIndex?: unknown;
          pageNumber?: unknown;
        };
        if (typeof citeTyped.id !== "string") continue;
        if (typeof citeTyped.documentId !== "string") continue;
        if (typeof citeTyped.documentName !== "string") continue;

        citations.push({
          id: citeTyped.id,
          documentId: citeTyped.documentId,
          documentName: citeTyped.documentName,
          locationLabel:
            typeof citeTyped.locationLabel === "string"
              ? citeTyped.locationLabel
              : undefined,
          pageNumber:
            typeof citeTyped.pageNumber === "number"
              ? citeTyped.pageNumber
              : undefined,
          quote:
            typeof citeTyped.quote === "string" ? citeTyped.quote : undefined,
        });
      }
    }

    return citations;
  }, []);

  // Load conversation messages when currentConversationId changes (from sidebar selection)
  const prevConversationIdRef = useRef<string | null>(null);
  useEffect(() => {
    const abortController = new AbortController();

    const loadConversation = async (chatId: string) => {
      try {
        const response = await fetch(`${API_URL}/api/conversations/${chatId}`, {
          signal: abortController.signal,
        });
        if (!response.ok) throw new Error("Failed to load conversation");
        const conversationData = await response.json();

        // Only update if this request wasn't aborted (user didn't switch conversations)
        if (!abortController.signal.aborted) {
          setMessages(
            conversationData.messages.map(
              (msg: {
                id: string;
                role: string;
                content: string;
                citations?: unknown[];
              }) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                annotations:
                  msg.citations && msg.citations.length > 0
                    ? [{ type: "citations", citations: msg.citations }]
                    : undefined,
              }),
            ),
          );
        }
      } catch (error) {
        // Ignore abort errors (user switched conversations)
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load conversation:", error);
        toast.error("Failed to load conversation. Please try again.");
      }
    };

    // Only load if conversation changed and there's a valid ID
    if (
      currentConversationId &&
      currentConversationId !== prevConversationIdRef.current
    ) {
      loadConversation(currentConversationId);
    } else if (!currentConversationId && prevConversationIdRef.current) {
      // Clear messages when starting a new chat
      setMessages([]);
      clearMentionedDocs();
      clearAttachments();
    }

    prevConversationIdRef.current = currentConversationId;

    // Cleanup: abort any in-flight request when conversation changes
    return () => {
      abortController.abort();
    };
  }, [
    currentConversationId,
    setMessages,
    clearMentionedDocs,
    clearAttachments,
  ]);

  const handleMentionAdd = useCallback(
    (doc: PickerDocument) => {
      addMentionedDoc(doc.id);
    },
    [addMentionedDoc],
  );

  const handleAttach = useCallback(
    async (files: FileList) => {
      for (const file of Array.from(files)) {
        const id = `${Date.now()}-${file.name}`;
        const attachment: Attachment = {
          id,
          file,
          name: file.name,
          status: "uploading",
          progress: 0,
        };
        addAttachment(attachment);

        const formData = new FormData();
        formData.append("file", file);

        try {
          updateAttachment(id, { progress: 30 });

          const response = await fetch(`${API_URL}/api/documents`, {
            method: "POST",
            body: formData,
          });

          updateAttachment(id, { progress: 80 });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          const { id: documentId } = await response.json();
          updateAttachment(id, {
            status: "complete",
            progress: 100,
            documentId,
          });
        } catch (error) {
          console.error("File upload error:", error);
          updateAttachment(id, { status: "error", progress: 0 });
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    },
    [addAttachment, updateAttachment],
  );

  const handleSelectPrompt = useCallback(
    (prompt: string) => {
      handleInputChange({
        target: { value: prompt },
      } as ChangeEvent<HTMLTextAreaElement>);
    },
    [handleInputChange],
  );

  const handleNewChat = useCallback(() => {
    setCurrentChat(null);
    setCurrentConversationId(null);
    setMessages([]);
    clearMentionedDocs();
    clearAttachments();
    closeMobileSidebar();
  }, [
    setCurrentChat,
    setCurrentConversationId,
    setMessages,
    clearMentionedDocs,
    clearAttachments,
    closeMobileSidebar,
  ]);

  const handleSelectDocument = useCallback(
    (doc: SidebarDocument) => {
      toggleDocumentSelection(doc.id);
    },
    [toggleDocumentSelection],
  );

  const handleUploadDocument = useCallback(() => {
    closeMobileSidebar();
    navigate("/documents/upload");
  }, [closeMobileSidebar, navigate]);

  const handleSelectConversation = useCallback(
    (conv: SidebarConversation) => {
      setCurrentChat(conv.id);
      setCurrentConversationId(conv.id);
      closeMobileSidebar();
    },
    [setCurrentChat, setCurrentConversationId, closeMobileSidebar],
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

  return (
    <div className="flex h-full bg-background">
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[320px] max-w-[88vw] transform transition-transform duration-300 ease-in-out lg:hidden",
          sidebarMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <ChatSidebarPanel
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
          onMobileClose={closeMobileSidebar}
        />
      </div>

      <aside className="hidden h-full w-[320px] shrink-0 lg:block">
        <ChatSidebarPanel
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
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={openMobileSidebar}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <HugeiconsIcon icon={Menu02Icon} size={16} />
            Chat Sidebar
          </button>
        </div>

        <div className="flex h-full min-h-0 flex-col">
          <div
            ref={messagesContainerRef}
            className={cn(
              "flex-1 overflow-y-auto",
              canScrollUp && "scroll-shadow-top",
              canScrollDown && !isAtBottom && "scroll-shadow-bottom",
            )}
          >
            <div className="flex min-h-full flex-col items-center justify-center p-6">
              {messages.length === 0 ? (
                <ChatWelcome onSelectPrompt={handleSelectPrompt} />
              ) : (
                <div className="mx-auto w-full max-w-4xl space-y-6">
                  {messages.map((message, index) => {
                    const isLastMessage = index === messages.length - 1;
                    const isStreamingMessage =
                      isLastMessage &&
                      message.role === "assistant" &&
                      isLoading &&
                      !isThinking;
                    const taggedDocs =
                      message.role === "user" ? getTaggedDocs(message) : [];
                    const citations =
                      message.role === "assistant" ? getCitations(message) : [];

                    return (
                      <ChatMessage
                        key={message.id}
                        variant={message.role as "user" | "assistant"}
                        content={message.content}
                        taggedDocs={taggedDocs}
                        citations={citations}
                        isStreaming={isStreamingMessage}
                      />
                    );
                  })}

                  {isThinking && <ThinkingIndicator />}
                </div>
              )}
            </div>

            <ScrollToBottom
              visible={!isAtBottom && messages.length > 0}
              onClick={scrollToBottom}
              hasNewMessages={newMessageCount > 0}
              newMessageCount={newMessageCount}
            />
          </div>

          <div className="w-full p-6 pb-8">
            <ChatInputGlow
              value={input}
              onChange={(value: string) =>
                handleInputChange({
                  target: { value },
                } as ChangeEvent<HTMLTextAreaElement>)
              }
              onSubmit={onSubmit}
              onStop={stop}
              placeholder="Ask anything or mention documents..."
              isLoading={isLoading}
              modelSelector={
                <ModelSelector
                  models={AVAILABLE_MODELS}
                  selectedModelId={activeModelId}
                  onSelectModel={setSelectedModelId}
                />
              }
              documents={pickerDocuments}
              mentionedDocs={mentionedDocs}
              onMentionAdd={handleMentionAdd}
              onMentionRemove={removeMentionedDoc}
              attachments={inputAttachments}
              onAttach={handleAttach}
              onAttachmentRemove={removeAttachment}
              showDisclaimer={true}
            />
          </div>
        </div>
      </div>

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
