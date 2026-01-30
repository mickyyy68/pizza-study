import { zValidator } from "@hono/zod-validator";
import { chatModel, SYSTEM_PROMPT } from "@repo/ai";
import { chatRequestSchema } from "@repo/contracts";
import { streamText } from "ai";
import { Hono } from "hono";
const chat = new Hono().post("/", zValidator("json", chatRequestSchema), async (c) => {
    const { messages } = c.req.valid("json");
    const result = streamText({
        model: chatModel,
        system: SYSTEM_PROMPT,
        messages,
    });
    return result.toDataStreamResponse();
});
export default chat;
