import { createFileRoute, notFound } from "@tanstack/react-router"
import { ComponentPage } from "../../../playground/component-page.tsx"
import { libItems } from "../../../playground/registry-items.ts"
import { siteName } from "../../../site.ts"

export const Route = createFileRoute("/playground/lib/$item")({
  loader: ({ params }) => {
    const item = libItems.find((candidate) => candidate.name === params.item)
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
  component: LibRoute,
})

function LibRoute() {
  const item = Route.useLoaderData()
  return <ComponentPage key={item.name} item={item} />
}
