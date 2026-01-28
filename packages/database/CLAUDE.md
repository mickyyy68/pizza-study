# @repo/database

## Boundaries

**CRITICAL - READ BEFORE ANY EDIT:**
- ONLY edit files within `packages/database/`
- NEVER edit: root configs, `apps/*`, other `packages/*`
- You may import from: `@repo/utils`
- You may NOT modify packages you import from

## Purpose

Database layer using Drizzle ORM with PostgreSQL and pgvector for vector embeddings. Handles schema definitions, migrations, and database client.

## Key Files

- `src/index.ts` - Public exports (db client, schemas)
- `src/client.ts` - Database connection pool
- `src/schema/` - Table definitions
- `src/schema/users.ts` - Users table
- `src/schema/documents.ts` - RAG documents table
- `src/schema/embeddings.ts` - Vector embeddings table with pgvector
- `src/migrate.ts` - Programmatic migration runner
- `drizzle.config.ts` - Drizzle Kit configuration
- `drizzle/` - Generated migrations

## Patterns

**pgvector column (1536 dimensions for text-embedding-3-small):**
```typescript
import { vector } from 'drizzle-orm/pg-core';

embedding: vector('embedding', { dimensions: 1536 })
```

**HNSW index for vector search:**
```typescript
export const embeddings = pgTable('embeddings', {
  // columns...
}, (table) => [
  index('embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops'))
]);
```

**Connection pool:**
```typescript
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL!, { max: 10, idleTimeout: 20 });
```

**Migrations use separate connection:**
```typescript
const migrationSql = postgres(process.env.DATABASE_URL!, { max: 1 });
```

## Commands

- `bun run db:generate` - Generate migrations from schema changes
- `bun run db:push` - Push schema directly (development)
- `bun run db:migrate` - Run migrations (production)
- `bun run db:studio` - Open Drizzle Studio
