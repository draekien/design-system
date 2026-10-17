import type { Iterations } from "../experiment-iteration.ts"
import { invoicePageRules, recordTableRules } from "./1/record-table-rules.ts"

export const recordTableIterations = [
  {
    n: 1,
    date: "2026-10-17",
    summary:
      "First wireframe: invoices grouped by status under sortable column headers, with expandable lines, peek, selection and an invoice page, after the critique fixes.",
    ruleSections: [
      { title: "Rules this wireframe encodes", rules: recordTableRules },
      { title: "Invoice page", rules: invoicePageRules },
    ],
  },
] as const satisfies Iterations

export type RecordTableIterationNumber = (typeof recordTableIterations)[number]["n"]
