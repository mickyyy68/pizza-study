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
utils (shared)          ← Everyone can ADD new utility files
    ↑
contracts ──────────────← Zod schemas, shared API types
    ↑
database ───────────────← Drizzle ORM, PostgreSQL, pgvector
    ↑
ui ─────────────────────← shadcn/ui components (React)
    ↑
ai ─────────────────────← Vercel AI SDK, OpenRouter
    ↑
rag ────────────────────← Embeddings, vector search (uses database)
```

### Frontend-Backend Communication

**Technology: Hono RPC**

Hono has built-in RPC support that provides end-to-end type safety:

1. **Backend** defines routes with Zod validation in `apps/backend/`
2. **Backend** exports route types via Hono's type inference
3. **Frontend** uses `hc` (Hono Client) to make typed API calls
4. **Contracts** (`@repo/contracts`) holds shared Zod schemas used by both

**Example flow:**
```typescript
// packages/contracts/src/schemas/chat.ts
export const chatRequestSchema = z.object({
  message: z.string(),
  conversationId: z.string().optional(),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

// apps/backend/src/routes/chat.ts
import { chatRequestSchema } from "@repo/contracts";
const route = app.post("/chat", zValidator("json", chatRequestSchema), (c) => {
  // handler
});
export type ChatRoute = typeof route;

// apps/frontend/src/lib/api.ts
import { hc } from "hono/client";
import type { ChatRoute } from "backend/src/routes/chat";
const client = hc<ChatRoute>("http://localhost:3000");
// client.chat.$post({ json: { message: "hello" } }) - fully typed!
```

### Shared Utils Strategy

The `utils` package is special - everyone may need to add utilities:

**Rule: Add-only, never modify existing files**

1. Create new utility in its own file: `src/{utility-name}.ts`
2. Export from that file
3. Add export line to `src/index.ts`

This minimizes conflicts:
- Different files = no conflict
- `index.ts` changes = trivial merge (just adding export lines)

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
| `packages/rag/CLAUDE.md` | `packages/rag/` | `@repo/database`, `@repo/utils` |
| `apps/backend/CLAUDE.md` | `apps/backend/` | All `@repo/*` packages |
| `apps/frontend/CLAUDE.md` | `apps/frontend/` | `@repo/ui`, `@repo/contracts`, `@repo/utils` |

---

## Phase 0: CLAUDE.md Files

- [ ] Create `CLAUDE.md` (root) - restricts edits to root config files only
- [ ] Create `packages/utils/CLAUDE.md` - shared package, add-only pattern
- [ ] Create `packages/contracts/CLAUDE.md` - Zod schemas, API types
- [ ] Create `packages/database/CLAUDE.md` - Drizzle ORM, PostgreSQL, pgvector
- [ ] Create `packages/ui/CLAUDE.md` - shadcn/ui dumb components
- [ ] Create `packages/ai/CLAUDE.md` - Vercel AI SDK, OpenRouter
- [ ] Create `packages/rag/CLAUDE.md` - embeddings, vector search
- [ ] Create `apps/backend/CLAUDE.md` - Hono server, exports RPC types
- [ ] Create `apps/frontend/CLAUDE.md` - React + Vite, uses Hono RPC client

---

## Phase 1: Root Configuration

- [ ] Create root `package.json` with name "pizza-study", type "module", and workspaces array `["apps/*", "packages/*"]`
- [ ] Add root scripts: `"dev": "bun run --filter '*' dev"`, `"build": "bun run --filter '*' build"`, `"lint": "bun run --filter '*' lint"`
- [ ] Create root `tsconfig.json` with `compilerOptions`: target ES2022, module ESNext, moduleResolution bundler, strict true, skipLibCheck true, esModuleInterop true
- [ ] Add path aliases to root tsconfig: `"@repo/*": ["./packages/*/src"]`
- [ ] Create `.gitignore` with: node_modules, dist, .env, .env.local, *.log, .DS_Store, .turbo

## Phase 2: Utils Package

- [ ] Create `packages/utils/` directory
- [ ] Create `packages/utils/package.json` with name `@repo/utils`, type "module", main "src/index.ts", exports "./src/index.ts"
- [ ] Create `packages/utils/tsconfig.json` extending `../../tsconfig.json` with include `["src"]`
- [ ] Create `packages/utils/src/index.ts` with placeholder export: `export const VERSION = "0.0.1"`

## Phase 3: Contracts Package

- [ ] Create `packages/contracts/` directory
- [ ] Create `packages/contracts/package.json` with name `@repo/contracts`, dependencies: `zod`, `@repo/utils`
- [ ] Create `packages/contracts/tsconfig.json` extending root
- [ ] Create `packages/contracts/src/index.ts` with placeholder Zod schema export
- [ ] Create `packages/contracts/src/schemas/user.ts` with `userSchema` using Zod
- [ ] Create `packages/contracts/src/schemas/message.ts` with `messageSchema` for chat messages
- [ ] Create `packages/contracts/src/schemas/document.ts` with `documentSchema` for RAG documents
- [ ] Export all schemas from `packages/contracts/src/index.ts`

## Phase 4: Database Package

- [ ] Create `packages/database/` directory
- [ ] Create `packages/database/package.json` with name `@repo/database`
- [ ] Add dependencies: `drizzle-orm`, `postgres`, `@repo/utils`
- [ ] Add devDependencies: `drizzle-kit`
- [ ] Create `packages/database/tsconfig.json` extending root
- [ ] Create `packages/database/drizzle.config.ts` with postgres dialect, schema path, out path for migrations
- [ ] Create `packages/database/src/client.ts` with connection pool using `postgres` package
- [ ] Configure connection pool with max connections, idle timeout from env vars
- [ ] Create `packages/database/src/schema/users.ts` with users table definition
- [ ] Create `packages/database/src/schema/documents.ts` with documents table for RAG content
- [ ] Create `packages/database/src/schema/embeddings.ts` with pgvector column for embeddings
- [ ] Create `packages/database/src/schema/index.ts` exporting all schemas
- [ ] Create `packages/database/src/index.ts` exporting client and schemas
- [ ] Add script to package.json: `"db:generate": "drizzle-kit generate"`
- [ ] Add script to package.json: `"db:migrate": "drizzle-kit migrate"`
- [ ] Add script to package.json: `"db:studio": "drizzle-kit studio"`

## Phase 5: UI Package

- [ ] Create `packages/ui/` directory
- [ ] Create `packages/ui/package.json` with name `@repo/ui`
- [ ] Add dependencies: `react`, `react-dom`, `clsx`, `tailwind-merge`, `class-variance-authority`
- [ ] Add devDependencies: `tailwindcss`, `postcss`, `autoprefixer`, `@types/react`, `@types/react-dom`
- [ ] Add peerDependencies: `react`, `react-dom`
- [ ] Create `packages/ui/tsconfig.json` extending root, add jsx "react-jsx"
- [ ] Create `packages/ui/tailwind.config.ts` with content paths, theme extensions
- [ ] Create `packages/ui/postcss.config.js` with tailwindcss and autoprefixer plugins
- [ ] Create `packages/ui/src/lib/utils.ts` with `cn()` function using clsx and tailwind-merge
- [ ] Create `packages/ui/src/components/button.tsx` - dumb Button component with variants
- [ ] Create `packages/ui/src/components/card.tsx` - dumb Card component
- [ ] Create `packages/ui/src/components/input.tsx` - dumb Input component
- [ ] Create `packages/ui/src/components/index.ts` exporting all components
- [ ] Create `packages/ui/src/index.ts` exporting components and utils
- [ ] Create `packages/ui/src/styles.css` with Tailwind directives

## Phase 6: AI Package

- [ ] Create `packages/ai/` directory
- [ ] Create `packages/ai/package.json` with name `@repo/ai`
- [ ] Add dependencies: `ai`, `@ai-sdk/openai`, `@repo/utils`
- [ ] Create `packages/ai/tsconfig.json` extending root
- [ ] Create `packages/ai/src/client.ts` with OpenRouter configuration using `@ai-sdk/openai` compatible provider
- [ ] Create `packages/ai/src/config.ts` with model names, default parameters, API base URL for OpenRouter
- [ ] Create `packages/ai/src/prompts/system.ts` with system prompt templates
- [ ] Create `packages/ai/src/prompts/index.ts` exporting prompt utilities
- [ ] Create `packages/ai/src/index.ts` exporting client, config, and prompts

## Phase 7: RAG Package

- [ ] Create `packages/rag/` directory
- [ ] Create `packages/rag/package.json` with name `@repo/rag`
- [ ] Add dependencies: `@repo/database`, `@repo/utils`
- [ ] Create `packages/rag/tsconfig.json` extending root
- [ ] Create `packages/rag/src/embeddings.ts` with embedding generation function (placeholder for OpenAI embeddings API)
- [ ] Create `packages/rag/src/chunking.ts` with text chunking strategies (split by tokens, overlap)
- [ ] Create `packages/rag/src/search.ts` with vector similarity search using pgvector
- [ ] Create `packages/rag/src/retrieval.ts` with full retrieval pipeline: query → embed → search → rank
- [ ] Create `packages/rag/src/index.ts` exporting all RAG utilities

## Phase 8: Backend App

- [ ] Create `apps/backend/` directory
- [ ] Create `apps/backend/package.json` with name `backend`
- [ ] Add dependencies: `hono`, `@hono/zod-validator`, `@repo/ai`, `@repo/rag`, `@repo/database`, `@repo/contracts`, `@repo/utils`
- [ ] Add devDependencies: `@types/bun`
- [ ] Add scripts: `"dev": "bun --watch src/index.ts"`, `"start": "bun src/index.ts"`
- [ ] Create `apps/backend/tsconfig.json` extending root
- [ ] Create `apps/backend/src/index.ts` with Hono app, listen on port 3000
- [ ] Add CORS middleware to Hono app
- [ ] Create `apps/backend/src/routes/health.ts` with GET /health endpoint
- [ ] Create `apps/backend/src/routes/chat.ts` with POST /api/chat endpoint using Zod validator
- [ ] Create `apps/backend/src/routes/documents.ts` with CRUD endpoints for documents
- [ ] Create `apps/backend/src/routes/index.ts` combining all routes and exporting types for Hono RPC
- [ ] Register routes in main `src/index.ts`
- [ ] Create `apps/backend/src/middleware/error.ts` with error handling middleware
- [ ] Create `apps/backend/src/middleware/logging.ts` with request logging middleware
- [ ] Export AppType from routes for frontend Hono client

## Phase 9: Frontend App

- [ ] Create `apps/frontend/` directory
- [ ] Create `apps/frontend/package.json` with name `frontend`
- [ ] Add dependencies: `react`, `react-dom`, `hono`, `@repo/ui`, `@repo/contracts`, `@repo/utils`
- [ ] Add devDependencies: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `tailwindcss`, `postcss`, `autoprefixer`
- [ ] Add scripts: `"dev": "vite"`, `"build": "vite build"`, `"preview": "vite preview"`
- [ ] Create `apps/frontend/tsconfig.json` extending root, add jsx "react-jsx"
- [ ] Create `apps/frontend/vite.config.ts` with React plugin, resolve aliases for @repo packages
- [ ] Create `apps/frontend/tailwind.config.ts` extending UI package config, add content paths
- [ ] Create `apps/frontend/postcss.config.js` with tailwindcss and autoprefixer
- [ ] Create `apps/frontend/index.html` with root div and script src to /src/main.tsx
- [ ] Create `apps/frontend/src/main.tsx` rendering App into root
- [ ] Create `apps/frontend/src/App.tsx` with basic layout placeholder
- [ ] Create `apps/frontend/src/styles/globals.css` with Tailwind directives
- [ ] Import globals.css in main.tsx
- [ ] Create `apps/frontend/src/lib/api.ts` with Hono client (`hc`) configured for backend
- [ ] Create `apps/frontend/src/pages/Home.tsx` placeholder page component
- [ ] Import and use Home in App.tsx

## Phase 10: Integration & Verification

- [ ] Run `bun install` from project root
- [ ] Verify no dependency resolution errors
- [ ] Run `bun run --filter @repo/utils build` (if build script exists)
- [ ] Run `bun run --filter backend dev` and verify server starts on port 3000
- [ ] Test GET http://localhost:3000/health returns OK
- [ ] Run `bun run --filter frontend dev` and verify Vite starts on port 5173
- [ ] Open http://localhost:5173 in browser and verify React app loads
- [ ] Verify TypeScript has no errors across all packages: `bunx tsc --noEmit`
- [ ] Verify Hono RPC types work: frontend can import backend route types
- [ ] Create `.env.example` with required environment variables documented
- [ ] Add DATABASE_URL, OPENROUTER_API_KEY placeholders to .env.example
