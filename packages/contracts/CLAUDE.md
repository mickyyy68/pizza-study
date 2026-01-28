# @repo/contracts

## Boundaries

**CRITICAL - READ BEFORE ANY EDIT:**
- ONLY edit files within `packages/contracts/`
- NEVER edit: root configs, `apps/*`, other `packages/*`
- You may import from: `@repo/utils`
- You may NOT modify packages you import from

## Purpose

Zod schemas and TypeScript types for API contracts. Provides type-safe validation for request/response data shared between frontend and backend.

## Key Files

- `src/index.ts` - Public exports (schemas and inferred types)
- `src/schemas/user.ts` - User-related schemas
- `src/schemas/message.ts` - Chat message schemas
- `src/schemas/document.ts` - RAG document schemas

## Patterns

**Schema structure:**
```typescript
import { z } from 'zod';

// Define schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.date(),
});

// Export inferred type
export type User = z.infer<typeof userSchema>;
```

**Naming conventions:**
- Schemas: `{name}Schema` (e.g., `userSchema`, `chatRequestSchema`)
- Types: `{Name}` (e.g., `User`, `ChatRequest`)

## Commands

- `bun run typecheck` - Type check this package
