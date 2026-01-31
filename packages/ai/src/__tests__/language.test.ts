import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { streamPersonalityChat, streamRagChat } from "../agents";

// Mock the 'ai' module
vi.mock("ai", async () => {
  return {
    streamText: vi.fn(),
    convertToCoreMessages: (msgs: unknown) => msgs,
    tool: (t: unknown) => t,
  };
});

import { streamText } from "ai";

describe("AI Agents Language Support", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock return
    (streamText as Mock).mockReturnValue({
      textStream: (async function* () {
        yield "";
      })(),
      toDataStreamResponse: () => new Response(),
    });
  });

  describe("RAG Chat", () => {
    it("should inject Italian language instruction into system prompt", async () => {
      // Since we mocked convertToCoreMessages to identity, we pass array directly
      const messages = [{ role: "user", content: "Test" }] as Parameters<
        typeof streamRagChat
      >[0];
      await streamRagChat(messages, "Italian");

      expect(streamText).toHaveBeenCalledTimes(1);
      const callArgs = (streamText as Mock).mock.calls[0][0] as {
        system: string;
      };

      expect(callArgs.system).toContain("ALWAYS Answer in Italian");
    });

    it("should default to English language instruction", async () => {
      const messages = [{ role: "user", content: "Test" }] as Parameters<
        typeof streamRagChat
      >[0];
      await streamRagChat(messages);

      const callArgs = (streamText as Mock).mock.calls[0][0] as {
        system: string;
      };
      expect(callArgs.system).toContain("ALWAYS Answer in English");
    });
  });

  describe("Personality Chat", () => {
    it("should inject Spanish language instruction for personalities", async () => {
      const messages = [{ role: "user", content: "Test" }] as Parameters<
        typeof streamPersonalityChat
      >[0];
      await streamPersonalityChat(messages, "professor", "Spanish");

      const callArgs = (streamText as Mock).mock.calls[0][0] as {
        system: string;
      };
      expect(callArgs.system).toContain(
        "IMPORTANT: You must Answer in Spanish",
      );
    });
  });
});
