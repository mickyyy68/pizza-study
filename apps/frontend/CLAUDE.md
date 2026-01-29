# frontend

## Boundaries

**CRITICAL - READ BEFORE ANY EDIT:**
- ONLY edit files within `apps/frontend/`
- NEVER edit: root configs, `packages/*`, `apps/backend/*`
- You may import from: `@repo/ui`, `@repo/contracts`, `@repo/utils`
- You may import **type-only** from `apps/backend`: `import type { AppType } from '../../../backend/src/routes'`
- You may NOT modify packages you import from

## Purpose

React + Vite frontend application with Tailwind CSS v4. Uses Hono RPC client for type-safe API calls and Vercel AI SDK's `useChat` hook for streaming chat.

## Key Files

- `src/main.tsx` - React entry point
- `src/App.tsx` - Main app component
- `src/styles/globals.css` - Tailwind v4 styles
- `src/lib/api.ts` - Hono RPC client setup
- `src/hooks/useChat.ts` - Chat hook wrapper
- `src/pages/Home.tsx` - Main chat interface
- `vite.config.ts` - Vite + Tailwind v4 plugin
- `index.html` - HTML entry point

## Patterns

**Tailwind v4 with shared config:**
```css
/* src/styles/globals.css */
@config "../../packages/ui/tailwind.config.ts";
@import "tailwindcss";
```

**Vite config with Tailwind v4 plugin:**
```typescript
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@repo/ui': resolve(__dirname, '../../packages/ui/src'),
      // ...
    }
  }
});
```

**Hono RPC client (type-only import from backend):**
```typescript
import { hc } from 'hono/client';
import type { AppType } from '../../../backend/src/routes';

export const client = hc<AppType>('http://localhost:3000');

// Fully typed!
const res = await client.api.chat.$post({ json: { message: 'hello' } });
```

**Streaming chat with useChat:**
```typescript
import { useChat } from '@ai-sdk/react';

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: 'http://localhost:3000/api/chat',
  });
  // render messages and form
}
```

## Build Order

**Important:** Backend must be built first for RPC types to resolve:
```bash
bun run --filter backend build  # First
bun run --filter frontend dev   # Then
```

## Commands

- `bun run dev` - Start Vite dev server (port 5173)
- `bun run build` - Production build
- `bun run preview` - Preview production build
- `bun run test` - Run tests in watch mode
- `bun run test:run` - Run tests once

## Testing

Tests in `src/__tests__/`. Uses Vitest with `happy-dom` and `@testing-library/react`. Setup in `vitest.setup.ts`.
