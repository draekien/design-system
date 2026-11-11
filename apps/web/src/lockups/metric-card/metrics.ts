import {
  outstandingLastMonth,
  overdueLastMonth,
  paidLastMonth,
  sampleInvoices,
} from "@workspace/fixtures/invoices.ts"
import { fixtureNow } from "@workspace/fixtures/records.ts"

/** One metric: its name, what it counts, this month's figure and last month's. */
export type Metric = Readonly<{
  name: string
  description: string
  amount: number
  previous: number
}>

const sent = sampleInvoices.filter((invoice) => invoice.status === "sent")

function unpaid(invoices: typeof sampleInvoices) {
  return invoices.reduce((sum, invoice) => sum + invoice.amount * (1 - invoice.paid), 0)
}

export const outstandingMetric: Metric = {
  name: "Outstanding",
  description: "Unpaid on sent invoices, AUD",
  amount: unpaid(sent),
  previous: outstandingLastMonth,
}

/** Outstanding, overdue and paid this month, from the sample invoices. */
export const metrics: ReadonlyArray<Metric> = [
  outstandingMetric,
  {
    name: "Overdue",
    description: "Unpaid past the due date, AUD",
    amount: unpaid(sent.filter((invoice) => invoice.dueIso < fixtureNow)),
    previous: overdueLastMonth,
  },
  {
    name: "Paid",
    description: "Received on invoices, AUD",
    amount: sampleInvoices.reduce((sum, invoice) => sum + invoice.amount * invoice.paid, 0),
    previous: paidLastMonth,
  },
]

/** Figures too wide for the metric card at full length, and a previous month of zero to compare against. */
export const worstMetrics: ReadonlyArray<{ amount: number; previous: number }> = [
  { amount: 12_345_678_901.23, previous: 24_691_357_802.46 },
  { amount: 9_560.74, previous: 0 },
]
