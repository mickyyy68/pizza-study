import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "../../vitest.config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: "@repo/ui",
      environment: "happy-dom",
      setupFiles: ["./vitest.setup.ts"],
    },
  }),
);
