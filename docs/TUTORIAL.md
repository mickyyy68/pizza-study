# Pizza Study - Setup Tutorial

## Prerequisites

- [Bun](https://bun.sh) installed
- [Docker](https://docker.com) installed
- [OpenRouter](https://openrouter.ai) API key

## Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Start PostgreSQL with pgvector
docker compose up -d --wait

# 3. Configure environment
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# 4. Copy .env to backend (Bun loads .env from cwd)
cp .env apps/backend/.env

# 5. Push database schema
bun run --filter @repo/database db:push

# 6. Start development servers
bun run dev
```

Open http://localhost:5173 - you should see the chat interface.

## Verify Everything Works

```bash
# Check database is running
docker exec pizza_study_db pg_isready -U postgres

# Check pgvector extension
docker exec pizza_study_db psql -U postgres -d pizza_study -c "SELECT extversion FROM pg_extension WHERE extname = 'vector';"

# Check backend health
curl http://localhost:3000/health

# Check TypeScript
bun run typecheck

# Check linting
bun run lint
```

## Development Workflow

| Terminal 1 | Terminal 2 |
|------------|------------|
| `bun run --filter backend dev` | `bun run --filter frontend dev` |

Or run both with: `bun run dev`

## Common Commands

| Command | What it does |
|---------|--------------|
| `bun run dev` | Start all dev servers |
| `bun run build` | Build everything |
| `bun run typecheck` | Type check all packages |
| `bun run lint` | Lint with Biome |
| `bun run --filter @repo/database db:studio` | Open Drizzle Studio |

## Ports

| Service | Port |
|---------|------|
| Frontend (Vite) | 5173 |
| Backend (Hono) | 3000 |
| PostgreSQL | 5432 |

## Troubleshooting

**"Cannot find module" errors in frontend**

Build backend first for RPC types:
```bash
bun run --filter backend build
```

**Database connection refused**

Check Docker is running:
```bash
docker compose up -d --wait
```

**pgvector extension missing**

The `docker/init.sql` should auto-enable it. If not:
```bash
docker exec pizza_study_db psql -U postgres -d pizza_study -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

**OpenRouter API errors**

Verify your API key in `.env`:
```
OPENROUTER_API_KEY=sk-or-v1-...
```
