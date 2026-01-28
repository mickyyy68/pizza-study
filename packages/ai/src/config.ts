import type { LanguageModelV1 } from "ai";
import { openrouter } from "./client";

// Chat model configuration
export const CHAT_MODEL = "minimax/minimax-m2.1";
export const chatModel: LanguageModelV1 = openrouter(CHAT_MODEL);

// Default parameters for chat completions
export const DEFAULT_CHAT_OPTIONS = {
  temperature: 0.7,
  maxTokens: 4096,
};

// Embedding model configuration
export const EMBEDDING_MODEL = "openai/text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;
