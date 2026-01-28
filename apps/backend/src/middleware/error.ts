import type { Context, Next } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    console.error("Unhandled error:", err);

    const message =
      err instanceof Error ? err.message : "Internal server error";
    const rawStatus = (err as { status?: number }).status ?? 500;
    // Ensure it's a valid contentful status code (not 101, etc.)
    const status = (rawStatus >= 200 ? rawStatus : 500) as ContentfulStatusCode;

    return c.json({ error: message }, status);
  }
}
