import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { recordTableViews } from "../../../experiments/record-table/iteration-views.ts"
import { tableSearch, tableSearchDefaults } from "../../../experiments/record-table/table-search.ts"

export const Route = createFileRoute("/canvas/experiments/record-table")({
  validateSearch: tableSearch,
  search: { middlewares: [stripSearchParams(tableSearchDefaults)] },
  head: () => ({ meta: [{ title: "Record table canvas" }] }),
  component: RecordTableCanvasRoute,
})

function RecordTableCanvasRoute() {
  const { state, view, iteration } = Route.useSearch()
  const { Lockup, Constellation } = recordTableViews(iteration)
  return (
    <main className={view === "lockup" ? "p-4 pb-24 sm:p-6 sm:pb-24" : "h-svh"}>
      <h1 className="sr-only">Invoices</h1>
      {view === "lockup" ? <Lockup state={state} /> : <Constellation state={state} />}
    </main>
  )
}
