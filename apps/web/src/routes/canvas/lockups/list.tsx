import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { CanvasDocument, type CanvasMessageSearch } from "../../../playground/canvas-frame.tsx"
import { ListCanvas } from "../../../playground/list-canvas.tsx"
import { canvasPointerSearch, canvasSearch } from "../../../playground/playground-search.ts"

const search = canvasSearch.extend(canvasPointerSearch.shape)

const defaults = search.parse({})

export const Route = createFileRoute("/canvas/lockups/list")({
  validateSearch: search,
  search: { middlewares: [stripSearchParams(defaults)] },
  head: () => ({ meta: [{ title: "List canvas" }, { name: "robots", content: "noindex" }] }),
  component: ListCanvasRoute,
})

function ListCanvasRoute() {
  const current = Route.useSearch()
  const navigate = Route.useNavigate()
  const hydrated = useHydrated()
  const options = hydrated ? current : defaults

  function handleFrameNavigate(next: CanvasMessageSearch) {
    void navigate({ search: next, replace: true, resetScroll: false })
  }

  return (
    <CanvasDocument search={options} schema={search} onFrameNavigate={handleFrameNavigate}>
      <ListCanvas options={options} />
    </CanvasDocument>
  )
}
