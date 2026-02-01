# Chat UI Redesign - Implementation Backlog

> Full rebuild of the chat interface with sidebar layout, rich markdown rendering, document citations, and polished interactions. **Replaces existing chat in place.**

---

## Phase 0: Prerequisites

> **Must complete before building UI components.** Defines contracts and architecture to prevent integration issues.

### 0.1 Define State Management Architecture
- [ ] Design Zustand store structure for chat (`useChatStore`)
- [ ] Define slices: `sidebar`, `documents`, `history`, `input`, `messages`
- [ ] Document which state is local (component) vs global (store) vs persisted (localStorage)
- [ ] Create `apps/frontend/src/stores/chat-store.ts` with typed store
- [ ] Export typed hooks: `useSidebar`, `useDocuments`, `useChatHistory`, etc.

### 0.2 Define API Contracts - Chat
- [ ] Document `POST /api/chat` request shape (include `documentIds` filter param)
- [ ] Document `POST /api/chat` response shape (streaming, citations format)
- [ ] Verify existing backend supports document filtering (or create backend task)
- [ ] Define error response shapes for chat API

### 0.3 Define API Contracts - History
- [ ] Document `GET /api/chat/history` response shape
- [ ] Document `GET /api/chat/:id` for loading specific conversation
- [ ] Document `POST /api/chat/new` for creating new conversation
- [ ] Document `DELETE /api/chat/:id` for deleting conversation (if needed)

### 0.4 Define API Contracts - File Upload
- [ ] Document `POST /api/upload` request (multipart form data)
- [ ] Document `POST /api/upload` response shape (returns `documentId`, metadata)
- [ ] Define upload size limits and accepted file types
- [ ] Define error responses (file too large, invalid type, etc.)

### 0.5 Define Citation System Backend Contract
- [ ] Document how RAG pipeline embeds citations in responses (e.g., `[[cite:1]]` syntax)
- [ ] Document citation metadata format in API response:
  ```ts
  { id: string, documentId: string, documentName: string, pageNumber: number, quote: string }
  ```
- [ ] Verify backend RAG pipeline generates citations (or create backend task)
- [ ] Define fallback behavior when citations unavailable

### 0.6 Create Shared Types
- [ ] Create `packages/ui/src/types/chat.ts` with shared type definitions
- [ ] Export: `Message`, `Citation`, `Document`, `ChatHistoryItem`, `ChatState`
- [ ] Ensure types align with API contracts defined above

---

## Phase 1: Foundation & Layout Shell

### 1.1 Replace Chat Page Structure
- [ ] Backup/remove old `apps/frontend/src/pages/chat/ChatPage.tsx`
- [ ] Create new `ChatPage.tsx` with two-panel layout shell
- [ ] Verify `/chat` route still works with new component
- [ ] Remove old `ChatSlideOver.tsx` component

### 1.2 Build Layout Container Component
- [ ] Create `packages/ui/src/components/chat-layout.tsx`
- [ ] Implement two-panel flexbox structure (sidebar 280px + main flex-1)
- [ ] Add CSS variables for sidebar width (`--sidebar-width: 280px`)
- [ ] Export `ChatLayout`, `ChatLayoutSidebar`, `ChatLayoutMain` components
- [ ] Add `role="main"` and `role="complementary"` for accessibility

### 1.3 Implement Sidebar Shell
- [ ] Create `packages/ui/src/components/chat-sidebar.tsx`
- [ ] Add collapsible container with expand/collapse state
- [ ] Style with `bg-muted/50` and subtle right border
- [ ] Add collapse toggle button (chevron icon)
- [ ] Store collapsed state in localStorage (`chat-sidebar-collapsed`)
- [ ] Add `aria-expanded` attribute to toggle button

### 1.4 Implement Responsive Sidebar Behavior
- [ ] Add media query breakpoint at 1024px
- [ ] Desktop (≥1024px): sidebar inline, collapsible
- [ ] Mobile (<1024px): sidebar as overlay with backdrop
- [ ] Add hamburger menu button for mobile
- [ ] Implement slide-in animation for mobile overlay (200ms ease-out)
- [ ] Implement focus trap when sidebar overlay is open
- [ ] Close overlay on Escape key press
- [ ] Add `aria-modal="true"` to overlay

### 1.5 Build Main Chat Panel Shell
- [ ] Create scrollable messages container (flex-1, overflow-y-auto)
- [ ] Add max-width constraint for messages (720px) with auto margins
- [ ] Create sticky footer area for input
- [ ] Add padding and spacing following design system
- [ ] Design container to support future virtualization (fixed height, ref for scroll)

---

## Phase 2: Sidebar - Documents Section

### 2.1 Create Documents List Component
- [ ] Create `packages/ui/src/components/document-list.tsx`
- [ ] Define `DocumentItem` type: `{ id, name, pageCount, isSelected, recentlyCited }`
- [ ] Implement list container with "Documents" header
- [ ] Add collapsible section behavior (click header to expand/collapse)
- [ ] Add `role="list"` and proper list semantics

### 2.2 Build Document Item Component
- [ ] Create `packages/ui/src/components/document-item.tsx`
- [ ] Display file icon (PDF icon from lucide-react)
- [ ] Show document name with text truncation (ellipsis)
- [ ] Show page count badge
- [ ] Add checkbox for include/exclude from RAG context
- [ ] Add proper label association for checkbox (accessibility)

### 2.3 Add Document Selection Logic
- [ ] Implement checkbox toggle handler
- [ ] Add visual distinction for selected vs unselected (opacity, checkmark)
- [ ] Add "recently cited" indicator (subtle glow or badge)
- [ ] Wire up to Zustand store (`useDocuments` slice)

### 2.4 Add Upload Button
- [ ] Add "Upload" button at bottom of documents section
- [ ] Style as secondary button with plus icon
- [ ] Wire click handler to trigger file picker (implementation later)

### 2.5 Connect Documents Section to ChatPage
- [ ] Import and place DocumentList in sidebar
- [ ] Connect to Zustand store for document state
- [ ] Pass selection state and handlers as props

### 2.6 Add Keyboard Navigation
- [ ] Arrow up/down to navigate document list
- [ ] Space/Enter to toggle selection
- [ ] Proper focus management within list

---

## Phase 3: Sidebar - Chat History Section

### 3.1 Create Chat History List Component
- [ ] Create `packages/ui/src/components/chat-history-list.tsx`
- [ ] Define `ChatHistoryItem` type: `{ id, preview, timestamp, messageCount, isActive }`
- [ ] Implement list container with "History" header
- [ ] Add collapsible section behavior
- [ ] Add `role="list"` for accessibility

### 3.2 Build Chat History Item Component
- [ ] Create `packages/ui/src/components/chat-history-item.tsx`
- [ ] Show first message preview (truncated to ~50 chars)
- [ ] Show relative timestamp ("2 hours ago", "Yesterday")
- [ ] Show message count badge
- [ ] Highlight active/current chat with primary color accent
- [ ] Add `aria-current="true"` for active item

### 3.3 Add History Item Interactions
- [ ] Add hover effect: subtle lift (`translate-y: -1px`) and shadow
- [ ] Add click handler to load conversation
- [ ] Add visual feedback on click (brief scale down)

### 3.4 Add New Chat Button
- [ ] Add prominent "New Chat" button above history list
- [ ] Style as primary button with plus icon
- [ ] Wire click handler to create new conversation

### 3.5 Add History Search
- [ ] Add search input at top of history section
- [ ] Implement client-side filtering by preview text
- [ ] Show "No results" state when filter matches nothing
- [ ] Clear button (X) when search has value
- [ ] Add `aria-label` for search input

### 3.6 Connect History Section to ChatPage
- [ ] Import and place ChatHistoryList in sidebar (below documents)
- [ ] Connect to Zustand store for history state
- [ ] Wire up navigation and new chat handlers

---

## Phase 4: Message Components - Basic Structure

### 4.1 Replace ChatMessage Component
- [ ] Replace `packages/ui/src/components/chat-message.tsx`
- [ ] Define props: `{ role, content, timestamp, citations?, isStreaming? }`
- [ ] Set up CVA variants for user/assistant/system roles
- [ ] Basic container with role-based alignment (user=right, assistant=left)
- [ ] Add `role="article"` with `aria-label` for screen readers

### 4.2 Style User Messages
- [ ] Apply terracotta background (`bg-primary/10`)
- [ ] Right-align with `ml-auto`
- [ ] Rounded corners with slight cutout (`rounded-2xl rounded-br-md`)
- [ ] Max-width of 80% of container

### 4.3 Style Assistant Messages
- [ ] Apply muted background (`bg-muted`)
- [ ] Left-align with `mr-auto`
- [ ] Rounded corners with slight cutout (`rounded-2xl rounded-bl-md`)
- [ ] Max-width of 80% of container

### 4.4 Add Avatar Display
- [ ] Import existing Avatar component
- [ ] Show user avatar for user messages (right side)
- [ ] Show assistant icon/avatar for assistant messages (left side)
- [ ] Position avatar outside message bubble

### 4.5 Add Timestamp Display
- [ ] Show timestamp on hover (absolute positioned)
- [ ] Format as relative time ("2m ago") or time ("3:42 PM")
- [ ] Fade in on hover with 150ms transition

### 4.6 Create Error Boundary for Messages
- [ ] Create `packages/ui/src/components/message-error-boundary.tsx`
- [ ] Wrap message content in error boundary
- [ ] Show fallback UI on render error: "Failed to render message"
- [ ] Include "Show raw" button to display unformatted content

### 4.7 Plan Virtualization Support
- [ ] Research virtualization library (`@tanstack/react-virtual`)
- [ ] Design message list to accept `virtualizer` prop
- [ ] Ensure messages have stable keys and measurable heights
- [ ] Document virtualization integration point for Phase 16

### 4.8 Test Message Component
- [ ] Write tests for role-based styling variants
- [ ] Write tests for timestamp formatting
- [ ] Write tests for error boundary fallback

---

## Phase 5: Markdown Rendering

### 5.1 Set Up Markdown Parser
- [ ] Install `react-markdown` package
- [ ] Install `remark-gfm` for GitHub Flavored Markdown (tables, strikethrough)
- [ ] Create `packages/ui/src/components/markdown-renderer.tsx` wrapper

### 5.2 Style Basic Markdown Elements
- [ ] Style paragraphs with proper spacing (`mb-4 last:mb-0`)
- [ ] Style headings (h1-h6) with appropriate sizes and weights
- [ ] Style bold (`font-semibold`) and italic (`italic`)
- [ ] Style links with primary color and underline on hover

### 5.3 Style Lists
- [ ] Style unordered lists with disc markers
- [ ] Style ordered lists with decimal numbers
- [ ] Proper indentation and spacing for nested lists
- [ ] Match spacing to design system

### 5.4 Style Blockquotes
- [ ] Left border accent in primary color
- [ ] Slightly muted text color
- [ ] Padding and italic styling

### 5.5 Style Tables
- [ ] Bordered cells with muted borders
- [ ] Header row with muted background
- [ ] Proper cell padding
- [ ] Horizontal scroll wrapper for wide tables

### 5.6 Implement Code Blocks
- [ ] Install `react-syntax-highlighter` or `shiki` for syntax highlighting
- [ ] Create `packages/ui/src/components/code-block.tsx`
- [ ] Dark background with monospace font
- [ ] Language label in top-right corner
- [ ] Rounded corners matching design system

### 5.7 Add Copy Button to Code Blocks
- [ ] Add copy icon button in top-right of code block
- [ ] Implement clipboard copy functionality
- [ ] Show success feedback (checkmark icon, brief)
- [ ] Tooltip: "Copy code"

### 5.8 Style Inline Code
- [ ] Muted background with slight rounding
- [ ] Monospace font
- [ ] Slightly smaller font size

### 5.9 Integrate Markdown into ChatMessage
- [ ] Replace plain text rendering with MarkdownRenderer
- [ ] Pass assistant message content through markdown parser
- [ ] Keep user messages as plain text (or optional markdown)

### 5.10 Add Markdown Error Handling
- [ ] Wrap markdown renderer in try-catch
- [ ] Show raw text fallback if parsing fails
- [ ] Log parsing errors for debugging

### 5.11 Test Markdown Renderer
- [ ] Write tests for each markdown element type
- [ ] Write tests for malformed markdown (graceful handling)
- [ ] Write tests for code block copy functionality

---

## Phase 6: Citations System

### 6.1 Define Citation Data Structure
- [ ] Use `Citation` type from `packages/ui/src/types/chat.ts`
- [ ] Add `citations` prop to ChatMessage component
- [ ] Create mock citation data matching backend contract for development

### 6.2 Implement Inline Citation Badges
- [ ] Create `packages/ui/src/components/citation-badge.tsx`
- [ ] Style as small superscript badge: `[1]`
- [ ] Primary color background, rounded
- [ ] Clickable (button semantics)
- [ ] Add `aria-label="Citation 1, click to view source"`

### 6.3 Parse Citations from Message Content
- [ ] Define citation syntax parser for `[[cite:1]]` pattern
- [ ] Create parser to extract and replace with badge components
- [ ] Map citation IDs to citation data from props
- [ ] Handle missing citation data gracefully (show badge without popup)

### 6.4 Build Sources Section
- [ ] Create `packages/ui/src/components/citation-sources.tsx`
- [ ] Display at bottom of message when citations present
- [ ] "Sources" header with divider
- [ ] List each source: document name, page number
- [ ] Add `id` for scroll targeting (e.g., `source-1`)

### 6.5 Add Citation Click Behavior
- [ ] Clicking inline badge scrolls to sources section
- [ ] Highlight the relevant source briefly (flash animation)
- [ ] Smooth scroll animation

### 6.6 Add Citation Hover Preview
- [ ] Create tooltip/popover on citation hover
- [ ] Show quoted passage from document
- [ ] Show document name and page
- [ ] 200ms delay before showing
- [ ] Handle missing quote gracefully

### 6.7 Add Source Click to Open Document
- [ ] Make source items clickable
- [ ] Define callback prop for document open action
- [ ] Add external link icon indicator

### 6.8 Test Citation System
- [ ] Write tests for citation parsing (valid and invalid syntax)
- [ ] Write tests for badge click scroll behavior
- [ ] Write tests for missing citation data fallback

---

## Phase 7: Message Actions

### 7.1 Create Message Actions Container
- [ ] Create `packages/ui/src/components/message-actions.tsx`
- [ ] Position absolutely, top-right of message
- [ ] Show on message hover, hide otherwise
- [ ] Fade in/out animation (150ms)
- [ ] Add `role="toolbar"` for accessibility

### 7.2 Implement Copy Message Action
- [ ] Add copy button with clipboard icon
- [ ] Copy plain text content (strip markdown)
- [ ] Show success feedback (checkmark)
- [ ] Tooltip: "Copy message"

### 7.3 Implement Regenerate Action (Assistant Only)
- [ ] Add regenerate button with refresh icon
- [ ] Only show for assistant messages
- [ ] Define callback prop for regenerate handler
- [ ] Tooltip: "Regenerate response"

### 7.4 Implement Edit Action (User Only)
- [ ] Add edit button with pencil icon
- [ ] Only show for user messages
- [ ] Define callback prop for edit handler
- [ ] Tooltip: "Edit message"

### 7.5 Wire Actions to ChatMessage Component
- [ ] Add action callbacks as props
- [ ] Conditionally render actions based on role
- [ ] Pass message data to handlers

---

## Phase 8: Streaming & Loading States

### 8.1 Implement Streaming Cursor
- [ ] Create pulsing cursor component (vertical bar or underscore)
- [ ] Animate with CSS (`animate-pulse` or custom keyframes)
- [ ] Append to end of streaming message content

### 8.2 Create Message Skeleton Loader
- [ ] Create `packages/ui/src/components/message-skeleton.tsx`
- [ ] Mimic message bubble shape
- [ ] Animated shimmer effect
- [ ] Show 2-3 skeletons while loading history

### 8.3 Add "AI is thinking" Indicator
- [ ] Show before first token arrives
- [ ] Three bouncing dots animation
- [ ] Subtle, non-intrusive placement

---

## Phase 9: Rich Chat Input - Core

### 9.1 Replace ChatInput Component
- [ ] Replace `packages/ui/src/components/chat-input.tsx`
- [ ] Define props: `{ onSend, isLoading, placeholder, documents? }`
- [ ] Basic textarea with warm border styling
- [ ] Add `aria-label="Message input"`

### 9.2 Implement Auto-Expanding Textarea
- [ ] Start at single line height
- [ ] Expand as content grows (max 200px)
- [ ] Scroll internally when max height reached
- [ ] Smooth height transition animation

### 9.3 Style Input Container
- [ ] Rounded border with focus glow (`ring-primary/30`)
- [ ] Padding matching design system
- [ ] Background color for slight elevation from page

### 9.4 Implement Send Button
- [ ] Position inside input container, right side
- [ ] Terracotta primary color
- [ ] Send icon (arrow up or paper plane)
- [ ] Disabled state when empty or loading
- [ ] Loading spinner when sending

### 9.5 Add Keyboard Shortcuts
- [ ] `Enter` → Send message
- [ ] `Shift+Enter` → Insert newline
- [ ] `Cmd/Ctrl+Enter` → Force send
- [ ] `Escape` → Blur input / close pickers

### 9.6 Test Input Component
- [ ] Write tests for keyboard shortcuts
- [ ] Write tests for auto-expanding behavior
- [ ] Write tests for disabled/loading states

---

## Phase 10: Rich Chat Input - @ Mentions

### 10.1 Detect @ Trigger
- [ ] Listen for `@` character in input
- [ ] Track cursor position when @ is typed
- [ ] Store @ trigger position for dropdown placement

### 10.2 Create Document Picker Dropdown
- [ ] Create `packages/ui/src/components/document-picker.tsx`
- [ ] Position below cursor (or above if near bottom)
- [ ] List available documents
- [ ] Slide-down entrance animation
- [ ] Add `role="listbox"` for accessibility

### 10.3 Implement Fuzzy Search in Picker
- [ ] Filter documents as user types after @
- [ ] Highlight matching characters in results
- [ ] Show "No matches" state

### 10.4 Handle Document Selection
- [ ] Click or Enter to select document
- [ ] Replace @query with document reference
- [ ] Add document to mentioned list
- [ ] Close dropdown

### 10.5 Display Mentioned Documents as Chips
- [ ] Show chips above textarea
- [ ] Each chip: document icon + name + X to remove
- [ ] Scale-in animation when added
- [ ] Click X to remove from context

### 10.6 Keyboard Navigation in Picker
- [ ] Arrow up/down to navigate options
- [ ] Enter to select highlighted option
- [ ] Escape to close without selecting
- [ ] Add `aria-activedescendant` for screen readers

### 10.7 Test @ Mentions
- [ ] Write tests for @ trigger detection
- [ ] Write tests for fuzzy search filtering
- [ ] Write tests for keyboard navigation

---

## Phase 11: Rich Chat Input - File Attachments

### 11.1 Add Attachment Button
- [ ] Add paperclip icon button in input toolbar
- [ ] Click opens native file picker
- [ ] Accept PDF and common document types

### 11.2 Implement Drag and Drop Zone
- [ ] Detect drag enter on input container
- [ ] Show drop zone overlay with dashed border
- [ ] Handle file drop event
- [ ] Add `aria-dropeffect="copy"` when drag active

### 11.3 Display Attached Files
- [ ] Show attached files as chips (similar to mentions)
- [ ] File icon + name + X to remove
- [ ] Distinguish from mentioned (existing) documents visually

### 11.4 File Upload Progress
- [ ] Show upload progress indicator on chip
- [ ] Shimmer effect while uploading
- [ ] Success checkmark when complete
- [ ] Error state with retry option

### 11.5 Wire Attachments to Send
- [ ] Include attached file IDs in message payload
- [ ] Clear attachments after successful send
- [ ] Handle upload failures gracefully

### 11.6 Test File Attachments
- [ ] Write tests for drag and drop detection
- [ ] Write tests for file type validation
- [ ] Write tests for upload progress states

---

## Phase 12: Messages Area Behavior

### 12.1 Implement Auto-Scroll
- [ ] Auto-scroll to bottom when new message arrives
- [ ] Only auto-scroll if already at bottom
- [ ] Track scroll position to determine "at bottom"

### 12.2 Add "Scroll to Bottom" Button
- [ ] Create floating action button (FAB)
- [ ] Show when scrolled up from bottom
- [ ] Arrow down icon
- [ ] Click smoothly scrolls to bottom

### 12.3 Add New Message Indicator
- [ ] When scrolled up and new message arrives
- [ ] Bounce the FAB to attract attention
- [ ] Optional: show message count badge

### 12.4 Add Scroll Shadows
- [ ] Subtle shadow at top when scrolled down
- [ ] Subtle shadow at bottom when more content below
- [ ] Use CSS `background: linear-gradient` technique

### 12.5 Implement Welcome State
- [ ] Show when conversation is empty
- [ ] Centered welcome message
- [ ] 3-4 suggested prompt buttons
- [ ] Click suggestion to populate input

---

## Phase 13: Message Animations

### 13.1 Implement Message Enter Animation
- [ ] New messages fade in (`opacity: 0 → 1`)
- [ ] Slide up slightly (`translateY: 10px → 0`)
- [ ] 200ms duration, ease-out timing

### 13.2 Add Role-Based Slide Direction
- [ ] User messages slide from right (`translateX: 10px → 0`)
- [ ] Assistant messages slide from left (`translateX: -10px → 0`)
- [ ] Subtle, just 10-20px movement

### 13.3 Implement Reduced Motion Support
- [ ] Check `prefers-reduced-motion` media query
- [ ] Disable slide animations when reduced motion preferred
- [ ] Keep opacity transitions (less motion-intensive)

---

## Phase 14: Polish & Micro-interactions

### 14.1 Add Button Press Effects
- [ ] Scale down on active (`scale: 0.95`)
- [ ] Quick transition (100ms)
- [ ] Apply to all interactive buttons

### 14.2 Add Hover Transitions
- [ ] Background color transitions (150ms)
- [ ] Apply to all hoverable elements
- [ ] Consistent timing across components

### 14.3 Add Focus Ring Styling
- [ ] Warm focus ring (`ring-primary/30`)
- [ ] Consistent offset (`ring-offset-2`)
- [ ] Apply to all focusable elements

### 14.4 Add Input Expand Animation
- [ ] Smooth height transition when textarea grows
- [ ] 150ms duration
- [ ] Ease-out timing

### 14.5 Add Chip Animations
- [ ] Scale-in when chip added (`scale: 0.8 → 1`)
- [ ] Fade out when removed
- [ ] 150ms duration

### 14.6 Add Error State Shake
- [ ] Brief horizontal shake on validation error
- [ ] 300ms duration, 3 oscillations
- [ ] Settle back to center

### 14.7 Add Success Flash Feedback
- [ ] Brief green flash on send button after success
- [ ] 500ms duration
- [ ] Subtle, not distracting

---

## Phase 15: Integration & Wiring

### 15.1 Connect useChat Hook
- [ ] Import Vercel AI SDK's useChat in ChatPage
- [ ] Configure API endpoint per contract from Phase 0
- [ ] Wire messages, input, handleSubmit

### 15.2 Wire Document Selection to RAG
- [ ] Pass selected document IDs to chat API (per contract)
- [ ] Include in request body
- [ ] Update Zustand store on selection change

### 15.3 Wire File Uploads
- [ ] Implement file upload API call (per contract)
- [ ] Get document ID after upload
- [ ] Add to selected documents automatically
- [ ] Handle upload errors with toast notification

### 15.4 Wire Chat History
- [ ] Fetch chat history from API (per contract)
- [ ] Implement load conversation handler
- [ ] Implement new chat handler
- [ ] Persist current chat ID in URL or state
- [ ] Add optimistic loading state when switching conversations

### 15.5 Wire Message Actions
- [ ] Implement regenerate: call API with same input
- [ ] Implement edit: update message and resend
- [ ] Implement copy: copy to clipboard

### 15.6 Handle Loading States
- [ ] Show skeletons while loading history
- [ ] Show thinking indicator while waiting for response
- [ ] Disable input while processing

### 15.7 Handle Error States
- [ ] Create reusable error toast component
- [ ] Show error toast on API failure
- [ ] Allow retry on failed messages
- [ ] Graceful degradation (show partial data if available)

---

## Phase 16: QA & Testing

### 16.1 Accessibility Audit
- [ ] Verify all interactive elements are keyboard accessible
- [ ] Verify ARIA labels added during implementation
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify focus management through all flows
- [ ] Check color contrast meets WCAG AA

### 16.2 Mobile Testing
- [ ] Test sidebar collapse/expand on mobile
- [ ] Test touch interactions
- [ ] Verify input doesn't get hidden by keyboard
- [ ] Test on iOS Safari and Android Chrome

### 16.3 Performance Check
- [ ] Profile render performance with many messages
- [ ] Implement virtualization if needed (using prep from Phase 4.7)
- [ ] Optimize re-renders with memo/useMemo
- [ ] Verify no memory leaks in scroll handlers

### 16.4 Dark Mode Verification
- [ ] Test all components in dark mode
- [ ] Verify contrast ratios meet WCAG AA
- [ ] Check shadows and borders in dark mode

### 16.5 Cross-Browser Testing
- [ ] Test in Chrome, Firefox, Safari
- [ ] Verify animations work consistently
- [ ] Check for CSS compatibility issues

### 16.6 End-to-End Testing
- [ ] Write E2E test: send message and receive response
- [ ] Write E2E test: upload document and mention in chat
- [ ] Write E2E test: switch between conversations
- [ ] Write E2E test: citation click scrolls to source

---

## Phase 17: Cleanup

### 17.1 Remove Unused Code
- [ ] Remove any backup files created during replacement
- [ ] Remove unused imports and dependencies
- [ ] Run linter to catch dead code

### 17.2 Update Exports
- [ ] Update `packages/ui` component exports
- [ ] Ensure all new components are properly exported
- [ ] Remove exports for deleted components

### 17.3 Documentation
- [ ] Update component documentation
- [ ] Document new features and keyboard shortcuts
- [ ] Update any relevant README sections

---

## Future Enhancements (Deferred)

> Nice-to-have features that can be added after core implementation.

### Formatting Toolbar
- [ ] Create `packages/ui/src/components/formatting-toolbar.tsx`
- [ ] Add Bold, Italic, Code, Link buttons
- [ ] Implement `Cmd+B`, `Cmd+I`, `Cmd+E`, `Cmd+K` shortcuts
- [ ] Toggle visibility with toolbar button

### Smooth Streaming Text
- [ ] Buffer incoming tokens (group into chunks)
- [ ] Prevent jarring character-by-character updates
- [ ] Target ~50ms update intervals

### Advanced History Features
- [ ] Delete conversation from history
- [ ] Rename conversation
- [ ] Export conversation as markdown

---

## Summary

**Total tasks:** ~130
**Phases:** 17 + Future backlog

**Approach:** In-place replacement of existing chat (no parallel v2 build)

**Key improvements from review:**
- Phase 0 defines state management and API contracts upfront
- Testing tasks distributed throughout phases
- Accessibility tasks integrated into component phases
- Error boundaries and handling added early
- Virtualization planned from Phase 4

**Key deliverables:**
- Two-panel layout with collapsible sidebar
- Full markdown rendering with syntax highlighting
- Citation system with inline badges and sources
- Rich input with @ mentions and attachments
- Polished animations and micro-interactions
- Comprehensive accessibility and mobile support
