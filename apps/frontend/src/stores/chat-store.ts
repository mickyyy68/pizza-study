import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Chat Store for the redesigned chat interface.
 *
 * Manages:
 * - Chat sidebar state (mobile overlay)
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

export interface ChatGroup {
  id: string;
  name: string;
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
  sidebarMobileOpen: boolean;
  documentsSectionCollapsed: boolean;
  historySectionCollapsed: boolean;
  groupsSectionCollapsed: boolean;

  // Documents for RAG context
  documents: ChatDocument[];

  // Chat history
  history: ChatHistoryItem[];
  currentChatId: string | null;
  currentConversationId: string | null;
  historySearchQuery: string;
  groups: ChatGroup[];
  currentGroupId: string;
  chatGroupMap: Record<string, string>;

  // Input state
  mentionedDocIds: string[];
  attachments: Attachment[];

  // Model selection
  selectedModelId: string | null;

  // Sidebar actions
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleDocumentsSection: () => void;
  toggleHistorySection: () => void;
  toggleGroupsSection: () => void;

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
  renameConversation: (id: string, title: string) => Promise<void>;
  createGroup: (name: string) => string;
  deleteGroup: (groupId: string) => void;
  renameGroup: (groupId: string, name: string) => void;
  setCurrentGroupId: (groupId: string) => void;
  assignChatToGroup: (chatId: string, groupId: string) => void;

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

const DEFAULT_GROUP_ID = "ungrouped";
const DEFAULT_GROUP: ChatGroup = {
  id: DEFAULT_GROUP_ID,
  name: "Ungrouped",
};

const createGroupId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

/* =============================================================================
   Store Implementation
   ============================================================================= */

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial sidebar state
      sidebarMobileOpen: false,
      documentsSectionCollapsed: true,
      historySectionCollapsed: false,
      groupsSectionCollapsed: false,

      // Initial data (will be populated from API)
      documents: [],
      history: [],
      currentChatId: null,
      currentConversationId: null,
      historySearchQuery: "",
      groups: [DEFAULT_GROUP],
      currentGroupId: DEFAULT_GROUP_ID,
      chatGroupMap: {},

      // Initial input state
      mentionedDocIds: [],
      attachments: [],

      // Model selection (null means use default)
      selectedModelId: null,

      // Sidebar actions
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
      toggleGroupsSection: () =>
        set((state) => ({
          groupsSectionCollapsed: !state.groupsSectionCollapsed,
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
          const { chatGroupMap, currentGroupId, groups } = get();
          const groupIds = new Set(groups.map((group) => group.id));
          const defaultGroupId = groupIds.has(currentGroupId)
            ? currentGroupId
            : DEFAULT_GROUP_ID;
          const updatedGroupMap = { ...chatGroupMap };
          const history = convos.map(
            (c: {
              id: string;
              title: string;
              updatedAt: string;
              messageCount: number;
            }) => {
              if (
                !updatedGroupMap[c.id] ||
                !groupIds.has(updatedGroupMap[c.id])
              ) {
                updatedGroupMap[c.id] = defaultGroupId;
              }
              return {
                id: c.id,
                preview: c.title,
                timestamp: new Date(c.updatedAt),
                messageCount: c.messageCount,
              };
            },
          );
          set({ history, chatGroupMap: updatedGroupMap });
        } catch (error) {
          console.error("Failed to fetch conversations:", error);
          toast.error("Failed to load conversations");
        }
      },
      deleteConversation: async (id) => {
        try {
          const response = await fetch(`${API_URL}/api/chat/${id}`, {
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
            chatGroupMap: Object.fromEntries(
              Object.entries(state.chatGroupMap).filter(
                ([chatId]) => chatId !== id,
              ),
            ),
          }));
        } catch (error) {
          console.error("Failed to delete conversation:", error);
          toast.error("Failed to delete conversation");
        }
      },
      renameConversation: async (id, title) => {
        try {
          const response = await fetch(`${API_URL}/api/chat/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
          });
          if (!response.ok) throw new Error("Failed to rename conversation");
          set((state) => ({
            history: state.history.map((item) =>
              item.id === id
                ? { ...item, preview: title, timestamp: new Date() }
                : item,
            ),
          }));
        } catch (error) {
          console.error("Failed to rename conversation:", error);
          toast.error("Failed to rename conversation");
        }
      },
      createGroup: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return DEFAULT_GROUP_ID;
        const id = createGroupId();
        set((state) => ({
          groups: [...state.groups, { id, name: trimmed }],
        }));
        return id;
      },
      deleteGroup: (groupId) => {
        if (groupId === DEFAULT_GROUP_ID) return;
        set((state) => {
          const groups = state.groups.filter((group) => group.id !== groupId);
          const chatGroupMap = Object.fromEntries(
            Object.entries(state.chatGroupMap).map(([chatId, id]) => [
              chatId,
              id === groupId ? DEFAULT_GROUP_ID : id,
            ]),
          );
          return {
            groups,
            chatGroupMap,
            currentGroupId:
              state.currentGroupId === groupId
                ? DEFAULT_GROUP_ID
                : state.currentGroupId,
          };
        });
      },
      renameGroup: (groupId, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId ? { ...group, name: trimmed } : group,
          ),
        }));
      },
      setCurrentGroupId: (groupId) =>
        set((state) => ({
          currentGroupId: state.groups.some((group) => group.id === groupId)
            ? groupId
            : DEFAULT_GROUP_ID,
        })),
      assignChatToGroup: (chatId, groupId) =>
        set((state) => {
          const targetGroupId = state.groups.some(
            (group) => group.id === groupId,
          )
            ? groupId
            : DEFAULT_GROUP_ID;
          return {
            chatGroupMap: {
              ...state.chatGroupMap,
              [chatId]: targetGroupId,
            },
          };
        }),

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
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const groups = state.groups ?? [];
        if (!groups.some((group) => group.id === DEFAULT_GROUP_ID)) {
          state.groups = [DEFAULT_GROUP, ...groups];
        }
        if (
          !state.currentGroupId ||
          !state.groups.some((group) => group.id === state.currentGroupId)
        ) {
          state.currentGroupId = DEFAULT_GROUP_ID;
        }
        state.chatGroupMap = state.chatGroupMap ?? {};
      },
      partialize: (state) => ({
        // Only persist UI preferences, not data
        documentsSectionCollapsed: state.documentsSectionCollapsed,
        historySectionCollapsed: state.historySectionCollapsed,
        groupsSectionCollapsed: state.groupsSectionCollapsed,
        // Persist model selection
        selectedModelId: state.selectedModelId,
        // Persist frontend chat organization
        groups: state.groups,
        currentGroupId: state.currentGroupId,
        chatGroupMap: state.chatGroupMap,
      }),
    },
  ),
);

/* =============================================================================
   Selector Hooks (for convenience)
   ============================================================================= */

export const useSidebar = () =>
  useChatStore((state) => ({
    mobileOpen: state.sidebarMobileOpen,
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
