import {
  type InvoiceStatus,
  type SampleInvoice,
  type SampleInvoiceLine,
  sampleInvoiceLines,
  sampleInvoices,
} from "@workspace/fixtures/invoices.ts"
import { fixtureNow } from "@workspace/fixtures/records.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import { randomInvoiceLines } from "../list/random-records.ts"
import { type TablePart, tableParts } from "./table-parts.ts"

export type RowState = Exclude<FixtureState, "error" | "loading">

export type Column = "invoice" | "customer" | "lines" | "amount" | "paid" | "due"

export type Sort = { column: Column; direction: "ascending" | "descending" }

const statusOrder: ReadonlyArray<InvoiceStatus> = ["draft", "sent", "paid"]

export const statusLabel: Readonly<Record<InvoiceStatus, string>> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
}

export const columnLabel: Readonly<Record<Column, string>> = {
  invoice: "Invoice",
  customer: "Customer",
  lines: "Lines",
  amount: "Amount (AUD)",
  paid: "Paid %",
  due: "Due",
}

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

const sampleIds = new Set(sampleInvoices.map((invoice) => invoice.id))

const randomLines = new WeakMap<SampleInvoice, ReadonlyArray<SampleInvoiceLine>>()

export function linesOf(invoice: SampleInvoice): ReadonlyArray<SampleInvoiceLine> {
  if (sampleIds.has(invoice.id)) {
    return linesByInvoice.get(invoice.id) ?? []
  }
  const lines = randomLines.get(invoice) ?? randomInvoiceLines(invoice)
  randomLines.set(invoice, lines)
  return lines
}

export function compareInvoices(column: Column, a: SampleInvoice, b: SampleInvoice): number {
  switch (column) {
    case "invoice":
      return a.id.localeCompare(b.id)
    case "customer":
      return a.customer.localeCompare(b.customer)
    case "lines":
      return linesOf(a).length - linesOf(b).length
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
    case "lines":
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

export function statusGroups(
  invoices: ReadonlyArray<SampleInvoice>,
  sort: Sort
): ReadonlyArray<StatusGroup> {
  return statusOrder
    .map((status) => ({
      status,
      invoices: sorted(
        invoices.filter((invoice) => invoice.status === status),
        sort,
        compareInvoices
      ),
    }))
    .filter((group) => group.invoices.length > 0)
}

export function groupSum(group: StatusGroup): number {
  return group.invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
}

export function groupLineCount(group: StatusGroup): number {
  return group.invoices.reduce((sum, invoice) => sum + linesOf(invoice).length, 0)
}

export const columns: ReadonlyArray<Column> = [
  "invoice",
  "customer",
  "lines",
  "amount",
  "paid",
  "due",
]

export function shownColumns(hidden: ReadonlySet<TablePart>): ReadonlyArray<Column> {
  return columns.filter((column) => !tableParts.some((part) => part === column && hidden.has(part)))
}

export function isColumn(value: string): value is Column {
  return columns.some((column) => column === value)
}

export function groupValue(status: InvoiceStatus): string {
  return `group:${status}`
}

export function invoiceCount(count: number): string {
  return count === 1 ? "1 invoice" : `${count} invoices`
}
