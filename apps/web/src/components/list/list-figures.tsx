import type * as React from "react"
import { Figure } from "@/components/figure.tsx"
import {
  List,
  ListRow,
  ListRowDescription,
  ListRowFact,
  ListRowId,
  ListRowLink,
  ListRowName,
  ListRowSubject,
} from "@/components/list.tsx"
import { Meter } from "@/components/meter.tsx"
import { RelativeTime } from "@/components/relative-time.tsx"

const invoices = [
  {
    id: "INV-2041",
    name: "Harbour Print Co.",
    description: "October stationery order",
    total: 12_840.5,
    paid: 0.4,
    issued: "2026-10-15T09:12:00Z",
  },
  {
    id: "INV-2042",
    name: "Northside Logistics",
    description: "Freight, week 41",
    total: 3_215,
    paid: 1,
    issued: "2026-10-12T14:30:00Z",
  },
  {
    id: "INV-2043",
    name: "Lumen Studio",
    description: "Brand refresh, milestone 2",
    total: 8_400,
    paid: 0,
    issued: "2026-10-09T08:00:00Z",
  },
] as const

export function ListFigures(): React.ReactElement {
  return (
    <div className="w-full">
      <List aria-label="Invoices">
        {invoices.map((invoice) => (
          <ListRow key={invoice.id} value={invoice.id}>
            <ListRowLink href={`#${invoice.id}`}>
              <ListRowSubject>
                <ListRowId narrow="hide">{invoice.id}</ListRowId>
                <ListRowName>{invoice.name}</ListRowName>
                <ListRowDescription>{invoice.description}</ListRowDescription>
              </ListRowSubject>
              <ListRowFact narrow="abbreviate">
                <Figure
                  value={invoice.total}
                  format={{ style: "currency", currency: "AUD" }}
                  locale="en-AU"
                />
              </ListRowFact>
              <ListRowFact narrow="abbreviate">
                <Meter
                  value={invoice.paid}
                  max={1}
                  format={{ style: "percent" }}
                  aria-label="Paid"
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
