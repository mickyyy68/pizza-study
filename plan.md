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

## Phase 1: Foundation & Utilities

### 1.1 Add CSS utilities for glass-panel and glow effects

- [ ] **Add glass-panel utility class to `packages/ui/src/styles.css`**
  - Add `.glass-panel` class with `backdrop-filter: blur(12px)` and `-webkit-backdrop-filter: blur(12px)`
  - Place in `@layer utilities` section

- [ ] **Add glow shadow utility to `packages/ui/src/styles.css`**
  - Add `--shadow-glow` CSS variable: `0 0 20px -5px oklch(var(--primary) / 0.3)`
  - Add `.shadow-glow` utility class using the variable

- [ ] **Add gradient text utility to `packages/ui/src/styles.css`**
  - Add `.text-gradient-primary` class with `text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent`

- [ ] **Verify utilities work in both light and dark modes**
  - Test glass-panel visibility on both themes
  - Test glow shadow color in both themes

---

## Phase 2: Chat Page Sidebar Component

### 2.1 Create sidebar component file structure

- [ ] **Create new file `packages/ui/src/components/chat-page-sidebar.tsx`**
  - Add basic component skeleton with TypeScript types
  - Export `ChatPageSidebar` component
  - Export `ChatPageSidebarProps` interface

- [ ] **Add component to `packages/ui/src/index.ts` exports**
  - Add export for `ChatPageSidebar`

### 2.2 Implement sidebar header section

- [ ] **Create `SidebarHeader` sub-component inside chat-page-sidebar.tsx**
  - Container: `p-6 flex items-center gap-3`
  - Logo container: `relative w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full`
  - Pizza emoji: `text-2xl` with animated pulse dot (`w-2 h-2 bg-primary rounded-full animate-pulse`)
  - Title: `font-display font-semibold text-xl tracking-tight`
  - Subtitle: `text-xs text-muted-foreground font-medium` — "Learn deliciously"

### 2.3 Implement navigation links section

- [ ] **Create `SidebarNav` sub-component**
  - Container: `px-4 space-y-1 mb-6`
  - Accept `currentPath` prop to determine active state

- [ ] **Create `NavItem` sub-component for individual nav links**
  - Base styles: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors group`
  - Active styles: `bg-primary/10 text-primary font-medium shadow-sm ring-1 ring-primary/20`
  - Icon: `text-xl group-hover:text-primary transition-colors`
  - Label: `text-sm font-medium`

- [ ] **Add four navigation items**
  - Dashboard — icon: `LayoutDashboard` (lucide), path: `/`
  - Documents — icon: `FileText`, path: `/documents`
  - Calendar — icon: `Calendar`, path: `/calendar`
  - Chat — icon: `MessageCircle`, path: `/chat`

### 2.4 Implement "New Chat" button

- [ ] **Create `NewChatButton` sub-component**
  - Container: `px-4 mb-6`
  - Button styles: `w-full flex items-center justify-center gap-2 py-2.5 rounded-lg`
  - Gradient: `bg-gradient-to-r from-red-500 to-primary` (use CSS variables for colors)
  - Text: `text-white font-medium`
  - Effects: `shadow-glow hover:shadow-lg hover:opacity-90 transition-all transform active:scale-[0.98]`
  - Icon: Plus icon, `text-sm`
  - Accept `onClick` prop for creating new chat

### 2.5 Implement Documents section

- [ ] **Create `SidebarSection` generic sub-component**
  - Accept `title`, `children`, `defaultOpen`, `onToggle` props
  - Header row: `flex items-center justify-between mb-2 text-muted-foreground`
  - Title: `text-xs font-semibold uppercase tracking-wider opacity-70`
  - Chevron icon that rotates when collapsed/expanded
  - Collapsible content area with smooth height transition

- [ ] **Create `DocumentsSection` sub-component**
  - Use `SidebarSection` with title "Documents"
  - Accept `documents` prop (array of document objects)
  - Map documents to list items

- [ ] **Create `DocumentItem` sub-component**
  - Container: `flex items-center justify-between px-2 py-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-sm text-muted-foreground group`
  - Left side: PDF icon (`text-red-400`) + truncated name (`truncate group-hover:text-primary transition-colors`)
  - Right side: page count badge (`text-[10px] opacity-50`)

- [ ] **Add "Upload Document" button at bottom of documents section**
  - Styles: `w-full mt-2 flex items-center justify-center gap-2 py-1.5 border border-dashed border-border rounded text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors`
  - Icon: Upload icon, `text-sm`
  - Accept `onUpload` prop

### 2.6 Implement History section

- [ ] **Create `HistorySection` sub-component**
  - Use `SidebarSection` with title "History"
  - Accept `conversations` prop, `searchQuery`, `onSearchChange`, `onSelectConversation`

- [ ] **Add search input inside HistorySection**
  - Container: `relative mb-3`
  - Search icon: `absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm`
  - Input: `w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/50 text-xs py-2 pl-8 pr-3 rounded-md focus:ring-0 focus:outline-none transition-all`
  - Placeholder: "Search conversations..."

- [ ] **Create `HistoryItem` sub-component**
  - Container: `group relative flex flex-col gap-1 p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-transparent hover:border-border transition-all cursor-pointer`
  - Top row: chat icon + truncated title (max `w-32`) + hover actions (edit/delete icons)
  - Bottom row: relative time + message count (`text-[10px] text-muted-foreground opacity-70`)
  - Hover actions: `hidden group-hover:flex items-center gap-1`

### 2.7 Implement sidebar footer

- [ ] **Create `SidebarFooter` sub-component**
  - Container: `p-4 mt-auto border-t border-border`
  - Accept `onThemeClick`, `onSettingsClick`, `onQuickChatClick` props

- [ ] **Add Theme and System buttons row**
  - Container: `flex items-center justify-between mb-4`
  - Button styles: `flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors`
  - Theme button: Palette icon + "Theme"
  - System button: Settings icon + "System"

- [ ] **Add Quick Chat button**
  - Container: `w-full flex items-center justify-between p-2 rounded-lg border border-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors group`
  - Left: Sparkles icon (`text-primary`) + "Quick Chat" label
  - Right: Keyboard shortcut badge `⌘K` — `hidden group-hover:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-black/10 dark:bg-white/10 rounded`

### 2.8 Assemble complete sidebar

- [ ] **Combine all sub-components in main `ChatPageSidebar` component**
  - Root container: `w-72 h-full flex flex-col border-r border-border glass-panel relative z-20 transition-all duration-300`
  - Background: `bg-surface/50` (semi-transparent for glass effect)
  - Order: Header → Nav → NewChatButton → Documents (scrollable) → History (scrollable) → Footer
  - Middle sections wrapper: `flex-1 overflow-y-auto px-4 space-y-6`

- [ ] **Add props interface for ChatPageSidebar**
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

---

## Phase 3: Welcome State Component

### 3.1 Create welcome component file

- [ ] **Create new file `packages/ui/src/components/chat-welcome.tsx`**
  - Add basic component skeleton
  - Export `ChatWelcome` component
  - Export `ChatWelcomeProps` interface

- [ ] **Add component to `packages/ui/src/index.ts` exports**

### 3.2 Implement hero section

- [ ] **Create hero container**
  - Wrapper: `w-full max-w-4xl space-y-12`
  - Add entrance animation class: `animate-fade-in-up`

- [ ] **Create main heading**
  - Container: `space-y-4`
  - Heading: `font-display text-5xl md:text-6xl tracking-tight leading-tight`
  - Text: "How can I help you "
  - Gradient word: `<span class="text-gradient-primary">study?</span>`

- [ ] **Create subheading paragraph**
  - Styles: `text-lg text-muted-foreground max-w-2xl font-light`
  - Text: "Ask me questions, request explanations, or build study plans using your saved documents. I'm here to make learning delicious."

### 3.3 Implement suggestion cards section

- [ ] **Create suggestions container**
  - Wrapper: `space-y-4`
  - Label: `text-sm font-medium uppercase tracking-widest text-muted-foreground opacity-60` — "Start with"
  - Grid: `grid grid-cols-1 md:grid-cols-3 gap-4`

- [ ] **Create `SuggestionCard` sub-component**
  - Accept `icon`, `iconColor`, `title`, `description`, `prompt`, `onClick` props
  - Container: `group relative p-6 rounded-2xl border border-border bg-surface/30 hover:bg-surface transition-all duration-300 hover:shadow-glow hover:-translate-y-1 text-left`
  - Icon container: `w-10 h-10 rounded-full bg-{color}/10 flex items-center justify-center mb-4 group-hover:bg-{color}/20 transition-colors`
  - Title: `text-lg font-semibold mb-2`
  - Description: `text-sm text-muted-foreground leading-relaxed`

- [ ] **Add three suggestion cards with static content**
  - Card 1: Lightbulb icon (yellow), "Explain a concept", "Can you explain the concept of integration by parts?"
  - Card 2: GraduationCap icon (blue), "Quiz me", "Quiz me on Newton's Laws of Motion with 5 questions."
  - Card 3: HelpCircle icon (green), "Help with homework", "I'm stuck on a calculus problem. Can you guide me?"

- [ ] **Wire up onClick to populate input**
  - Accept `onSelectPrompt` prop in `ChatWelcome`
  - Pass prompt text to callback when card is clicked

---

## Phase 4: Chat Input Redesign

### 4.1 Restructure chat input layout

- [ ] **Open `packages/ui/src/components/chat-input.tsx` for modification**
  - Review current structure and props

- [ ] **Create new outer wrapper with glow effect**
  - Wrapper class: `relative group max-w-4xl mx-auto`
  - Glow element: `absolute -inset-0.5 bg-gradient-to-r from-primary to-red-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-1000 group-hover:duration-200`
  - Inner card: `relative flex flex-col gap-2 bg-surface border border-border rounded-2xl p-3 shadow-2xl`

### 4.2 Add model selector row

- [ ] **Create model selector pill component (or modify existing)**
  - Container row: `flex items-center justify-between px-2`
  - Pill button: `flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-xs font-medium border border-transparent hover:border-primary/30`
  - Content: Bot icon (`text-primary text-sm`) + model name + chevron down (`text-xs opacity-50`)

- [ ] **Move model selector from current position to top of input card**
  - Update component structure to render model selector first
  - Ensure dropdown still functions correctly

### 4.3 Update textarea styling

- [ ] **Modify textarea element**
  - Remove existing border/background styles
  - New styles: `w-full bg-transparent border-0 focus:ring-0 p-3 text-base placeholder-muted-foreground resize-none max-h-48`
  - Keep auto-resize functionality

### 4.4 Restructure action buttons row

- [ ] **Create bottom row container**
  - Styles: `flex items-center justify-between px-2 pb-1`

- [ ] **Move attachment buttons to left side**
  - Container: `flex items-center gap-2`
  - Button styles: `p-2 rounded-lg text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-primary transition-colors`
  - Attach file button: Paperclip icon, `text-xl`
  - Image button: Image icon, `text-xl`

- [ ] **Keep send button on right side**
  - Styles: `p-2 rounded-lg bg-primary text-white hover:bg-secondary transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed`
  - Icon: Send icon, `text-xl`

### 4.5 Add disclaimer text

- [ ] **Add disclaimer below input card**
  - Container: `mt-3 text-center`
  - Text: `text-[10px] text-muted-foreground opacity-40`
  - Content: "AI can make mistakes. Verify important information."

### 4.6 Clean up old input styles

- [ ] **Remove or update `.writing-desk` class usage**
  - Check if class is used elsewhere
  - Remove from chat input if replaced by new glow effect
  - Keep class definition in CSS for potential other uses

---

## Phase 5: Chat Page Layout Integration

### 5.1 Update Chat page route configuration

- [ ] **Modify `apps/frontend/src/pages/chat/index.tsx` (or route config)**
  - Ensure Chat page can render without RootLayout's AppSidebar
  - Chat page should be full-screen with its own sidebar

### 5.2 Restructure ChatPage component

- [ ] **Open `apps/frontend/src/pages/chat/ChatPage.tsx` for modification**
  - Review current layout structure and state management

- [ ] **Create new root layout structure**
  - Root container: `h-screen overflow-hidden flex bg-background`
  - Sidebar: `<ChatPageSidebar />` (new component)
  - Main: `flex-1 h-full flex flex-col relative`

- [ ] **Add mobile sidebar state management**
  - Add `sidebarOpen` state: `useState(false)`
  - Add toggle function
  - Pass to sidebar for mobile overlay behavior

### 5.3 Implement mobile sidebar behavior

- [ ] **Add mobile overlay wrapper to ChatPageSidebar**
  - Desktop: render sidebar inline
  - Mobile (`md:hidden`): render as fixed overlay with backdrop
  - Backdrop: `fixed inset-0 bg-black/50 z-40` (click to close)
  - Sidebar overlay: `fixed inset-y-0 left-0 z-50`

- [ ] **Add mobile header with toggle button**
  - Container: `md:hidden h-14 px-4 flex items-center border-b border-border`
  - Toggle button: hamburger menu icon
  - Optional: Show "Pizza Study" title in mobile header

### 5.4 Integrate welcome state

- [ ] **Add conditional rendering for welcome vs messages**
  - If `messages.length === 0`: render `<ChatWelcome />`
  - Else: render messages list
  - Both should be inside the scrollable main area

- [ ] **Wire up ChatWelcome's onSelectPrompt**
  - When user clicks suggestion card, populate input with prompt text
  - Focus the input after populating

### 5.5 Update message area styling

- [ ] **Change message container max-width to match input**
  - Update from `max-w-3xl` to `max-w-4xl`
  - Ensure centering: `mx-auto`

- [ ] **Verify message area scrolling works correctly**
  - Main area should scroll, not entire page
  - Input should remain sticky at bottom

### 5.6 Connect sidebar to existing functionality

- [ ] **Wire up document selection**
  - Pass documents from existing state/API
  - Connect `onSelectDocument` to existing document toggle logic

- [ ] **Wire up conversation history**
  - Pass conversations from existing state/API
  - Connect `onSelectConversation` to load conversation
  - Connect search functionality if exists

- [ ] **Wire up new chat button**
  - Clear messages and start fresh conversation
  - Reset any selected documents if needed

- [ ] **Wire up theme toggle**
  - Connect to existing theme toggle functionality

- [ ] **Wire up Quick Chat (⌘K)**
  - Connect to existing `ChatSlideOver` component
  - Ensure keyboard shortcut still works

---

## Phase 6: Polish & Refinements

### 6.1 Add animations

- [ ] **Add entrance animation to welcome state**
  - Verify `animate-fade-in-up` is defined in CSS
  - Apply to welcome container

- [ ] **Add transition to sidebar collapse on mobile**
  - Slide in from left: `transition-transform duration-300`
  - Backdrop fade: `transition-opacity duration-300`

- [ ] **Add subtle animation to suggestion cards on hover**
  - Already handled by hover classes, verify smooth

### 6.2 Accessibility improvements

- [ ] **Add ARIA labels to sidebar navigation**
  - `aria-label` on nav container
  - `aria-current="page"` on active nav item

- [ ] **Add keyboard navigation for suggestion cards**
  - Cards should be focusable
  - Enter/Space to activate

- [ ] **Ensure mobile sidebar can be closed with Escape key**
  - Add keyboard event listener

### 6.3 Dark mode verification

- [ ] **Test all new components in dark mode**
  - Glass panel visibility
  - Glow effect colors
  - Text contrast
  - Border visibility

- [ ] **Adjust any colors that don't work well in dark mode**
  - Document any dark-mode-specific overrides needed

### 6.4 Responsive testing

- [ ] **Test on mobile viewport (< 768px)**
  - Sidebar overlay behavior
  - Welcome state layout (single column cards)
  - Input card sizing

- [ ] **Test on tablet viewport (768px - 1024px)**
  - Sidebar always visible
  - Card grid layout

- [ ] **Test on large desktop (> 1280px)**
  - Content doesn't stretch too wide
  - Proper centering

---

## Phase 7: Cleanup & Documentation

### 7.1 Remove deprecated code

- [ ] **Remove old chat layout components if fully replaced**
  - Check if `ChatLayoutSidebar` is still used elsewhere
  - Remove unused exports from `packages/ui/src/index.ts`

- [ ] **Clean up any unused CSS classes**
  - Review `.writing-desk` usage
  - Remove dead code

### 7.2 Update component documentation

- [ ] **Add JSDoc comments to new components**
  - `ChatPageSidebar` — describe props and usage
  - `ChatWelcome` — describe props and usage

- [ ] **Update any existing documentation**
  - If there's a component docs file, add new components

### 7.3 Final verification

- [ ] **Run TypeScript type checking**
  - `bun run typecheck`
  - Fix any type errors

- [ ] **Run linter**
  - `bun run lint`
  - Fix any linting issues

- [ ] **Run tests**
  - `bun run test:run`
  - Ensure no regressions

- [ ] **Manual end-to-end testing**
  - Create new chat
  - Send messages
  - Switch conversations
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
