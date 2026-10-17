import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { RecordTableLockup } from "../../../experiments/record-table.tsx"
import { RecordTableConstellation } from "../../../experiments/record-table-drawing.tsx"
import { tableSearch, tableSearchDefaults } from "../../../experiments/record-table-model.ts"

export const Route = createFileRoute("/canvas/experiments/record-table")({
  validateSearch: tableSearch,
  search: { middlewares: [stripSearchParams(tableSearchDefaults)] },
  head: () => ({ meta: [{ title: "Record table canvas" }] }),
  component: RecordTableCanvasRoute,
})

function RecordTableCanvasRoute() {
  const { state, view } = Route.useSearch()
  return (
    <main className={view === "lockup" ? "p-4 pb-24 sm:p-6 sm:pb-24" : "h-svh"}>
      <h1 className="sr-only">Invoices</h1>
      {view === "lockup" ? (
        <RecordTableLockup state={state} />
      ) : (
        <RecordTableConstellation state={state} />
      )}
    </main>
  )
}
