export const tableParts = [
  "select",
  "invoice",
  "lines",
  "child-rows",
  "paid",
  "due",
  "customer-card",
] as const

export type TablePart = (typeof tableParts)[number]
