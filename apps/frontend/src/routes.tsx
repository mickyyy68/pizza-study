import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { CalendarPage } from "./pages/calendar/CalendarPage";
import { ChatPage } from "./pages/chat/ChatPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { DocumentsPage } from "./pages/documents/DocumentsPage";

/**
 * Route definitions for Pizza Study.
 *
 * All routes are wrapped in RootLayout which provides:
 * - Sidebar navigation
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
      // Calendar - day-focused planning
      {
        path: "calendar",
        element: <CalendarPage />,
      },
      // Chat - full page chat
      {
        path: "chat",
        element: <ChatPage />,
      },
    ],
  },
]);
