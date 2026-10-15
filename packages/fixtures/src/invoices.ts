/** A sample invoice's billing stage. */
export type InvoiceStatus = "draft" | "sent" | "paid"

/** A synthetic invoice for playground routes; no field holds real data. */
export type SampleInvoice = {
  id: string
  customer: string
  status: InvoiceStatus
  /** The amount due, in Australian dollars. */
  amount: number
  /** How much of the amount is paid, from 0 to 1. */
  paid: number
  /** The customer's billing contact. */
  contact: string
  /** When the invoice is due, as an ISO 8601 string. */
  dueIso: string
  /** The absolute due date, for example `"22 Oct 2026"`. */
  dueAt: string
  summary: string
}

/** Four synthetic invoices, soonest due first. */
export const sampleInvoices: readonly SampleInvoice[] = [
  {
    id: "INV-2041",
    customer: "Northwind Freight",
    status: "sent",
    amount: 12_840.5,
    paid: 0.4,
    contact: "Priya Natarajan",
    dueIso: "2026-10-17T00:00:00Z",
    dueAt: "17 Oct 2026",
    summary: "Quarterly freight tracking licence, 40 seats, second of four instalments.",
  },
  {
    id: "INV-2040",
    customer: "Harbour & Vine",
    status: "paid",
    amount: 3_150,
    paid: 1,
    contact: "Tomás Ibarra",
    dueIso: "2026-10-12T00:00:00Z",
    dueAt: "12 Oct 2026",
    summary: "Onboarding workshop and two months of support for the Sydney office.",
  },
  {
    id: "INV-2039",
    customer: "Kestrel Analytics",
    status: "draft",
    amount: 48_200,
    paid: 0,
    contact: "Hannah Weiss",
    dueIso: "2026-11-01T00:00:00Z",
    dueAt: "1 Nov 2026",
    summary: "Annual enterprise renewal with a 12% volume discount, awaiting sign-off.",
  },
  {
    id: "INV-2038",
    customer: "Bluegum Health",
    status: "sent",
    amount: 7_425.75,
    paid: 0.75,
    contact: "Daniel Osei",
    dueIso: "2026-10-09T00:00:00Z",
    dueAt: "9 Oct 2026",
    summary: "Data migration services, final milestone after the 2 October cut-over.",
  },
]
