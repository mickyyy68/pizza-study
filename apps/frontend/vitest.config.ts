import { resolve } from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "../../vitest.config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: "frontend",
      environment: "happy-dom",
      setupFiles: ["./vitest.setup.ts"],
    },
    resolve: {
      alias: {
        "@repo/ui": resolve(__dirname, "../../packages/ui/src"),
        "@repo/contracts": resolve(__dirname, "../../packages/contracts/src"),
        "@repo/utils": resolve(__dirname, "../../packages/utils/src"),
      },
    },
  }),
);
