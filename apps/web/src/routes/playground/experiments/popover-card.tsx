import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { ExperimentPage } from "../../../experiments/experiment-page.tsx"
import {
  experimentSearch,
  experimentSearchDefaults,
} from "../../../experiments/experiment-search.ts"
import { popoverCardRules } from "../../../experiments/popover-card-rules.ts"
import { siteName } from "../../../site.ts"

const DESCRIPTION =
  "The greyscale wireframe of a popover card: a card about one value that opens on press and holds actions, where a ⋮ menu replaces the card's parts instead of opening a second popup."

export const Route = createFileRoute("/playground/experiments/popover-card")({
  validateSearch: experimentSearch,
  search: { middlewares: [stripSearchParams(experimentSearchDefaults)] },
  head: () => ({
    meta: [
      { title: `Popover card · Experiments · Playground · ${siteName}` },
      { name: "description", content: DESCRIPTION },
    ],
  }),
  component: PopoverCardExperiment,
})

const ruleSections = [{ title: "Rules this wireframe encodes", rules: popoverCardRules }]

function PopoverCardExperiment() {
  const search = Route.useSearch()
  const hydrated = useHydrated()
  return (
    <ExperimentPage
      key={String(hydrated)}
      title="Popover card"
      description={DESCRIPTION}
      canvas="/canvas/experiments/popover-card"
      search={hydrated ? search : experimentSearchDefaults}
      ruleSections={ruleSections}
    />
  )
}
