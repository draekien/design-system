import type * as React from "react"
import { requireSource } from "../components/item-docs.ts"
import { metricCardLockup, recordCardLockup, summaryCardLockup } from "../lockups/lockups.ts"
import { metricCardDocs } from "../lockups/metric-card/metric-card.docs.ts"
import { MetricCardConstellation } from "../lockups/metric-card/metric-card-drawing.tsx"
import {
  metricCardRules,
  recordCardRules,
  summaryCardRules,
} from "../lockups/record-card/card-rules.ts"
import { recordCardDocs } from "../lockups/record-card/record-card.docs.ts"
import { RecordCardConstellation } from "../lockups/record-card/record-card-drawing.tsx"
import { summaryCardDocs } from "../lockups/summary-card/summary-card.docs.ts"
import { SummaryCardConstellation } from "../lockups/summary-card/summary-card-drawing.tsx"
import type { CardKind } from "./card-canvas.tsx"
import { LockupPage } from "./lockup-page.tsx"
import type { PlaygroundSearch } from "./playground-search.ts"

const sources = import.meta.glob<string>(
  [
    "../lockups/record-card/record-card.tsx",
    "../lockups/summary-card/summary-card.tsx",
    "../lockups/metric-card/metric-card.tsx",
    "./card-canvas.tsx",
  ],
  { query: "?raw", import: "default", eager: true }
)

const statesCode = {
  code: requireSource(sources, "./card-canvas.tsx"),
  fileName: "card-canvas.tsx",
}

const pages = {
  record: {
    lockup: recordCardLockup,
    intro: (
      <>
        Tooltips and menus are Base UI{" "}
        <code className="font-mono text-[0.875em] text-foreground">Tooltip</code> and{" "}
        <code className="font-mono text-[0.875em] text-foreground">Menu</code> beside the
        components.
      </>
    ),
    noun: "record cards",
    canvas: "/canvas/lockups/record-card",
    Constellation: RecordCardConstellation,
    constellationDescription:
      "How a record card encodes the rules: each part sits with its information rank and connects to where it shows or is revealed in the card.",
    docs: recordCardDocs,
    rules: recordCardRules,
  },
  summary: {
    lockup: summaryCardLockup,
    intro: null,
    noun: "summary card",
    canvas: "/canvas/lockups/summary-card",
    Constellation: SummaryCardConstellation,
    constellationDescription:
      "How a summary card encodes the rules: each part sits with its information rank and connects to where it shows or is revealed in the card.",
    docs: summaryCardDocs,
    rules: summaryCardRules,
  },
  metric: {
    lockup: metricCardLockup,
    intro: null,
    noun: "metric cards",
    canvas: "/canvas/lockups/metric-card",
    Constellation: MetricCardConstellation,
    constellationDescription:
      "How a metric card encodes the rules: each part sits with its information rank and connects to where it shows or is revealed in the card.",
    docs: metricCardDocs,
    rules: metricCardRules,
  },
} as const

/** A card lockup's playground page. */
export function CardPage({
  card,
  search,
  onSearchChange,
}: {
  card: CardKind
  search: PlaygroundSearch
  onSearchChange: (patch: Partial<PlaygroundSearch>) => void
}): React.ReactElement {
  const page = pages[card]
  return (
    <LockupPage
      lockup={page.lockup}
      intro={page.intro}
      noun={page.noun}
      canvas={page.canvas}
      search={search}
      lockupCode={{
        code: requireSource(sources, `../lockups/${page.lockup.name}/${page.lockup.name}.tsx`),
        fileName: `${page.lockup.name}.tsx`,
      }}
      statesCode={statesCode}
      constellation={<page.Constellation state={search.state} />}
      constellationDescription={page.constellationDescription}
      docs={page.docs}
      rules={page.rules}
      controls={null}
      onSearchChange={onSearchChange}
    />
  )
}
