import { createFileRoute } from "@tanstack/react-router"
import { fixtureStateSearch } from "@workspace/fixtures/state.ts"
import { RecordListWireframe } from "../record-list.tsx"

export const Route = createFileRoute("/record-list")({
  validateSearch: fixtureStateSearch,
  component: RecordListRoute,
})

function RecordListRoute() {
  const { state } = Route.useSearch()
  return <RecordListWireframe state={state} />
}
