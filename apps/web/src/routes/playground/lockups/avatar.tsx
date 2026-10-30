import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { AvatarPage } from "../../../playground/avatar-page.tsx"
import {
  playgroundSearch,
  playgroundSearchDefaults,
} from "../../../playground/playground-search.ts"
import { siteName } from "../../../site.ts"

export const Route = createFileRoute("/playground/lockups/avatar")({
  validateSearch: playgroundSearch,
  search: { middlewares: [stripSearchParams(playgroundSearchDefaults)] },
  head: () => ({
    meta: [
      { title: `Avatar · Playground · ${siteName}` },
      {
        name: "description",
        content:
          "Try the people panel lockup, built from the avatar, entity and preview card components, in every state, with your shadcn theme, then copy the code.",
      },
    ],
  }),
  component: AvatarRoute,
})

function AvatarRoute() {
  const search = Route.useSearch()
  const hydrated = useHydrated()
  return <AvatarPage key={String(hydrated)} search={hydrated ? search : playgroundSearchDefaults} />
}
