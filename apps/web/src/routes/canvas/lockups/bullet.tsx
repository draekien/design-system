import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { BulletCanvas } from "../../../playground/bullet-canvas.tsx"
import { CanvasDocument, type CanvasMessageSearch } from "../../../playground/canvas-frame.tsx"
import { canvasPointerSearch, canvasSearch } from "../../../playground/playground-search.ts"

const search = canvasSearch.extend(canvasPointerSearch.shape)

const defaults = search.parse({})

export const Route = createFileRoute("/canvas/lockups/bullet")({
  validateSearch: search,
  search: { middlewares: [stripSearchParams(defaults)] },
  head: () => ({ meta: [{ title: "Bullet canvas" }, { name: "robots", content: "noindex" }] }),
  component: BulletCanvasRoute,
})

function BulletCanvasRoute() {
  const current = Route.useSearch()
  const navigate = Route.useNavigate()
  const hydrated = useHydrated()
  const options = hydrated ? current : defaults

  function handleFrameNavigate(next: CanvasMessageSearch) {
    void navigate({ search: next, replace: true, resetScroll: false })
  }

  return (
    <CanvasDocument search={options} schema={search} onFrameNavigate={handleFrameNavigate}>
      <BulletCanvas options={options} />
    </CanvasDocument>
  )
}
