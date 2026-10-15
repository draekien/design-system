import { createFileRoute } from "@tanstack/react-router"
import { ThemePage } from "../../playground/theme-page.tsx"

export const Route = createFileRoute("/playground/theme")({
  head: () => ({ meta: [{ title: "Canvas theme · Playground · {{design-system}}" }] }),
  component: ThemePage,
})
