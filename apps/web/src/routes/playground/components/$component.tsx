import { createFileRoute, notFound, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { ComponentPage } from "../../../playground/component-page.tsx"
import { componentSearch } from "../../../playground/playground-search.ts"
import { componentItems } from "../../../playground/registry-items.ts"
import { siteName } from "../../../site.ts"

const defaults = componentSearch.parse({})

export const Route = createFileRoute("/playground/components/$component")({
  validateSearch: componentSearch,
  search: { middlewares: [stripSearchParams(defaults)] },
  loader: ({ params }) => {
    const item = componentItems.find((candidate) => candidate.name === params.component)
    if (item === undefined) {
      throw notFound()
    }
    return item
  },
  head: ({ loaderData }) => ({
    meta:
      loaderData === undefined
        ? [{ title: `Not found · Playground · ${siteName}` }]
        : [
            { title: `${loaderData.title} · Playground · ${siteName}` },
            { name: "description", content: loaderData.description },
          ],
  }),
  component: ComponentRoute,
})

function ComponentRoute() {
  const item = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const hydrated = useHydrated()

  return (
    <ComponentPage
      key={item.name}
      item={item}
      tab={hydrated ? search.tab : defaults.tab}
      onTabChange={(tab) => void navigate({ search: { tab }, replace: true, resetScroll: false })}
    />
  )
}
