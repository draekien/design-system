import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { bulletRules } from "../../../experiments/bullet-rules.ts"
import { ExperimentPage } from "../../../experiments/experiment-page.tsx"
import {
  experimentSearch,
  experimentSearchDefaults,
} from "../../../experiments/experiment-search.ts"
import { siteName } from "../../../site.ts"

const DESCRIPTION =
  "The greyscale wireframe of a bullet, one fact drawn as icons and a label, in a record's details panel where each bullet opens a picker, a popover, a hover card or a link."

export const Route = createFileRoute("/playground/experiments/bullet")({
  validateSearch: experimentSearch,
  search: { middlewares: [stripSearchParams(experimentSearchDefaults)] },
  head: () => ({
    meta: [
      { title: `Bullet · Experiments · Playground · ${siteName}` },
      { name: "description", content: DESCRIPTION },
    ],
  }),
  component: BulletExperiment,
})

const ruleSections = [{ title: "Rules this wireframe encodes", rules: bulletRules }]

function BulletExperiment() {
  const search = Route.useSearch()
  const hydrated = useHydrated()
  return (
    <ExperimentPage
      key={String(hydrated)}
      title="Bullet"
      description={DESCRIPTION}
      canvas="/canvas/experiments/bullet"
      search={hydrated ? search : experimentSearchDefaults}
      ruleSections={ruleSections}
    />
  )
}
