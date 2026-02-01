# Document Upload UI Redesign - Implementation Backlog

## Overview

**Goal:** Redesign the document upload experience with a dropzone-centric UI that feels warm and inviting (Trattoria theme), supports immediate uploads, and allows inline metadata editing.

**Key Decisions:**
- Fresh redesign (not evolution of existing form)
- Dropzone-centric layout, separate from document library
- Upload queue as a list below dropzone
- Editable list items (thumbnail, title, progress, size)
- File types: Text files (`.txt`, `.md`, `.csv`, `.json`) + PDFs
- Immediate upload on drop (no staging)
- Subtle glow effect on drag-over

**Architecture:** Component-First approach
- `packages/ui/` — Presentational components (FileDropzone, UploadList, UploadListItem)
- `apps/frontend/` — Page orchestration, state management, API calls

---

## Phase 1: Core Dropzone Component

### 1.1 Create FileDropzone Base Component
- [ ] Create `packages/ui/src/components/file-dropzone.tsx`
- [ ] Define `FileDropzoneProps` interface extending `HTMLAttributes<HTMLDivElement>`
- [ ] Add props: `onFilesSelected`, `accept`, `multiple`, `disabled`
- [ ] Implement basic div container with `cn()` class merging
- [ ] Export from `packages/ui/src/components/index.ts` and re-export from `packages/ui/src/index.ts`

### 1.2 Add Dropzone Variants with CVA
- [ ] Define `fileDropzoneVariants` using CVA
- [ ] Add `variant` prop: `default`, `compact`
- [ ] Add `size` prop: `sm`, `md`, `lg`
- [ ] Style default variant with dashed border, rounded-xl, padding
- [ ] Use Trattoria theme colors (warm border, cream background)

### 1.3 Implement Drag-and-Drop State
- [ ] Add internal `isDragging` state
- [ ] Implement `onDragEnter` handler (set isDragging true)
- [ ] Implement `onDragLeave` handler (set isDragging false)
- [ ] Implement `onDragOver` handler (prevent default)
- [ ] Implement `onDrop` handler (extract files, call onFilesSelected)
- [ ] Prevent drag events from bubbling to parent

### 1.4 Add Drag-Over Visual Feedback
- [ ] Apply subtle glow effect when `isDragging` is true
- [ ] Use terracotta border color on drag-over
- [ ] Add soft background color shift (cream → warm highlight)
- [ ] Implement smooth transition (200ms) for all state changes
- [ ] Ensure accessible focus states

### 1.5 Add Click-to-Upload Fallback
- [ ] Add hidden `<input type="file" />` element with ref
- [ ] Forward `accept` and `multiple` props to input
- [ ] Handle click on dropzone to trigger input click
- [ ] Handle input `onChange` to call `onFilesSelected`
- [ ] Style the clickable area with cursor-pointer

### 1.6 Add Dropzone Content Slot
- [ ] Accept `children` prop for custom content
- [ ] Create default content (icon + text) when no children provided
- [ ] Use Lucide `Upload` icon for default state
- [ ] Add encouraging copy: "Drop your study materials here"
- [ ] Add secondary text: "or click to browse"

### 1.7 Add Disabled State
- [ ] Style disabled state (reduced opacity, no pointer events)
- [ ] Prevent drag handlers when disabled
- [ ] Prevent click-to-upload when disabled
- [ ] Add `aria-disabled` attribute

---

## Phase 2: File Utilities (moved before Upload List)

### 2.1 Create File Validation Utility
- [ ] Create `packages/ui/src/utils/file-validation.ts`
- [ ] Define `ACCEPTED_FILE_TYPES` constant
- [ ] Add `.txt`, `.md`, `.markdown`, `.csv`, `.json`, `.pdf`
- [ ] Create `isValidFileType(file: File)` function
- [ ] Create `getFileExtension(filename: string)` function

### 2.2 Add File Size Validation
- [ ] Define `MAX_FILE_SIZE_PDF` constant (10MB)
- [ ] Define `MAX_FILE_SIZE_TEXT` constant (1MB)
- [ ] Create `isValidFileSize(file: File)` function
- [ ] Return `{ valid: boolean, error?: string }` with clear error messages
- [ ] Export validation functions from utils index

### 2.3 Create File Size Formatting Utility
- [ ] Create `formatFileSize(bytes: number)` function
- [ ] Return human-readable format (B, KB, MB, GB)
- [ ] Handle edge cases (0 bytes, very large files)
- [ ] Export from utils index

### 2.4 Create File Type Mapping
- [ ] Create `getFileTypeLabel(extension: string)` function
- [ ] Map extensions to friendly names (PDF, Markdown, Text, etc.)
- [ ] Create `getFileTypeIcon(extension: string)` function
- [ ] Return appropriate Lucide icon component name

### 2.5 Add PDF File Handling Hook
- [ ] Create `apps/frontend/src/hooks/useFileReader.ts`
- [ ] Handle text file reading with `file.text()`
- [ ] Handle PDF files (store as binary/base64 for backend processing)
- [ ] Return `{ content, isLoading, error }` state
- [ ] Support abort/cancel for large files

---

## Phase 3: Upload List Components

### 3.1 Create UploadListItem Component
- [ ] Create `packages/ui/src/components/upload-list-item.tsx`
- [ ] Define `UploadListItemProps` interface
- [ ] Add props: `fileName`, `fileSize`, `fileType`, `status`, `progress`, `error`, `onRemove`, `onRetry`
- [ ] Create basic horizontal flex layout
- [ ] Export from `packages/ui/src/components/index.ts`

### 3.2 Add File Icon/Thumbnail Section
- [ ] Create left section for file type indicator
- [ ] Show file type icon based on extension (FileText, FileJson, File)
- [ ] Add PDF icon (`FileText` with red accent) for `.pdf` files
- [ ] Use Trattoria accent colors for icons
- [ ] Size icons appropriately (w-10 h-10)

### 3.3 Add File Info Section
- [ ] Create middle section with file details
- [ ] Display file name (truncate with ellipsis if > 30 chars)
- [ ] Display file size using `formatFileSize` utility
- [ ] Add file type badge using existing Badge component
- [ ] Style with proper typography (Poppins for body)

### 3.4 Add Progress Indicator
- [ ] Create progress bar section
- [ ] Show progress percentage (0-100)
- [ ] Use terracotta color for progress fill
- [ ] Animate progress bar smoothly (transition-all)
- [ ] Hide progress bar when complete or idle

### 3.5 Add Status Indicators
- [ ] Show status badge: `uploading`, `processing`, `complete`, `error`
- [ ] Use existing Badge variants (amber for uploading, emerald for complete, rose for error)
- [ ] Add spinning icon (Loader2) for uploading state
- [ ] Add checkmark icon (Check) for complete state
- [ ] Add error icon (AlertCircle) for error state

### 3.6 Add Remove/Retry Actions
- [ ] Add remove button (X icon) on right side
- [ ] Call `onRemove` when clicked
- [ ] Show retry button when status is `error`
- [ ] Add `onRetry` prop and handler
- [ ] Style buttons with hover states

### 3.7 Create UploadList Container Component
- [ ] Create `packages/ui/src/components/upload-list.tsx`
- [ ] Define `UploadListProps` with `children` or render prop pattern
- [ ] Add wrapper div with `role="list"` for accessibility
- [ ] Style with gap-3 between items
- [ ] Export from components index

---

## Phase 4: Upload State Management

### 4.1 Define Upload Types
- [ ] Add `UploadItem` interface to `apps/frontend/src/types/index.ts`
- [ ] Include: `id`, `file`, `title`, `status`, `progress`, `error`, `documentId`
- [ ] Add `UploadStatus` type: `pending`, `uploading`, `processing`, `complete`, `error`
- [ ] Export types from index

### 4.2 Create Upload Queue Hook
- [ ] Create `apps/frontend/src/hooks/useUploadQueue.ts`
- [ ] Manage array of `UploadItem` objects with useState
- [ ] Implement `addFiles(files: File[])` — creates upload items with unique IDs
- [ ] Implement `removeFile(id: string)` — removes from queue
- [ ] Implement `updateItem(id: string, updates: Partial<UploadItem>)`

### 4.3 Implement Single File Upload Function
- [ ] Create `uploadDocument(file: File, title: string)` async function
- [ ] Use FormData for file upload (to support binary PDFs)
- [ ] Call `POST /api/documents` endpoint
- [ ] Return created document ID on success
- [ ] Throw error with message on failure

### 4.4 Add Progress Tracking
- [ ] Use `XMLHttpRequest` for upload with progress events
- [ ] Listen to `upload.onprogress` event
- [ ] Calculate percentage: `(loaded / total) * 100`
- [ ] Call `updateItem` with new progress value
- [ ] Handle upload completion via `onload`

### 4.5 Add Auto-Upload on File Add
- [ ] Trigger upload immediately when file is added via `addFiles`
- [ ] Set status to `uploading`
- [ ] Update progress during upload (0 → 100)
- [ ] Set status to `complete` or `error` when done
- [ ] Store returned `documentId` on success

### 4.6 Add Upload Cancellation
- [ ] Create AbortController for each upload
- [ ] Store controller reference in upload item
- [ ] Implement `cancelUpload(id: string)` function
- [ ] Abort XMLHttpRequest when cancel called
- [ ] Set status to `error` with "Upload cancelled" message

### 4.7 Add Concurrent Upload Limiting
- [ ] Define `MAX_CONCURRENT_UPLOADS = 3` constant
- [ ] Track count of items with status `uploading`
- [ ] When adding files, only start upload if under limit
- [ ] Queue excess files with status `pending`
- [ ] Start next pending upload when an active one completes

### 4.8 Add Retry Logic
- [ ] Implement `retryUpload(id: string)` function
- [ ] Reset status to `pending` (will auto-start if under limit)
- [ ] Clear previous error
- [ ] Increment retry count (store in item)
- [ ] Limit retry attempts (max 3), show final error if exceeded

### 4.9 Integrate with Documents Store
- [ ] Import `useDocumentsStore` in upload hook
- [ ] On successful upload, call `addDocument()` or trigger refetch
- [ ] Ensure new uploads appear in document library immediately
- [ ] Handle case where user navigates away during upload

---

## Phase 5: Redesigned Upload Page

### 5.1 Create New Page Layout
- [ ] Refactor `apps/frontend/src/pages/documents/UploadDocumentPage.tsx`
- [ ] Remove old form-based layout entirely
- [ ] Create single-column centered layout (max-w-3xl mx-auto)
- [ ] Add page title: "Upload Documents" (serif font)
- [ ] Add subtitle: "Add study materials to your library"

### 5.2 Integrate FileDropzone Component
- [ ] Import `FileDropzone` from `@repo/ui`
- [ ] Place at top of page with margin-bottom
- [ ] Configure `accept` prop with allowed file types
- [ ] Set `multiple={true}` to allow batch uploads
- [ ] Connect `onFilesSelected` to `addFiles` from upload hook

### 5.3 Add File Validation on Drop
- [ ] Validate each dropped file with `isValidFileType`
- [ ] Validate file size with `isValidFileSize`
- [ ] Show error toast/message for rejected files
- [ ] Only add valid files to upload queue

### 5.4 Integrate UploadList Component
- [ ] Import `UploadList` and `UploadListItem` from `@repo/ui`
- [ ] Place below dropzone with mt-6 spacing
- [ ] Map upload queue items to UploadListItem components
- [ ] Connect `onRemove`, `onRetry` handlers
- [ ] Pass file info, status, progress, error to each item

### 5.5 Add Empty State
- [ ] Show friendly message when no files in queue
- [ ] Text: "No files uploading" or similar
- [ ] Use muted color, centered below dropzone
- [ ] Match Trattoria warm aesthetic

### 5.6 Add Success Feedback
- [ ] Keep completed items in list with success status
- [ ] Show "View document" link on completed items
- [ ] Add "Clear completed" button when there are completed uploads
- [ ] Subtle success animation (checkmark fade-in)

### 5.7 Add Error Handling UI
- [ ] Show error message inline on failed items
- [ ] Display specific error reason (size limit, network, etc.)
- [ ] Provide clear retry action button
- [ ] Don't block other uploads on single failure

### 5.8 Connect to Navigation
- [ ] Verify sidebar "Upload" link points to this page
- [ ] Add "Back to Documents" link at top
- [ ] Ensure browser back button works correctly

---

## Phase 6: Backend Updates

### 6.1 Update Documents API for File Upload
- [ ] Modify `POST /api/documents` to accept `multipart/form-data`
- [ ] Parse FormData with Hono's built-in parsing
- [ ] Extract `file` field (binary) and `title` field (string)
- [ ] Return document ID on success

### 6.2 Add Backend Security Validation
- [ ] Validate file MIME type matches extension (check magic bytes)
- [ ] Enforce file size limits (10MB for PDF, 1MB for text)
- [ ] Sanitize filename (remove path traversal, special chars)
- [ ] Return 400 with clear error messages for validation failures
- [ ] Log rejected uploads for security monitoring

### 6.3 Add PDF Text Extraction
- [ ] Install `pdf-parse` package: `bun add pdf-parse`
- [ ] Extract text content from uploaded PDFs
- [ ] Store extracted text in `content` field for RAG
- [ ] Store original filename in `metadata.originalFilename`
- [ ] Handle extraction errors gracefully (store empty content)

### 6.4 Add Document Update Endpoint
- [ ] Create `PATCH /api/documents/:id` endpoint
- [ ] Accept JSON body with optional `title` and `metadata` fields
- [ ] Validate document exists
- [ ] Update only provided fields
- [ ] Return updated document

---

## Phase 7: Polish & Accessibility

### 7.1 Add Keyboard Navigation
- [ ] Dropzone focusable with Tab key (tabIndex={0})
- [ ] Enter/Space triggers file picker when focused
- [ ] List items have focusable remove/retry buttons
- [ ] Focus trap doesn't get stuck

### 7.2 Add Screen Reader Support
- [ ] Add `aria-label="Upload files by dropping or clicking"` to dropzone
- [ ] Use `aria-live="polite"` region to announce upload status changes
- [ ] Label all buttons with `aria-label`
- [ ] Add `role="listitem"` to upload list items

### 7.3 Add Animations & Transitions
- [ ] Animate file items entering list (fade-in + slide-down)
- [ ] Animate progress bar filling (smooth width transition)
- [ ] Animate status badge transitions (fade)
- [ ] Animate item removal (fade-out, then remove from DOM)

### 7.4 Mobile Responsiveness
- [ ] Ensure dropzone works on touch devices (tap to upload)
- [ ] Reduce dropzone height on small screens
- [ ] Stack file info vertically on mobile (< 640px)
- [ ] Ensure tap targets are large enough (min 44px)

---

## Phase 8: Testing

### 8.1 Unit Tests for FileDropzone
- [ ] Test renders without crashing
- [ ] Test `onFilesSelected` called with files on drop event
- [ ] Test `onFilesSelected` called on input change
- [ ] Test disabled state prevents interactions
- [ ] Test `isDragging` state changes on drag events

### 8.2 Unit Tests for UploadListItem
- [ ] Test renders file name and size correctly
- [ ] Test progress bar width matches progress prop
- [ ] Test status badge shows correct variant per status
- [ ] Test `onRemove` callback fires on button click
- [ ] Test `onRetry` callback fires when error status

### 8.3 Unit Tests for useUploadQueue Hook
- [ ] Test `addFiles` creates items with unique IDs
- [ ] Test `removeFile` removes item by ID
- [ ] Test `updateItem` merges updates correctly
- [ ] Test concurrent upload limit is enforced
- [ ] Test retry increments count and respects max

### 8.4 Integration Tests
- [ ] Test drop files → upload starts → completes
- [ ] Test upload error → retry → success
- [ ] Test cancel upload mid-progress
- [ ] Test multiple file upload with queue

---

## Nice to Have (Post-MVP)

These features were identified during review as deferrable:

### Inline Metadata Editing (Phase 2 extension)
- [ ] Add inline title editor to UploadListItem
- [ ] Pre-populate with filename (without extension)
- [ ] Call `onTitleChange` on blur or Enter key
- [ ] Add tags input with Badge components
- [ ] Create `updateDocumentMetadata` function

### List Header
- [ ] Add header row with column labels
- [ ] Show total count: "3 files"
- [ ] Add "Clear all" action button

### Loading Skeletons
- [ ] Show skeleton while initial page loads
- [ ] Smooth transition from skeleton to content

### Drag Handle Visual Enhancement
- [ ] Show custom cursor when dragging over dropzone
- [ ] Add subtle animation to dropzone icon on drag
- [ ] Consider particle effect on successful drop

### E2E Tests
- [ ] Test drag-and-drop in real browser (Playwright)
- [ ] Test file picker interaction
- [ ] Test upload to real backend
- [ ] Test navigation after upload

---

## File Reference

**New files to create:**
```
packages/ui/src/components/file-dropzone.tsx
packages/ui/src/components/upload-list.tsx
packages/ui/src/components/upload-list-item.tsx
packages/ui/src/utils/file-validation.ts
apps/frontend/src/hooks/useUploadQueue.ts
apps/frontend/src/hooks/useFileReader.ts
```

**Files to modify:**
```
packages/ui/src/components/index.ts — add new component exports
packages/ui/src/index.ts — re-export new components
apps/frontend/src/types/index.ts — add UploadItem and UploadStatus types
apps/frontend/src/pages/documents/UploadDocumentPage.tsx — full rewrite
apps/backend/src/routes/documents.ts — add FormData support, PATCH endpoint
```

---

## Definition of Done

- [ ] All Phase 1-6 tasks completed
- [ ] Components exported from UI package
- [ ] Upload page fully functional with new design
- [ ] PDF upload working with text extraction
- [ ] File validation (type + size) on frontend and backend
- [ ] Upload cancellation and retry working
- [ ] New uploads appear in documents library
- [ ] All unit tests passing
- [ ] Accessible (keyboard + screen reader basics)
- [ ] Mobile responsive
- [ ] Matches Trattoria design theme
