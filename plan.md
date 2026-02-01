# Chat Message Redesign — Implementation Backlog

## Overview

Redesign chat messages to follow a clean, ChatGPT-style alternating row pattern with improved whitespace, typography, and visual hierarchy. Optimized for study/tutoring and document-based chat use cases.

**Design principles:**
- Alternating backgrounds: user (transparent) vs assistant (subtle muted band)
- No avatars — clean typography with minimal role labels
- Icon-only actions on hover
- More whitespace and better line-height for long educational content

---

## Phase 1: Layout Foundation ✓

### 1.1 Update container width and padding
- [x] In `chat-message.tsx`, change `max-w-3xl` to `max-w-2xl` for tighter, more readable content width
- [x] Change outer padding from `px-6` to `px-8` for more horizontal breathing room

### 1.2 Increase vertical spacing
- [x] Change `py-6` to `py-8` on the main message container for both user and assistant messages
- [x] Update `ChatTypingIndicator` to match with `py-8`

### 1.3 Improve content typography
- [x] Change content text from `text-sm` to `text-base` for better readability
- [x] Change `leading-relaxed` to `leading-loose` for improved line spacing on long content
- [x] Update `text-foreground/90` to `text-foreground` for full contrast

---

## Phase 2: Remove Avatars ✓

### 2.1 Remove avatar from user messages
- [x] Remove the `avatar` prop usage for user messages
- [x] Remove the `defaultAvatar` rendering for user variant
- [x] Remove the avatar container `<div className="shrink-0 pt-0.5">` wrapper for user messages

### 2.2 Remove avatar from assistant messages
- [x] Remove the `defaultAvatar` rendering for assistant variant
- [x] Remove the avatar container wrapper for assistant messages
- [x] Remove the `User03Icon` and `SparklesIcon` imports if no longer needed elsewhere

### 2.3 Update layout structure
- [x] Remove the `flex gap-4` wrapper that accommodated avatar + content
- [x] Simplify to direct content rendering without the two-column layout

### 2.4 Clean up avatar-related props
- [x] Remove `avatar` prop from `ChatMessageProps` interface
- [x] Update any consumers passing custom avatars (ChatSlideOver.tsx)

### 2.5 Update ChatTypingIndicator
- [x] Remove avatar from typing indicator component
- [x] Simplify layout to match new message structure

---

## Phase 3: Role Labels ✓

### 3.1 Restyle user role label
- [x] Change "You" label from `text-sm font-medium text-foreground` to `text-xs font-medium uppercase tracking-wide text-muted-foreground`
- [x] Add `mb-2` spacing between label and content (via `space-y-2` on container)

### 3.2 Restyle assistant role label
- [x] Change "Assistant" to "✦ Assistant" (add sparkle character before text)
- [x] Apply same styling: `text-xs font-medium uppercase tracking-wide text-muted-foreground`
- [x] Add `mb-2` spacing between label and content

### 3.3 Update typing indicator label
- [x] Apply same role label styling to typing indicator's "Assistant" text
- [x] Add sparkle prefix to match assistant messages

---

## Phase 4: Background Differentiation ✓

### 4.1 Remove background from user messages
- [x] Ensure user messages have no background class (transparent by default)
- [x] Remove any existing background styling for user variant

### 4.2 Update assistant message background
- [x] Change `bg-muted/40` to `bg-muted/30` for subtler differentiation
- [x] Ensure background spans full viewport width (already does via parent container)

### 4.3 Update typing indicator background
- [x] Verify `bg-muted/30` matches assistant message background
- [x] Verify visual consistency between typing state and rendered message

---

## Phase 5: Actions Toolbar Redesign ✓

### 5.1 Create new icon-only action button
- [x] In `message-actions.tsx`, modify `ActionButton` to be icon-only (remove `<span>{label}</span>`)
- [x] Keep `aria-label` for accessibility
- [x] Adjust padding from `px-2 py-1` to `p-2` for square icon buttons
- [x] Update icon size from `14` to `16`

### 5.2 Reposition actions to top-right
- [x] Change actions container from below content to absolute positioned top-right
- [x] Add `relative` to message content wrapper to enable absolute positioning
- [x] Position actions with `absolute top-0 right-0`

### 5.3 Update actions container styling
- [x] Remove `-ml-2` negative margin (no longer needed)
- [x] Add `flex items-center gap-1` for icon spacing
- [x] Keep hover opacity transition: `opacity-0 group-hover:opacity-100`

### 5.4 Improve action button hover state
- [x] Change hover background from `hover:bg-muted` to `hover:bg-muted/80`
- [x] Add `rounded-md` if not present
- [x] Ensure smooth transition with `transition-colors duration-150`

### 5.5 Update copied state styling
- [x] Keep checkmark icon swap behavior
- [x] Ensure green tint works: `text-green-600 dark:text-green-400`
- [x] Verify the 2-second timeout for reverting state

---

## Phase 6: Streaming Indicator ✓

### 6.1 Replace bouncing dots with cursor
- [x] Remove the three bouncing dot `<span>` elements from streaming state
- [x] Add a blinking cursor character: `<span className="animate-pulse">█</span>`

### 6.2 Style the cursor
- [x] Apply `text-primary` color to cursor for visibility
- [x] Use `animate-pulse` for blinking effect
- [x] Cursor appears inline after last character of content

### 6.3 Update ChatTypingIndicator component
- [x] Replace bouncing dots with same cursor treatment
- [x] Show just the blinking cursor (no "Thinking..." text)
- [x] Ensure consistent styling with in-message streaming cursor

---

## Phase 7: Citations Refinement ✓

### 7.1 Add visual separator before citations
- [x] Wrap `CitationSources` in a container with `mt-4 pt-4 border-t border-border/50`
- [x] This creates clear separation between content and sources

### 7.2 Compact citation styling (if needed)
- [x] Reviewed `CitationSources` component styling — no changes needed

---

## Phase 8: Remove Timestamps ✓

### 8.1 Remove timestamp display
- [x] Remove the timestamp rendering block from `ChatMessage`
- [x] Keep the `timestamp` prop in interface for API compatibility (prefixed with `_`)

### 8.2 Clean up timestamp utility
- [x] Remove `formatTime` function (only used by deleted timestamp display)

---

## Phase 9: System Messages ✓

### 9.1 Review system message styling
- [x] System messages already use `py-2` (not affected by `py-8` change)
- [x] Verified centered pill styling looks good — no change needed

---

## Phase 10: Final Cleanup ✓

### 10.1 Remove unused imports
- [x] Remove `User03Icon` import
- [x] Remove `SparklesIcon` import
- [x] Remove `HugeiconsIcon` import from chat-message.tsx

### 10.2 Update component documentation
- [x] Update the JSDoc comment at top of `chat-message.tsx` to reflect new design
- [x] Remove references to "Icon avatars" and update description

### 10.3 Test all message variants
- [x] Verify user message renders correctly
- [x] Verify assistant message renders correctly
- [x] Verify system message renders correctly
- [x] Verify streaming state renders correctly
- [x] Verify typing indicator renders correctly
- [x] Test hover actions work for both user and assistant

---

## Phase 11: ThinkingIndicator Update ✓ (Added)

### 11.1 Update ThinkingIndicator component
- [x] Remove old avatar bubble design from `message-skeleton.tsx`
- [x] Match new ChatMessage design: no avatar, role label, blinking cursor
- [x] Apply same styling: `py-8 bg-muted/30`, `max-w-2xl mx-auto px-8`
- [x] Add `✦ Assistant` label with same uppercase styling

---

## Phase 12: Streaming Flow Fix ✓ (Added)

### 12.1 Fix double-block streaming issue
- [x] Remove separate empty `<ChatMessage isStreaming />` in ChatPage.tsx
- [x] Pass `isStreaming` prop to actual message being streamed
- [x] Add logic to detect last assistant message during streaming
- [x] Remove `gap-4` from messages container (messages have own `py-8` padding)

---

## Phase 13: Input & Code Block Improvements ✓ (Added)

### 13.1 Add Stop button to ChatInput
- [x] Add `onStop` prop to `ChatInputProps` interface
- [x] Import `StopIcon` from hugeicons
- [x] Show Stop button (instead of spinner) when `isLoading && onStop`
- [x] Style with muted background, red hover state
- [x] Wire up `stop` from useChat in ChatPage.tsx

### 13.2 Fix code block copy button
- [x] Make copy button icon-only (remove "Copy" text label)
- [x] Update padding to `p-1.5` and icon size to `16`
- [x] Simplify to single icon element with conditional icon swap

---

## Files Modified

| File | Changes |
|------|---------|
| `packages/ui/src/components/chat-message.tsx` | Layout, spacing, avatars, role labels, backgrounds, streaming cursor |
| `packages/ui/src/components/message-actions.tsx` | Icon-only buttons, positioning, padding |
| `packages/ui/src/components/message-skeleton.tsx` | ThinkingIndicator redesign |
| `packages/ui/src/components/chat-input.tsx` | Add onStop prop, Stop button |
| `packages/ui/src/components/code-block.tsx` | Icon-only copy button |
| `apps/frontend/src/pages/chat/ChatPage.tsx` | Streaming flow fix, wire up stop |
| `apps/frontend/src/components/chat/ChatSlideOver.tsx` | Remove avatar prop usage |

---

## Out of Scope (Future Enhancements)

- [ ] KaTeX/LaTeX math rendering
- [ ] Timestamp as hover tooltip
- [ ] Mobile-specific always-visible actions
- [ ] Message edit mode UI
- [ ] Regenerate loading state
