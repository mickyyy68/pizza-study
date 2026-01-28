# @repo/utils

## Boundaries

**CRITICAL - READ BEFORE ANY EDIT:**
- ONLY edit files within `packages/utils/`
- NEVER edit: root configs, `apps/*`, other `packages/*`
- You may import from: None (this is the base package)
- You may NOT modify packages you import from

## Purpose

Shared utility functions used across all packages. This is the foundational package with no internal dependencies.

## Key Files

- `src/index.ts` - Main exports (keep minimal)
- `src/*.ts` - Individual utility modules (add new files here)

## Patterns

**Add-only pattern**: Everyone can add new utilities, but never modify existing files to avoid conflicts.

1. Create new utility in its own file: `src/{utility-name}.ts`
2. Export from that file directly
3. Import via subpath: `import { retry } from '@repo/utils/retry'`

**Subpath exports** (in package.json):
```json
{
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  }
}
```

This avoids index.ts modification conflicts - consumers import `@repo/utils/retry` directly.

## Commands

- `bun run typecheck` - Type check this package
