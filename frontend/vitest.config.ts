/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import viteReact from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [viteReact()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    reporters: ["verbose"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "src/routeTree.gen.ts",
      ],
    },
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
  },
});
