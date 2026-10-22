import * as React from "react"
import { Entity, EntityMedia, EntityName } from "@/components/entity.tsx"
import { Figure } from "@/components/figure.tsx"
import {
  List,
  ListRow,
  ListRowFact,
  ListRowId,
  ListRowLink,
  ListRowMedia,
  ListRowName,
  ListRowSelect,
  ListRowSubject,
} from "@/components/list.tsx"
import { Meter } from "@/components/meter.tsx"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"
import { RelativeTime } from "@/components/relative-time.tsx"

const invoices = [
  {
    id: "INV-2041",
    customer: { initials: "HP", name: "Harbour Print Co.", city: "Sydney" },
    total: 12_840.5,
    paid: 0.4,
    due: "2026-10-29T00:00:00Z",
  },
  {
    id: "INV-2042",
    customer: { initials: "NL", name: "Northside Logistics", city: "Brisbane" },
    total: 3_215,
    paid: 1,
    due: "2026-10-19T00:00:00Z",
  },
  {
    id: "INV-2043",
    customer: { initials: "LS", name: "Lumen Studio", city: "Melbourne" },
    total: 8_400,
    paid: 0,
    due: "2026-10-08T00:00:00Z",
  },
] as const

export function ListInvoices(): React.ReactElement {
  const hintId = React.useId()
  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card text-card-foreground">
      <List aria-label="Invoices" aria-describedby={hintId}>
        {invoices.map((invoice) => (
          <ListRow key={invoice.id} value={invoice.id} className="last:border-b-0">
            <ListRowSelect />
            <ListRowLink href={`#${invoice.id}`}>
              <ListRowSubject>
                <ListRowId narrow="hide">{invoice.id}</ListRowId>
                <ListRowMedia>
                  <PreviewCard>
                    <PreviewCardTrigger>
                      <Entity>
                        <EntityMedia>{invoice.customer.initials}</EntityMedia>
                        <EntityName>{invoice.customer.name}</EntityName>
                      </Entity>
                    </PreviewCardTrigger>
                    <PreviewCardContent>
                      <p className="font-medium">{invoice.customer.name}</p>
                      <p className="text-muted-foreground">Customer · {invoice.customer.city}</p>
                    </PreviewCardContent>
                  </PreviewCard>
                </ListRowMedia>
                <ListRowName>{invoice.customer.name}</ListRowName>
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
                <RelativeTime dateTime={invoice.due} now="2026-10-15T11:12:00Z" />
              </ListRowFact>
            </ListRowLink>
          </ListRow>
        ))}
      </List>
      <p id={hintId} className="border-t px-3 py-2 text-muted-foreground text-xs">
        ↑ ↓ move between rows · X selects the focused row
      </p>
    </div>
  )
}
