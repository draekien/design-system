import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: WireframeIndex,
})

function WireframeIndex() {
  return (
    <main className="p-6">
      <h1 className="font-semibold text-xl">Wireframes</h1>
      <p className="text-muted-foreground text-sm">Pick a wireframe from the sidebar.</p>
    </main>
  )
}
