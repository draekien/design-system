import { createFileRoute, notFound } from "@tanstack/react-router"
import { sampleRecords } from "@workspace/fixtures/records.ts"
import { RecordPage } from "../../../../experiments/record-list.tsx"

export const Route = createFileRoute("/canvas/experiments/records/$recordId")({
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
  const { state } = Route.useSearch()
  return <RecordPage record={record} state={state} />
}
