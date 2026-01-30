import { z } from "zod";
export const chatRequestSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
    })),
});
export const chatResponseSchema = z.object({
    reply: z.string(),
});
