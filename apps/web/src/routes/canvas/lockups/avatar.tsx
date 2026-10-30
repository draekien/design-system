import { createFileRoute, stripSearchParams, useHydrated } from "@tanstack/react-router"
import { AvatarCanvas } from "../../../playground/avatar-canvas.tsx"
import { CanvasDocument, type CanvasMessageSearch } from "../../../playground/canvas-frame.tsx"
import { canvasPointerSearch, canvasSearch } from "../../../playground/playground-search.ts"

const search = canvasSearch.extend(canvasPointerSearch.shape)

const defaults = search.parse({})

export const Route = createFileRoute("/canvas/lockups/avatar")({
  validateSearch: search,
  search: { middlewares: [stripSearchParams(defaults)] },
  head: () => ({ meta: [{ title: "Avatar canvas" }, { name: "robots", content: "noindex" }] }),
  component: AvatarCanvasRoute,
})

function AvatarCanvasRoute() {
  const current = Route.useSearch()
  const navigate = Route.useNavigate()
  const hydrated = useHydrated()
  const options = hydrated ? current : defaults

  function handleFrameNavigate(next: CanvasMessageSearch) {
    void navigate({ search: next, replace: true, resetScroll: false })
  }

  return (
    <CanvasDocument search={options} schema={search} onFrameNavigate={handleFrameNavigate}>
      <AvatarCanvas options={options} />
    </CanvasDocument>
  )
}
