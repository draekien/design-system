import { createFileRoute } from "@tanstack/react-router"
import { ThemePage } from "../../playground/theme-page.tsx"
import { siteName } from "../../site.ts"

export const Route = createFileRoute("/playground/theme")({
  head: () => ({ meta: [{ title: `Canvas theme · Playground · ${siteName}` }] }),
  component: ThemePage,
})
