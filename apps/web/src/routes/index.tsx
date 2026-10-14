import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { fixtureStateSearch } from "@workspace/fixtures/state.ts"
import { Home } from "../home.tsx"

export const Route = createFileRoute("/")({
  validateSearch: fixtureStateSearch,
  search: { middlewares: [stripSearchParams({ state: "loaded" })] },
  component: HomeRoute,
})

function HomeRoute() {
  const { state } = Route.useSearch()
  const hydrated = useHydrated()
  return <Home state={hydrated ? state : "loaded"} />
}
