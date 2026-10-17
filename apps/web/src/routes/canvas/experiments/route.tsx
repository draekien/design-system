import {
  createFileRoute,
  Outlet,
  retainSearchParams,
  stripSearchParams,
  useHydrated,
  useNavigate,
} from "@tanstack/react-router"
import {
  type ExperimentCanvasSearch,
  experimentCanvasDefaults,
  experimentCanvasSearch,
} from "../../../experiments/experiment-search.ts"
import { CanvasDocument } from "../../../playground/canvas-frame.tsx"

export const Route = createFileRoute("/canvas/experiments")({
  validateSearch: experimentCanvasSearch,
  search: {
    middlewares: [
      retainSearchParams(experimentCanvasSearch.keyof().options),
      stripSearchParams(experimentCanvasDefaults),
    ],
  },
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: ExperimentCanvasRoute,
})

function ExperimentCanvasRoute() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const hydrated = useHydrated()

  function handleFrameNavigate(next: ExperimentCanvasSearch) {
    void navigate({
      to: ".",
      search: (previous) => ({ ...previous, ...next }),
      replace: true,
      resetScroll: false,
    })
  }

  return (
    <CanvasDocument
      search={hydrated ? search : experimentCanvasDefaults}
      schema={experimentCanvasSearch}
      onFrameNavigate={handleFrameNavigate}
    >
      {hydrated ? <Outlet /> : null}
    </CanvasDocument>
  )
}
