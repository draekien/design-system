import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "tokens",
          environment: "node",
          include: ["tokens/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "components",
          environment: "jsdom",
          setupFiles: ["./test-setup.ts"],
          exclude: ["tokens/**", "**/node_modules/**"],
        },
      },
    ],
  },
})
