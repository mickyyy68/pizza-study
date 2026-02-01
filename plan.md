# Chat Message Redesign — Implementation Backlog

## Overview

Redesign chat messages to follow a clean, ChatGPT-style alternating row pattern with improved whitespace, typography, and visual hierarchy. Optimized for study/tutoring and document-based chat use cases.

**Design principles:**
- Alternating backgrounds: user (transparent) vs assistant (subtle muted band)
- No avatars — clean typography with minimal role labels
- Icon-only actions on hover
- More whitespace and better line-height for long educational content

---

## Phase 1: Layout Foundation

### 1.1 Update container width and padding
- [ ] In `chat-message.tsx`, change `max-w-3xl` to `max-w-2xl` for tighter, more readable content width
- [ ] Change outer padding from `px-6` to `px-8` for more horizontal breathing room

### 1.2 Increase vertical spacing
- [ ] Change `py-6` to `py-8` on the main message container for both user and assistant messages
- [ ] Update `ChatTypingIndicator` to match with `py-8`

### 1.3 Improve content typography
- [ ] Change content text from `text-sm` to `text-base` for better readability
- [ ] Change `leading-relaxed` to `leading-loose` for improved line spacing on long content
- [ ] Update `text-foreground/90` to `text-foreground` for full contrast

---

## Phase 2: Remove Avatars

### 2.1 Remove avatar from user messages
- [ ] Remove the `avatar` prop usage for user messages
- [ ] Remove the `defaultAvatar` rendering for user variant
- [ ] Remove the avatar container `<div className="shrink-0 pt-0.5">` wrapper for user messages

### 2.2 Remove avatar from assistant messages
- [ ] Remove the `defaultAvatar` rendering for assistant variant
- [ ] Remove the avatar container wrapper for assistant messages
- [ ] Remove the `User03Icon` and `SparklesIcon` imports if no longer needed elsewhere

### 2.3 Update layout structure
- [ ] Remove the `flex gap-4` wrapper that accommodated avatar + content
- [ ] Simplify to direct content rendering without the two-column layout

### 2.4 Clean up avatar-related props
- [ ] Remove `avatar` prop from `ChatMessageProps` interface
- [ ] Update any consumers passing custom avatars (search codebase for usage)

### 2.5 Update ChatTypingIndicator
- [ ] Remove avatar from typing indicator component
- [ ] Simplify layout to match new message structure

---

## Phase 3: Role Labels

### 3.1 Restyle user role label
- [ ] Change "You" label from `text-sm font-medium text-foreground` to `text-xs font-medium uppercase tracking-wide text-muted-foreground`
- [ ] Add `mb-2` spacing between label and content

### 3.2 Restyle assistant role label
- [ ] Change "Assistant" to "✦ Assistant" (add sparkle character before text)
- [ ] Apply same styling: `text-xs font-medium uppercase tracking-wide text-muted-foreground`
- [ ] Add `mb-2` spacing between label and content
- [ ] Alternative: use small inline HugeIcon sparkle (14px) instead of ✦ character — decide during implementation

### 3.3 Update typing indicator label
- [ ] Apply same role label styling to typing indicator's "Assistant" text
- [ ] Add sparkle prefix to match assistant messages

---

## Phase 4: Background Differentiation

### 4.1 Remove background from user messages
- [ ] Ensure user messages have no background class (should be transparent by default)
- [ ] Remove any existing background styling for user variant

### 4.2 Update assistant message background
- [ ] Change `bg-muted/40` to `bg-muted/30` for subtler differentiation
- [ ] Ensure background spans full viewport width (already does via parent container)

### 4.3 Update typing indicator background
- [ ] Change `bg-muted/30` to match assistant message background exactly
- [ ] Verify visual consistency between typing state and rendered message

---

## Phase 5: Actions Toolbar Redesign

### 5.1 Create new icon-only action button
- [ ] In `message-actions.tsx`, modify `ActionButton` to be icon-only (remove `<span>{label}</span>`)
- [ ] Keep `aria-label` for accessibility
- [ ] Adjust padding from `px-2 py-1` to `p-1.5` for square icon buttons
- [ ] Update icon size from `14` to `16`

### 5.2 Reposition actions to top-right
- [ ] Change actions container from below content to absolute positioned top-right
- [ ] Add `relative` to message content wrapper to enable absolute positioning
- [ ] Position actions with `absolute top-0 right-0`
- [ ] Adjust alignment to sit inline with role label

### 5.3 Update actions container styling
- [ ] Remove `-ml-2` negative margin (no longer needed)
- [ ] Add `flex items-center gap-1` for icon spacing
- [ ] Keep hover opacity transition: `opacity-0 group-hover:opacity-100`

### 5.4 Improve action button hover state
- [ ] Change hover background from `hover:bg-muted` to `hover:bg-muted/80`
- [ ] Add `rounded-md` if not present
- [ ] Ensure smooth transition with `transition-colors duration-150`

### 5.5 Update copied state styling
- [ ] Keep checkmark icon swap behavior
- [ ] Ensure green tint works: `text-green-600 dark:text-green-400`
- [ ] Verify the 2-second timeout for reverting state

---

## Phase 6: Streaming Indicator

### 6.1 Replace bouncing dots with cursor
- [ ] Remove the three bouncing dot `<span>` elements from streaming state
- [ ] Add a blinking cursor character: `<span className="animate-pulse">█</span>`
- [ ] Alternative: use `|` pipe character if block cursor feels too heavy

### 6.2 Style the cursor
- [ ] Apply `text-primary` color to cursor for visibility
- [ ] Use `animate-pulse` or create custom `animate-blink` keyframes
- [ ] Cursor should appear inline after last character of content

### 6.3 Update ChatTypingIndicator component
- [ ] Replace bouncing dots with same cursor treatment
- [ ] Add placeholder text like "Thinking..." or just show cursor alone
- [ ] Ensure consistent styling with in-message streaming cursor

---

## Phase 7: Citations Refinement

### 7.1 Add visual separator before citations
- [ ] Wrap `CitationSources` in a container with `mt-4 pt-4 border-t border-border/50`
- [ ] This creates clear separation between content and sources

### 7.2 Compact citation styling (if needed)
- [ ] Review `CitationSources` component styling
- [ ] Consider reducing padding and font size for more compact appearance
- [ ] Note: This may require changes in `citation.tsx` — check file location

---

## Phase 8: Remove Timestamps

### 8.1 Remove timestamp display
- [ ] Remove the timestamp rendering block from `ChatMessage`
- [ ] Keep the `timestamp` prop in interface for data purposes (may be used elsewhere)
- [ ] Alternatively: convert to tooltip on message hover (future enhancement)

### 8.2 Clean up timestamp utility
- [ ] Keep `formatTime` function if used elsewhere
- [ ] Remove if only used by deleted timestamp display

---

## Phase 9: System Messages

### 9.1 Review system message styling
- [ ] System messages currently render centered with pill styling
- [ ] Verify this still looks good with new spacing (`py-8` may be too much)
- [ ] Consider reducing to `py-4` for system messages specifically

---

## Phase 10: Final Cleanup

### 10.1 Remove unused imports
- [ ] Remove `User03Icon` import if no longer used
- [ ] Remove `SparklesIcon` import if replaced with character
- [ ] Run linter to catch any other unused imports

### 10.2 Update component documentation
- [ ] Update the JSDoc comment at top of `chat-message.tsx` to reflect new design
- [ ] Remove references to "Icon avatars" and update description

### 10.3 Test all message variants
- [ ] Verify user message renders correctly
- [ ] Verify assistant message renders correctly
- [ ] Verify system message renders correctly
- [ ] Verify streaming state renders correctly
- [ ] Verify typing indicator renders correctly
- [ ] Test hover actions work for both user and assistant

### 10.4 Test responsive behavior
- [ ] Verify layout looks good on mobile widths
- [ ] Verify actions are still accessible on touch devices (may need always-visible on mobile)

### 10.5 Verify dark mode
- [ ] Test all changes in dark mode
- [ ] Ensure background differentiation is visible but subtle
- [ ] Verify action button states in dark mode

---

## Files to Modify

| File | Changes |
|------|---------|
| `packages/ui/src/components/chat-message.tsx` | Layout, spacing, avatars, role labels, backgrounds, streaming |
| `packages/ui/src/components/message-actions.tsx` | Icon-only buttons, positioning, sizing |
| `packages/ui/src/components/citation.tsx` | Possibly compact styling (review needed) |

---

## Out of Scope (Future Enhancements)

- [ ] KaTeX/LaTeX math rendering
- [ ] Timestamp as hover tooltip
- [ ] Mobile-specific always-visible actions
- [ ] Message edit mode UI
- [ ] Regenerate loading state
