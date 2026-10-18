import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { playgroundSearch, playgroundSearchDefaults } from "../../playground/playground-search.ts"
import { RecordListPage } from "../../playground/record-list-page.tsx"

export const Route = createFileRoute("/playground/record-list")({
  validateSearch: playgroundSearch,
  search: { middlewares: [stripSearchParams(playgroundSearchDefaults)] },
  head: () => ({
    meta: [
      { title: "Record list · Playground · design-system" },
      {
        name: "description",
        content:
          "Try the record-list and record-row registry items in every state, with your data volume and your shadcn theme, then copy the install command and code.",
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
