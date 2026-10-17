import { createFileRoute, notFound, stripSearchParams } from "@tanstack/react-router"
import { sampleInvoices } from "@workspace/fixtures/invoices.ts"
import { InvoicePage } from "../../../../experiments/record-table.tsx"
import { tableSearch, tableSearchDefaults } from "../../../../experiments/record-table-model.ts"

export const Route = createFileRoute("/canvas/experiments/invoices/$invoiceId")({
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
  const { state } = Route.useSearch()
  return <InvoicePage invoice={invoice} state={state} />
}
