import type * as React from "react"
import { Figure } from "@/components/figure.tsx"
import {
  RecordList,
  RecordRow,
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

export function RecordListNarrow(): React.ReactElement {
  return (
    <div className="w-full max-w-xs overflow-hidden rounded-xl border bg-card text-card-foreground">
      <RecordList aria-label="Invoices">
        {invoices.map((invoice) => (
          <RecordRow key={invoice.id} value={invoice.id} className="last:border-b-0">
            <RecordRowLink href={`#${invoice.id}`}>
              <RecordRowSubject>
                <RecordRowId narrow="hide">{invoice.id}</RecordRowId>
                <RecordRowName>{invoice.name}</RecordRowName>
              </RecordRowSubject>
              <RecordRowFact narrow="abbreviate">
                <Figure
                  value={invoice.total}
                  format={{ style: "currency", currency: "AUD" }}
                  locale="en-AU"
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
