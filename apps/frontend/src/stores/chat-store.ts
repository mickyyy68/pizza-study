import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Chat Store for the redesigned chat interface.
 *
 * Manages:
 * - Sidebar state (collapsed, mobile overlay)
 * - Document selection for RAG context
 * - Chat history navigation
 * - Input state (mentioned docs, attachments)
 */

/* =============================================================================
   Types
   ============================================================================= */

export interface ChatDocument {
  id: string;
  name: string;
  pageCount: number;
  isSelected: boolean;
  recentlyCited: boolean;
}

export interface ChatHistoryItem {
  id: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
}

export interface Attachment {
  id: string;
  file: File;
  name: string;
  status: "uploading" | "complete" | "error";
  progress: number;
  documentId?: string;
}

/* =============================================================================
   Store Interface
   ============================================================================= */

interface ChatState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  documentsSectionCollapsed: boolean;
  historySectionCollapsed: boolean;

  // Documents for RAG context
  documents: ChatDocument[];

  // Chat history
  history: ChatHistoryItem[];
  currentChatId: string | null;
  currentConversationId: string | null;
  historySearchQuery: string;

  // Input state
  mentionedDocIds: string[];
  attachments: Attachment[];

  // Model selection
  selectedModelId: string | null;

  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleDocumentsSection: () => void;
  toggleHistorySection: () => void;

  // Document actions
  setDocuments: (documents: ChatDocument[]) => void;
  toggleDocumentSelection: (docId: string) => void;
  selectAllDocuments: () => void;
  deselectAllDocuments: () => void;
  markDocumentCited: (docId: string) => void;

  // History actions
  setHistory: (history: ChatHistoryItem[]) => void;
  setCurrentChat: (chatId: string | null) => void;
  setCurrentConversationId: (id: string | null) => void;
  setHistorySearchQuery: (query: string) => void;
  getFilteredHistory: () => ChatHistoryItem[];
  fetchConversations: () => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;

  // Input actions
  addMentionedDoc: (docId: string) => void;
  removeMentionedDoc: (docId: string) => void;
  clearMentionedDocs: () => void;
  addAttachment: (attachment: Attachment) => void;
  updateAttachment: (id: string, updates: Partial<Attachment>) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;

  // Model selection actions
  setSelectedModelId: (modelId: string) => void;

  // Computed
  getSelectedDocuments: () => ChatDocument[];
  getSelectedDocumentIds: () => string[];
}

/* =============================================================================
   Store Implementation
   ============================================================================= */

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial sidebar state
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      documentsSectionCollapsed: true,
      historySectionCollapsed: false,

      // Initial data (will be populated from API)
      documents: [],
      history: [],
      currentChatId: null,
      currentConversationId: null,
      historySearchQuery: "",

      // Initial input state
      mentionedDocIds: [],
      attachments: [],

      // Model selection (null means use default)
      selectedModelId: null,

      // Sidebar actions
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      openMobileSidebar: () => set({ sidebarMobileOpen: true }),
      closeMobileSidebar: () => set({ sidebarMobileOpen: false }),
      toggleDocumentsSection: () =>
        set((state) => ({
          documentsSectionCollapsed: !state.documentsSectionCollapsed,
        })),
      toggleHistorySection: () =>
        set((state) => ({
          historySectionCollapsed: !state.historySectionCollapsed,
        })),

      // Document actions
      setDocuments: (documents) => set({ documents }),
      toggleDocumentSelection: (docId) =>
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === docId ? { ...doc, isSelected: !doc.isSelected } : doc,
          ),
        })),
      selectAllDocuments: () =>
        set((state) => ({
          documents: state.documents.map((doc) => ({
            ...doc,
            isSelected: true,
          })),
        })),
      deselectAllDocuments: () =>
        set((state) => ({
          documents: state.documents.map((doc) => ({
            ...doc,
            isSelected: false,
          })),
        })),
      markDocumentCited: (docId) =>
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === docId ? { ...doc, recentlyCited: true } : doc,
          ),
        })),

      // History actions
      setHistory: (history) => set({ history }),
      setCurrentChat: (chatId) => set({ currentChatId: chatId }),
      setCurrentConversationId: (id) => set({ currentConversationId: id }),
      setHistorySearchQuery: (query) => set({ historySearchQuery: query }),
      getFilteredHistory: () => {
        const { history, historySearchQuery } = get();
        if (!historySearchQuery.trim()) return history;
        const query = historySearchQuery.toLowerCase();
        return history.filter((item) =>
          item.preview.toLowerCase().includes(query),
        );
      },
      fetchConversations: async () => {
        try {
          const response = await fetch(`${API_URL}/api/conversations`);
          if (!response.ok) throw new Error("Failed to fetch conversations");
          const convos = await response.json();
          set({
            history: convos.map(
              (c: {
                id: string;
                title: string;
                updatedAt: string;
                messageCount: number;
              }) => ({
                id: c.id,
                preview: c.title,
                timestamp: new Date(c.updatedAt),
                messageCount: c.messageCount,
              }),
            ),
          });
        } catch (error) {
          console.error("Failed to fetch conversations:", error);
        }
      },
      deleteConversation: async (id) => {
        try {
          const response = await fetch(`${API_URL}/api/conversations/${id}`, {
            method: "DELETE",
          });
          if (!response.ok) throw new Error("Failed to delete conversation");
          // Remove from history
          set((state) => ({
            history: state.history.filter((h) => h.id !== id),
            currentChatId:
              state.currentChatId === id ? null : state.currentChatId,
            currentConversationId:
              state.currentConversationId === id
                ? null
                : state.currentConversationId,
          }));
        } catch (error) {
          console.error("Failed to delete conversation:", error);
        }
      },

      // Input actions
      addMentionedDoc: (docId) =>
        set((state) => ({
          mentionedDocIds: state.mentionedDocIds.includes(docId)
            ? state.mentionedDocIds
            : [...state.mentionedDocIds, docId],
        })),
      removeMentionedDoc: (docId) =>
        set((state) => ({
          mentionedDocIds: state.mentionedDocIds.filter((id) => id !== docId),
        })),
      clearMentionedDocs: () => set({ mentionedDocIds: [] }),
      addAttachment: (attachment) =>
        set((state) => ({ attachments: [...state.attachments, attachment] })),
      updateAttachment: (id, updates) =>
        set((state) => ({
          attachments: state.attachments.map((att) =>
            att.id === id ? { ...att, ...updates } : att,
          ),
        })),
      removeAttachment: (id) =>
        set((state) => ({
          attachments: state.attachments.filter((att) => att.id !== id),
        })),
      clearAttachments: () => set({ attachments: [] }),

      // Model selection actions
      setSelectedModelId: (modelId) => set({ selectedModelId: modelId }),

      // Computed
      getSelectedDocuments: () => {
        return get().documents.filter((doc) => doc.isSelected);
      },
      getSelectedDocumentIds: () => {
        return get()
          .documents.filter((doc) => doc.isSelected)
          .map((doc) => doc.id);
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        // Only persist UI preferences, not data
        sidebarCollapsed: state.sidebarCollapsed,
        documentsSectionCollapsed: state.documentsSectionCollapsed,
        historySectionCollapsed: state.historySectionCollapsed,
        // Persist model selection
        selectedModelId: state.selectedModelId,
      }),
    },
  ),
);

/* =============================================================================
   Selector Hooks (for convenience)
   ============================================================================= */

export const useSidebar = () =>
  useChatStore((state) => ({
    collapsed: state.sidebarCollapsed,
    mobileOpen: state.sidebarMobileOpen,
    toggle: state.toggleSidebar,
    setCollapsed: state.setSidebarCollapsed,
    openMobile: state.openMobileSidebar,
    closeMobile: state.closeMobileSidebar,
  }));

export const useDocumentsSection = () =>
  useChatStore((state) => ({
    documents: state.documents,
    collapsed: state.documentsSectionCollapsed,
    toggleCollapsed: state.toggleDocumentsSection,
    toggleSelection: state.toggleDocumentSelection,
    selectAll: state.selectAllDocuments,
    deselectAll: state.deselectAllDocuments,
    getSelected: state.getSelectedDocuments,
    getSelectedIds: state.getSelectedDocumentIds,
  }));

export const useHistorySection = () =>
  useChatStore((state) => ({
    history: state.history,
    currentChatId: state.currentChatId,
    searchQuery: state.historySearchQuery,
    collapsed: state.historySectionCollapsed,
    toggleCollapsed: state.toggleHistorySection,
    setCurrentChat: state.setCurrentChat,
    setSearchQuery: state.setHistorySearchQuery,
    getFiltered: state.getFilteredHistory,
  }));

export const useChatInput = () =>
  useChatStore((state) => ({
    mentionedDocIds: state.mentionedDocIds,
    attachments: state.attachments,
    addMention: state.addMentionedDoc,
    removeMention: state.removeMentionedDoc,
    clearMentions: state.clearMentionedDocs,
    addAttachment: state.addAttachment,
    updateAttachment: state.updateAttachment,
    removeAttachment: state.removeAttachment,
    clearAttachments: state.clearAttachments,
  }));
