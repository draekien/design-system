import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { cardRules } from "../../../experiments/card-rules.ts"
import { ExperimentPage } from "../../../experiments/experiment-page.tsx"
import {
  experimentSearch,
  experimentSearchDefaults,
} from "../../../experiments/experiment-search.ts"
import { siteName } from "../../../site.ts"

const DESCRIPTION =
  "The greyscale wireframe of a card, one record's ranks in one container, drawn three ways: record cards in a grid, a summary of one record's properties and a metric with its change."

export const Route = createFileRoute("/playground/experiments/card")({
  validateSearch: experimentSearch,
  search: { middlewares: [stripSearchParams(experimentSearchDefaults)] },
  head: () => ({
    meta: [
      { title: `Card · Experiments · Playground · ${siteName}` },
      { name: "description", content: DESCRIPTION },
    ],
  }),
  component: CardExperiment,
})

const ruleSections = [{ title: "Rules this wireframe encodes", rules: cardRules }]

function CardExperiment() {
  const search = Route.useSearch()
  const hydrated = useHydrated()
  return (
    <ExperimentPage
      key={String(hydrated)}
      title="Card"
      description={DESCRIPTION}
      canvas="/canvas/experiments/card"
      search={hydrated ? search : experimentSearchDefaults}
      ruleSections={ruleSections}
    />
  )
}
