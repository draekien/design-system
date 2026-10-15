/// <reference types="vitest/config" />
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const isTest = process.env.VITEST === "true"
const base = process.env.SITE_BASE_PATH || "/"

export default defineConfig({
  base,
  server: { port: 3000 },
  resolve: { tsconfigPaths: true },
  plugins: [
    !isTest && devtools(),
    !isTest && tailwindcss(),
    !isTest &&
      tanstackStart({
        importProtection: { behavior: "error" },
        pages: [
          { path: "/playground/record-list" },
          { path: "/playground/theme" },
          { path: "/canvas/record-list" },
        ],
        prerender: {
          enabled: true,
          crawlLinks: true,
          autoSubfolderIndex: true,
          filter: ({ path }) => !path.includes("?"),
        },
      }),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  test: {
    projects: [
      {
        extends: true,
        test: { name: "unit", environment: "jsdom", setupFiles: ["./src/setup.ts"] },
      },
    ],
  },
})
