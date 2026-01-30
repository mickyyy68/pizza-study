import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import "./styles/globals.css";

/**
 * Pizza Study - Main Entry Point
 *
 * Renders the application with:
 * - React 19 StrictMode for development warnings
 * - React Router for navigation
 * - Global styles with the warm Italian theme
 */

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Root element not found. Make sure there is a <div id='root'></div> in your HTML."
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
