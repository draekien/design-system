import { createFileRoute } from "@tanstack/react-router"
import { ThemePage } from "../../playground/theme-page.tsx"
import { siteName } from "../../site.ts"

export const Route = createFileRoute("/playground/tokens")({
  head: () => ({ meta: [{ title: `Tokens · Playground · ${siteName}` }] }),
  component: ThemePage,
})
