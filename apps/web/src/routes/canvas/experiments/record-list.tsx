import { createFileRoute } from "@tanstack/react-router"
import { RecordListCanvas } from "../../../experiments/record-list.tsx"

export const Route = createFileRoute("/canvas/experiments/record-list")({
  head: () => ({ meta: [{ title: "Record list canvas" }] }),
  component: RecordListCanvasRoute,
})

function RecordListCanvasRoute() {
  const { state, view } = Route.useSearch()
  return <RecordListCanvas state={state} view={view} />
}
