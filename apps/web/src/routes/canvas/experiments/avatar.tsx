import { createFileRoute } from "@tanstack/react-router"
import { AvatarConstellation } from "../../../experiments/avatar-drawing.tsx"
import { AvatarLockup } from "../../../experiments/avatar-lockup.tsx"

export const Route = createFileRoute("/canvas/experiments/avatar")({
  head: () => ({ meta: [{ title: "Avatar canvas" }] }),
  component: AvatarCanvasRoute,
})

function AvatarCanvasRoute() {
  const { state, view } = Route.useSearch()
  return (
    <main className={view === "lockup" ? "p-4 sm:p-6" : "h-svh"}>
      <h1 className="sr-only">People</h1>
      {view === "lockup" ? <AvatarLockup state={state} /> : <AvatarConstellation state={state} />}
    </main>
  )
}
