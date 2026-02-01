# Plan: Unmock Documents + Conversation Persistence

> Replace mock data with real API calls and add chat history persistence

---

## Part 1: Unmock Documents (Quick Win)

### Current State
- `MOCK_DOCUMENTS` array hardcoded in `ChatPage.tsx`
- Backend already has `GET /api/documents` endpoint that works

### Implementation

**File**: `apps/frontend/src/pages/chat/ChatPage.tsx`

```typescript
// Replace mock initialization with API fetch
useEffect(() => {
  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const docs = await response.json();
      setDocuments(docs.map((d: any) => ({
        id: d.id,
        name: d.title,
        pageCount: d.metadata?.pageCount || 0,
        isSelected: true,
        recentlyCited: false,
      })));
    } catch (error) {
      console.error('Failed to load documents:', error);
      // Keep empty state, user can upload
    }
  };
  fetchDocuments();
}, [setDocuments]);
```

**Changes needed:**
1. Remove `MOCK_DOCUMENTS` constant
2. Replace initialization effect with API fetch
3. Map API response to `ChatDocument` format

---

## Part 2: Conversation Persistence (Full Feature)

### Database Schema

**New file**: `packages/database/src/schema/conversations.ts`

```typescript
import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  title: text("title").notNull(),
  documentIds: jsonb("document_ids").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**New file**: `packages/database/src/schema/messages.ts`

```typescript
import { pgTable, text, timestamp, uuid, jsonb, index } from "drizzle-orm/pg-core";
import { conversations } from "./conversations";

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  role: text("role").notNull(), // "user" | "assistant" | "system"
  content: text("content").notNull(),
  citations: jsonb("citations").$type<{ documentId: string; chunk: string }[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index("messages_conversation_idx").on(table.conversationId),
  createdAtIdx: index("messages_created_at_idx").on(table.createdAt),
}));
```

**Update**: `packages/database/src/schema/index.ts`
- Export new tables

### Backend API Endpoints

**New file**: `apps/backend/src/routes/conversations.ts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/conversations` | List all conversations (recent first) |
| `POST` | `/api/conversations` | Create new conversation |
| `GET` | `/api/conversations/:id` | Get conversation with messages |
| `DELETE` | `/api/conversations/:id` | Delete conversation |

**Update**: `apps/backend/src/routes/chat.ts`

Add conversation persistence to existing chat endpoint:
1. Accept optional `conversationId` in request body
2. If no conversationId, create new conversation
3. Save user message to DB
4. Save assistant response to DB (after streaming completes)
5. Return `conversationId` in response headers

### Frontend Integration

**Update**: `apps/frontend/src/stores/chat-store.ts`

Add new state and actions:
```typescript
// New state
conversations: Conversation[];
currentConversationId: string | null;

// New actions
fetchConversations: () => Promise<void>;
createConversation: () => Promise<string>;
loadConversation: (id: string) => Promise<void>;
deleteConversation: (id: string) => Promise<void>;
```

**Update**: `apps/frontend/src/pages/chat/ChatPage.tsx`

1. Remove `MOCK_HISTORY` constant
2. Fetch conversations on mount
3. Pass `conversationId` to useChat
4. Update sidebar to use real conversation data
5. Wire "New Chat" button to create conversation

---

## Implementation Order

### Phase A: Unmock Documents (30 min)
- [ ] A1. Remove `MOCK_DOCUMENTS` from ChatPage
- [ ] A2. Add useEffect to fetch from `/api/documents`
- [ ] A3. Handle loading/error states
- [ ] A4. Test with real uploaded documents

### Phase B: Database Schema (30 min)
- [ ] B1. Create `conversations.ts` schema
- [ ] B2. Create `messages.ts` schema
- [ ] B3. Update schema index exports
- [ ] B4. Generate migration: `bun run db:generate`
- [ ] B5. Run migration: `bun run db:push`

### Phase C: Backend Endpoints (1 hour)
- [ ] C1. Create `conversations.ts` route file
- [ ] C2. Implement `GET /api/conversations`
- [ ] C3. Implement `POST /api/conversations`
- [ ] C4. Implement `GET /api/conversations/:id`
- [ ] C5. Implement `DELETE /api/conversations/:id`
- [ ] C6. Register routes in main router
- [ ] C7. Test endpoints with curl/httpie

### Phase D: Update Chat Endpoint (45 min)
- [ ] D1. Accept `conversationId` in request body
- [ ] D2. Create conversation if not provided
- [ ] D3. Save user message before streaming
- [ ] D4. Save assistant message after streaming
- [ ] D5. Return conversationId in response
- [ ] D6. Test conversation flow

### Phase E: Frontend Integration (1 hour)
- [ ] E1. Add conversation state to chat-store
- [ ] E2. Add fetch/create/load/delete actions
- [ ] E3. Remove `MOCK_HISTORY` from ChatPage
- [ ] E4. Fetch conversations on mount
- [ ] E5. Wire sidebar to real data
- [ ] E6. Update useChat to include conversationId
- [ ] E7. Test full flow: new chat → send messages → reload → see history

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `packages/database/src/schema/conversations.ts` | **CREATE** |
| `packages/database/src/schema/messages.ts` | **CREATE** |
| `packages/database/src/schema/index.ts` | MODIFY - add exports |
| `apps/backend/src/routes/conversations.ts` | **CREATE** |
| `apps/backend/src/routes/index.ts` | MODIFY - register route |
| `apps/backend/src/routes/chat.ts` | MODIFY - add persistence |
| `apps/frontend/src/stores/chat-store.ts` | MODIFY - add conversation state |
| `apps/frontend/src/pages/chat/ChatPage.tsx` | MODIFY - remove mocks, wire real data |

---

## Verification

1. **Documents**: Upload a PDF, refresh page, see it in sidebar
2. **New conversation**: Click "New Chat", send message, see conversation created
3. **Load conversation**: Click conversation in sidebar, see messages loaded
4. **Persistence**: Refresh page, conversations still there
5. **Delete**: Delete conversation, confirm removed from DB

---

## API Response Formats

### GET /api/conversations
```json
[
  {
    "id": "uuid",
    "title": "Explain integration by parts",
    "documentIds": ["doc-uuid"],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:35:00Z",
    "messageCount": 4
  }
]
```

### GET /api/conversations/:id
```json
{
  "id": "uuid",
  "title": "Explain integration by parts",
  "documentIds": ["doc-uuid"],
  "messages": [
    { "id": "uuid", "role": "user", "content": "...", "createdAt": "..." },
    { "id": "uuid", "role": "assistant", "content": "...", "createdAt": "..." }
  ]
}
```

### POST /api/conversations
```json
// Request
{ "title": "New conversation" }

// Response
{ "id": "uuid" }
```
