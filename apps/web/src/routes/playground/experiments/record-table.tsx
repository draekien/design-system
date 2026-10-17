import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { ExperimentPage } from "../../../experiments/experiment-page.tsx"
import {
  experimentSearch,
  experimentSearchDefaults,
} from "../../../experiments/experiment-search.ts"
import { recordTableIterations } from "../../../experiments/record-table/iterations.ts"

const DESCRIPTION =
  "The greyscale wireframe of a table of invoices grouped by status, which readers compare down each column."

export const Route = createFileRoute("/playground/experiments/record-table")({
  validateSearch: experimentSearch,
  search: { middlewares: [stripSearchParams(experimentSearchDefaults)] },
  head: () => ({
    meta: [
      { title: "Record table · Experiments · Playground · {{design-system}}" },
      { name: "description", content: DESCRIPTION },
    ],
  }),
  component: RecordTableExperiment,
})

function RecordTableExperiment() {
  const search = Route.useSearch()
  const hydrated = useHydrated()
  return (
    <ExperimentPage
      key={String(hydrated)}
      title="Record table"
      description={DESCRIPTION}
      canvas="/canvas/experiments/record-table"
      search={hydrated ? search : experimentSearchDefaults}
      iterations={recordTableIterations}
    />
  )
}
