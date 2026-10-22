import * as React from "react"
import { Figure } from "@/components/figure.tsx"
import {
  List,
  ListRow,
  ListRowFact,
  ListRowId,
  ListRowLink,
  ListRowName,
  ListRowPeek,
  ListRowSubject,
} from "@/components/list.tsx"

const invoices = [
  { id: "INV-2041", name: "Harbour Print Co.", total: 12_840.5, missing: null },
  { id: "INV-2042", name: "Northside Logistics", total: 3_215, missing: "unavailable" },
  { id: "INV-2043", name: "Lumen Studio", total: 8_400, missing: "hidden" },
] as const

export function ListMissing(): React.ReactElement {
  const hintId = React.useId()
  return (
    <div className="w-full">
      <List aria-label="Invoices" aria-describedby={hintId}>
        {invoices.map((invoice) => (
          <ListRow key={invoice.id} value={invoice.id}>
            <ListRowLink href={`#${invoice.id}`}>
              <ListRowSubject>
                <ListRowId narrow="hide">{invoice.id}</ListRowId>
                <ListRowName>{invoice.name}</ListRowName>
              </ListRowSubject>
              {invoice.missing === null ? (
                <ListRowFact>
                  <Figure
                    value={invoice.total}
                    format={{ style: "currency", currency: "AUD" }}
                    locale="en-AU"
                  />
                </ListRowFact>
              ) : (
                <ListRowFact missing={invoice.missing} />
              )}
            </ListRowLink>
            <ListRowPeek />
          </ListRow>
        ))}
      </List>
      <p id={hintId} className="px-2 pt-3 text-muted-foreground text-xs">
        ↑ ↓ move between rows · Space peeks the focused row
      </p>
    </div>
  )
}
