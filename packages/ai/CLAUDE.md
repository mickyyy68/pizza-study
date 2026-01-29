# @repo/ai

## Boundaries

**CRITICAL - READ BEFORE ANY EDIT:**
- ONLY edit files within `packages/ai/`
- NEVER edit: root configs, `apps/*`, other `packages/*`
- You may import from: `@repo/utils`
- You may NOT modify packages you import from

## Purpose

AI integration layer using Vercel AI SDK with OpenRouter as the provider. Handles chat completions, embeddings, and prompt templates.

## Key Files

- `src/index.ts` - Public exports
- `src/client.ts` - OpenRouter provider setup
- `src/embedding.ts` - Embedding model and helper functions
- `src/config.ts` - Model names, default parameters
- `src/prompts/system.ts` - System prompt templates
- `src/prompts/index.ts` - Prompt utilities

## Patterns

**OpenRouter provider setup:**
```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});
```

**Embedding model (text-embedding-3-small, 1536 dimensions):**
```typescript
export const embeddingModel = openrouter.textEmbeddingModel('openai/text-embedding-3-small');
```

**Chat model:**
```typescript
export const chatModel = openrouter.chat('anthropic/claude-3.5-sonnet');
```

**Embedding helper:**
```typescript
import { embed } from 'ai';

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({ model: embeddingModel, value: text });
  return embedding; // 1536-dimensional vector
}
```

## Environment Variables

- `OPENROUTER_API_KEY` - Required for API access

## Commands

- `bun run typecheck` - Type check this package
- `bun run test` - Run tests in watch mode
- `bun run test:run` - Run tests once

## Testing

Tests in `src/__tests__/`. Uses Vitest with node environment. Mock external AI APIs for unit tests.
