import { cardDocs } from "../../components/card/card.docs.ts"
import { figureDocs } from "../../components/figure/figure.docs.ts"
import { type ComponentDocs, requireSource } from "../../components/item-docs.ts"
import { previewCardDocs } from "../../components/preview-card/preview-card.docs.ts"
import { MetricCardCompact } from "./metric-card-compact.tsx"
import { MetricCardZeroBase } from "./metric-card-zero-base.tsx"

const sources = import.meta.glob<string>("./metric-card-{compact,zero-base}.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

export const metricCardDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import {
  Card,
  CardAside,
  CardDescription,
  CardFact,
  CardFacts,
  CardName,
  CardSubject,
} from "@/components/card"
import { Figure } from "@/components/figure"`,
    code: `<Card render={<section aria-label="Outstanding" />}>
  <CardFacts>
    <CardFact label="Amount">
      <Figure value={9560.74} format={{ style: "currency", currency: "AUD" }} className="ms-0 text-display" />
    </CardFact>
  </CardFacts>
  <CardAside>
    <CardFacts>
      <CardFact label="Change">
        <Figure value={0.069} format={{ style: "percent", signDisplay: "exceptZero" }} />
      </CardFact>
    </CardFacts>
  </CardAside>
  <CardSubject>
    <CardName>Outstanding</CardName>
    <CardDescription>Unpaid on sent invoices, AUD</CardDescription>
  </CardSubject>
</Card>`,
    description:
      "The figure first, its change in CardAside, then the name and unit. Lay metric cards in a row 8px apart.",
  },
  composition: {
    name: "Metrics",
    item: null,
    children: [{ ...cardDocs.composition, item: "card" }],
  },
  examples: [
    {
      name: "metric-card-compact",
      title: "Compact figure",
      description:
        "A figure longer than 12 characters switches to compact notation; screen readers read the full figure.",
      Preview: MetricCardCompact,
      source: requireSource(sources, "./metric-card-compact.tsx"),
    },
    {
      name: "metric-card-zero-base",
      title: "Zero base",
      description: "When last month was zero, the change is a muted dash with a hover card.",
      Preview: MetricCardZeroBase,
      source: requireSource(sources, "./metric-card-zero-base.tsx"),
    },
  ],
  api: [...cardDocs.api, ...figureDocs.api, ...previewCardDocs.api],
}
