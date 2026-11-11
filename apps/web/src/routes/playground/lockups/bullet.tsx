import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { BulletPage } from "../../../playground/bullet-page.tsx"
import {
  playgroundSearch,
  playgroundSearchDefaults,
} from "../../../playground/playground-search.ts"
import { siteName } from "../../../site.ts"

export const Route = createFileRoute("/playground/lockups/bullet")({
  validateSearch: playgroundSearch,
  search: { middlewares: [stripSearchParams(playgroundSearchDefaults)] },
  head: () => ({
    meta: [
      { title: `Bullet · Playground · ${siteName}` },
      {
        name: "description",
        content:
          "Try the record details panel lockup, built from the bullet, avatar and preview card components, in every state, with your shadcn theme, then copy the code.",
      },
    ],
  }),
  component: BulletRoute,
})

function BulletRoute() {
  const search = Route.useSearch()
  const hydrated = useHydrated()
  return <BulletPage key={String(hydrated)} search={hydrated ? search : playgroundSearchDefaults} />
}
