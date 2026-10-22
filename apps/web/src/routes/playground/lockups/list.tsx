import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { ListPage } from "../../../playground/list-page.tsx"
import {
  playgroundSearch,
  playgroundSearchDefaults,
} from "../../../playground/playground-search.ts"
import { siteName } from "../../../site.ts"

export const Route = createFileRoute("/playground/lockups/list")({
  validateSearch: playgroundSearch,
  search: { middlewares: [stripSearchParams(playgroundSearchDefaults)] },
  head: () => ({
    meta: [
      { title: `List · Playground · ${siteName}` },
      {
        name: "description",
        content:
          "Try the list lockup, built from the list item and the content components, in every state, with your data volume and your shadcn theme, then copy the code.",
      },
    ],
  }),
  component: ListRoute,
})

function ListRoute() {
  const search = Route.useSearch()
  const hydrated = useHydrated()
  return <ListPage key={String(hydrated)} search={hydrated ? search : playgroundSearchDefaults} />
}
