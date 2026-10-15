import { createFileRoute, notFound } from "@tanstack/react-router"
import { sampleRecords } from "@workspace/fixtures/records.ts"
import { RecordPage } from "../../record-list.tsx"
import { recordPageRules } from "../../record-list-rules.ts"
import { RuleNotes } from "../../rule-notes.tsx"

export const Route = createFileRoute("/records/$recordId")({
  loader: ({ params }) => {
    const record = sampleRecords.find((candidate) => candidate.id === params.recordId)
    if (record === undefined) {
      throw notFound()
    }
    return record
  },
  component: RecordRoute,
})

function RecordRoute() {
  const record = Route.useLoaderData()
  const { embed, state } = Route.useSearch()
  return embed ? (
    <RecordPage record={record} state={state} />
  ) : (
    <RuleNotes rules={recordPageRules} />
  )
}
