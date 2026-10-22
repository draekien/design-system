import type * as React from "react"
import { Figure } from "@/components/figure.tsx"
import {
  List,
  ListRow,
  ListRowFact,
  ListRowId,
  ListRowLink,
  ListRowName,
  ListRowSubject,
} from "@/components/list.tsx"
import { RelativeTime } from "@/components/relative-time.tsx"

const invoices = [
  {
    id: "INV-2041",
    name: "Harbour Print Co.",
    total: 12_840.5,
    issued: "2026-10-15T09:12:00Z",
  },
  {
    id: "INV-2042",
    name: "Northside Logistics",
    total: 3_215,
    issued: "2026-10-12T14:30:00Z",
  },
] as const

export function ListNarrow(): React.ReactElement {
  return (
    <div className="w-full max-w-xs">
      <List aria-label="Invoices">
        {invoices.map((invoice) => (
          <ListRow key={invoice.id} value={invoice.id}>
            <ListRowLink href={`#${invoice.id}`}>
              <ListRowSubject>
                <ListRowId narrow="hide">{invoice.id}</ListRowId>
                <ListRowName>{invoice.name}</ListRowName>
              </ListRowSubject>
              <ListRowFact narrow="abbreviate">
                <Figure
                  value={invoice.total}
                  format={{ style: "currency", currency: "AUD" }}
                  locale="en-AU"
                />
              </ListRowFact>
              <ListRowFact narrow="hide">
                <RelativeTime dateTime={invoice.issued} now="2026-10-15T11:12:00Z" />
              </ListRowFact>
            </ListRowLink>
          </ListRow>
        ))}
      </List>
    </div>
  )
}
