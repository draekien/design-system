import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import {
  playgroundSearch,
  playgroundSearchDefaults,
} from "../../../playground/playground-search.ts"
import { RecordListPage } from "../../../playground/record-list-page.tsx"
import { siteName } from "../../../site.ts"

export const Route = createFileRoute("/playground/lockups/record-list")({
  validateSearch: playgroundSearch,
  search: { middlewares: [stripSearchParams(playgroundSearchDefaults)] },
  head: () => ({
    meta: [
      { title: `Record list · Playground · ${siteName}` },
      {
        name: "description",
        content:
          "Try the record list lockup, built from the record-list item and the content components, in every state, with your data volume and your shadcn theme, then copy the code.",
      },
    ],
  }),
  component: RecordListRoute,
})

function RecordListRoute() {
  const search = Route.useSearch()
  const hydrated = useHydrated()
  return (
    <RecordListPage key={String(hydrated)} search={hydrated ? search : playgroundSearchDefaults} />
  )
}
