import { sampleRecords } from "@workspace/fixtures/records.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import * as React from "react"
import { clipSpecimen } from "../../experiments/clip-specimen.tsx"
import { ErrorMessage } from "../../experiments/wireframe-parts.tsx"
import {
  Constellation,
  type ConstellationGroup,
  type ConstellationPart,
} from "../../playground/constellation.tsx"
import { ownerEntity, recordStatus } from "../list/datasets.tsx"
import { cardSurface } from "../lockup-styles.ts"
import { RecordCard, RecordCardLoading } from "./record-card.tsx"

type Drawing = {
  parts: ReadonlyArray<ConstellationPart>
  groups: ReadonlyArray<ConstellationGroup>
  centre: React.ReactNode
}

const record = firstRecord()

function firstRecord() {
  const found = sampleRecords[0]
  if (found === undefined) {
    throw new Error("The card constellation needs one sample record.")
  }
  return found
}

/** The record card drawn as its constellation: one record card at rest with its parts around it. */
export function RecordCardConstellation({ state }: { state: FixtureState }): React.ReactElement {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null)
  const drawing = cardDrawing(state)
  return (
    <Constellation
      key={state}
      label="Record card constellation"
      stage={stage}
      onStageChange={setStage}
      parts={drawing.parts.map(clipSpecimen)}
      groups={drawing.groups}
      centre={drawing.centre}
    />
  )
}

function cardDrawing(state: FixtureState): Drawing {
  switch (state) {
    case "error":
      return {
        parts: [{ n: 1, name: "ErrorMessage", depth: 0, note: "Replaces the cards" }],
        groups: [],
        centre: (
          <div data-anchor={1} className="w-72">
            <ErrorMessage subject="The records" />
          </div>
        ),
      }
    case "loading":
      return {
        parts: [
          {
            n: 1,
            name: "Card",
            depth: 0,
            note: "Bars in place of the ID, name, description and three facts",
          },
        ],
        groups: [],
        centre: (
          <div data-anchor={1} className="w-72">
            <RecordCardLoading media={false} />
          </div>
        ),
      }
    case "loaded":
    case "partial":
    case "no-permission":
      return restDrawing(state)
  }
}

function restDrawing(state: "loaded" | "partial" | "no-permission"): Drawing {
  const hasOwner = state === "loaded"
  const explain = hasOwner ? 10 : 9
  const parts: ReadonlyArray<ConstellationPart> = [
    { n: 1, name: "Card", depth: 0, note: "12px padding, the card radius, a hairline border" },
    {
      n: 2,
      name: "CardSubject",
      depth: 1,
      note: "Rank 1: ID, name, description; a picture only where callers recognise records by it",
    },
    { n: 3, name: "CardId", depth: 2, note: "Muted, tabular figures" },
    {
      n: 4,
      name: "CardName",
      depth: 2,
      note: "At most two lines",
      specimen: <span className="font-medium text-sm">{record.title}</span>,
    },
    {
      n: 5,
      name: "CardLink",
      depth: 3,
      note: "Rank 5: the record's page; its hit area covers the card",
    },
    { n: 6, name: "CardDescription", depth: 2, note: "One line; truncates" },
    {
      n: 7,
      name: "CardFacts",
      depth: 1,
      note: "Rank 2: at most four facts on one line, in the same order on every card",
    },
    {
      n: 8,
      name: "CardFact",
      depth: 2,
      note: "One status, entity, figure or relative time; its property's name is read by screen readers only",
      specimen: <span className="text-xs">{recordStatus(record)}</span>,
    },
    ...(hasOwner
      ? [
          {
            n: 9,
            name: "PreviewCard",
            depth: 3,
            note: "The owner's role and team, on hover after 300ms",
            specimen: (
              <div className={cardSurface}>
                <p className="flex font-medium">{ownerEntity(record.owner)}</p>
                <p className="mt-1 text-muted-foreground">Owner · {record.team} team</p>
              </div>
            ),
          },
        ]
      : []),
    {
      n: explain,
      name: "CardExplain",
      depth: 1,
      note: "Rank 3: the summary, in place under the facts",
      specimen: <p className="w-56 text-muted-foreground text-xs">{record.summary}</p>,
    },
  ]

  const groups: ReadonlyArray<ConstellationGroup> = [
    {
      title: "Subject",
      rank: 1,
      summary: "What the card is about, at its top",
      reveal: "always",
      links: [
        { part: 2, anchor: 2 },
        { part: 3, anchor: 3 },
        { part: 4, anchor: 4 },
        { part: 6, anchor: 6 },
      ],
    },
    {
      title: "Fact",
      rank: 2,
      summary: "The facts the caller compares across cards",
      reveal: "always",
      links: [
        { part: 7, anchor: 7 },
        { part: 8, anchor: 8 },
      ],
    },
    {
      title: "Explain",
      rank: 3,
      summary: "Read on some visits, in place",
      reveal: "revealed",
      gesture: "Press Summary",
      links: [{ part: explain, anchor: explain }],
    },
    ...(hasOwner
      ? [
          {
            title: "Enrich",
            rank: 4,
            summary: "More about the owner",
            reveal: "revealed" as const,
            gesture: "Hover",
            links: [{ part: 9, anchor: 9 }],
          },
        ]
      : []),
    {
      title: "Elsewhere",
      rank: 5,
      summary: "Everything about the record, on its page",
      reveal: "revealed",
      gesture: "Click or Enter",
      links: [{ part: 5, anchor: 4 }],
    },
  ]

  return {
    parts,
    groups,
    centre: (
      <div className="w-72 bg-background">
        <RecordCard
          record={record}
          state={state}
          media={false}
          anchors={{
            card: 1,
            subject: 2,
            id: 3,
            name: 4,
            description: 6,
            facts: 7,
            fact: 8,
            owner: 9,
            explain,
          }}
        />
      </div>
    ),
  }
}
