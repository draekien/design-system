import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { CanvasDocument, type CanvasMessageSearch } from "../../../playground/canvas-frame.tsx"
import { canvasPointerSearch, canvasSearch } from "../../../playground/playground-search.ts"
import { TableCanvas } from "../../../playground/table-canvas.tsx"

const search = canvasSearch.extend(canvasPointerSearch.shape)

const defaults = search.parse({})

export const Route = createFileRoute("/canvas/lockups/table")({
  validateSearch: search,
  search: { middlewares: [stripSearchParams(defaults)] },
  head: () => ({ meta: [{ title: "Table canvas" }, { name: "robots", content: "noindex" }] }),
  component: TableCanvasRoute,
})

function TableCanvasRoute() {
  const current = Route.useSearch()
  const navigate = Route.useNavigate()
  const hydrated = useHydrated()
  const options = hydrated ? current : defaults

  function handleFrameNavigate(next: CanvasMessageSearch) {
    void navigate({ search: next, replace: true, resetScroll: false })
  }

  return (
    <CanvasDocument search={options} schema={search} onFrameNavigate={handleFrameNavigate}>
      <TableCanvas options={options} />
    </CanvasDocument>
  )
}
