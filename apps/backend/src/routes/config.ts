import { Hono } from "hono";

const config = new Hono().get("/", (c) => {
  const hasApiKey = Boolean(process.env.OPENROUTER_API_KEY);

  return c.json({
    ai: {
      configured: hasApiKey,
    },
  });
});

export default config;
