# Pizza Study - UI Implementation Backlog

## Overview

Build the full UI scaffold for Pizza Study with sidebar-only layout, dashboard, documents, calendar, and chat features. Component-first approach with mock data.

**Tech Stack:** React 19, Vite 6, Tailwind v4, React Router, Zustand, Lucide React

---

## Phase 1: Theme & Dependencies ✅ COMPLETE

### 1.1 Install Dependencies ✅
- [x] Run `cd apps/frontend && bun add react-router zustand date-fns lucide-react`
- [x] Verify dependencies in `apps/frontend/package.json`

### 1.2 Add Google Fonts ✅
- [x] Open `apps/frontend/index.html`
- [x] Add preconnect links for Google Fonts
- [x] Add link tag for Poppins (weights: 400, 500, 600, 700)
- [x] Add link tag for Libre Baskerville (weights: 400, 700)
- [x] Add link tag for IBM Plex Mono (weights: 400, 500)

### 1.3 Apply Custom Theme ✅
Theme implemented in `packages/ui/src/styles.css` using OKLCH color space for better perceptual uniformity.

**Design Direction:** "Trattoria Study Hall" - warm Italian café meets scholarly library.

- [x] Light theme (`:root`) - sun-drenched parchment with terracotta accents
- [x] Dark theme (`.dark`) - evening study with warm browns
- [x] `@theme inline` block mapping CSS variables to Tailwind tokens
- [x] All shadcn-compatible tokens: background, foreground, card, primary, secondary, muted, accent, destructive, border, input, ring, chart-1 through chart-5, sidebar variants
- [x] Typography: Poppins (sans), Libre Baskerville (serif), IBM Plex Mono (mono)
- [x] Warm-tinted shadows with terracotta undertones
- [x] Base layer styles (headings use serif, focus rings, selection highlight)
- [x] Utility classes (text-gradient-primary, glow-primary, paper-texture, hover-lift, priority indicators)

### 1.4 Update Frontend Styles ✅
- [x] `apps/frontend/src/styles/globals.css` imports UI theme via `@import "@repo/ui/styles.css"`
- [x] Added app-specific animations (fade-in-up, slide-in-right, pulse-warm, typing dots)
- [x] Added component classes (nav-item, task-checkbox, chat-bubble, calendar-grid, document-card, stat-card)

### 1.5 Update Existing Components ✅
- [x] Button: Updated to use theme tokens, added secondary/link variants, active scale effect
- [x] Card: Updated to use theme tokens, added CardDescription and CardFooter, serif titles
- [x] Input: Updated to use theme tokens, warm focus glow

---

## Phase 2: UI Package - Layout Components ✅ COMPLETE

### 2.1-2.6 Sidebar Components ✅
- [x] `packages/ui/src/components/sidebar.tsx` created
- [x] Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarItem, SidebarSeparator
- [x] CVA variants for active state
- [x] Collapsed/expanded states with transitions
- [x] All exported from `packages/ui/src/components/index.ts`

### 2.7-2.10 SlideOver Components ✅
- [x] `packages/ui/src/components/slide-over.tsx` created
- [x] SlideOver, SlideOverHeader, SlideOverContent, SlideOverFooter
- [x] CVA variants for side (left/right) and size (sm/md/lg/xl)
- [x] Portal-based rendering, backdrop, escape key, click outside
- [x] All exported from index

---

## Phase 3: UI Package - Data Display Components ✅ COMPLETE

### 3.1 Badge Component ✅
- [x] `packages/ui/src/components/badge.tsx`
- [x] Variants: default, secondary, accent, muted, outline, destructive, success, warning
- [x] Sizes: sm, md, lg
- [x] Removable option with onRemove callback

### 3.2 Avatar Component ✅
- [x] `packages/ui/src/components/avatar.tsx`
- [x] Sizes: xs, sm, md, lg, xl
- [x] Image with fallback initials
- [x] Status indicator (online/offline/away/busy)
- [x] AvatarGroup for stacked avatars

### 3.3 Separator Component ✅
- [x] `packages/ui/src/components/separator.tsx`
- [x] Horizontal/vertical orientation
- [x] Decorative vs semantic role

### 3.4 Checkbox Component ✅
- [x] `packages/ui/src/components/checkbox.tsx`
- [x] Custom styled with animated checkmark
- [x] Label and description support
- [x] Error state

---

## Phase 4: UI Package - Chat Components ✅ COMPLETE

### 4.1 ChatMessage Component ✅
- [x] `packages/ui/src/components/chat-message.tsx`
- [x] Variants for user/assistant/system
- [x] Streaming indicator with animated dots
- [x] Timestamp support
- [x] Avatar slot
- [x] ChatTypingIndicator component

### 4.2 ChatInput Component ✅
- [x] `packages/ui/src/components/chat-input.tsx`
- [x] Auto-growing textarea (maxRows prop)
- [x] Send button with loading state
- [x] Enter to submit, Shift+Enter for newline

---

## Phase 5: Frontend - Types & Mock Data ✅ COMPLETE

### 5.1 Type Definitions ✅
- [x] `apps/frontend/src/types/index.ts`
- [x] Document, Folder, Task, CalendarEvent, ChatSession, ChatMessage, StudyStats, NavItem

### 5.2-5.4 Mock Data ✅
- [x] `apps/frontend/src/mock/documents.ts` - folders, documents, tags
- [x] `apps/frontend/src/mock/tasks.ts` - tasks, events, stats

---

## Phase 6: Frontend - State Management ✅ COMPLETE

### 6.1 UI Store ✅
- [x] `apps/frontend/src/stores/ui-store.ts`
- [x] Sidebar collapsed state
- [x] Chat slide-over open/close

### 6.2 Documents Store ✅
- [x] `apps/frontend/src/stores/documents-store.ts`
- [x] Documents, folders, filtering
- [x] Search query, selected tags, selected folder
- [x] View mode (grid/list)
- [x] Computed filtered documents

### 6.3 Calendar Store ✅
- [x] `apps/frontend/src/stores/calendar-store.ts`
- [x] Tasks, events, current month, selected date
- [x] Navigate month, go to today
- [x] Toggle task complete
- [x] Computed tasks/events for date

---

## Phase 7: Frontend - Routing Setup ✅ COMPLETE

### 7.1 Route Definitions ✅
- [x] `apps/frontend/src/routes.tsx`
- [x] Routes: /, /dashboard, /documents, /calendar, /chat
- [x] RootLayout wrapper

### 7.2 Update Main Entry Point ✅
- [x] `apps/frontend/src/main.tsx` uses RouterProvider

---

## Phase 8: Frontend - Layout Implementation ✅ COMPLETE

### 8.1 RootLayout ✅
- [x] `apps/frontend/src/layouts/RootLayout.tsx`
- [x] Sidebar + Outlet + ChatSlideOver
- [x] Global keyboard shortcut (Cmd/Ctrl + K)

### 8.2 AppSidebar ✅
- [x] `apps/frontend/src/layouts/AppSidebar.tsx`
- [x] Logo/brand header
- [x] Nav items with active state
- [x] Quick Chat button in footer

### 8.3-8.4 ChatSlideOver ✅
- [x] `apps/frontend/src/components/chat/ChatSlideOver.tsx`
- [x] Connected to useChat hook
- [x] Welcome screen when empty
- [x] Auto-scroll to bottom

---

## Phase 9: Dashboard Page ✅ COMPLETE

- [x] `apps/frontend/src/pages/dashboard/DashboardPage.tsx`
- [x] Greeting with current date
- [x] Today's tasks list with checkboxes and priority
- [x] Progress stats (streak, completed today/week)
- [x] Upcoming events list
- [x] Quick access cards

---

## Phase 10: Documents Page ✅ COMPLETE

- [x] `apps/frontend/src/pages/documents/DocumentsPage.tsx`
- [x] Folder tree sidebar
- [x] Tag cloud filtering
- [x] Search input
- [x] Grid/list view toggle
- [x] Document cards with type icons
- [x] Breadcrumb navigation
- [x] Empty state

---

## Phase 11: Calendar Page ✅ COMPLETE

- [x] `apps/frontend/src/pages/calendar/CalendarPage.tsx`
- [x] Month grid with day cells
- [x] Today/selected date highlighting
- [x] Event/task indicator dots
- [x] Month navigation
- [x] Side panel with selected day tasks/events
- [x] Task completion toggle

---

## Phase 12: Chat Page ✅ COMPLETE

- [x] `apps/frontend/src/pages/chat/ChatPage.tsx`
- [x] Full conversation history
- [x] Welcome screen with suggestions
- [x] Connected to AI SDK useChat
- [x] Auto-scroll

---

## Phase 13: Polish & Verification ✅ COMPLETE

### Completed tasks
- [x] Dark mode toggle - ThemeToggle component with light/dark/system support
- [x] Theme persistence via localStorage
- [x] Skeleton loading components (Skeleton, SkeletonText, SkeletonCard)
- [x] EmptyState component for consistent empty UI
- [x] Mobile-responsive sidebar (slide-in on mobile, fixed on desktop)
- [x] Mobile menu button and backdrop
- [x] Enhanced calendar empty states
- [x] Run typecheck: `bun run typecheck` ✅

---

## Files Created/Modified

### packages/ui/src/components/
- `sidebar.tsx` (NEW)
- `slide-over.tsx` (NEW)
- `badge.tsx` (NEW)
- `avatar.tsx` (NEW)
- `checkbox.tsx` (NEW)
- `separator.tsx` (NEW)
- `chat-message.tsx` (NEW)
- `chat-input.tsx` (NEW)
- `theme-toggle.tsx` (NEW)
- `skeleton.tsx` (NEW)
- `empty-state.tsx` (NEW)
- `button.tsx` (MODIFIED)
- `card.tsx` (MODIFIED)
- `input.tsx` (MODIFIED)
- `index.ts` (MODIFIED)

### packages/ui/src/
- `styles.css` (MODIFIED - full theme)

### apps/frontend/src/
- `main.tsx` (MODIFIED)
- `routes.tsx` (NEW)
- `index.html` (MODIFIED - fonts)
- `styles/globals.css` (MODIFIED)

### apps/frontend/src/types/
- `index.ts` (NEW)

### apps/frontend/src/mock/
- `documents.ts` (NEW)
- `tasks.ts` (NEW)

### apps/frontend/src/stores/
- `ui-store.ts` (NEW + MODIFIED for theme/mobile)
- `documents-store.ts` (NEW)
- `calendar-store.ts` (NEW)

### apps/frontend/src/hooks/
- `useTheme.ts` (NEW - theme management hook)

### apps/frontend/src/layouts/
- `RootLayout.tsx` (NEW)
- `AppSidebar.tsx` (NEW)

### apps/frontend/src/pages/
- `dashboard/DashboardPage.tsx` (NEW)
- `documents/DocumentsPage.tsx` (NEW)
- `calendar/CalendarPage.tsx` (NEW)
- `chat/ChatPage.tsx` (NEW)

### apps/frontend/src/components/
- `chat/ChatSlideOver.tsx` (NEW)
