import type { FixtureState } from "@workspace/fixtures/state.ts"
import * as React from "react"
import { Figure } from "@/components/figure.tsx"
import { cardSurface } from "../../experiments/bullet-styles.ts"
import { clipSpecimen } from "../../experiments/clip-specimen.tsx"
import {
  Constellation,
  type ConstellationGroup,
  type ConstellationPart,
} from "../../playground/constellation.tsx"
import { MetricCard } from "./metric-card.tsx"
import { outstandingMetric } from "./metrics.ts"

type Drawing = {
  parts: ReadonlyArray<ConstellationPart>
  groups: ReadonlyArray<ConstellationGroup>
}

/** The metric card drawn as its constellation: one card at rest with its parts around it. */
export function MetricCardConstellation({ state }: { state: FixtureState }): React.ReactElement {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null)
  const drawing = metricDrawing(state)
  return (
    <Constellation
      key={state}
      label="Metric card constellation"
      stage={stage}
      onStageChange={setStage}
      parts={drawing.parts.map(clipSpecimen)}
      groups={drawing.groups}
      centre={
        <div data-anchor={state === "error" ? 1 : undefined} className="w-64 bg-background">
          <MetricCard
            state={state}
            anchors={{
              card: 1,
              figure: 2,
              aside: 3,
              change: 4,
              subject: 6,
              name: 7,
              description: 8,
            }}
          />
        </div>
      }
    />
  )
}

function metricDrawing(state: FixtureState): Drawing {
  switch (state) {
    case "error":
      return {
        parts: [{ n: 1, name: "ErrorMessage", depth: 0, note: "Replaces the card" }],
        groups: [],
      }
    case "loading":
      return {
        parts: [
          {
            n: 1,
            name: "Card",
            depth: 0,
            note: "Bars in place of the figure and the change; the name and unit stay",
          },
        ],
        groups: [],
      }
    case "loaded":
    case "partial":
    case "no-permission":
      return restDrawing(state)
  }
}

function restDrawing(state: "loaded" | "partial" | "no-permission"): Drawing {
  const hasChange = state === "loaded"
  const parts: ReadonlyArray<ConstellationPart> = [
    { n: 1, name: "Card", depth: 0, note: "12px padding, the card radius, a hairline border" },
    {
      n: 2,
      name: "CardFacts",
      depth: 1,
      note: "Rank 2, first: the figure at the top left in the 24px display type; compact past 12 characters",
      specimen: (
        <Figure
          value={outstandingMetric.amount}
          format={{ style: "currency", currency: "AUD" }}
          className="ms-0 text-display"
        />
      ),
    },
    {
      n: 3,
      name: "CardAside",
      depth: 1,
      note: "The top right, at most a third of the card's width",
    },
    {
      n: 4,
      name: "CardFact",
      depth: 2,
      note: "The change against last month, in tabular figures; a muted dash when last month was zero",
    },
    ...(hasChange
      ? [
          {
            n: 5,
            name: "PreviewCard",
            depth: 3,
            note: "Both months' figures, 4px below the change on hover after 300ms",
            specimen: (
              <div className={cardSurface}>
                <p className="font-medium">Change against September</p>
                <p className="mt-1 text-muted-foreground">October and September, in AUD</p>
              </div>
            ),
          },
        ]
      : []),
    { n: 6, name: "CardSubject", depth: 1, note: "Rank 1, under the figure: the name and unit" },
    {
      n: 7,
      name: "CardName",
      depth: 2,
      note: "What the figure counts",
      specimen: <span className="font-medium text-sm">{outstandingMetric.name}</span>,
    },
    { n: 8, name: "CardDescription", depth: 2, note: "The unit and what is counted; truncates" },
  ]

  const groups: ReadonlyArray<ConstellationGroup> = [
    {
      title: "Subject",
      rank: 1,
      summary: "What the figure counts, and in what unit",
      reveal: "always",
      links: [
        { part: 6, anchor: 6 },
        { part: 7, anchor: 7 },
        { part: 8, anchor: 8 },
      ],
    },
    {
      title: "Fact",
      rank: 2,
      summary: "The figure, and its change against last month",
      reveal: "always",
      links: [
        { part: 2, anchor: 2 },
        { part: 3, anchor: 3 },
        { part: 4, anchor: hasChange ? 4 : 3 },
      ],
    },
    ...(hasChange
      ? [
          {
            title: "Enrich",
            rank: 4,
            summary: "The two figures the change compares",
            reveal: "revealed" as const,
            gesture: "Hover",
            links: [{ part: 5, anchor: 4 }],
          },
        ]
      : []),
  ]

  return { parts, groups }
}
