import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { CardPage } from "../../../playground/card-pages.tsx"
import {
  type PlaygroundSearch,
  playgroundSearch,
  playgroundSearchDefaults,
} from "../../../playground/playground-search.ts"
import { siteName } from "../../../site.ts"

export const Route = createFileRoute("/playground/lockups/metric-card")({
  validateSearch: playgroundSearch,
  search: { middlewares: [stripSearchParams(playgroundSearchDefaults)] },
  head: () => ({
    meta: [
      { title: `Metric card · Playground · ${siteName}` },
      {
        name: "description",
        content:
          "Try the metric card lockup, built from the card, figure and preview card components, in every state, with your shadcn theme, then copy the code.",
      },
    ],
  }),
  component: MetricCardRoute,
})

function MetricCardRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const hydrated = useHydrated()

  function handleSearchChange(patch: Partial<PlaygroundSearch>) {
    void navigate({
      search: (previous) => ({ ...previous, ...patch }),
      replace: true,
      resetScroll: false,
    })
  }

  return (
    <CardPage
      key={String(hydrated)}
      card="metric"
      search={hydrated ? search : playgroundSearchDefaults}
      onSearchChange={handleSearchChange}
    />
  )
}
