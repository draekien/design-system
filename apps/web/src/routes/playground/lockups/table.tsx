import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import {
  playgroundSearch,
  playgroundSearchDefaults,
} from "../../../playground/playground-search.ts"
import { TablePage } from "../../../playground/table-page.tsx"
import { siteName } from "../../../site.ts"

export const Route = createFileRoute("/playground/lockups/table")({
  validateSearch: playgroundSearch,
  search: { middlewares: [stripSearchParams(playgroundSearchDefaults)] },
  head: () => ({
    meta: [
      { title: `Table · Playground · ${siteName}` },
      {
        name: "description",
        content:
          "Try the table lockup, built from the table and preview card components, in every state, with your shadcn theme, then copy the code.",
      },
    ],
  }),
  component: TableRoute,
})

function TableRoute() {
  const search = Route.useSearch()
  const hydrated = useHydrated()
  return <TablePage key={String(hydrated)} search={hydrated ? search : playgroundSearchDefaults} />
}
