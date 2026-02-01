import { Hono } from "hono";
import chat from "./chat";
import conversations from "./conversations";
import documents from "./documents";
import events from "./events";
import health from "./health";
import tasks from "./tasks";

const app = new Hono()
  .route("/health", health)
  .route("/api/chat", chat)
  .route("/api/conversations", conversations)
  .route("/api/documents", documents)
  .route("/api/tasks", tasks)
  .route("/api/events", events);

export type AppType = typeof app;
export default app;
