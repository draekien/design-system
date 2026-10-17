import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { RecordTableLockup } from "../record-table.tsx"
import { RecordTableConstellation } from "../record-table-drawing.tsx"
import { tableSearch, tableSearchDefaults } from "../record-table-model.ts"
import { recordTableRules } from "../record-table-rules.ts"
import { RuleNotes } from "../rule-notes.tsx"

export const Route = createFileRoute("/record-table")({
  validateSearch: tableSearch,
  search: { middlewares: [stripSearchParams(tableSearchDefaults)] },
  component: RecordTableRoute,
})

function RecordTableRoute() {
  const { embed, state, view } = Route.useSearch()
  if (!embed) {
    return <RuleNotes rules={recordTableRules} />
  }
  return (
    <main className="p-4 pb-24 sm:p-6 sm:pb-24">
      <h1 className="sr-only">Invoices</h1>
      {view === "lockup" ? (
        <RecordTableLockup state={state} />
      ) : (
        <RecordTableConstellation state={state} />
      )}
    </main>
  )
}
