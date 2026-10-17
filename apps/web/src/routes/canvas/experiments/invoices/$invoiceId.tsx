import { createFileRoute, notFound, stripSearchParams } from "@tanstack/react-router"
import { sampleInvoices } from "@workspace/fixtures/invoices.ts"
import { recordTableViews } from "../../../../experiments/record-table/iteration-views.ts"
import {
  tableSearch,
  tableSearchDefaults,
} from "../../../../experiments/record-table/table-search.ts"

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
  const { state, iteration } = Route.useSearch()
  const { InvoicePage } = recordTableViews(iteration)
  return <InvoicePage invoice={invoice} state={state} />
}
