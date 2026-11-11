import { sampleRecordDetails } from "@workspace/fixtures/record-details.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import * as React from "react"
import { clipSpecimen } from "../../experiments/clip-specimen.tsx"
import {
  Constellation,
  type ConstellationGroup,
  type ConstellationPart,
} from "../../playground/constellation.tsx"
import { recordStatus } from "../list/datasets.tsx"
import { cardSurface } from "../lockup-styles.ts"
import { SummaryCard } from "./summary-card.tsx"
import { summaryRecord } from "./summary-record.ts"

type Drawing = {
  parts: ReadonlyArray<ConstellationPart>
  groups: ReadonlyArray<ConstellationGroup>
}

/** The summary card drawn as its constellation: one card at rest with its parts around it. */
export function SummaryCardConstellation({ state }: { state: FixtureState }): React.ReactElement {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null)
  const drawing = summaryDrawing(state)
  return (
    <Constellation
      key={state}
      label="Summary card constellation"
      stage={stage}
      onStageChange={setStage}
      parts={drawing.parts.map(clipSpecimen)}
      groups={drawing.groups}
      centre={
        <div data-anchor={state === "error" ? 1 : undefined} className="w-72 bg-background">
          <SummaryCard
            state={state}
            anchors={{ card: 1, subject: 2, id: 3, name: 4, facts: 5, fact: 6, workspace: 7 }}
          />
        </div>
      }
    />
  )
}

function summaryDrawing(state: FixtureState): Drawing {
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
            note: "Bars in place of the ID, name and each fact's value; the property names stay",
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
  const hasWorkspace = state !== "no-permission"
  const parts: ReadonlyArray<ConstellationPart> = [
    { n: 1, name: "Card", depth: 0, note: "12px padding, the card radius, a hairline border" },
    { n: 2, name: "CardSubject", depth: 1, note: "Rank 1: ID and name; no picture" },
    { n: 3, name: "CardId", depth: 2, note: "Muted, tabular figures" },
    {
      n: 4,
      name: "CardName",
      depth: 2,
      note: "At most two lines; no link, since the card sits on the record's own page",
      specimen: <span className="font-medium text-sm">{summaryRecord.title}</span>,
    },
    {
      n: 5,
      name: "CardFacts",
      depth: 1,
      note: 'Rank 2, layout="labelled": one fact per 24px line after its property\'s name',
    },
    {
      n: 6,
      name: "CardFact",
      depth: 2,
      note: "One status, entity, figure or text; a value that does not fit truncates to one line",
      specimen: <span className="text-sm">{recordStatus(summaryRecord)}</span>,
    },
    ...(hasWorkspace
      ? [
          {
            n: 7,
            name: "PreviewCard",
            depth: 3,
            note: "The full workspace name, beside the card on hover after 300ms",
            specimen: (
              <div className={cardSurface}>
                <p className="text-muted-foreground">Workspace</p>
                <p className="mt-1 font-medium">{sampleRecordDetails.workspace}</p>
              </div>
            ),
          },
        ]
      : []),
  ]

  const groups: ReadonlyArray<ConstellationGroup> = [
    {
      title: "Subject",
      rank: 1,
      summary: "Which record the properties belong to",
      reveal: "always",
      links: [
        { part: 2, anchor: 2 },
        { part: 3, anchor: 3 },
        { part: 4, anchor: 4 },
      ],
    },
    {
      title: "Fact",
      rank: 2,
      summary: "Each property, after its name",
      reveal: "always",
      links: [
        { part: 5, anchor: 5 },
        { part: 6, anchor: 6 },
      ],
    },
    ...(hasWorkspace
      ? [
          {
            title: "Enrich",
            rank: 4,
            summary: "A value cut off by the card's width",
            reveal: "revealed" as const,
            gesture: "Hover",
            links: [{ part: 7, anchor: 7 }],
          },
        ]
      : []),
  ]

  return { parts, groups }
}
