# RAG Chat Integration - Implementation Plan

## Overview

**Goal:** Integrate Retrieval-Augmented Generation (RAG) into the chat endpoint so the AI can answer questions based on uploaded documents.

**Current State:**
- Documents are uploaded and embedded via `createDocumentWithEmbeddings()`
- Embeddings stored in PostgreSQL with pgvector
- `vectorSearch()` function exists but is unused
- Chat sends messages directly to AI without document context

**Target State:**
- Chat retrieves relevant document chunks based on user's question
- Relevant context is injected into the prompt
- AI can answer questions about uploaded study materials

---

## Architecture Decision

### Option A: Always Search (Simple)
Every message triggers a vector search. Simple but may retrieve irrelevant context for casual conversation.

### Option B: Keyword Detection
Only search when message contains keywords like "document", "file", "what does", etc. More efficient but might miss valid queries.

### Option C: Two-Pass (Recommended) ✅
1. First, check if there are any documents in the database
2. If yes, always search (study app context means most questions are about documents)
3. If no documents, skip search entirely

**Decision:** Option C - Simple, efficient, appropriate for a study app.

---

## Phase 1: RAG Retrieval Function

### 1.1 Create Retrieval Helper
- [x] Create `packages/rag/src/retrieval.ts`
- [x] Export `retrieveContext(query: string)` function
- [x] Generate embedding for query using `generateEmbedding()`
- [x] Call `vectorSearch()` with query embedding
- [x] Return formatted context string

```typescript
// packages/rag/src/retrieval.ts
export interface RetrievalResult {
  context: string;
  sources: { title: string; documentId: string }[];
  hasContext: boolean;
}

export async function retrieveContext(
  query: string,
  options?: { limit?: number; threshold?: number }
): Promise<RetrievalResult>
```

### 1.2 Format Context for Prompt
- [x] Format retrieved chunks as readable context
- [x] Include document titles for attribution
- [x] Handle case when no relevant documents found
- [x] Limit context length to avoid token limits

**Context Format:**
```
The following excerpts from the user's study materials may be relevant:

---
From "Document Title":
[chunk text]

---
From "Another Document":
[chunk text]

---
```

### 1.3 Export from Package
- [x] Add to `packages/rag/src/index.ts` exports
- [x] Rebuild package

---

## Phase 2: Update Chat Route

### 2.1 Add RAG to Chat Endpoint
- [x] Import `retrieveContext` from `@repo/rag`
- [x] Extract latest user message from messages array
- [x] Call `retrieveContext()` with user's message
- [x] Inject context into system prompt

**File:** `apps/backend/src/routes/chat.ts`

### 2.2 Update System Prompt
- [x] Modify system prompt to include retrieved context
- [x] Add instructions for AI to use the context
- [x] Tell AI to say "I don't have information about that" when context isn't relevant

**Updated System Prompt Structure:**
```typescript
const systemWithContext = `${SYSTEM_PROMPT}

${result.hasContext ? `
## Retrieved Study Materials

${result.context}

Use the above excerpts to answer the user's question. If the excerpts don't contain relevant information, say so.
` : ''}`;
```

### 2.3 Handle Edge Cases
- [x] No documents in database → skip search entirely
- [x] No relevant chunks found → proceed without context
- [x] Embedding API fails → log warning, proceed without RAG
- [x] Empty user message → skip search

---

## Phase 3: Performance Optimization

### 3.1 Add Caching (Optional)
- [ ] Cache recent query embeddings (in-memory, 5 min TTL)
- [ ] Avoid regenerating embedding for repeated questions

### 3.2 Add Document Count Check
- [x] Before searching, check if any documents exist
- [x] Skip embedding generation if no documents
- [x] Add quick count query: `SELECT COUNT(*) FROM documents`

### 3.3 Limit Token Usage
- [x] Cap total context at ~4000 characters (configurable via maxContextLength)
- [x] Truncate when chunks exceed limit
- [x] Limit to top 5 most relevant chunks (configurable via limit)

---

## Phase 4: Testing & Logging

### 4.1 Add Logging
- [x] Log when RAG search is triggered
- [x] Log number of chunks found
- [x] Log search latency
- [x] Log when context is injected

### 4.2 Manual Testing
- [ ] Upload a document
- [ ] Ask a question about the document
- [ ] Verify AI uses the document content in response
- [ ] Ask an unrelated question, verify graceful fallback

---

## Files to Create/Modify

**New Files:**
```
packages/rag/src/retrieval.ts
```

**Modified Files:**
```
packages/rag/src/index.ts — add retrieval export
apps/backend/src/routes/chat.ts — integrate RAG
packages/ai/src/prompts/system.ts — update system prompt (optional)
```

---

## Implementation Order

1. **Phase 1.1-1.3** — Create retrieval function
2. **Phase 2.1-2.3** — Integrate into chat
3. **Phase 4.1-4.2** — Add logging and test
4. **Phase 3** — Optimize (defer to later if needed)

---

## Success Criteria

- [ ] User uploads a document about "pizza dough"
- [ ] User asks "How do I make pizza dough?"
- [ ] AI responds using content from the uploaded document
- [ ] AI attributes information to the document
- [ ] If no relevant documents, AI says it doesn't have that information
- [ ] Chat still works when no documents are uploaded

---

## Estimated Effort

| Phase | Tasks | Complexity |
|-------|-------|------------|
| Phase 1 | 3 | Low |
| Phase 2 | 3 | Medium |
| Phase 3 | 3 | Low (optional) |
| Phase 4 | 2 | Low |

**Total:** ~1-2 hours of implementation

---

## Notes

- RAG search adds ~100-300ms latency per message (embedding generation + vector search)
- Consider adding a loading indicator in the UI for the slight delay
- Future enhancement: Show sources in the chat UI
