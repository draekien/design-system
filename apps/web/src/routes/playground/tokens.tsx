import { createFileRoute } from "@tanstack/react-router"
import { TokensPage } from "../../playground/tokens-page.tsx"
import { siteName } from "../../site.ts"

export const Route = createFileRoute("/playground/tokens")({
  head: () => ({ meta: [{ title: `Tokens · Playground · ${siteName}` }] }),
  component: TokensPage,
})
