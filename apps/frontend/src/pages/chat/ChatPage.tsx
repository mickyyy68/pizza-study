import { useChat } from "@ai-sdk/react";
import {
  BookOpen01Icon,
  BulbIcon,
  HelpCircleIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from "@repo/ai/models";
import {
  type AttachedFile,
  Button,
  ChatHistoryList,
  ChatInput,
  ChatLayout,
  ChatLayoutFooter,
  ChatLayoutMain,
  ChatLayoutMessages,
  ChatLayoutSidebar,
  ChatMessage,
  ChatSidebarHeader,
  ChatSidebarNewButton,
  ChatSidebarSearch,
  ChatSidebarSection,
  cn,
  DocumentList,
  type MentionedDocument,
  MobileSidebarTrigger,
  ModelSelector,
  type PickerDocument,
  ScrollToBottom,
  ThinkingIndicator,
} from "@repo/ui";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import type { Attachment } from "../../stores/chat-store";
import { useChatStore } from "../../stores/chat-store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * ChatPage - Full-page chat with sidebar for Pizza Study.
 *
 * Features:
 * - Two-panel layout (sidebar + chat)
 * - Document selection for RAG context
 * - @ mentions to reference documents
 * - File attachments with drag-drop
 * - Chat history navigation
 * - Rich markdown message rendering
 */
export function ChatPage() {
  // Track new messages for FAB indicator
  const [newMessageCount, setNewMessageCount] = useState(0);
  const prevMessageCountRef = useRef(0);
  const _prevGroupIdRef = useRef<string | null>(null);

  // Chat store state
  const {
    sidebarCollapsed,
    sidebarMobileOpen,
    documentsSectionCollapsed,
    historySectionCollapsed,
    groupsSectionCollapsed: _groupsSectionCollapsed,
    documents,
    currentChatId,
    currentConversationId,
    historySearchQuery,
    groups: _groups,
    currentGroupId: _currentGroupId,
    chatGroupMap: _chatGroupMap,
    mentionedDocIds,
    attachments,
    toggleSidebar,
    openMobileSidebar,
    closeMobileSidebar,
    toggleDocumentsSection,
    toggleHistorySection,
    toggleGroupsSection: _toggleGroupsSection,
    toggleDocumentSelection,
    setDocuments,
    setCurrentChat,
    setCurrentConversationId,
    setHistorySearchQuery,
    getFilteredHistory,
    fetchConversations,
    deleteConversation,
    renameConversation,
    createGroup,
    deleteGroup,
    setCurrentGroupId,
    assignChatToGroup,
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

  // Local state for thinking indicator and errors
  const [isThinking, setIsThinking] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Fetch documents and conversations from API on mount
  useEffect(() => {
    const fetchDocuments = async () => {
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
        // Keep empty state - user can upload documents
      }
    };
    fetchDocuments();
    fetchConversations();
  }, [setDocuments, fetchConversations]);

  // Vercel AI SDK chat hook with error handling and conversation persistence
  // Use selected model or default
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
      // First token received, stop thinking
      setIsThinking(false);
      setChatError(null);

      // Get conversation ID from response header for new conversations
      const newConvoId = response.headers.get("X-Conversation-Id");
      if (newConvoId && !currentConversationId) {
        setCurrentConversationId(newConvoId);
        setCurrentChat(newConvoId);
        // Refresh conversation list to include the new conversation
        fetchConversations();
      }
    },
    onError: (error) => {
      setIsThinking(false);
      setChatError(
        error.message || "Failed to send message. Please try again.",
      );
      // Auto-clear error after 5 seconds
      setTimeout(() => setChatError(null), 5000);
    },
  });

  // Smart auto-scroll hook - triggers when message count changes
  const {
    containerRef: messagesContainerRef,
    isAtBottom,
    scrollToBottom,
    canScrollUp,
    canScrollDown,
  } = useAutoScroll(messages.length);

  // Track new message indicator for FAB
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      // New message arrived
      if (!isAtBottom) {
        setNewMessageCount(
          (prev) => prev + (messages.length - prevMessageCountRef.current),
        );
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, isAtBottom]);

  // Clear new message count when scrolling to bottom
  useEffect(() => {
    if (isAtBottom) {
      setNewMessageCount(0);
    }
  }, [isAtBottom]);

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
        { allowEmptySubmit: true },
      );
      setInput("");
      // Clear mentions and attachments after send
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

  const handleNewChat = () => {
    setCurrentChat(null);
    setCurrentConversationId(null);
    setMessages([]);
    clearMentionedDocs();
    clearAttachments();
  };

  const handleSelectChat = async (chatId: string) => {
    setCurrentChat(chatId);
    setCurrentConversationId(chatId);
    closeMobileSidebar();

    // Load conversation messages from API
    try {
      const response = await fetch(`${API_URL}/api/conversations/${chatId}`);
      if (!response.ok) throw new Error("Failed to load conversation");
      const conversation = await response.json();

      // Convert to useChat message format
      setMessages(
        conversation.messages.map(
          (msg: { id: string; role: string; content: string }) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
          }),
        ),
      );
    } catch (error) {
      console.error("Failed to load conversation:", error);
      setChatError("Failed to load conversation. Please try again.");
      setTimeout(() => setChatError(null), 5000);
    }
  };

  // Handle function for deleting a conversation
  const handleDeleteChat = useCallback(
    async (chatId: string) => {
      await deleteConversation(chatId);
      if (chatId === currentChatId) {
        setMessages([]);
        clearMentionedDocs();
        clearAttachments();
      }
    },
    [
      deleteConversation,
      currentChatId,
      setMessages,
      clearMentionedDocs,
      clearAttachments,
    ],
  );

  const handleRenameChat = useCallback(
    async (chatId: string, currentTitle: string) => {
      const nextTitle = window.prompt("Chat name", currentTitle);
      if (!nextTitle) return;
      const trimmed = nextTitle.trim();
      if (!trimmed || trimmed === currentTitle) return;
      await renameConversation(chatId, trimmed);
    },
    [renameConversation],
  );

  // Handle @ mention
  const handleMentionAdd = useCallback(
    (doc: PickerDocument) => {
      addMentionedDoc(doc.id);
    },
    [addMentionedDoc],
  );

  // Handle file attachment with real API upload
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

        // Upload to API
        const formData = new FormData();
        formData.append("file", file);

        try {
          // Show progress updates during upload
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
        }
      }
    },
    [addAttachment, updateAttachment],
  );

  const filteredHistory = getFilteredHistory();

  return (
    <ChatLayout className="bg-background">
      {/* Sidebar */}
      <ChatLayoutSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={sidebarMobileOpen}
        onMobileClose={closeMobileSidebar}
        className="bg-card/70"
      >
        <ChatSidebarHeader
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          onMobileClose={closeMobileSidebar}
          showMobileClose={sidebarMobileOpen}
          className="bg-background/80 backdrop-blur"
        >
          <HugeiconsIcon
            icon={SparklesIcon}
            size={16}
            className="text-primary"
          />
          Study Chat
        </ChatSidebarHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2">
            <ChatSidebarNewButton onClick={handleNewChat} />
          </div>

          <ChatSidebarSection
            title="Documents"
            collapsed={documentsSectionCollapsed}
            onToggleCollapse={toggleDocumentsSection}
          >
            <DocumentList
              documents={documents}
              onToggleSelection={toggleDocumentSelection}
              onUploadClick={() => console.log("Upload clicked")}
            />
          </ChatSidebarSection>

          <ChatSidebarSection
            title="History"
            collapsed={historySectionCollapsed}
            onToggleCollapse={toggleHistorySection}
          >
            <div className="space-y-2">
              <ChatSidebarSearch
                value={historySearchQuery}
                onChange={setHistorySearchQuery}
                placeholder="Search conversations..."
              />
              <ChatHistoryList
                items={filteredHistory}
                currentChatId={currentChatId}
                onSelectChat={handleSelectChat}
                onDeleteChat={handleDeleteChat}
                onRenameChat={handleRenameChat}
              />
            </div>
          </ChatSidebarSection>
        </div>
      </ChatLayoutSidebar>

      {/* Main content */}
      <ChatLayoutMain className="bg-muted/20">
        <div className="flex items-center justify-between border-b border-border/60 bg-background/95 px-3 py-2">
          <div className="flex items-center gap-2">
            <MobileSidebarTrigger onClick={openMobileSidebar} />
            <p className="text-sm font-medium">Study Chat</p>
          </div>
          {sidebarCollapsed && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSidebar}
              className="hidden h-8 md:inline-flex"
            >
              Show sidebar
            </Button>
          )}
        </div>

        <ChatLayoutMessages
          ref={messagesContainerRef}
          showTopShadow={canScrollUp}
          showBottomShadow={canScrollDown && !isAtBottom}
          className="bg-background/40"
        >
          <div className="space-y-6">
            {messages.length === 0 ? (
              <WelcomeScreen onSuggestionClick={handleInputChange} />
            ) : (
              <div className="flex flex-col">
                {messages.map((message, index) => {
                  const isLastMessage = index === messages.length - 1;
                  const isStreamingMessage =
                    isLastMessage &&
                    message.role === "assistant" &&
                    isLoading &&
                    !isThinking;
                  const taggedDocs =
                    message.role === "user" ? getTaggedDocs(message) : [];

                  return (
                    <ChatMessage
                      key={message.id}
                      variant={message.role as "user" | "assistant"}
                      content={message.content}
                      taggedDocs={taggedDocs}
                      isStreaming={isStreamingMessage}
                    />
                  );
                })}

                {/* Thinking indicator (before first token) */}
                {isThinking && <ThinkingIndicator />}

                {/* Error indicator */}
                {chatError && (
                  <div className="flex justify-center">
                    <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-lg animate-in fade-in-0 slide-in-from-bottom-2">
                      {chatError}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scroll to bottom FAB */}
          <ScrollToBottom
            visible={!isAtBottom && messages.length > 0}
            onClick={scrollToBottom}
            hasNewMessages={newMessageCount > 0}
            newMessageCount={newMessageCount}
          />
        </ChatLayoutMessages>

        <ChatLayoutFooter className="border-border/60 bg-background/95 backdrop-blur">
          <ChatInput
            value={input}
            onChange={(value) =>
              handleInputChange({
                target: { value },
              } as ChangeEvent<HTMLTextAreaElement>)
            }
            onSubmit={onSubmit}
            onStop={stop}
            placeholder="Ask anything or mention documents"
            isLoading={isLoading}
            modelSelector={
              <ModelSelector
                models={AVAILABLE_MODELS}
                selectedModelId={activeModelId}
                onSelectModel={setSelectedModelId}
              />
            }
            // @ Mentions
            documents={pickerDocuments}
            mentionedDocs={mentionedDocs}
            onMentionAdd={handleMentionAdd}
            onMentionRemove={removeMentionedDoc}
            // Attachments
            attachments={inputAttachments}
            onAttach={handleAttach}
            onAttachmentRemove={removeAttachment}
          />
        </ChatLayoutFooter>
      </ChatLayoutMain>
    </ChatLayout>
  );
}

/* =============================================================================
   WelcomeScreen
   ============================================================================= */

interface WelcomeScreenProps {
  onSuggestionClick: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  const suggestions: {
    icon: IconSvgElement;
    title: string;
    prompt: string;
    color: string;
  }[] = [
    {
      icon: BulbIcon,
      title: "Explain a concept",
      prompt: "Can you explain the concept of integration by parts?",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      icon: BookOpen01Icon,
      title: "Quiz me",
      prompt: "Quiz me on Newton's Laws of Motion",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      icon: HelpCircleIcon,
      title: "Help with homework",
      prompt: "I'm stuck on a calculus problem. Can you help?",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ];

  const handleSuggestionClick = (prompt: string) => {
    onSuggestionClick({
      target: { value: prompt },
    } as ChangeEvent<HTMLTextAreaElement>);
  };

  return (
    <div className="my-6 rounded-3xl border border-border/70 bg-card/80 p-8 shadow-sm md:my-10 md:p-10">
      <div className="space-y-5 pt-2">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            How can I help you study?
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md">
            Ask me questions, request explanations, or build study plans using
            your saved documents.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Start with
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {suggestions.map((suggestion) => (
              <button
                type="button"
                key={suggestion.title}
                onClick={() => handleSuggestionClick(suggestion.prompt)}
                className="group rounded-2xl border border-border/70 bg-background/70 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center mb-3",
                    suggestion.color,
                  )}
                >
                  <HugeiconsIcon icon={suggestion.icon} size={20} />
                </div>
                <p className="font-medium text-sm group-hover:text-primary transition-colors">
                  {suggestion.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  "{suggestion.prompt}"
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
