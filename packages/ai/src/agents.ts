import { type CoreMessage, streamText } from "ai";
import { openrouter } from "./client";
import { chatModel, DEFAULT_CHAT_OPTIONS } from "./config";
import { PERSONALITIES, type PersonalityId } from "./prompts/personalities";
import { mockRagTool } from "./tools";

// --- RAG Agent ---

const getRagSystemPrompt = (language: string) => `
You are a specialized RAG (Retrieval-Augmented Generation) assistant.
CRITICAL RULE: You must ONLY answer questions using the information found in the documents provided by the "search_documents" tool.
If the information is not in the documents, strictly say "I cannot find that information in your documents."
Do not use your own external knowledge.

ALWAYS Answer in ${language}.
`;

export async function streamRagChat(
  messages: CoreMessage[],
  language = "English",
) {
  return streamText({
    model: chatModel,
    messages,
    system: getRagSystemPrompt(language),
    tools: {
      search_documents: mockRagTool,
    },
    maxSteps: 5, // Allow multi-step tool use
    ...DEFAULT_CHAT_OPTIONS,
  });
}

// --- Personality Chat Agent ---

export async function streamPersonalityChat(
  messages: CoreMessage[],
  personalityId: PersonalityId = "professor",
  language = "English",
) {
  const personality = PERSONALITIES[personalityId] || PERSONALITIES.professor;

  const systemPrompt = `${personality.system}\n\nIMPORTANT: You must Answer in ${language}.`;

  return streamText({
    model: chatModel,
    messages,
    system: systemPrompt,
    ...DEFAULT_CHAT_OPTIONS,
  });
}
