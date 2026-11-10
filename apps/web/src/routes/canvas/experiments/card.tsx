import { createFileRoute } from "@tanstack/react-router"
import { CardLockup } from "../../../experiments/card.tsx"
import { CardConstellation } from "../../../experiments/card-drawing.tsx"

export const Route = createFileRoute("/canvas/experiments/card")({
  head: () => ({ meta: [{ title: "Card canvas" }] }),
  component: CardCanvasRoute,
})

function CardCanvasRoute() {
  const { state, view } = Route.useSearch()
  return (
    <main className={view === "lockup" ? "p-4 sm:p-6" : "h-svh"}>
      <h1 className="sr-only">Cards</h1>
      {view === "lockup" ? <CardLockup state={state} /> : <CardConstellation state={state} />}
    </main>
  )
}
