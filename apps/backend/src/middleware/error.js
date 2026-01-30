export async function errorMiddleware(c, next) {
    try {
        await next();
    }
    catch (err) {
        console.error("Unhandled error:", err);
        const message = err instanceof Error ? err.message : "Internal server error";
        const rawStatus = err.status ?? 500;
        // Ensure it's a valid contentful status code (not 101, etc.)
        const status = (rawStatus >= 200 ? rawStatus : 500);
        return c.json({ error: message }, status);
    }
}
