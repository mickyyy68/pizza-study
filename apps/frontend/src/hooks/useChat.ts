import { useChat as useAIChat } from "@ai-sdk/react";

export function useChat() {
  return useAIChat({
    api: "http://localhost:3000/api/chat",
  });
}
