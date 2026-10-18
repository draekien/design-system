import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { CanvasDocument, type CanvasMessageSearch } from "../../playground/canvas-frame.tsx"
import { canvasPointerSearch, canvasSearch } from "../../playground/playground-search.ts"
import { RecordListCanvas } from "../../playground/record-list-canvas.tsx"

const search = canvasSearch.extend(canvasPointerSearch.shape)

const defaults = search.parse({})

export const Route = createFileRoute("/canvas/record-list")({
  validateSearch: search,
  search: { middlewares: [stripSearchParams(defaults)] },
  head: () => ({ meta: [{ title: "Record list canvas" }, { name: "robots", content: "noindex" }] }),
  component: RecordListCanvasRoute,
})

function RecordListCanvasRoute() {
  const current = Route.useSearch()
  const navigate = Route.useNavigate()
  const hydrated = useHydrated()
  const options = hydrated ? current : defaults

  function handleFrameNavigate(next: CanvasMessageSearch) {
    void navigate({ search: next, replace: true, resetScroll: false })
  }

  return (
    <CanvasDocument search={options} schema={search} onFrameNavigate={handleFrameNavigate}>
      <RecordListCanvas options={options} />
      <img src="/favicon.svg" />
    </CanvasDocument>
  )
}
