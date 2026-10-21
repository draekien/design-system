import * as React from "react"
import { Figure } from "@/components/figure.tsx"
import {
  RecordList,
  RecordRow,
  RecordRowFact,
  RecordRowId,
  RecordRowLink,
  RecordRowName,
  RecordRowPeek,
  RecordRowSubject,
} from "@/components/record-list.tsx"

const invoices = [
  { id: "INV-2041", name: "Harbour Print Co.", total: 12_840.5, missing: null },
  { id: "INV-2042", name: "Northside Logistics", total: 3_215, missing: "unavailable" },
  { id: "INV-2043", name: "Lumen Studio", total: 8_400, missing: "hidden" },
] as const

export function RecordListMissing(): React.ReactElement {
  const hintId = React.useId()
  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card text-card-foreground">
      <RecordList aria-label="Invoices" aria-describedby={hintId}>
        {invoices.map((invoice) => (
          <RecordRow key={invoice.id} value={invoice.id} className="last:border-b-0">
            <RecordRowLink href={`#${invoice.id}`}>
              <RecordRowSubject>
                <RecordRowId narrow="hide">{invoice.id}</RecordRowId>
                <RecordRowName>{invoice.name}</RecordRowName>
              </RecordRowSubject>
              {invoice.missing === null ? (
                <RecordRowFact>
                  <Figure
                    value={invoice.total}
                    format={{ style: "currency", currency: "AUD" }}
                    locale="en-AU"
                  />
                </RecordRowFact>
              ) : (
                <RecordRowFact missing={invoice.missing} />
              )}
            </RecordRowLink>
            <RecordRowPeek />
          </RecordRow>
        ))}
      </RecordList>
      <p id={hintId} className="border-t px-3 py-2 text-muted-foreground text-xs">
        ↑ ↓ move between rows · Space peeks the focused row
      </p>
    </div>
  )
}
