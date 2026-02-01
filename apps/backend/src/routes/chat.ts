import { zValidator } from "@hono/zod-validator";
import { chatModel, SYSTEM_PROMPT } from "@repo/ai";
import { chatRequestSchema } from "@repo/contracts";
import { streamText } from "ai";
import { Hono } from "hono";

const chat = new Hono().post(
  "/",
  zValidator("json", chatRequestSchema),
  async (c) => {
    const { messages } = c.req.valid("json");

    const result = streamText({
      model: chatModel,
      system: SYSTEM_PROMPT,
      messages,
      maxRetries: 0,
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        console.error("AI chat error:", error);
        if (error instanceof Error) {
          return error.message;
        }
        try {
          return JSON.stringify(error);
        } catch {
          return "Unknown error";
        }
      },
    });
  },
);

export default chat;
