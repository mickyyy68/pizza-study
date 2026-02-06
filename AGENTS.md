# pizza-study

## Boundaries

**CRITICAL - READ BEFORE ANY EDIT:**
- ONLY edit root configuration files: `package.json`, `tsconfig.json`, `biome.json`, `.gitignore`, `.env.example`, `docker-compose.yml`
- NEVER edit: `apps/*`, `packages/*`
- This file controls the monorepo workspace configuration only

## Purpose

Root configuration for the pizza-study monorepo. Manages workspace dependencies, TypeScript project references, linting, and Docker setup.

## Key Files

- `package.json` - Workspace configuration, shared dependencies, root scripts
- `tsconfig.json` - TypeScript config with path aliases and project references
- `biome.json` - Biome 2.0 linting and formatting
- `docker-compose.yml` - PostgreSQL with pgvector
- `.env.example` - Environment variable template

## Patterns

- Use `bun` as package manager
- Pin shared dependencies (especially `hono`) in root package.json
- All packages use `"type": "module"` for ESM

## Commands

- `bun install` - Install all dependencies
- `bun run dev` - Start all apps in development mode
- `bun run build` - Build all packages and apps
- `bun run typecheck` - TypeScript type checking (`tsc -b`)
- `bun run lint` - Run Biome linter
- `bun run lint:fix` - Fix linting issues
- `bun run format` - Format code with Biome
- `bun run test` - Run all tests in watch mode
- `bun run test:run` - Run all tests once
- `bun run test:coverage` - Run tests with coverage

## Testing

Uses Vitest with workspace projects. Each package/app has its own `vitest.config.ts`. Tests live in `src/__tests__/`. React packages use `happy-dom` and `@testing-library/react`.
