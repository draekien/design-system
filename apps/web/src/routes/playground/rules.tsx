import { createFileRoute } from "@tanstack/react-router"
import { RulesPage } from "../../playground/rules-page.tsx"
import { siteName } from "../../site.ts"

export const Route = createFileRoute("/playground/rules")({
  head: () => ({
    meta: [
      { title: `Rules · Playground · ${siteName}` },
      {
        name: "description",
        content:
          "The rules this design system's components follow, including the five ranks that decide where each value appears and how it is reached.",
      },
    ],
  }),
  component: RulesPage,
})
