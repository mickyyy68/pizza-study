import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import { errorMiddleware } from "./middleware/error";
import { loggingMiddleware } from "./middleware/logging";
import app from "./routes";

const server = new Hono();

// Apply middleware
server.use("*", corsMiddleware);
server.use("*", errorMiddleware);
server.use("*", loggingMiddleware);

// Mount routes
server.route("/", app);

const port = 3000;
console.log(`Server running on http://localhost:${port}`);

export default {
  port,
  fetch: server.fetch,
};
