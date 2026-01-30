import { tool } from "ai";
import { z } from "zod";

export const mockRagTool = tool({
  description: "Search for information in the user's uploaded documents.",
  parameters: z.object({
    query: z.string().describe("The search query to find relevant documents"),
  }),
  execute: async ({ query }) => {
    // Mock delay to simulate network call
    await new Promise((resolve) => setTimeout(resolve, 500));

    return `
      [MOCK RAG RESULTS]
      Found 2 relevant documents for query: "${query}"
      
      Document 1 (pizza_history.txt):
      "Naples is often credited as the birthplace of pizza. In 1889, pizzaiolo Raffaele Esposito created the Pizza Margherita specifically for Queen Margherita of Savoy."
      
      Document 2 (dough_recipe.txt):
      "The secret to a good pizza dough is high hydration and a long fermentation period (at least 24 hours). Use 00 flour for best results."
    `;
  },
});
