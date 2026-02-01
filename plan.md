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

## Phase 1: Core Dropzone Component ✅

### 1.1 Create FileDropzone Base Component ✅
- [x] Create `packages/ui/src/components/file-dropzone.tsx`
- [x] Define `FileDropzoneProps` interface extending `HTMLAttributes<HTMLDivElement>`
- [x] Add props: `onFilesSelected`, `accept`, `multiple`, `disabled`
- [x] Implement basic div container with `cn()` class merging
- [x] Export from `packages/ui/src/components/index.ts` and re-export from `packages/ui/src/index.ts`

### 1.2 Add Dropzone Variants with CVA ✅
- [x] Define `fileDropzoneVariants` using CVA
- [x] Add `variant` prop: `default`, `compact`
- [x] Add `size` prop: `sm`, `md`, `lg`
- [x] Style default variant with dashed border, rounded-xl, padding
- [x] Use Trattoria theme colors (warm border, cream background)

### 1.3 Implement Drag-and-Drop State ✅
- [x] Add internal `isDragging` state
- [x] Implement `onDragEnter` handler (set isDragging true)
- [x] Implement `onDragLeave` handler (set isDragging false)
- [x] Implement `onDragOver` handler (prevent default)
- [x] Implement `onDrop` handler (extract files, call onFilesSelected)
- [x] Prevent drag events from bubbling to parent

### 1.4 Add Drag-Over Visual Feedback ✅
- [x] Apply subtle glow effect when `isDragging` is true
- [x] Use terracotta border color on drag-over
- [x] Add soft background color shift (cream → warm highlight)
- [x] Implement smooth transition (200ms) for all state changes
- [x] Ensure accessible focus states

### 1.5 Add Click-to-Upload Fallback ✅
- [x] Add hidden `<input type="file" />` element with ref
- [x] Forward `accept` and `multiple` props to input
- [x] Handle click on dropzone to trigger input click
- [x] Handle input `onChange` to call `onFilesSelected`
- [x] Style the clickable area with cursor-pointer

### 1.6 Add Dropzone Content Slot ✅
- [x] Accept `children` prop for custom content
- [x] Create default content (icon + text) when no children provided
- [x] Use Lucide `Upload` icon for default state
- [x] Add encouraging copy: "Drop your study materials here"
- [x] Add secondary text: "or click to browse"

### 1.7 Add Disabled State ✅
- [x] Style disabled state (reduced opacity, no pointer events)
- [x] Prevent drag handlers when disabled
- [x] Prevent click-to-upload when disabled
- [x] Add `aria-disabled` attribute

---

## Phase 2: File Utilities (moved before Upload List) ✅

### 2.1 Create File Validation Utility ✅
- [x] Create `packages/ui/src/utils/file-validation.ts`
- [x] Define `ACCEPTED_FILE_TYPES` constant
- [x] Add `.txt`, `.md`, `.markdown`, `.csv`, `.json`, `.pdf`
- [x] Create `isValidFileType(file: File)` function
- [x] Create `getFileExtension(filename: string)` function

### 2.2 Add File Size Validation ✅
- [x] Define `MAX_FILE_SIZE_PDF` constant (10MB)
- [x] Define `MAX_FILE_SIZE_TEXT` constant (1MB)
- [x] Create `isValidFileSize(file: File)` function
- [x] Return `{ valid: boolean, error?: string }` with clear error messages
- [x] Export validation functions from utils index

### 2.3 Create File Size Formatting Utility ✅
- [x] Create `formatFileSize(bytes: number)` function
- [x] Return human-readable format (B, KB, MB, GB)
- [x] Handle edge cases (0 bytes, very large files)
- [x] Export from utils index

### 2.4 Create File Type Mapping ✅
- [x] Create `getFileTypeLabel(extension: string)` function
- [x] Map extensions to friendly names (PDF, Markdown, Text, etc.)
- [x] Create `getFileTypeIcon(extension: string)` function
- [x] Return appropriate Lucide icon component name

### 2.5 Add PDF File Handling Hook ✅
- [x] Create `apps/frontend/src/hooks/useFileReader.ts`
- [x] Handle text file reading with `file.text()`
- [x] Handle PDF files (flagged as binary, sent directly to backend)
- [x] Return `{ content, isLoading, error }` state
- [x] Support abort/cancel for read operations

---

## Phase 3: Upload List Components ✅

### 3.1 Create UploadListItem Component ✅
- [x] Create `packages/ui/src/components/upload-list-item.tsx`
- [x] Define `UploadListItemProps` interface
- [x] Add props: `fileName`, `fileSize`, `fileType`, `status`, `progress`, `error`, `onRemove`, `onRetry`
- [x] Create basic horizontal flex layout
- [x] Export from `packages/ui/src/components/index.ts`

### 3.2 Add File Icon/Thumbnail Section ✅
- [x] Create left section for file type indicator
- [x] Show file type icon based on extension (FileText, FileJson, File)
- [x] Add PDF icon (`FileText` with red accent) for `.pdf` files
- [x] Use Trattoria accent colors for icons
- [x] Size icons appropriately (w-10 h-10)

### 3.3 Add File Info Section ✅
- [x] Create middle section with file details
- [x] Display file name (truncate with ellipsis if > 30 chars)
- [x] Display file size using `formatFileSize` utility
- [x] Add file type badge using existing Badge component
- [x] Style with proper typography (Poppins for body)

### 3.4 Add Progress Indicator ✅
- [x] Create progress bar section
- [x] Show progress percentage (0-100)
- [x] Use terracotta color for progress fill
- [x] Animate progress bar smoothly (transition-all)
- [x] Hide progress bar when complete or idle

### 3.5 Add Status Indicators ✅
- [x] Show status badge: `uploading`, `processing`, `complete`, `error`
- [x] Use existing Badge variants (amber for uploading, emerald for complete, rose for error)
- [x] Add spinning icon (Loader2) for uploading state
- [x] Add checkmark icon (Check) for complete state
- [x] Add error icon (AlertCircle) for error state

### 3.6 Add Remove/Retry Actions ✅
- [x] Add remove button (X icon) on right side
- [x] Call `onRemove` when clicked
- [x] Show retry button when status is `error`
- [x] Add `onRetry` prop and handler
- [x] Style buttons with hover states

### 3.7 Create UploadList Container Component ✅
- [x] Create `packages/ui/src/components/upload-list.tsx`
- [x] Define `UploadListProps` with `children` or render prop pattern
- [x] Add wrapper `<ul>` for semantic list accessibility
- [x] Style with gap-3 between items
- [x] Export from components index

---

## Phase 4: Upload State Management ✅

### 4.1 Define Upload Types ✅
- [x] Add `UploadItem` interface to `apps/frontend/src/types/index.ts`
- [x] Include: `id`, `file`, `title`, `status`, `progress`, `error`, `documentId`
- [x] Add `UploadStatus` type: `pending`, `uploading`, `processing`, `complete`, `error`
- [x] Export types from index

### 4.2 Create Upload Queue Hook ✅
- [x] Create `apps/frontend/src/hooks/useUploadQueue.ts`
- [x] Manage array of `UploadItem` objects with useState
- [x] Implement `addFiles(files: File[])` — creates upload items with unique IDs
- [x] Implement `removeFile(id: string)` — removes from queue
- [x] Implement `updateItem(id: string, updates: Partial<UploadItem>)`

### 4.3 Implement Single File Upload Function ✅
- [x] Create `uploadFile()` function with FormData
- [x] Use FormData for file upload (to support binary PDFs)
- [x] Call `POST /api/documents` endpoint
- [x] Return created document ID on success
- [x] Throw error with message on failure

### 4.4 Add Progress Tracking ✅
- [x] Use `XMLHttpRequest` for upload with progress events
- [x] Listen to `upload.onprogress` event
- [x] Calculate percentage: `(loaded / total) * 100`
- [x] Call `updateItem` with new progress value
- [x] Handle upload completion via `onload`

### 4.5 Add Auto-Upload on File Add ✅
- [x] Trigger upload immediately when file is added via useEffect
- [x] Set status to `uploading`
- [x] Update progress during upload (0 → 100)
- [x] Set status to `complete` or `error` when done
- [x] Store returned `documentId` on success

### 4.6 Add Upload Cancellation ✅
- [x] Create AbortController for each upload
- [x] Store controller reference in upload item
- [x] Implement `cancelUpload(id: string)` function
- [x] Abort XMLHttpRequest when cancel called
- [x] Set status to `error` with "Upload cancelled" message

### 4.7 Add Concurrent Upload Limiting ✅
- [x] Define `MAX_CONCURRENT_UPLOADS = 3` constant
- [x] Track active uploads with ref
- [x] When adding files, only start upload if under limit
- [x] Queue excess files with status `pending`
- [x] Start next pending upload when an active one completes (via useEffect)

### 4.8 Add Retry Logic ✅
- [x] Implement `retryUpload(id: string)` function
- [x] Reset status to `pending` (will auto-start if under limit)
- [x] Clear previous error
- [x] Increment retry count (store in item)
- [x] Limit retry attempts (max 3), show final error if exceeded

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
