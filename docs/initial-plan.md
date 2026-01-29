# Pizza Study - Implementation Backlog

## Foundation: Parallel Development Setup

This section establishes the foundation for 5 people (4 colleagues + 1 lead) to work in parallel without merge conflicts.

### Architecture Overview

```
pizza-study/
├── CLAUDE.md                    # Root: only root config edits
├── apps/
│   ├── frontend/CLAUDE.md       # Frontend app boundaries
│   └── backend/CLAUDE.md        # Backend app boundaries
└── packages/
    ├── utils/CLAUDE.md          # Shared: add-only pattern
    ├── contracts/CLAUDE.md      # API schemas (Zod)
    ├── database/CLAUDE.md       # Drizzle + PostgreSQL + pgvector
    ├── ui/CLAUDE.md             # shadcn/ui dumb components
    ├── ai/CLAUDE.md             # Vercel AI SDK + OpenRouter
    └── rag/CLAUDE.md            # Embeddings + vector search
```

### How CLAUDE.md Enables Parallel Work

Each `CLAUDE.md` file instructs Claude Code to:
1. **Only edit files within its directory** - prevents cross-package conflicts
2. **Import from dependencies but never modify them** - stable interfaces
3. **Never touch root configs, apps, or other packages** - clear boundaries

When a colleague opens Claude Code in `packages/database/`, it reads `packages/database/CLAUDE.md` and follows those boundaries.

### Package Dependencies

```
@repo/utils ─────────────────────────────────────────────────────────┐
     │                                                               │
     ├──→ @repo/contracts (Zod schemas)                              │
     │                                                               │
     ├──→ @repo/database (Drizzle + PostgreSQL + pgvector)           │
     │         │                                                     │
     │         └──→ @repo/rag (embeddings, vector search) ←──────────┤
     │                   │                                           │
     ├──→ @repo/ai (Vercel AI SDK + OpenRouter) ←────────────────────┤
     │                                                               │
     └──→ @repo/ui (shadcn/ui components) ───────────────────────────┘

Legend: A ──→ B means "B depends on A"
```

**utils** is shared - everyone can ADD new utility files (see Shared Utils Strategy below).

### Frontend-Backend Communication

**Technology: Hono RPC**

Hono has built-in RPC support that provides end-to-end type safety. **Critical requirements:**

1. Backend and frontend must use the **exact same Hono version** (pinned in root package.json)
2. Routes must use **method chaining** (not imperative `app.get()` calls)
3. Backend tsconfig needs `"composite": true`
4. Frontend tsconfig needs `"references"` pointing to backend
5. **Build order**: Backend must be built before frontend for types to resolve

**Correct pattern - method chaining for type inference:**
```typescript
// apps/backend/src/routes/index.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { chatRequestSchema } from '@repo/contracts';

// CORRECT: Method chaining preserves types
const app = new Hono()
  .get('/health', (c) => c.json({ status: 'ok' }))
  .post('/api/chat', zValidator('json', chatRequestSchema), (c) => {
    const data = c.req.valid('json');
    return c.json({ reply: 'Hello!' });
  });

export type AppType = typeof app;
export default app;

// WRONG: Imperative calls lose type inference
// const app = new Hono();
// app.get('/health', ...);  // Types become `unknown`
```

**Frontend client setup:**
```typescript
// apps/frontend/src/lib/api.ts
import { hc } from 'hono/client';
import type { AppType } from '../../../backend/src/routes';  // Relative path for type-only import

const client = hc<AppType>('http://localhost:3000');

// Fully typed!
const res = await client.api.chat.$post({ json: { message: 'hello' } });
```

**Note on frontend importing backend types:** The frontend uses a **type-only import** (`import type`). This is safe because:
- Types are erased at compile time - no runtime dependency
- No backend code is bundled into frontend
- Required for Hono RPC type safety

**Route composition for multiple files:**
```typescript
// apps/backend/src/routes/index.ts
import { Hono } from 'hono';
import health from './health';
import chat from './chat';
import documents from './documents';

const app = new Hono()
  .route('/health', health)
  .route('/api/chat', chat)
  .route('/api/documents', documents);

export type AppType = typeof app;
export default app;
```

### Embedding Model Configuration

**Model**: OpenAI `text-embedding-3-small` via OpenRouter
**Dimensions**: 1536

```typescript
// packages/ai/src/embedding.ts
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});

// For embeddings
export const embeddingModel = openrouter.textEmbeddingModel('openai/text-embedding-3-small');

// For chat completions (provider function returns LanguageModel)
export const chatModel = openrouter.chat('anthropic/claude-3.5-sonnet');
```

The database vector column must match: `vector('embedding', { dimensions: 1536 })`.

### Streaming Chat Responses

For AI chat, streaming is essential - users see tokens as they arrive instead of waiting for the full response.

**Backend** (Hono + Vercel AI SDK):
```typescript
// apps/backend/src/routes/chat.ts
import { streamText } from 'ai';
import { chatModel } from '@repo/ai';

app.post('/chat', async (c) => {
  const { messages } = await c.req.json();
  const result = streamText({
    model: chatModel,
    messages,
  });
  return result.toUIMessageStreamResponse();  // Works with useChat default protocol
});
```

**Frontend** (useChat hook from Vercel AI SDK):
```typescript
// apps/frontend/src/hooks/useChat.ts
import { useChat } from '@ai-sdk/react';

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: 'http://localhost:3000/api/chat',
  });
  // render messages and input form
}
```

### Linting with Biome

This project uses **Biome 2.0** for linting and formatting (replaces ESLint + Prettier).

**Why Biome:**
- Single tool for both linting and formatting
- 10-100x faster than ESLint
- Zero config needed for TypeScript/React
- Native monorepo support with nested configs

**Root config:**
```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/latest/schema.json",
  "organizeImports": { "enabled": true },
  "linter": { "enabled": true, "rules": { "recommended": true } },
  "formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 2 }
}
```

**Package-specific overrides** (optional):
```json
// packages/ui/biome.json
{
  "extends": ["//"],  // Extends root config (Biome 2.0 monorepo syntax)
  "linter": {
    "rules": {
      "a11y": { "recommended": true }  // Extra rules for UI package
    }
  }
}
```

**Note:** Biome 2.0 has known issues where nested configs with `"extends": ["//"]` may sometimes be ignored. If you encounter linting inconsistencies, either skip package-level configs or check the [Biome GitHub issues](https://github.com/biomejs/biome/issues) for updates.

### Tailwind CSS v4

This project uses **Tailwind CSS v4** with the Vite plugin (not PostCSS).

**Key differences from v3:**
- Use `@tailwindcss/vite` plugin instead of `postcss.config.js`
- CSS uses `@import "tailwindcss"` instead of `@tailwind` directives
- Configuration is CSS-first, but JS config still supported via `@config`

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* styles.css */
@config "../../packages/ui/tailwind.config.ts";
@import "tailwindcss";
```

### Shared Utils Strategy

The `utils` package is special - everyone may need to add utilities.

**Rule: Add-only, never modify existing files**

1. Create new utility in its own file: `src/{utility-name}.ts`
2. Export from that file
3. Import directly via subpath: `import { retry } from '@repo/utils/retry'`

**Subpath exports pattern** (avoids index.ts conflicts):
```json
// packages/utils/package.json
{
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  }
}
```

This way consumers import `@repo/utils/retry` directly, no index.ts modification needed.

### CLAUDE.md Template

Each package CLAUDE.md follows this structure:

```markdown
# @repo/{package-name}

## Boundaries

**CRITICAL - READ BEFORE ANY EDIT:**
- ONLY edit files within `packages/{name}/`
- NEVER edit: root configs, apps/*, other packages/*
- You may import from: {list of allowed dependencies}
- You may NOT modify packages you import from

## Purpose

{What this package does}

## Key Files

- `src/index.ts` - Public exports
- {other important files}

## Patterns

{Package-specific conventions}

## Commands

{Available scripts}
```

### CLAUDE.md Files to Create

| Location | Edit Scope | Can Import From |
|----------|------------|-----------------|
| `CLAUDE.md` | Root configs only (`package.json`, `tsconfig.json`, `.gitignore`) | N/A |
| `packages/utils/CLAUDE.md` | Add new files in `packages/utils/src/` | None |
| `packages/contracts/CLAUDE.md` | `packages/contracts/` | `@repo/utils` |
| `packages/database/CLAUDE.md` | `packages/database/` | `@repo/utils` |
| `packages/ui/CLAUDE.md` | `packages/ui/` | `@repo/utils` |
| `packages/ai/CLAUDE.md` | `packages/ai/` | `@repo/utils` |
| `packages/rag/CLAUDE.md` | `packages/rag/` | `@repo/database`, `@repo/ai`, `@repo/utils` |
| `apps/backend/CLAUDE.md` | `apps/backend/` | All `@repo/*` packages |
| `apps/frontend/CLAUDE.md` | `apps/frontend/` | `@repo/ui`, `@repo/contracts`, `@repo/utils`, **type-only** from `apps/backend` |

### Environment Variables

Document these early - they're needed across multiple packages:

| Variable | Used By | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `@repo/database` | PostgreSQL connection string |
| `OPENROUTER_API_KEY` | `@repo/ai` | OpenRouter API key |

---

## Phase 0: CLAUDE.md Files

- [x] Create `CLAUDE.md` (root) - restricts edits to root config files only
- [x] Create `packages/utils/CLAUDE.md` - shared package, add-only pattern with subpath exports
- [x] Create `packages/contracts/CLAUDE.md` - Zod schemas, API types
- [x] Create `packages/database/CLAUDE.md` - Drizzle ORM, PostgreSQL, pgvector
- [x] Create `packages/ui/CLAUDE.md` - shadcn/ui dumb components, Tailwind v4
- [x] Create `packages/ai/CLAUDE.md` - Vercel AI SDK, OpenRouter, embedding model
- [x] Create `packages/rag/CLAUDE.md` - embeddings, vector search
- [x] Create `apps/backend/CLAUDE.md` - Hono server, exports RPC types, method chaining requirement
- [x] Create `apps/frontend/CLAUDE.md` - React + Vite, uses Hono RPC client, type-only backend imports allowed

---

## Phase 1: Root Configuration

- [x] Create root `package.json` with name "pizza-study", type "module", and workspaces array `["apps/*", "packages/*"]`
- [x] Add root devDependencies: `typescript`, `@biomejs/biome`
- [x] Add root scripts: `"dev": "bun run --filter backend build && bun run --filter '*' dev"`, `"build": "bun run --filter '*' build"`, `"typecheck": "tsc -b"`, `"lint": "biome check ."`, `"lint:fix": "biome check --write ."`, `"format": "biome format --write ."`
- [x] Create `biome.json` with Biome 2.0 schema, recommended rules, organize imports enabled, space indentation (2 spaces)
- [x] Pin shared dependency versions in root package.json: `"hono": "4.11.4"` (exact version for RPC compatibility)
- [x] Create root `tsconfig.json` with `compilerOptions`: target ES2022, module ESNext, moduleResolution bundler, strict true, skipLibCheck true, esModuleInterop true
- [x] Add path aliases to root tsconfig: `"@repo/*": ["./packages/*/src"]`
- [x] Add `references` array to root tsconfig pointing to all packages and apps for `tsc -b` to work:
```json
"references": [
  { "path": "./packages/utils" },
  { "path": "./packages/contracts" },
  { "path": "./packages/database" },
  { "path": "./packages/ui" },
  { "path": "./packages/ai" },
  { "path": "./packages/rag" },
  { "path": "./apps/backend" },
  { "path": "./apps/frontend" }
]
```
- [x] Create `.gitignore` with: node_modules, dist, .env, .env.local, *.log, .DS_Store, *.tsbuildinfo
- [x] Create `.env.example` with DATABASE_URL (`postgresql://postgres:postgres@localhost:5432/pizza_study`) and OPENROUTER_API_KEY placeholders
- [x] Create `docker/` directory
- [x] Create `docker-compose.yml` in project root with:
  - `pgvector/pgvector:pg16` image
  - Container name `pizza_study_db`
  - Environment: POSTGRES_USER=postgres, POSTGRES_PASSWORD=postgres, POSTGRES_DB=pizza_study
  - Port 5432:5432
  - Named volume `pizza_study_data` for persistence
  - Mount `./docker/init.sql` to `/docker-entrypoint-initdb.d/init.sql`
  - Health check: `pg_isready -U postgres -d pizza_study` (interval: 5s, timeout: 5s, retries: 5)
- [x] Create `docker/init.sql` with `CREATE EXTENSION IF NOT EXISTS vector;`

## Phase 2: Utils Package

- [x] Create `packages/utils/` directory
- [x] Create `packages/utils/package.json` with name `@repo/utils`, type "module"
- [x] Add exports field with subpath pattern: `".": "./src/index.ts"`, `"./*": "./src/*.ts"`
- [x] Create `packages/utils/tsconfig.json` extending `../../tsconfig.json` with include `["src"]`, add `"composite": true`
- [x] Create `packages/utils/src/index.ts` with placeholder export: `export const VERSION = "0.0.1"`

## Phase 3: Contracts Package

- [x] Create `packages/contracts/` directory
- [x] Create `packages/contracts/package.json` with name `@repo/contracts`, dependencies: `zod`, `@repo/utils`
- [x] Add exports field: `".": "./src/index.ts"`, `"./*": "./src/*.ts"`
- [x] Create `packages/contracts/tsconfig.json` extending root, add `"composite": true`, add `"references": [{ "path": "../utils" }]`
- [x] Create `packages/contracts/src/schemas/user.ts` with `userSchema` using Zod (id, email, name, createdAt)
- [x] Create `packages/contracts/src/schemas/message.ts` with `chatRequestSchema` and `chatResponseSchema`
- [x] Create `packages/contracts/src/schemas/document.ts` with `documentSchema` for RAG documents (id, title, content, metadata)
- [x] Create `packages/contracts/src/index.ts` exporting all schemas and inferred types

## Phase 4: Database Package

- [x] Create `packages/database/` directory
- [x] Create `packages/database/package.json` with name `@repo/database`
- [x] Add dependencies: `drizzle-orm`, `postgres`, `@repo/utils`
- [x] Add devDependencies: `drizzle-kit`
- [x] Add exports field: `".": "./src/index.ts"`, `"./*": "./src/*.ts"`
- [x] Create `packages/database/tsconfig.json` extending root, add `"composite": true`, add `"references": [{ "path": "../utils" }]`
- [x] Create `packages/database/drizzle.config.ts` with postgres dialect, schema path `./src/schema`, out path `./drizzle`
- [x] Create `packages/database/src/client.ts` importing `drizzle` from `drizzle-orm/postgres-js` and `postgres` from `postgres`
- [x] Configure connection pool: `postgres(process.env.DATABASE_URL!, { max: 10, idleTimeout: 20 })`
- [x] Create `packages/database/src/schema/users.ts` with users table using `pgTable`
- [x] Create `packages/database/src/schema/documents.ts` with documents table for RAG content
- [x] Create `packages/database/src/schema/embeddings.ts` with table definition including:
  - pgvector column: `vector('embedding', { dimensions: 1536 })`
  - HNSW index in table's second callback (array syntax): `(table) => [index('embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops'))]`
- [x] Create `packages/database/src/schema/index.ts` exporting all table definitions
- [x] Create `packages/database/src/index.ts` exporting db client and schemas
- [x] Create `packages/database/src/migrate.ts` for programmatic migrations:
  - Use separate connection with `{ max: 1 }` (required for migrator)
  - Import `migrate` from `drizzle-orm/postgres-js/migrator`
- [x] Add script to package.json: `"db:generate": "drizzle-kit generate"`
- [x] Add script to package.json: `"db:push": "drizzle-kit push"` (for development)
- [x] Add script to package.json: `"db:migrate": "bun src/migrate.ts"` (for production)
- [x] Add script to package.json: `"db:studio": "drizzle-kit studio"`
- [x] Create `packages/database/drizzle/0000_enable_pgvector.sql` with `CREATE EXTENSION IF NOT EXISTS vector;`

## Phase 5: UI Package (Tailwind v4)

- [x] Create `packages/ui/` directory
- [x] Create `packages/ui/package.json` with name `@repo/ui`
- [x] Add dependencies: `react`, `react-dom`, `clsx`, `tailwind-merge`, `class-variance-authority`
- [x] Add devDependencies: `tailwindcss@^4`, `@types/react`, `@types/react-dom`
- [x] Add peerDependencies: `react`, `react-dom`
- [x] Add exports field: `".": "./src/index.ts"`, `"./styles.css": "./src/styles.css"`, `"./tailwind.config": "./tailwind.config.ts"`
- [x] Create `packages/ui/tsconfig.json` extending root, add `"jsx": "react-jsx"`, `"composite": true`, add `"references": [{ "path": "../utils" }]`
- [x] Create `packages/ui/tailwind.config.ts` with theme extensions (colors, fonts), export as ESM default
- [x] Create `packages/ui/src/lib/utils.ts` with `cn()` function using clsx and tailwind-merge
- [x] Create `packages/ui/src/components/button.tsx` - dumb Button component with variants using CVA
- [x] Create `packages/ui/src/components/card.tsx` - dumb Card component
- [x] Create `packages/ui/src/components/input.tsx` - dumb Input component
- [x] Create `packages/ui/src/components/index.ts` exporting all components
- [x] Create `packages/ui/src/index.ts` exporting components and utils
- [x] Create `packages/ui/src/styles.css` with Tailwind v4 import: `@import "tailwindcss";`

## Phase 6: AI Package

- [x] Create `packages/ai/` directory
- [x] Create `packages/ai/package.json` with name `@repo/ai`
- [x] Add dependencies: `ai`, `@openrouter/ai-sdk-provider`, `@repo/utils`
- [x] Add exports field: `".": "./src/index.ts"`, `"./*": "./src/*.ts"`
- [x] Create `packages/ai/tsconfig.json` extending root, add `"composite": true`, add `"references": [{ "path": "../utils" }]`
- [x] Create `packages/ai/src/client.ts` with OpenRouter provider setup
- [x] Export `openrouter` instance: `createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })`
- [x] Create `packages/ai/src/embedding.ts` with embedding model: `openrouter.textEmbeddingModel('openai/text-embedding-3-small')`
- [x] Export helper function: `generateEmbedding(text: string): Promise<number[]>` returning 1536-dim vector
- [x] Create `packages/ai/src/config.ts` with model names (e.g., `anthropic/claude-3.5-sonnet`), default parameters
- [x] Create `packages/ai/src/prompts/system.ts` with system prompt templates
- [x] Create `packages/ai/src/prompts/index.ts` exporting prompt utilities
- [x] Create `packages/ai/src/index.ts` exporting client, embedding, config, and prompts

## Phase 7: RAG Package

- [x] Create `packages/rag/` directory
- [x] Create `packages/rag/package.json` with name `@repo/rag`
- [x] Add dependencies: `@repo/database`, `@repo/ai`, `@repo/utils`
- [x] Add exports field: `".": "./src/index.ts"`, `"./*": "./src/*.ts"`
- [x] Create `packages/rag/tsconfig.json` extending root, add `"composite": true`, add `"references": [{ "path": "../database" }, { "path": "../ai" }, { "path": "../utils" }]`
- [x] Create `packages/rag/src/embeddings.ts` importing `generateEmbedding` from `@repo/ai`
- [x] Create `packages/rag/src/chunking.ts` with text chunking strategies (split by tokens, overlap)
- [x] Create `packages/rag/src/search.ts` with vector similarity search using pgvector cosine distance operator `<=>`
- [x] Create `packages/rag/src/retrieval.ts` with full retrieval pipeline: query → embed → search → rank
- [x] Create `packages/rag/src/index.ts` exporting all RAG utilities

## Phase 8: Backend App

- [x] Create `apps/backend/` directory
- [x] Create `apps/backend/package.json` with name `backend`
- [x] Add dependencies: `hono` (use `"hono": "4.11.4"` matching root pinned version for RPC compatibility), `@hono/zod-validator`, `@repo/ai`, `@repo/rag`, `@repo/database`, `@repo/contracts`, `@repo/utils`
- [x] Add devDependencies: `@types/bun`
- [x] Add scripts: `"dev": "bun --watch src/index.ts"`, `"start": "bun src/index.ts"`, `"build": "tsc"`
- [x] Create `apps/backend/tsconfig.json` extending root with `"composite": true`, `"declaration": true`, `"declarationMap": true`
- [x] Create `apps/backend/src/routes/health.ts` exporting Hono route with method chaining: `new Hono().get('/', (c) => c.json({ status: 'ok' }))`
- [x] Create `apps/backend/src/routes/chat.ts` with streaming POST handler:
  - Use `streamText` from `ai` package with `chatModel` from `@repo/ai`
  - Return `result.toUIMessageStreamResponse()` for streaming (works with useChat default protocol)
  - Method chaining for Hono RPC type inference
- [x] Create `apps/backend/src/routes/documents.ts` with CRUD endpoints using method chaining
- [x] Create `apps/backend/src/routes/index.ts` composing routes with `.route()` and exporting `AppType`. Note: use `.route('/health', health)` and `.route('/api/chat', chat)` - the path in `.route()` is the prefix, individual route handlers use `/` for their paths
- [x] Create `apps/backend/src/middleware/cors.ts` with CORS configuration for localhost:5173
- [x] Create `apps/backend/src/middleware/error.ts` with error handling middleware
- [x] Create `apps/backend/src/middleware/logging.ts` with request logging middleware
- [x] Create `apps/backend/src/index.ts` importing routes, applying middleware, listening on port 3000

## Phase 9: Frontend App (Tailwind v4)

- [x] Create `apps/frontend/` directory
- [x] Create `apps/frontend/package.json` with name `frontend`
- [x] Add dependencies: `react`, `react-dom`, `hono` (use `"hono": "4.11.4"` matching root pinned version for RPC compatibility), `ai`, `@ai-sdk/react`, `@repo/ui`, `@repo/contracts`, `@repo/utils`
- [x] Add devDependencies: `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss@^4`, `typescript`, `@types/react`, `@types/react-dom`, `@types/node`
- [x] Add scripts: `"dev": "vite"`, `"build": "vite build"`, `"preview": "vite preview"`
- [x] Create `apps/frontend/tsconfig.json` extending root with `"jsx": "react-jsx"`, `"composite": true`, and `"references": [{ "path": "../backend" }]`
- [x] Create `apps/frontend/vite.config.ts` with React plugin, Tailwind v4 plugin, and aliases:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@repo/ui': resolve(__dirname, '../../packages/ui/src'),
      '@repo/contracts': resolve(__dirname, '../../packages/contracts/src'),
      '@repo/utils': resolve(__dirname, '../../packages/utils/src'),
    }
  }
});
```
- [x] Create `apps/frontend/index.html` with root div and script src to /src/main.tsx
- [x] Create `apps/frontend/src/main.tsx` rendering App into root
- [x] Create `apps/frontend/src/App.tsx` with basic layout placeholder
- [x] Create `apps/frontend/src/styles/globals.css` with Tailwind v4:
```css
@config "../../packages/ui/tailwind.config.ts";
@import "tailwindcss";
```
- [x] Import globals.css in main.tsx
- [x] Create `apps/frontend/src/lib/api.ts` with Hono client using relative type import:
```typescript
import { hc } from 'hono/client';
import type { AppType } from '../../../backend/src/routes';
export const client = hc<AppType>('http://localhost:3000');
```
- [x] Create `apps/frontend/src/hooks/useChat.ts` using `useChat` from `@ai-sdk/react` with backend API URL
- [x] Create `apps/frontend/src/pages/Home.tsx` with chat interface using the useChat hook
- [x] Import and use Home in App.tsx

## Phase 10: Integration & Verification

- [ ] Run `bun install` from project root
- [ ] Verify no dependency resolution errors
- [ ] Verify Hono versions match in backend and frontend (check bun.lock)
- [ ] Start PostgreSQL: `docker compose up -d --wait` (auto-enables pgvector extension via init.sql)
- [ ] Create `.env` from `.env.example` with DATABASE_URL and OPENROUTER_API_KEY
- [ ] Verify pgvector extension: `docker exec pizza_study_db psql -U postgres -d pizza_study -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"`
- [ ] Run `bun run --filter @repo/database db:push` to sync schema
- [ ] Build backend first for RPC types: `bun run --filter backend build`
- [ ] Run `bun run --filter backend dev` and verify server starts on port 3000
- [ ] Test GET http://localhost:3000/health returns `{ "status": "ok" }`
- [ ] Run `bun run --filter frontend dev` and verify Vite starts on port 5173
- [ ] Open http://localhost:5173 in browser and verify React app loads
- [ ] Verify Tailwind styles are working (check if UI components render correctly)
- [ ] Verify TypeScript has no errors: `bun run typecheck` from root (uses `tsc -b` for build order)
- [ ] Test Hono RPC types: in frontend, verify `client.api.chat.$post()` has correct type inference (not `unknown`)
- [ ] Verify frontend can import `AppType` from backend without errors
- [ ] Run `bun run lint` and verify no linting errors
- [ ] Test streaming: send a chat message and verify tokens stream to frontend in real-time
