# Tasks & Calendar Database Storage - Implementation Backlog

## ✅ IMPLEMENTATION COMPLETE

All phases have been implemented. See notes below for important changes made during implementation.

### Key Changes From Original Plan:
1. **Port Configuration**: Docker PostgreSQL uses port **5433** (not 5432) to avoid conflicts with local PostgreSQL
2. **CORS Middleware**: Added `PATCH` to allowed methods in `apps/backend/src/middleware/cors.ts`
3. **Schema Exports**: Used named exports `export { tasks }` instead of `export *` (matches codebase pattern)
4. **Route Exports**: Used `export default tasksRoute` instead of named exports (matches codebase pattern)
5. **RootLayout Path**: Correct path is `apps/frontend/src/layouts/RootLayout.tsx` (not components/layout)
6. **Parse Utilities**: Created in `apps/frontend/src/lib/parse.ts` (not utils.ts)
7. **Error Schema**: Not created (not needed - errors handled inline)

---

## Phase 1: Database Schema ✅

### Tasks Table
- [x] Create `packages/database/src/schema/tasks.ts`
- [x] Import required types: `uuid`, `text`, `timestamp`, `boolean`, `jsonb` from `drizzle-orm/pg-core`
- [x] Define `tasks` table with all fields
- [x] Add indexes using Drizzle callback pattern
- [x] Export `tasks` table from the file

### Calendar Events Table
- [x] Create `packages/database/src/schema/calendar-events.ts`
- [x] Define `calendarEvents` table with all fields
- [x] Add date index
- [x] Export `calendarEvents` table

### Schema Index
- [x] Add `export { tasks } from "./tasks"` to `packages/database/src/schema/index.ts`
- [x] Add `export { calendarEvents } from "./calendar-events"` to `packages/database/src/schema/index.ts`

### Migration
- [x] Run `bun run db:generate` to generate migration SQL
- [x] Migration file: `packages/database/drizzle/0001_broken_dakota_north.sql`
- [x] Run `bun run db:migrate` to apply migration

---

## Phase 2: API Contracts (Zod Schemas) ✅

### Task Schemas
- [x] Create `packages/contracts/src/schemas/task.ts`
- [x] Define `taskSchema`, `createTaskSchema`, `updateTaskSchema`
- [x] Export all schemas and inferred types

### Calendar Event Schemas
- [x] Create `packages/contracts/src/schemas/calendar-event.ts`
- [x] Define `calendarEventSchema`, `createEventSchema`, `updateEventSchema`
- [x] Export all schemas and inferred types

### Stats Schema
- [x] Create `packages/contracts/src/schemas/stats.ts`
- [x] Define `studyStatsSchema`
- [x] Export schema and inferred type

### Contracts Index
- [x] Add exports to `packages/contracts/src/index.ts`

---

## Phase 3: Type Alignment ✅

### Update Frontend Types to Match API
- [x] Add `createdAt: Date` and `updatedAt: Date` to `Task` interface
- [x] Add `createdAt: Date` and `updatedAt: Date` to `CalendarEvent` interface
- [x] Change `CalendarEvent.documentIds` from optional to required

### Create Date Conversion Utilities
- [x] Create `apps/frontend/src/lib/parse.ts`
- [x] Add `parseTaskFromApi` function
- [x] Add `parseEventFromApi` function

---

## Phase 4: Backend API Routes ✅

### Tasks Route
- [x] Create `apps/backend/src/routes/tasks.ts`
- [x] Implement GET `/` with optional date filters
- [x] Implement GET `/stats` (before /:id)
- [x] Implement GET `/:id`
- [x] Implement POST `/` with validation
- [x] Implement PATCH `/:id`
- [x] Implement DELETE `/:id`
- [x] Export default

### Events Route
- [x] Create `apps/backend/src/routes/events.ts`
- [x] Implement full CRUD
- [x] Export default

### Register Routes
- [x] Import and register in `apps/backend/src/routes/index.ts`
- [x] Build backend for RPC types: `bun run --filter backend build`

### CORS Fix (Added during implementation)
- [x] Add `PATCH` to `allowMethods` in `apps/backend/src/middleware/cors.ts`

---

## Phase 5: Frontend Store Updates ✅

### Calendar Store
- [x] Remove mock data imports
- [x] Add loading/error state
- [x] Add stats state
- [x] Add `fetchTasks`, `fetchEvents`, `fetchStats` async actions
- [x] Add `addTask` async action
- [x] Add `toggleTaskComplete` with optimistic update and rollback
- [x] Add `deleteTask` async action
- [x] Add `addEvent`, `deleteEvent` async actions
- [x] Add `clearError` action

---

## Phase 6: Frontend Initialization ✅

### Create Initialization Hook
- [x] Create `apps/frontend/src/hooks/useInitialize.ts`
- [x] Implement hook with useEffect

### Wire Up Initialization
- [x] Update `apps/frontend/src/layouts/RootLayout.tsx`
- [x] Call `useInitialize()` hook

---

## Phase 7: Dashboard Stats Integration ✅

- [x] Update `DashboardPage.tsx` to use real stats from store
- [x] Remove `mockStats` import
- [x] Show loading skeleton when `statsLoading`
- [x] Handle null stats gracefully

---

## Phase 8: UI Loading & Error States ✅

### Calendar Page
- [x] Add error banner with dismiss/retry buttons
- [x] Import error handling from store

---

## Phase 9: Cleanup ✅

- [x] Add deprecation notice to `apps/frontend/src/mock/tasks.ts`
- [x] Add `createdAt`/`updatedAt` to mock data for type compatibility
- [x] Verify no mock imports in calendar store

---

## Phase 10: Verification ✅

- [x] All lint errors fixed
- [x] TypeScript compiles successfully
- [x] Backend endpoints tested and working
- [x] Frontend connects to API

---

## Setup Instructions

### Prerequisites
- Docker running
- Node.js / Bun installed

### Database Setup
```bash
# Start PostgreSQL (uses port 5433 to avoid conflicts)
docker compose up -d

# Run migrations
cd packages/database
export $(cat ../../.env | grep -v '^#' | xargs)
bun run db:migrate
```

### Development
```bash
# Start everything
bun run dev

# Or start individually:
cd apps/backend && bun run dev   # API on http://localhost:3000
cd apps/frontend && bun run dev  # UI on http://localhost:5173
```

### Testing API
```bash
# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","dueDate":"2025-02-01T10:00:00Z","priority":"high"}'

# List tasks
curl http://localhost:3000/api/tasks

# Get stats
curl http://localhost:3000/api/tasks/stats

# Toggle complete (replace {id} with actual ID)
curl -X PATCH http://localhost:3000/api/tasks/{id} \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

---

## Files Created

```
packages/database/src/schema/tasks.ts
packages/database/src/schema/calendar-events.ts
packages/contracts/src/schemas/task.ts
packages/contracts/src/schemas/calendar-event.ts
packages/contracts/src/schemas/stats.ts
apps/backend/src/routes/tasks.ts
apps/backend/src/routes/events.ts
apps/frontend/src/lib/parse.ts
apps/frontend/src/hooks/useInitialize.ts
```

## Files Modified

```
packages/database/src/schema/index.ts — added exports
packages/contracts/src/index.ts — added exports
apps/backend/src/routes/index.ts — registered routes
apps/backend/src/middleware/cors.ts — added PATCH method
apps/frontend/src/types/index.ts — added timestamps
apps/frontend/src/stores/calendar-store.ts — API integration
apps/frontend/src/pages/dashboard/DashboardPage.tsx — real stats
apps/frontend/src/pages/calendar/CalendarPage.tsx — error handling
apps/frontend/src/layouts/RootLayout.tsx — useInitialize hook
apps/frontend/src/mock/tasks.ts — deprecation + type fixes
docker-compose.yml — port 5433
.env — port 5433
```

## Unchanged (as planned)

```
apps/frontend/src/mock/documents.ts — documents stay mocked
apps/frontend/src/stores/documents-store.ts — keep using mock data
```
