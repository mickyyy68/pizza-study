import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { CalendarPage } from "./pages/calendar/CalendarPage";
import { ChatPageNew } from "./pages/chat/ChatPageNew";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { DocumentsPage } from "./pages/documents/DocumentsPage";
import { UploadDocumentPage } from "./pages/documents/UploadDocumentPage";

/**
 * Route definitions for Pizza Study.
 *
 * All routes are wrapped in RootLayout which provides:
 * - Unified sidebar navigation (with conditional chat sections on /chat)
 * - Chat slide-over panel
 * - Global keyboard shortcuts
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Redirect root to dashboard
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      // Dashboard - home view
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      // Documents - library view
      {
        path: "documents",
        element: <DocumentsPage />,
      },
      // Upload documents
      {
        path: "documents/upload",
        element: <UploadDocumentPage />,
      },
      // Calendar - day-focused planning
      {
        path: "calendar",
        element: <CalendarPage />,
      },
      // Chat - full page chat (uses unified sidebar with chat sections)
      {
        path: "chat",
        element: <ChatPageNew />,
      },
    ],
  },
]);
