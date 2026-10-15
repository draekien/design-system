import { createFileRoute } from "@tanstack/react-router"
import { RecordListCanvas } from "../record-list.tsx"
import { recordListRules } from "../record-list-rules.ts"
import { RuleNotes } from "../rule-notes.tsx"

export const Route = createFileRoute("/record-list")({
  component: RecordListRoute,
})

function RecordListRoute() {
  const { embed, state, view } = Route.useSearch()
  return embed ? (
    <RecordListCanvas state={state} view={view} />
  ) : (
    <RuleNotes rules={recordListRules} />
  )
}
