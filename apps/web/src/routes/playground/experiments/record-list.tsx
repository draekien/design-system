import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { ExperimentPage } from "../../../experiments/experiment-page.tsx"
import {
  experimentSearch,
  experimentSearchDefaults,
} from "../../../experiments/experiment-search.ts"
import { recordListRules, recordPageRules } from "../../../experiments/record-list-rules.ts"

const DESCRIPTION =
  "The greyscale wireframe of a list of records, one row each, before it became the record list lockup."

export const Route = createFileRoute("/playground/experiments/record-list")({
  validateSearch: experimentSearch,
  search: { middlewares: [stripSearchParams(experimentSearchDefaults)] },
  head: () => ({
    meta: [
      { title: "Record list · Experiments · Playground · {{design-system}}" },
      { name: "description", content: DESCRIPTION },
    ],
  }),
  component: RecordListExperiment,
})

const ruleSections = [
  { title: "Rules this wireframe encodes", rules: recordListRules },
  { title: "Record page", rules: recordPageRules },
]

function RecordListExperiment() {
  const search = Route.useSearch()
  const hydrated = useHydrated()
  return (
    <ExperimentPage
      key={String(hydrated)}
      title="Record list"
      description={DESCRIPTION}
      canvas="/canvas/experiments/record-list"
      search={hydrated ? search : experimentSearchDefaults}
      ruleSections={ruleSections}
    />
  )
}
