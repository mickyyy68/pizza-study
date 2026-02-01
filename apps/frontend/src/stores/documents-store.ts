import { create } from "zustand";
import type { Document, Folder } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Documents Store for Pizza Study.
 *
 * Manages document library state including:
 * - Document list
 * - Folder navigation
 * - Tag filtering
 * - Search
 * - View mode
 */

interface DocumentsState {
  // Data
  documents: Document[];
  folders: Folder[];
  isLoading: boolean;

  // Filters
  selectedFolderId: string | null;
  selectedTags: string[];
  searchQuery: string;

  // View
  viewMode: "grid" | "list";

  // Actions
  fetchDocuments: () => Promise<void>;
  fetchFolders: () => Promise<void>;
  setSelectedFolder: (folderId: string | null) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: "grid" | "list") => void;

  // Computed
  getFilteredDocuments: () => Document[];
  getFolderChildren: (parentId: string | null) => Folder[];
  getFolderPath: (folderId: string | null) => Folder[];
}

// Helper to parse API document to frontend Document type
function parseDocumentFromApi(doc: {
  id: string;
  title: string;
  content: string;
  metadata?: { mimeType?: string; originalFilename?: string } | null;
  folderId?: string | null;
  tags?: string[] | null;
  createdAt: string;
  updatedAt: string;
}): Document {
  // Derive document type from mime type or filename
  const mimeType = doc.metadata?.mimeType || "";
  const filename = doc.metadata?.originalFilename || doc.title;
  let type: Document["type"] = "note";

  if (mimeType.includes("pdf") || filename.endsWith(".pdf")) {
    type = "pdf";
  } else if (filename.includes("flashcard")) {
    type = "flashcard-deck";
  } else if (mimeType.startsWith("image/")) {
    type = "image";
  }

  return {
    id: doc.id,
    title: doc.title,
    folderId: doc.folderId ?? null,
    tags: doc.tags ?? [],
    type,
    content: doc.content,
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
  };
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  // Initialize empty (will be populated from API)
  documents: [],
  folders: [],
  isLoading: false,

  // Initial filter state
  selectedFolderId: null,
  selectedTags: [],
  searchQuery: "",
  viewMode: "grid",

  // API Actions
  fetchDocuments: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/api/documents`);
      if (!response.ok) throw new Error("Failed to fetch documents");
      const docs = await response.json();
      set({ documents: docs.map(parseDocumentFromApi) });
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFolders: async () => {
    try {
      const response = await fetch(`${API_URL}/api/folders`);
      if (!response.ok) throw new Error("Failed to fetch folders");
      const folders = await response.json();
      set({ folders });
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    }
  },

  // Actions
  setSelectedFolder: (folderId) => set({ selectedFolderId: folderId }),

  toggleTag: (tag) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag],
    })),

  clearTags: () => set({ selectedTags: [] }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setViewMode: (mode) => set({ viewMode: mode }),

  // Computed: filtered documents
  getFilteredDocuments: () => {
    const { documents, selectedFolderId, selectedTags, searchQuery } = get();

    return documents.filter((doc) => {
      // Folder filter
      if (selectedFolderId && doc.folderId !== selectedFolderId) {
        return false;
      }

      // Tag filter (OR logic - document must have at least one selected tag)
      if (selectedTags.length > 0) {
        const hasMatchingTag = selectedTags.some((tag) =>
          doc.tags.includes(tag),
        );
        if (!hasMatchingTag) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesTags = doc.tags.some((tag) =>
          tag.toLowerCase().includes(query),
        );
        if (!matchesTitle && !matchesTags) return false;
      }

      return true;
    });
  },

  // Computed: folder children
  getFolderChildren: (parentId) => {
    const { folders } = get();
    return folders.filter((f) => f.parentId === parentId);
  },

  // Computed: folder breadcrumb path
  getFolderPath: (folderId) => {
    const { folders } = get();
    const path: Folder[] = [];

    let currentId = folderId;
    while (currentId) {
      const folder = folders.find((f) => f.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }

    return path;
  },
}));
