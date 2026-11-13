import { createFileRoute } from "@tanstack/react-router"
import { PopoverCardLockup } from "../../../experiments/popover-card.tsx"
import { PopoverCardConstellation } from "../../../experiments/popover-card-drawing.tsx"

export const Route = createFileRoute("/canvas/experiments/popover-card")({
  head: () => ({ meta: [{ title: "Popover card canvas" }] }),
  component: PopoverCardCanvasRoute,
})

function PopoverCardCanvasRoute() {
  const { state, view } = Route.useSearch()
  return (
    <main className={view === "lockup" ? "p-4 sm:p-6" : "h-svh"}>
      <h1 className="sr-only">Record people</h1>
      {view === "lockup" ? (
        <PopoverCardLockup state={state} />
      ) : (
        <PopoverCardConstellation state={state} />
      )}
    </main>
  )
}
