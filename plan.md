# Chat UI Redesign — Implementation Backlog

## Overview

Redesign the Chat page with a unified sidebar layout, welcome state with suggestion cards, and glowing input card effect. Adapts the HTML mockup structure while preserving the existing "Trattoria Study Hall" terracotta color palette.

**Key decisions:**
- Full layout restructure with unified sidebar (chat-centric, other pages unchanged)
- Static suggestion cards on welcome screen
- Glowing halo effect on input card matching mockup exactly
- Sidebar always visible on desktop, overlay on mobile
- Keep current terracotta palette (don't adopt mockup's amber)
- Add glass-panel blur effect to sidebar
- Minimal message area changes (just max-width alignment)

---

## Phase 1: Foundation & Utilities ✅

### 1.1 Add CSS utilities for glass-panel and glow effects

- [x] **Add glass-panel utility class to `packages/ui/src/styles.css`**
  - Add `.glass-panel` class with `backdrop-filter: blur(12px)` and `-webkit-backdrop-filter: blur(12px)`
  - Place in `@layer utilities` section

- [x] **Add glow shadow utility to `packages/ui/src/styles.css`**
  - Add `--shadow-glow` CSS variable: `0 0 20px -5px oklch(var(--primary) / 0.3)`
  - Add `.shadow-glow` utility class using the variable

- [x] **Add gradient text utility to `packages/ui/src/styles.css`**
  - Already existed: `.text-gradient-primary` class with `text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent`

- [ ] **Verify utilities work in both light and dark modes**
  - Test glass-panel visibility on both themes
  - Test glow shadow color in both themes

---

## Phase 2: Chat Page Sidebar Component ✅

### 2.1 Create sidebar component file structure

- [x] **Create new file `packages/ui/src/components/chat-page-sidebar.tsx`**
  - Add basic component skeleton with TypeScript types
  - Export `ChatPageSidebar` component
  - Export `ChatPageSidebarProps` interface

- [x] **Add component to `packages/ui/src/components/index.ts` exports**
  - Add export for `ChatPageSidebar`

### 2.2 Implement sidebar header section

- [x] **Create `SidebarHeader` sub-component inside chat-page-sidebar.tsx**
  - Container: `p-6 flex items-center gap-3`
  - Logo container: `relative w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full`
  - Pizza emoji: `text-2xl` with animated pulse dot (`w-2 h-2 bg-primary rounded-full animate-pulse`)
  - Title: `font-serif font-semibold text-xl tracking-tight`
  - Subtitle: `text-xs text-muted-foreground font-medium` — "Learn deliciously"

### 2.3 Implement navigation links section

- [x] **Create `SidebarNav` sub-component**
  - Container: `px-4 space-y-1 mb-6`
  - Accept `currentPath` prop to determine active state

- [x] **Create `NavItemComponent` sub-component for individual nav links**
  - Base styles: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors group`
  - Active styles: `bg-primary/10 text-primary font-medium shadow-sm ring-1 ring-primary/20`
  - Icon: `text-xl group-hover:text-primary transition-colors`
  - Label: `text-sm font-medium`

- [x] **Add four navigation items**
  - Dashboard — icon: `DashboardSquare01Icon`, path: `/`
  - Documents — icon: `File02Icon`, path: `/documents`
  - Calendar — icon: `Calendar03Icon`, path: `/calendar`
  - Chat — icon: `Chat01Icon`, path: `/chat`

### 2.4 Implement "New Chat" button

- [x] **Create `NewChatButton` sub-component**
  - Container: `px-4 mb-6`
  - Button styles: `w-full flex items-center justify-center gap-2 py-2.5 rounded-lg`
  - Gradient: `bg-gradient-to-r from-destructive to-primary`
  - Text: `text-primary-foreground font-medium`
  - Effects: `shadow-glow hover:shadow-lg hover:opacity-90 transition-all transform active:scale-[0.98]`
  - Icon: `Add01Icon`, `text-sm`
  - Accept `onClick` prop for creating new chat

### 2.5 Implement Documents section

- [x] **Create `SidebarSection` generic sub-component**
  - Accept `title`, `children`, `defaultOpen` props
  - Header row: `flex items-center justify-between mb-2 text-muted-foreground`
  - Title: `text-xs font-semibold uppercase tracking-wider opacity-70`
  - Chevron icon that rotates when collapsed/expanded
  - Collapsible content area with smooth height transition

- [x] **Create `DocumentsSection` sub-component**
  - Use `SidebarSection` with title "Documents"
  - Accept `documents` prop (array of document objects)
  - Map documents to list items

- [x] **Create `DocumentItem` sub-component**
  - Container: `flex items-center justify-between px-2 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-sm text-muted-foreground group`
  - Left side: PDF icon (`text-red-400`) + truncated name (`truncate group-hover:text-primary transition-colors`)
  - Right side: page count badge (`text-[10px] opacity-50`)

- [x] **Add "Upload Document" button at bottom of documents section**
  - Styles: `w-full mt-2 flex items-center justify-center gap-2 py-1.5 border border-dashed border-border rounded text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors`
  - Icon: `Upload04Icon`, `text-sm`
  - Accept `onUpload` prop

### 2.6 Implement History section

- [x] **Create `HistorySection` sub-component**
  - Use `SidebarSection` with title "History"
  - Accept `conversations` prop, `searchQuery`, `onSearchChange`, `onSelectConversation`

- [x] **Add search input inside HistorySection**
  - Container: `relative mb-3`
  - Search icon: `absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm`
  - Input: `w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/50 text-xs py-2 pl-8 pr-3 rounded-md focus:ring-0 focus:outline-none transition-all`
  - Placeholder: "Search conversations..."

- [x] **Create `HistoryItem` sub-component**
  - Container: `group relative flex flex-col gap-1 p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-transparent hover:border-border transition-all cursor-pointer`
  - Top row: chat icon + truncated title (max `w-32`) + hover actions (edit/delete icons)
  - Bottom row: relative time + message count (`text-[10px] text-muted-foreground opacity-70`)
  - Hover actions: `hidden group-hover:flex items-center gap-1`

### 2.7 Implement sidebar footer

- [x] **Create `SidebarFooter` sub-component**
  - Container: `p-4 mt-auto border-t border-border`
  - Accept `onThemeClick`, `onSettingsClick`, `onQuickChatClick` props

- [x] **Add Theme and System buttons row**
  - Container: `flex items-center justify-between mb-4`
  - Button styles: `flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors`
  - Theme button: `PaintBrushIcon` + "Theme"
  - System button: `Settings02Icon` + "System"

- [x] **Add Quick Chat button**
  - Container: `w-full flex items-center justify-between p-2 rounded-lg border border-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors group`
  - Left: `SparklesIcon` (`text-primary`) + "Quick Chat" label
  - Right: Keyboard shortcut badge `⌘K` — `hidden group-hover:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-black/10 dark:bg-white/10 rounded`

### 2.8 Assemble complete sidebar

- [x] **Combine all sub-components in main `ChatPageSidebar` component**
  - Root container: `w-72 h-full flex flex-col border-r border-border glass-panel relative z-20 transition-all duration-300`
  - Background: `bg-sidebar/50` (semi-transparent for glass effect)
  - Order: Header → Nav → NewChatButton → Documents (scrollable) → History (scrollable) → Footer
  - Middle sections wrapper: `flex-1 overflow-y-auto px-4 space-y-6`

- [x] **Add props interface for ChatPageSidebar**
  - `documents`: array of documents
  - `conversations`: array of chat history items
  - `currentPath`: string for active nav highlighting
  - `onNewChat`: callback
  - `onSelectDocument`: callback
  - `onSelectConversation`: callback
  - `onUploadDocument`: callback
  - `onThemeToggle`: callback
  - `onOpenSettings`: callback
  - `onQuickChat`: callback

- [x] **Add mobile sidebar support**
  - Mobile overlay with backdrop
  - `ChatPageSidebarTrigger` component for mobile hamburger button
  - Escape key and backdrop click to close

---

## Phase 3: Welcome State Component ✅

### 3.1 Create welcome component file

- [x] **Create new file `packages/ui/src/components/chat-welcome.tsx`**
  - Add basic component skeleton
  - Export `ChatWelcome` component
  - Export `ChatWelcomeProps` interface

- [x] **Add component to `packages/ui/src/components/index.ts` exports**

### 3.2 Implement hero section

- [x] **Create hero container**
  - Wrapper: `w-full max-w-4xl space-y-12`
  - Add entrance animation class: `animate-in fade-in-0 slide-in-from-bottom-4`

- [x] **Create main heading**
  - Container: `space-y-4`
  - Heading: `font-serif text-5xl md:text-6xl tracking-tight leading-tight`
  - Text: "How can I help you "
  - Gradient word: `<span class="text-gradient-primary">study?</span>`

- [x] **Create subheading paragraph**
  - Styles: `text-lg text-muted-foreground max-w-2xl font-light`
  - Text: "Ask me questions, request explanations, or build study plans using your saved documents. I'm here to make learning delicious."

### 3.3 Implement suggestion cards section

- [x] **Create suggestions container**
  - Wrapper: `space-y-4`
  - Label: `text-sm font-medium uppercase tracking-widest text-muted-foreground opacity-60` — "Start with"
  - Grid: `grid grid-cols-1 md:grid-cols-3 gap-4`

- [x] **Create `SuggestionCardComponent` sub-component**
  - Accept `suggestion`, `onClick` props
  - Container: `group relative p-6 rounded-2xl border border-border bg-card/30 hover:bg-card transition-all duration-300 hover:shadow-glow hover:-translate-y-1 text-left`
  - Icon container: `w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-colors`
  - Title: `text-lg font-semibold mb-2`
  - Description: `text-sm text-muted-foreground leading-relaxed`

- [x] **Add three suggestion cards with static content**
  - Card 1: `BulbIcon` (yellow), "Explain a concept", "Can you explain the concept of integration by parts?"
  - Card 2: `BookOpen01Icon` (blue), "Quiz me", "Quiz me on Newton's Laws of Motion with 5 questions."
  - Card 3: `HelpCircleIcon` (green), "Help with homework", "I'm stuck on a calculus problem. Can you guide me?"

- [x] **Wire up onClick to populate input**
  - Accept `onSelectPrompt` prop in `ChatWelcome`
  - Pass prompt text to callback when card is clicked

---

## Phase 4: Chat Input Redesign ✅

> **Note:** Created a new `ChatInputGlow` component instead of modifying the existing `ChatInput` to maintain backward compatibility.

### 4.1 Restructure chat input layout

- [x] **Create new file `packages/ui/src/components/chat-input-glow.tsx`**
  - Based on existing ChatInput structure and props
  - Preserves all functionality (mentions, attachments, drag-drop)

- [x] **Create new outer wrapper with glow effect**
  - Wrapper class: `relative group max-w-4xl mx-auto`
  - Glow element: `absolute -inset-0.5 bg-gradient-to-r from-primary to-destructive rounded-2xl opacity-20 group-hover:opacity-40 blur transition-all duration-300`
  - Inner card: `relative flex flex-col gap-2 bg-card border border-border rounded-2xl p-3 shadow-2xl`

### 4.2 Add model selector row

- [x] **Model selector slot at top of input card**
  - Container row: `flex items-center justify-between px-2`
  - Accepts `modelSelector` prop (React node) for custom selector
  - Rendered first in the card layout

### 4.3 Update textarea styling

- [x] **Modify textarea element**
  - New styles: `w-full bg-transparent border-0 focus:ring-0 p-3 text-base placeholder:text-muted-foreground resize-none max-h-48`
  - Kept auto-resize functionality
  - Caret color: `caret-primary`

### 4.4 Restructure action buttons row

- [x] **Create bottom row container**
  - Styles: `flex items-center justify-between px-2 pb-1`

- [x] **Move attachment buttons to left side**
  - Container: `flex items-center gap-2`
  - Button styles: `p-2 rounded-lg text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-primary transition-colors`
  - Attach file button: `Attachment01Icon`
  - Image button: `Image01Icon` (optional via `onImageAttach` prop)

- [x] **Keep send button on right side**
  - Styles: `p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed`
  - Icon: Send icon, `text-xl`

### 4.5 Add disclaimer text

- [x] **Add disclaimer below input card**
  - Container: `mt-3 text-center`
  - Text: `text-[10px] text-muted-foreground opacity-40`
  - Content: "AI can make mistakes. Verify important information."
  - Controlled via `showDisclaimer` prop (default: true)

### 4.6 Clean up old input styles

- [x] **Keep `.writing-desk` class for backward compatibility**
  - Original `ChatInput` component unchanged
  - New `ChatInputGlow` uses new glow effect
  - Both components exported from `@repo/ui`

---

## Phase 5: Chat Page Layout Integration ✅

### 5.1 Update Chat page route configuration

- [x] **Add new route at `/chat-new` in `apps/frontend/src/routes.tsx`**
  - New route renders outside RootLayout (has its own sidebar)
  - Old `/chat` route preserved for comparison

### 5.2 Restructure ChatPage component

- [x] **Created `apps/frontend/src/pages/chat/ChatPageNew.tsx`**
  - Preserves all existing business logic from ChatPage
  - Uses new UI components

- [x] **Create new root layout structure**
  - Root container: `h-screen overflow-hidden flex bg-background`
  - Sidebar: `<ChatPageSidebar />` (new component)
  - Main: `flex-1 h-full flex flex-col relative`

- [x] **Add mobile sidebar state management**
  - `mobileSidebarOpen` state with `useState(false)`
  - Toggle via `ChatPageSidebarTrigger`
  - Close via backdrop click or `onMobileClose`

### 5.3 Implement mobile sidebar behavior

- [x] **Mobile sidebar integrated via ChatPageSidebar component**
  - Desktop: renders inline
  - Mobile: renders as fixed overlay with backdrop
  - `mobileOpen` and `onMobileClose` props

- [x] **Mobile header with toggle button**
  - Container: `md:hidden h-14 px-4 flex items-center border-b`
  - Uses `ChatPageSidebarTrigger` component
  - Shows "Chat" title

### 5.4 Integrate welcome state

- [x] **Conditional rendering for welcome vs messages**
  - If `messages.length === 0`: render `<ChatWelcome />`
  - Else: render messages list in scrollable area

- [x] **Wire up ChatWelcome's onSelectPrompt**
  - Callback populates input via `handleInputChange`

### 5.5 Update message area styling

- [x] **Change message container max-width to match input**
  - Messages use `max-w-4xl mx-auto`
  - Matches input card width

- [x] **Message area scrolling verified**
  - Uses `useAutoScroll` hook
  - Scroll shadows via `canScrollUp`/`canScrollDown`
  - Input stays at bottom (not sticky, in dedicated section)

### 5.6 Connect sidebar to existing functionality

- [x] **Wire up document selection**
  - Documents passed from `useChatStore`
  - `onSelectDocument` calls `toggleDocumentSelection`

- [x] **Wire up conversation history**
  - Conversations from `getFilteredHistory()`
  - `onSelectConversation` loads conversation via API
  - Search via `historySearchQuery` state

- [x] **Wire up new chat button**
  - Clears messages, mentioned docs, attachments
  - Resets conversation ID

- [x] **Wire up theme toggle**
  - Connected to `cycleTheme` from `useTheme` hook

- [x] **Wire up Quick Chat (⌘K)**
  - Connected to `openChatSlideOver` from `useUIStore`
  - Ensure keyboard shortcut still works

---

## Phase 6: Polish & Refinements ✅

### 6.1 Add animations

- [x] **Entrance animation on welcome state**
  - Uses `animate-in fade-in-0 slide-in-from-bottom-4 duration-500`

- [x] **Mobile sidebar animations**
  - Sidebar: `animate-in slide-in-from-left-2 duration-200`
  - Backdrop: `animate-in fade-in-0 duration-200`

- [x] **Suggestion card hover animations**
  - `hover:shadow-glow hover:-translate-y-1 transition-all duration-300`
  - Focus states mirror hover for keyboard users

### 6.2 Accessibility improvements

- [x] **ARIA labels on sidebar navigation**
  - `aria-label="Main navigation"` on nav container
  - `aria-current="page"` on active nav item

- [x] **Keyboard navigation for suggestion cards**
  - Cards are `<button>` elements (naturally focusable)
  - Focus styles: `focus-visible:ring-2 focus-visible:shadow-glow focus-visible:-translate-y-1`
  - Enter/Space activates (native button behavior)

- [x] **Escape key closes mobile sidebar**
  - `useEffect` with `keydown` listener for Escape
  - Cleans up on unmount

- [x] **Suggestions section labeled**
  - `<section aria-labelledby="suggestions-heading">`
  - Grid has `role="group"`

### 6.3 Dark mode verification

- [x] **CSS utilities support dark mode**
  - `shadow-glow` has `.dark` variant with brighter glow
  - `scroll-shadow-*` utilities have `.dark` variants with stronger shadows

- [x] **Glass panel works in dark mode**
  - Uses `bg-sidebar/50` which adapts to theme

### 6.4 Responsive testing

- [x] **Scroll shadows added**
  - `.scroll-shadow-top` and `.scroll-shadow-bottom` utilities
  - Dark mode variants with stronger shadows
  - Combined class for both shadows simultaneously

---

## Phase 7: Cleanup & Documentation ✅

### 7.1 Remove deprecated code

- [x] **Remove old chat layout components if fully replaced**
  - Deleted `apps/frontend/src/pages/chat/ChatPage.tsx` (was dead code, not imported anywhere)
  - `ChatLayoutSidebar` etc. now only exported from UI package (kept for backwards compatibility)
  - New unified sidebar is in `AppSidebar.tsx` with conditional chat sections

- [ ] **Clean up any unused CSS classes**
  - `.writing-desk` still used by original `ChatInput` component (kept for backwards compat)
  - No dead code identified

### 7.2 Update component documentation

- [x] **JSDoc comments on new components**
  - `ChatPageSidebar` — has props interface and component docs
  - `ChatWelcome` — has props interface and component docs
  - `AppSidebar` — updated with new chat section documentation

- [ ] **Update any existing documentation**
  - No component docs file exists in repo

### 7.3 Final verification

- [x] **Run TypeScript type checking**
  - `bun run typecheck` — ✅ Passes

- [x] **Run linter**
  - `bun run lint` — Pre-existing issues in backend/ai packages (not related to sidebar work)

- [x] **Run tests**
  - `bun run test:run` — 3 pre-existing failures in `@repo/ai` agent tests (unrelated)
  - All UI/frontend tests pass

- [ ] **Manual end-to-end testing**
  - Create new chat
  - Send messages
  - Switch conversations (test rapid switching for AbortController)
  - Delete conversation (verify confirmation dialog)
  - Upload document
  - Toggle theme
  - Test on mobile

---

## File Reference

| File | Action | Description |
|------|--------|-------------|
| `packages/ui/src/styles.css` | Modify | Add glass-panel, glow utilities |
| `packages/ui/src/components/chat-page-sidebar.tsx` | Create | New unified sidebar component |
| `packages/ui/src/components/chat-welcome.tsx` | Create | Welcome hero + suggestion cards |
| `packages/ui/src/components/chat-input.tsx` | Modify | Glow effect, restructure layout |
| `packages/ui/src/index.ts` | Modify | Export new components |
| `apps/frontend/src/pages/chat/ChatPage.tsx` | Modify | New layout structure |
| `apps/frontend/src/pages/chat/index.tsx` | Modify | Route config if needed |

---

## Design Tokens Reference

```css
/* Colors (existing palette) */
--primary: oklch(0.50 0.16 25);      /* Terracotta */
--accent: oklch(0.90 0.10 90);       /* Golden */
--surface: oklch(0.94 0.01 75);      /* Warm gray */
--muted-foreground: /* existing */

/* New utilities */
--shadow-glow: 0 0 20px -5px oklch(var(--primary) / 0.3);

/* Sizes */
--sidebar-width: 18rem;              /* 288px / w-72 */
--content-max-width: 56rem;          /* 896px / max-w-4xl */
```
