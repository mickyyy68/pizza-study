import { describe, it, expect, vi, beforeEach } from "vitest";
import { streamRagChat, streamPersonalityChat } from "../agents";
import { convertToCoreMessages } from "ai";

// Mock the 'ai' module, but handle importOriginal correctly for Bun/Vitest
vi.mock("ai", async () => {
    return {
        streamText: vi.fn(),
        convertToCoreMessages: (msgs: any) => msgs,
        tool: (t: any) => t
    };
});

import { streamText } from "ai";

describe("AI Agents Language Support", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock return using simple casting
        (streamText as any).mockReturnValue({
            textStream: (async function* () { yield ""; })(),
            toDataStreamResponse: () => new Response()
        });
    });

    describe("RAG Chat", () => {
        it("should inject Italian language instruction into system prompt", async () => {
            // Since we mocked convertToCoreMessages to identity, we pass array directly
            const messages = [{ role: "user", content: "Test" }] as any;
            await streamRagChat(messages, "Italian");

            expect(streamText).toHaveBeenCalledTimes(1);
            const callArgs = (streamText as any).mock.calls[0][0];

            expect(callArgs.system).toContain("ALWAYS Answer in Italian");
        });

        it("should default to English language instruction", async () => {
            const messages = [{ role: "user", content: "Test" }] as any;
            await streamRagChat(messages);

            const callArgs = (streamText as any).mock.calls[0][0];
            expect(callArgs.system).toContain("ALWAYS Answer in English");
        });
    });

    describe("Personality Chat", () => {
        it("should inject Spanish language instruction for personalities", async () => {
            const messages = [{ role: "user", content: "Test" }] as any;
            await streamPersonalityChat(messages, "professor", "Spanish");

            const callArgs = (streamText as any).mock.calls[0][0];
            expect(callArgs.system).toContain("IMPORTANT: You must Answer in Spanish");
        });
    });
});
