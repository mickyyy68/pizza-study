import { describe, expect, it } from "vitest";
import { streamPersonalityChat, streamRagChat } from "../agents";

// Helper to accumulate stream
async function collectStream(result: { textStream: AsyncIterable<string> }) {
  let text = "";
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk); // Stream to console to verify
    text += chunk;
  }
  process.stdout.write("\n\n");
  return text;
}

describe("AI Agents Demo", () => {
  // Increase timeout for AI calls
  const TIMEOUT = 30000;

  it(
    "should run RAG agent with mock tool",
    async () => {
      console.log("--- TESTING RAG AGENT (Query: 'Who invented pizza?') ---");
      const messages = [
        {
          role: "user",
          content: "Who invented pizza according to the documents?",
        },
      ];

      // @ts-expect-error - test messages format
      const result = await streamRagChat(messages);
      const text = await collectStream(result);

      expect(text).toContain("Raffaele Esposito");
    },
    TIMEOUT,
  );

  it(
    "should run Buddy personality",
    async () => {
      console.log("--- TESTING BUDDY AGENT ---");
      const messages = [{ role: "user", content: "Explain what an API is." }];

      // @ts-expect-error - test messages format
      const result = await streamPersonalityChat(messages, "buddy");
      const text = await collectStream(result);

      // Check for casual language (heuristic)
      expect(text.length).toBeGreaterThan(10);
    },
    TIMEOUT,
  );

  it(
    "should run Sarcastic personality",
    async () => {
      console.log("--- TESTING SARCASTIC AGENT ---");
      const messages = [
        { role: "user", content: "Is HTML a programming language?" },
      ];

      // @ts-expect-error - test messages format
      const result = await streamPersonalityChat(messages, "sarcastic");
      const text = await collectStream(result);

      expect(text.length).toBeGreaterThan(10);
    },
    TIMEOUT,
  );
});
