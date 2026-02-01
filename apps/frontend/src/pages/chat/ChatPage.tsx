import { useChat } from "@ai-sdk/react";
import {
  Avatar,
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
  ChatHistoryList,
  cn,
  DocumentList,
  MobileSidebarTrigger,
  ThinkingIndicator,
  type PickerDocument,
  type MentionedDocument,
  type AttachedFile,
} from "@repo/ui";
import { BookOpen, HelpCircle, Lightbulb, Sparkles } from "lucide-react";
import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useChatStore } from "../../stores/chat-store";
import type { ChatDocument, ChatHistoryItem, Attachment } from "../../stores/chat-store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Mock data for development
const MOCK_DOCUMENTS: ChatDocument[] = [
  {
    id: "1",
    name: "Introduction to Calculus.pdf",
    pageCount: 45,
    isSelected: true,
    recentlyCited: true,
  },
  {
    id: "2",
    name: "Physics 101 Notes.pdf",
    pageCount: 23,
    isSelected: true,
    recentlyCited: false,
  },
  {
    id: "3",
    name: "Chemistry Lab Manual.pdf",
    pageCount: 78,
    isSelected: false,
    recentlyCited: false,
  },
];

const MOCK_HISTORY: ChatHistoryItem[] = [
  {
    id: "1",
    preview: "Explain integration by parts",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    messageCount: 4,
  },
  {
    id: "2",
    preview: "What is Newton's second law?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    messageCount: 6,
  },
  {
    id: "3",
    preview: "Help with chemistry homework",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    messageCount: 12,
  },
];

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat store state
  const {
    sidebarCollapsed,
    sidebarMobileOpen,
    documentsSectionCollapsed,
    historySectionCollapsed,
    documents,
    history,
    currentChatId,
    historySearchQuery,
    mentionedDocIds,
    attachments,
    toggleSidebar,
    openMobileSidebar,
    closeMobileSidebar,
    toggleDocumentsSection,
    toggleHistorySection,
    toggleDocumentSelection,
    setDocuments,
    setHistory,
    setCurrentChat,
    setHistorySearchQuery,
    getFilteredHistory,
    addMentionedDoc,
    removeMentionedDoc,
    clearMentionedDocs,
    addAttachment,
    updateAttachment,
    removeAttachment,
    clearAttachments,
  } = useChatStore();

  // Local state for thinking indicator
  const [isThinking, setIsThinking] = useState(false);

  // Initialize with mock data
  useEffect(() => {
    if (documents.length === 0) {
      setDocuments(MOCK_DOCUMENTS);
    }
    if (history.length === 0) {
      setHistory(MOCK_HISTORY);
    }
  }, [documents.length, history.length, setDocuments, setHistory]);

  // Vercel AI SDK chat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: `${API_URL}/api/chat`,
      onResponse: () => {
        // First token received, stop thinking
        setIsThinking(false);
      },
    });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      handleSubmit();
      // Clear mentions and attachments after send
      clearMentionedDocs();
      clearAttachments();
    }
  }, [input, attachments.length, handleSubmit, clearMentionedDocs, clearAttachments]);

  const handleNewChat = () => {
    setCurrentChat(null);
    clearMentionedDocs();
    clearAttachments();
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChat(chatId);
    closeMobileSidebar();
  };

  // Handle @ mention
  const handleMentionAdd = useCallback(
    (doc: PickerDocument) => {
      addMentionedDoc(doc.id);
    },
    [addMentionedDoc]
  );

  // Handle file attachment
  const handleAttach = useCallback(
    (files: FileList) => {
      Array.from(files).forEach((file) => {
        const id = `${Date.now()}-${file.name}`;
        const attachment: Attachment = {
          id,
          file,
          name: file.name,
          status: "uploading",
          progress: 0,
        };
        addAttachment(attachment);

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            clearInterval(interval);
            updateAttachment(id, { status: "complete", progress: 100 });
          } else {
            updateAttachment(id, { progress });
          }
        }, 500);
      });
    },
    [addAttachment, updateAttachment]
  );

  const filteredHistory = getFilteredHistory();

  return (
    <ChatLayout>
      {/* Sidebar */}
      <ChatLayoutSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={sidebarMobileOpen}
        onMobileClose={closeMobileSidebar}
      >
        <ChatSidebarHeader
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          onMobileClose={closeMobileSidebar}
          showMobileClose={sidebarMobileOpen}
        >
          <Sparkles className="h-4 w-4 text-primary" />
          Study Chat
        </ChatSidebarHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
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
              />
            </div>
          </ChatSidebarSection>
        </div>
      </ChatLayoutSidebar>

      {/* Main content */}
      <ChatLayoutMain>
        <div className="flex items-center gap-2 border-b border-border px-4 py-2 lg:hidden">
          <MobileSidebarTrigger onClick={openMobileSidebar} />
          <span className="font-medium">Chat</span>
        </div>

        <ChatLayoutMessages>
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={handleInputChange} />
          ) : (
            <div className="space-y-6 pb-6">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  variant={message.role as "user" | "assistant"}
                  content={message.content}
                  avatar={
                    message.role === "assistant" ? (
                      <Avatar size="md" fallback="AI" />
                    ) : (
                      <Avatar size="md" fallback="You" />
                    )
                  }
                />
              ))}

              {/* Thinking indicator (before first token) */}
              {isThinking && <ThinkingIndicator />}

              {/* Streaming indicator (after first token) */}
              {isLoading && !isThinking && messages.length > 0 && (
                <ChatMessage
                  variant="assistant"
                  content=""
                  isStreaming
                  avatar={<Avatar size="md" fallback="AI" />}
                />
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </ChatLayoutMessages>

        <ChatLayoutFooter>
          <ChatInput
            value={input}
            onChange={(value) =>
              handleInputChange({
                target: { value },
              } as ChangeEvent<HTMLTextAreaElement>)
            }
            onSubmit={onSubmit}
            placeholder="Ask anything... Use @ to mention documents"
            isLoading={isLoading}
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
          <p className="text-xs text-muted-foreground text-center mt-2">
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">@</kbd> mention docs ·{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Enter</kbd> send ·{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Shift+Enter</kbd> new line
          </p>
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
  const suggestions = [
    {
      icon: Lightbulb,
      title: "Explain a concept",
      prompt: "Can you explain the concept of integration by parts?",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      icon: BookOpen,
      title: "Quiz me",
      prompt: "Quiz me on Newton's Laws of Motion",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      icon: HelpCircle,
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
    <div className="flex flex-col items-center justify-center text-center px-4 py-10">
      <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>

      <h1 className="font-serif text-3xl font-bold mb-2">
        How can I help you study?
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Ask me questions, request explanations, get quizzed on topics, or
        explore concepts from your documents.
      </p>

      <div className="grid gap-4 sm:grid-cols-3 max-w-3xl w-full">
        {suggestions.map((suggestion) => (
          <button
            type="button"
            key={suggestion.title}
            onClick={() => handleSuggestionClick(suggestion.prompt)}
            className="group p-4 rounded-xl border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left"
          >
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center mb-3",
                suggestion.color
              )}
            >
              <suggestion.icon className="h-5 w-5" />
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
  );
}
