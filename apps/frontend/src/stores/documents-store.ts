import { create } from "zustand";
import type { Document, Folder } from "../types";
import { mockDocuments, mockFolders } from "../mock/documents";

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

  // Filters
  selectedFolderId: string | null;
  selectedTags: string[];
  searchQuery: string;

  // View
  viewMode: "grid" | "list";

  // Actions
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

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  // Initialize with mock data
  documents: mockDocuments,
  folders: mockFolders,

  // Initial filter state
  selectedFolderId: null,
  selectedTags: [],
  searchQuery: "",
  viewMode: "grid",

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
          doc.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesTags = doc.tags.some((tag) =>
          tag.toLowerCase().includes(query)
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
