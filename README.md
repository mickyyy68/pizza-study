# pizza-study

A RAG (Retrieval-Augmented Generation) chat application for document Q&A.

## Current Stage: Scaffolded Infrastructure

The foundation is complete but features are not yet integrated.

| Layer | Status |
|-------|--------|
| Monorepo tooling | Done |
| Database schema | Done |
| AI integration | Done |
| RAG pipeline | Done |
| Backend API | Done |
| Frontend shell | Done |
| Feature integration | Not started |

### What works today

- Basic chat with MiniMax M2.1 (streaming)
- Document CRUD via API (no UI)

### What doesn't work yet

- Asking questions about uploaded documents (RAG not wired to chat)
- Document management from the UI
- User accounts / authentication

## Architecture

```
pizza-study/
├── apps/
│   ├── backend/     # Hono API server (port 3000)
│   └── frontend/    # React 19 + Vite (port 5173)
├── packages/
│   ├── ai/          # MiniMax M2.1 + embeddings via OpenRouter
│   ├── contracts/   # Zod schemas (shared types)
│   ├── database/    # Drizzle ORM + PostgreSQL + pgvector
│   ├── rag/         # Chunking, embedding, vector search, retrieval
│   ├── ui/          # Button, Card, Input components
│   └── utils/       # Shared utilities
```

## Tech Stack

- **Runtime**: Bun
- **Backend**: Hono
- **Frontend**: React 19, Vite 6, Tailwind CSS v4
- **Database**: PostgreSQL + pgvector
- **ORM**: Drizzle
- **AI**: Vercel AI SDK, OpenRouter (MiniMax M2.1, text-embedding-3-small)
- **Validation**: Zod
- **Linting**: Biome 2.0

## Getting Started

### Prerequisites

- Bun
- PostgreSQL with pgvector extension
- OpenRouter API key

### Setup

```bash
# Install dependencies
bun install

# Copy environment template
cp .env.example .env
# Edit .env with your DATABASE_URL and OPENROUTER_API_KEY

# Setup database
bun run db:setup
# Start development servers
bun run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all apps in development mode |
| `bun run build` | Build all packages and apps |
| `bun run typecheck` | TypeScript type checking |
| `bun run lint` | Run Biome linter |
| `bun run lint:fix` | Fix linting issues |
| `bun run format` | Format code with Biome |

## API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/health` | GET | Health check |
| `/api/chat` | POST | Streaming chat |
| `/api/documents` | GET | List documents |
| `/api/documents/:id` | GET | Get document |
| `/api/documents` | POST | Create document + embeddings |
| `/api/documents/:id` | DELETE | Delete document |

## Next Steps

1. Wire RAG retrieval into the chat endpoint
2. Build document upload/management UI
