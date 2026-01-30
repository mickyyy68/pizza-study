import { Hono } from "hono";
import chat from "./chat";
import documents from "./documents";
import health from "./health";
const app = new Hono()
    .route("/health", health)
    .route("/api/chat", chat)
    .route("/api/documents", documents);
export default app;
