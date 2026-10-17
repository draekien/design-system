import {
  type InvoiceStatus,
  type SampleInvoice,
  type SampleInvoiceLine,
  sampleInvoiceLines,
  sampleInvoices,
} from "@workspace/fixtures/invoices.ts"
import { fixtureNow } from "@workspace/fixtures/records.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"

export type { TableSearch } from "../table-search.ts"

export type TableState = Exclude<FixtureState, "error">

export type RowState = Exclude<FixtureState, "error" | "loading">

export type Column = "invoice" | "customer" | "amount" | "paid" | "due"

export type Sort = { column: Column; direction: "ascending" | "descending" }

export const columns = ["invoice", "customer", "amount", "paid", "due"] as const

export type Seat = "select" | "expand" | Column | "peek"

export const statusOrder: ReadonlyArray<InvoiceStatus> = ["draft", "sent", "paid"]

export const statusLabel: Readonly<Record<InvoiceStatus, string>> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
}

export const columnLabel: Readonly<Record<Column, string>> = {
  invoice: "Invoice",
  customer: "Customer",
  amount: "Amount",
  paid: "Paid %",
  due: "Due",
}

export const seatClass: Readonly<Record<Seat, string>> = {
  select: "col-start-1 flex justify-center",
  expand: "col-start-2 flex",
  invoice: "col-start-3 hidden pr-3 sm:flex",
  customer: "col-start-4 flex min-w-0",
  amount: "col-start-5 flex justify-end pl-4",
  paid: "col-start-6 hidden justify-end pl-4 md:flex",
  due: "col-start-7 hidden justify-end pr-2 pl-4 sm:flex",
  peek: "col-start-8 flex justify-center",
}

export const numericColumns: ReadonlySet<Column> = new Set(["amount", "paid"])

export const gridClass =
  "grid grid-cols-[1.5rem_minmax(2.25rem,auto)_auto_minmax(0,1fr)_auto_auto_auto_1.5rem] pointer-coarse:grid-cols-[2.75rem_minmax(2.25rem,auto)_auto_minmax(0,1fr)_auto_auto_auto_2.75rem]"

export const rowClass = "col-span-full grid grid-cols-subgrid items-center gap-x-1 px-2"

export const focusRing = "focus-ring focus-visible:-outline-offset-2"

export const focusLook = "focus-look -outline-offset-2"

export const handleIgnore = (): undefined => undefined

export const cardSurface =
  "block w-56 max-w-full rounded-md border bg-background p-3 text-left text-xs font-normal shadow-sm"

const amountFormat = new Intl.NumberFormat("en-AU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

const dayMs = 86_400_000

export function formatAmount(amount: number): string {
  return amountFormat.format(amount).replace("-", "−")
}

export function formatPaid(paid: number): string {
  return `${Math.round(paid * 100)}%`
}

export type DueReading =
  | { kind: "overdue"; text: string }
  | { kind: "upcoming"; text: string }
  | { kind: "settled"; text: string }

export function readDue(invoice: SampleInvoice): DueReading {
  const days = Math.round((Date.parse(invoice.dueIso) - Date.parse(fixtureNow)) / dayMs)
  const text = relativeFormat.format(days, "day")
  if (invoice.paid >= 1) {
    return { kind: "settled", text }
  }
  if (days < 0) {
    return { kind: "overdue", text: `Overdue ${-days} ${-days === 1 ? "day" : "days"}` }
  }
  return { kind: "upcoming", text }
}

const linesByInvoice = sampleInvoiceLines.reduce((map, line) => {
  map.set(line.invoiceId, [...(map.get(line.invoiceId) ?? []), line])
  return map
}, new Map<string, ReadonlyArray<SampleInvoiceLine>>())

export function linesOf(invoice: SampleInvoice): ReadonlyArray<SampleInvoiceLine> {
  return linesByInvoice.get(invoice.id) ?? []
}

export function compareInvoices(column: Column, a: SampleInvoice, b: SampleInvoice): number {
  switch (column) {
    case "invoice":
      return a.id.localeCompare(b.id)
    case "customer":
      return a.customer.localeCompare(b.customer)
    case "amount":
      return a.amount - b.amount
    case "paid":
      return a.paid - b.paid
    case "due":
      return a.dueIso.localeCompare(b.dueIso)
  }
}

export function compareLines(column: Column, a: SampleInvoiceLine, b: SampleInvoiceLine): number {
  switch (column) {
    case "customer":
      return a.description.localeCompare(b.description)
    case "amount":
      return a.amount - b.amount
    case "invoice":
    case "paid":
    case "due":
      return 0
  }
}

export function sorted<TItem>(
  items: ReadonlyArray<TItem>,
  sort: Sort,
  compare: (column: Column, a: TItem, b: TItem) => number
): ReadonlyArray<TItem> {
  const sign = sort.direction === "ascending" ? 1 : -1
  return [...items].sort((a, b) => sign * compare(sort.column, a, b))
}

export type StatusGroup = {
  status: InvoiceStatus
  invoices: ReadonlyArray<SampleInvoice>
}

export function statusGroups(sort: Sort): ReadonlyArray<StatusGroup> {
  return statusOrder
    .map((status) => ({
      status,
      invoices: sorted(
        sampleInvoices.filter((invoice) => invoice.status === status),
        sort,
        compareInvoices
      ),
    }))
    .filter((group) => group.invoices.length > 0)
}

export function groupSum(group: StatusGroup): number {
  return group.invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
}

export const rowGroupClass = "col-span-full grid grid-cols-subgrid"
