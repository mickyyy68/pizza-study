/**
 * Available AI models for chat.
 *
 * Each model has a user-friendly name and description,
 * plus the actual model ID for OpenRouter.
 */

export interface ModelDefinition {
  /** OpenRouter model ID */
  id: string;
  /** User-friendly display name */
  name: string;
  /** Brief description of the model's strengths */
  description: string;
}

export const AVAILABLE_MODELS: ModelDefinition[] = [
  {
    id: "moonshotai/kimi-k2",
    name: "Kimi K2.5",
    description: "Great for reasoning & analysis",
  },
  {
    id: "minimax/minimax-m1",
    name: "Minimax M2.1",
    description: "Fast and versatile",
  },
  {
    id: "google/gemini-2.0-flash-001",
    name: "Gemini 3 Flash",
    description: "Quick responses, good for chat",
  },
];

/** Default model ID when none is selected */
export const DEFAULT_MODEL_ID = AVAILABLE_MODELS[0].id;

/** All valid model IDs as a type */
export type ModelId = (typeof AVAILABLE_MODELS)[number]["id"];

/** Check if a model ID is valid */
export function isValidModelId(id: string): id is ModelId {
  return AVAILABLE_MODELS.some((m) => m.id === id);
}

/** Get model definition by ID */
export function getModelById(id: string): ModelDefinition | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}
