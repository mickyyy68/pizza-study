# backend

## Boundaries

**CRITICAL - READ BEFORE ANY EDIT:**
- ONLY edit files within `apps/backend/`
- NEVER edit: root configs, `packages/*`, `apps/frontend/*`
- You may import from: All `@repo/*` packages (`@repo/ai`, `@repo/rag`, `@repo/database`, `@repo/contracts`, `@repo/utils`)
- You may NOT modify packages you import from

## Purpose

Hono-based API server. Provides REST endpoints for chat (with streaming), document management, and health checks. Exports RPC types for frontend type safety.

## Key Files

- `src/index.ts` - Server entry point, middleware, port 3000
- `src/routes/index.ts` - Route composition, exports `AppType`
- `src/routes/health.ts` - Health check endpoint
- `src/routes/chat.ts` - Streaming chat endpoint
- `src/routes/documents.ts` - Document CRUD endpoints
- `src/middleware/cors.ts` - CORS for localhost:5173
- `src/middleware/error.ts` - Error handling
- `src/middleware/logging.ts` - Request logging

## Patterns

**CRITICAL: Method chaining for Hono RPC type inference:**
```typescript
// CORRECT - types are preserved
const app = new Hono()
  .get('/health', (c) => c.json({ status: 'ok' }))
  .post('/chat', zValidator('json', schema), async (c) => {
    // handler
  });

export type AppType = typeof app;

// WRONG - types become unknown
// const app = new Hono();
// app.get('/health', ...);  // Loses type inference!
```

**Route composition:**
```typescript
// src/routes/index.ts
const app = new Hono()
  .route('/health', health)
  .route('/api/chat', chat)
  .route('/api/documents', documents);

export type AppType = typeof app;
```

**Streaming chat response:**
```typescript
import { streamText } from 'ai';
import { chatModel } from '@repo/ai';

app.post('/chat', async (c) => {
  const { messages } = await c.req.json();
  const result = streamText({ model: chatModel, messages });
  return result.toUIMessageStreamResponse();
});
```

## Commands

- `bun run dev` - Start with hot reload (`bun --watch`)
- `bun run start` - Start production server
- `bun run build` - TypeScript build (required before frontend for RPC types)
