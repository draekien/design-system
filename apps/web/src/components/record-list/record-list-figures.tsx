import type * as React from "react"
import { Figure } from "@/components/figure.tsx"
import { Meter } from "@/components/meter.tsx"
import {
  RecordList,
  RecordRow,
  RecordRowDescription,
  RecordRowFact,
  RecordRowId,
  RecordRowLink,
  RecordRowName,
  RecordRowSubject,
} from "@/components/record-list.tsx"
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

export function RecordListFigures(): React.ReactElement {
  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card text-card-foreground">
      <RecordList aria-label="Invoices">
        {invoices.map((invoice) => (
          <RecordRow key={invoice.id} value={invoice.id} className="last:border-b-0">
            <RecordRowLink href={`#${invoice.id}`}>
              <RecordRowSubject>
                <RecordRowId narrow="hide">{invoice.id}</RecordRowId>
                <RecordRowName>{invoice.name}</RecordRowName>
                <RecordRowDescription>{invoice.description}</RecordRowDescription>
              </RecordRowSubject>
              <RecordRowFact narrow="abbreviate">
                <Figure
                  value={invoice.total}
                  format={{ style: "currency", currency: "AUD" }}
                  locale="en-AU"
                />
              </RecordRowFact>
              <RecordRowFact narrow="abbreviate">
                <Meter
                  value={invoice.paid}
                  max={1}
                  format={{ style: "percent" }}
                  aria-label="Paid"
                />
              </RecordRowFact>
              <RecordRowFact narrow="hide">
                <RelativeTime dateTime={invoice.issued} now="2026-10-15T11:12:00Z" />
              </RecordRowFact>
            </RecordRowLink>
          </RecordRow>
        ))}
      </RecordList>
    </div>
  )
}
