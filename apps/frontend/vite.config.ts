import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@repo/ui": resolve(__dirname, "../../packages/ui/src"),
      "@repo/contracts": resolve(__dirname, "../../packages/contracts/src"),
      "@repo/utils": resolve(__dirname, "../../packages/utils/src"),
      "@repo/ai": resolve(__dirname, "../../packages/ai/src"),
    },
  },
});
