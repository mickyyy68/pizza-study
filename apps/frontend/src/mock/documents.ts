import type { Document, Folder } from "../types";

/**
 * Mock folder structure for Pizza Study.
 */
export const mockFolders: Folder[] = [
  {
    id: "folder-math",
    name: "Mathematics",
    parentId: null,
    color: "blue",
    icon: "calculator",
  },
  {
    id: "folder-physics",
    name: "Physics",
    parentId: null,
    color: "purple",
    icon: "atom",
  },
  {
    id: "folder-history",
    name: "History",
    parentId: null,
    color: "amber",
    icon: "book",
  },
  {
    id: "folder-calculus",
    name: "Calculus",
    parentId: "folder-math",
    color: "blue",
  },
  {
    id: "folder-algebra",
    name: "Linear Algebra",
    parentId: "folder-math",
    color: "blue",
  },
  {
    id: "folder-mechanics",
    name: "Mechanics",
    parentId: "folder-physics",
    color: "purple",
  },
];

/**
 * Mock documents for Pizza Study.
 */
export const mockDocuments: Document[] = [
  {
    id: "doc-1",
    title: "Calculus Chapter 3: Integration",
    folderId: "folder-calculus",
    tags: ["calculus", "integration", "midterm"],
    type: "note",
    content:
      "Notes on integration techniques including substitution and parts...",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "doc-2",
    title: "Physics Midterm Review",
    folderId: "folder-physics",
    tags: ["physics", "exam", "review"],
    type: "pdf",
    previewUrl: "/mock/physics-preview.png",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "doc-3",
    title: "Matrix Operations Flashcards",
    folderId: "folder-algebra",
    tags: ["linear-algebra", "flashcards", "matrices"],
    type: "flashcard-deck",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
  },
  {
    id: "doc-4",
    title: "Newton's Laws Summary",
    folderId: "folder-mechanics",
    tags: ["physics", "mechanics", "laws"],
    type: "note",
    content: "First Law: An object remains at rest or in uniform motion...",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "doc-5",
    title: "World War II Timeline",
    folderId: "folder-history",
    tags: ["history", "wwii", "timeline"],
    type: "note",
    content: "1939: Germany invades Poland...",
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "doc-6",
    title: "Derivative Rules Cheat Sheet",
    folderId: "folder-calculus",
    tags: ["calculus", "derivatives", "cheatsheet"],
    type: "image",
    previewUrl: "/mock/derivatives.png",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "doc-7",
    title: "Thermodynamics Lecture Notes",
    folderId: "folder-physics",
    tags: ["physics", "thermodynamics", "lecture"],
    type: "pdf",
    createdAt: new Date("2023-12-20"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "doc-8",
    title: "Eigenvalues Practice Problems",
    folderId: "folder-algebra",
    tags: ["linear-algebra", "eigenvalues", "practice"],
    type: "note",
    content: "Problem 1: Find the eigenvalues of matrix A...",
    createdAt: new Date("2023-12-15"),
    updatedAt: new Date("2024-01-05"),
  },
];

/**
 * All available tags across documents.
 */
export const allTags = [
  "calculus",
  "integration",
  "derivatives",
  "midterm",
  "physics",
  "mechanics",
  "thermodynamics",
  "exam",
  "review",
  "linear-algebra",
  "matrices",
  "eigenvalues",
  "flashcards",
  "cheatsheet",
  "lecture",
  "practice",
  "history",
  "wwii",
  "timeline",
];
