import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.test.{ts,tsx}", "src/**/__tests__/**/*.{ts,tsx}"],
    exclude: ["node_modules", "dist"],
    passWithNoTests: true,
    projects: ["packages/*", "apps/*"],
  },
});
