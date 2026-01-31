# pizza-study

<p align="center">
  <img src="apps/frontend/public/logo_nobg_compressed.png" alt="pizza-study logo" width="400">
</p>

A RAG (Retrieval-Augmented Generation) chat application for document Q&A.

## Current Stage: Core Features Integrated

The foundation is complete with tasks and calendar features fully integrated.

| Layer | Status |
|-------|--------|
| Monorepo tooling | Done |
| Database schema | Done |
| AI integration | Done |
| RAG pipeline | Done |
| Backend API | Done |
| Frontend shell | Done |
| Tasks & Calendar | Done |
| Feature integration | In progress |

### What works today

- Basic chat with MiniMax M2.1 (streaming)
- Document CRUD via API (no UI)
- Tasks management (create, list, complete, delete)
- Calendar events (create, list, delete)
- Dashboard with study stats

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

# Start PostgreSQL (uses port 5433 to avoid conflicts)
docker compose up -d

# Run database migrations
bun run db:migrate

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
| `bun run db:generate` | Generate database migrations |
| `bun run db:migrate` | Apply database migrations |
| `bun run db:studio` | Open Drizzle Studio |

## API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/health` | GET | Health check |
| `/api/chat` | POST | Streaming chat |
| `/api/documents` | GET | List documents |
| `/api/documents/:id` | GET | Get document |
| `/api/documents` | POST | Create document + embeddings |
| `/api/documents/:id` | DELETE | Delete document |
| `/api/tasks` | GET | List tasks (optional date filters) |
| `/api/tasks` | POST | Create task |
| `/api/tasks/stats` | GET | Get study stats |
| `/api/tasks/:id` | GET | Get task |
| `/api/tasks/:id` | PATCH | Update task |
| `/api/tasks/:id` | DELETE | Delete task |
| `/api/events` | GET | List calendar events |
| `/api/events` | POST | Create event |
| `/api/events/:id` | GET | Get event |
| `/api/events/:id` | PATCH | Update event |
| `/api/events/:id` | DELETE | Delete event |

## Next Steps

1. Wire RAG retrieval into the chat endpoint
2. Build document upload/management UI
