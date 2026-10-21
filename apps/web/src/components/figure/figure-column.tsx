import type * as React from "react"
import { Figure } from "@/components/figure.tsx"

const invoices = [
  { id: "INV-2041", name: "Northwind Traders", amount: 12_840.5 },
  { id: "INV-2042", name: "Contoso Pty Ltd", amount: 960 },
  { id: "INV-2043", name: "Fabrikam Industries", amount: -1_250.75 },
]

export function FigureColumn(): React.ReactElement {
  return (
    <div className="flex w-72 flex-col gap-2 text-sm">
      {invoices.map((invoice) => (
        <div key={invoice.id} className="flex items-center gap-4">
          <span className="truncate">{invoice.name}</span>
          <Figure
            value={invoice.amount}
            format={{ style: "currency", currency: "AUD" }}
            locale="en-AU"
          />
        </div>
      ))}
    </div>
  )
}
