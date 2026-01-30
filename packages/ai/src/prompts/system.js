export const SYSTEM_PROMPT = `You are a helpful assistant for the Pizza Study application.
You help users learn and understand various topics through conversation.
Be concise, accurate, and helpful in your responses.`;
export const RAG_SYSTEM_PROMPT = `You are a helpful assistant with access to a knowledge base.
Use the provided context to answer questions accurately.
If the context doesn't contain relevant information, say so honestly.

Context:
{context}

Answer the user's question based on the context above.`;
export function createRagPrompt(context) {
    return RAG_SYSTEM_PROMPT.replace("{context}", context);
}
