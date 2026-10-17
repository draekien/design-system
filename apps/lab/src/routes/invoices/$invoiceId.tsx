import { createFileRoute, notFound, stripSearchParams } from "@tanstack/react-router"
import { sampleInvoices } from "@workspace/fixtures/invoices.ts"
import { InvoicePage } from "../../record-table.tsx"
import { tableSearch, tableSearchDefaults } from "../../record-table-model.ts"
import { invoicePageRules } from "../../record-table-rules.ts"
import { RuleNotes } from "../../rule-notes.tsx"

export const Route = createFileRoute("/invoices/$invoiceId")({
  validateSearch: tableSearch,
  search: { middlewares: [stripSearchParams(tableSearchDefaults)] },
  loader: ({ params }) => {
    const invoice = sampleInvoices.find((candidate) => candidate.id === params.invoiceId)
    if (invoice === undefined) {
      throw notFound()
    }
    return invoice
  },
  component: InvoiceRoute,
})

function InvoiceRoute() {
  const invoice = Route.useLoaderData()
  const { embed, state } = Route.useSearch()
  return embed ? (
    <InvoicePage invoice={invoice} state={state} />
  ) : (
    <RuleNotes rules={invoicePageRules} />
  )
}
