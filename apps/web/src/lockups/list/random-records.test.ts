import { describe, expect, it } from "vitest"
import { randomInvoiceLines, randomInvoices } from "./random-records.ts"

describe("randomInvoiceLines", () => {
  const invoices = randomInvoices(7, 25)

  it.each(invoices)("sums $id's lines to its amount to the cent", (invoice) => {
    const lines = randomInvoiceLines(invoice)
    if (lines.length === 0) {
      return
    }
    const cents = lines.reduce((sum, line) => sum + Math.round(line.amount * 100), 0)
    expect(cents).toBe(Math.round(invoice.amount * 100))
  })

  it("gives some invoices lines and some none", () => {
    const counts = new Set(invoices.map((invoice) => randomInvoiceLines(invoice).length))
    expect(counts.has(0)).toBe(true)
    expect([...counts].some((count) => count > 0)).toBe(true)
  })

  it("returns the same lines for the same invoice", () => {
    const invoice = invoices[0]
    if (invoice === undefined) {
      throw new Error("Seed 7 generates no invoices.")
    }
    expect(randomInvoiceLines(invoice)).toEqual(randomInvoiceLines(invoice))
  })
})
