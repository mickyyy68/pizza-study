import type { LanguageModelV1 } from "ai";
import { openrouter } from "./client";

// Chat model configuration
export const CHAT_MODEL = "liquid/lfm-2.5-1.2b-instruct:free";
export const chatModel: LanguageModelV1 = openrouter(CHAT_MODEL);

// Default parameters for chat completions
export const DEFAULT_CHAT_OPTIONS = {
  temperature: 0.7,
  maxTokens: 4096,
};

// Embedding model configuration
export const EMBEDDING_MODEL = "liquid/lfm-2.5-1.2b-instruct:free";
export const EMBEDDING_DIMENSIONS = 1536;
