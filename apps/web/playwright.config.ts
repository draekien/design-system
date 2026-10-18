import { defineConfig } from "@playwright/test"

const port = 4317

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  workers: "100%",
  forbidOnly: process.env.CI !== undefined,
  reporter: process.env.CI === undefined ? [["list"], ["html", { open: "never" }]] : "github",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}-{platform}{ext}",
  use: { baseURL: `http://localhost:${port}`, browserName: "chromium" },
  projects: [
    { name: "a11y", testMatch: "a11y.e2e.ts" },
    { name: "screenshots", testMatch: "screenshots.e2e.ts" },
  ],
  webServer: {
    command: `pnpm exec vite preview --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: process.env.CI === undefined,
  },
})
