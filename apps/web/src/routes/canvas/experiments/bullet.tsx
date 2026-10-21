import { createFileRoute } from "@tanstack/react-router"
import { BulletLockup } from "../../../experiments/bullet.tsx"
import { BulletConstellation } from "../../../experiments/bullet-drawing.tsx"

export const Route = createFileRoute("/canvas/experiments/bullet")({
  head: () => ({ meta: [{ title: "Bullet canvas" }] }),
  component: BulletCanvasRoute,
})

function BulletCanvasRoute() {
  const { state, view } = Route.useSearch()
  return (
    <main className={view === "lockup" ? "p-4 sm:p-6" : "h-svh"}>
      <h1 className="sr-only">Record details</h1>
      {view === "lockup" ? <BulletLockup state={state} /> : <BulletConstellation state={state} />}
    </main>
  )
}
