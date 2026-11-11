import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { CanvasDocument, type CanvasMessageSearch } from "../../../playground/canvas-frame.tsx"
import { CardCanvas } from "../../../playground/card-canvas.tsx"
import { canvasPointerSearch, canvasSearch } from "../../../playground/playground-search.ts"

const search = canvasSearch.extend(canvasPointerSearch.shape)

const defaults = search.parse({})

export const Route = createFileRoute("/canvas/lockups/summary-card")({
  validateSearch: search,
  search: { middlewares: [stripSearchParams(defaults)] },
  head: () => ({
    meta: [{ title: "Summary card canvas" }, { name: "robots", content: "noindex" }],
  }),
  component: SummaryCardCanvasRoute,
})

function SummaryCardCanvasRoute() {
  const current = Route.useSearch()
  const navigate = Route.useNavigate()
  const hydrated = useHydrated()
  const options = hydrated ? current : defaults

  function handleFrameNavigate(next: CanvasMessageSearch) {
    void navigate({ search: next, replace: true, resetScroll: false })
  }

  return (
    <CanvasDocument search={options} schema={search} onFrameNavigate={handleFrameNavigate}>
      <CardCanvas card="summary" options={options} />
    </CanvasDocument>
  )
}
