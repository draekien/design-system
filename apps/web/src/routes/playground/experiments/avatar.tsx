import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { avatarRules } from "../../../experiments/avatar-rules.ts"
import { ExperimentPage } from "../../../experiments/experiment-page.tsx"
import {
  experimentSearch,
  experimentSearchDefaults,
} from "../../../experiments/experiment-search.ts"
import { siteName } from "../../../site.ts"

const DESCRIPTION =
  "The greyscale wireframe of an avatar, one person or team drawn as initials, and of a group of avatars that overlap at rest and spread apart when hovered, focused or opened."

export const Route = createFileRoute("/playground/experiments/avatar")({
  validateSearch: experimentSearch,
  search: { middlewares: [stripSearchParams(experimentSearchDefaults)] },
  head: () => ({
    meta: [
      { title: `Avatar · Experiments · Playground · ${siteName}` },
      { name: "description", content: DESCRIPTION },
    ],
  }),
  component: AvatarExperiment,
})

const ruleSections = [{ title: "Rules this wireframe encodes", rules: avatarRules }]

function AvatarExperiment() {
  const search = Route.useSearch()
  const hydrated = useHydrated()
  return (
    <ExperimentPage
      key={String(hydrated)}
      title="Avatar"
      description={DESCRIPTION}
      canvas="/canvas/experiments/avatar"
      search={hydrated ? search : experimentSearchDefaults}
      ruleSections={ruleSections}
    />
  )
}
