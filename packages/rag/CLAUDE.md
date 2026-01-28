# @repo/rag

## Boundaries

**CRITICAL - READ BEFORE ANY EDIT:**
- ONLY edit files within `packages/rag/`
- NEVER edit: root configs, `apps/*`, other `packages/*`
- You may import from: `@repo/database`, `@repo/ai`, `@repo/utils`
- You may NOT modify packages you import from

## Purpose

Retrieval-Augmented Generation (RAG) pipeline. Handles document chunking, embedding generation, vector storage, and similarity search.

## Key Files

- `src/index.ts` - Public exports
- `src/chunking.ts` - Text chunking strategies
- `src/embeddings.ts` - Embedding generation for documents
- `src/search.ts` - Vector similarity search
- `src/retrieval.ts` - Full RAG pipeline

## Patterns

**Chunking strategy:**
```typescript
export function chunkText(text: string, options: {
  maxTokens?: number;
  overlap?: number;
}): string[] {
  // Split by tokens with overlap for context continuity
}
```

**Vector similarity search with pgvector:**
```typescript
import { sql } from 'drizzle-orm';
import { db } from '@repo/database';

// Cosine distance operator: <=>
const results = await db.execute(sql`
  SELECT *, embedding <=> ${queryEmbedding}::vector AS distance
  FROM embeddings
  ORDER BY distance
  LIMIT ${limit}
`);
```

**Full retrieval pipeline:**
```typescript
export async function retrieve(query: string, options?: RetrievalOptions) {
  // 1. Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // 2. Search for similar documents
  const results = await vectorSearch(queryEmbedding, options?.limit);

  // 3. Rank and filter results
  return rankResults(results, options?.threshold);
}
```

## Commands

- `bun run typecheck` - Type check this package
