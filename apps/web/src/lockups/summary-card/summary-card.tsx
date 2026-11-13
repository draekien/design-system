import {
  type SampleRecordDetails,
  sampleRecordDetails,
} from "@workspace/fixtures/record-details.ts"
import type { SampleRecord } from "@workspace/fixtures/records.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import * as React from "react"
import {
  Card,
  CardDescription,
  CardFact,
  CardFacts,
  CardId,
  CardMissing,
  CardName,
  CardSubject,
} from "@/components/card.tsx"
import { Entity, EntityMedia, EntityName } from "@/components/entity.tsx"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"
import { Bar, ErrorMessage, RetryLink } from "../../experiments/wireframe-parts.tsx"
import { recordStatus } from "../list/datasets.tsx"
import { belowTrigger, retryClass } from "../record-card/card-styles.ts"
import { Note } from "../record-card/record-card.tsx"
import { summaryRecord, worstRecordDetails, worstSummaryRecord } from "./summary-record.ts"

/** The centre parts of a summary card that a constellation connector ends on, by part number. */
type SummaryCardAnchors = Readonly<{
  card: number
  subject: number
  id: number
  name: number
  facts: number
  fact: number
  workspace: number
}>

const besideCard = { side: "flip", align: "shift", fallbackAxisSide: "end" } as const

function pastCardEdge(trigger: HTMLElement | null, card: HTMLElement | null, side: string): number {
  if (trigger === null || card === null || (side !== "left" && side !== "right")) {
    return belowTrigger.sideOffset
  }
  const anchor = trigger.getBoundingClientRect()
  const edge = card.getBoundingClientRect()
  return (side === "left" ? anchor.left - edge.left : edge.right - anchor.right) + 6
}

/** One record's properties: its head, then each fact after its property's name. Nothing links out. */
export function SummaryCard({
  state,
  record = summaryRecord,
  details = sampleRecordDetails,
  anchors,
}: {
  state: FixtureState
  record?: SampleRecord
  details?: SampleRecordDetails
  anchors?: SummaryCardAnchors
}): React.ReactElement {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const workspaceRef = React.useRef<HTMLAnchorElement>(null)
  if (state === "error") {
    return <ErrorMessage subject="The record's properties" />
  }
  const loading = state === "loading"
  const workspace =
    anchors === undefined ? (
      <PreviewCard>
        <PreviewCardTrigger ref={workspaceRef} className="w-full min-w-0 justify-start">
          <span className="truncate">{details.workspace}</span>
        </PreviewCardTrigger>
        <PreviewCardContent
          side="right"
          align="center"
          sideOffset={({ side }) => pastCardEdge(workspaceRef.current, cardRef.current, side)}
          collisionAvoidance={besideCard}
        >
          <CardSubject>
            <CardName>{details.workspace}</CardName>
            <CardDescription>Workspace</CardDescription>
          </CardSubject>
        </PreviewCardContent>
      </PreviewCard>
    ) : (
      <span data-anchor={anchors.workspace} className="truncate">
        {details.workspace}
      </span>
    )
  const rows: ReadonlyArray<{ label: string; value: React.ReactNode }> = [
    { label: "Status", value: recordStatus(record) },
    { label: "Priority", value: details.priority },
    {
      label: "Assignee",
      value:
        state === "partial" ? (
          <CardMissing>Unavailable</CardMissing>
        ) : (
          <Entity>
            <EntityMedia>{details.assignee.initials}</EntityMedia>
            <EntityName>{details.assignee.name}</EntityName>
          </Entity>
        ),
    },
    {
      label: "Workspace",
      value: state === "no-permission" ? <CardMissing>Hidden</CardMissing> : workspace,
    },
    { label: "Due", value: details.dueAt },
  ]
  return (
    <Card
      ref={cardRef}
      data-anchor={anchors?.card}
      render={<section aria-busy={loading} aria-label={`${record.title} properties`} />}
    >
      <CardSubject data-anchor={anchors?.subject}>
        <CardId data-anchor={anchors?.id}>
          {loading ? <Bar className="my-1 w-14" /> : record.id}
        </CardId>
        <CardName data-anchor={anchors?.name}>
          {loading ? <Bar className="my-1 w-40" /> : record.title}
        </CardName>
      </CardSubject>
      <CardFacts layout="labelled" data-anchor={anchors?.facts}>
        {rows.map((row, index) => (
          <CardFact
            key={row.label}
            label={row.label}
            data-anchor={index === 0 ? anchors?.fact : undefined}
          >
            {loading ? <Bar className="w-20" /> : row.value}
          </CardFact>
        ))}
      </CardFacts>
      {state === "partial" ? (
        <Note>
          The assignee could not load. <RetryLink className={retryClass} />
        </Note>
      ) : null}
      {state === "no-permission" ? (
        <Note>The workspace is hidden: only {details.workspaceRestrictedTo} can open it.</Note>
      ) : null}
    </Card>
  )
}

/** The summary card lockup: one card at the width of a record page's side column. */
export function SummaryCardLockup({ state }: { state: FixtureState }): React.ReactElement {
  return (
    <div className="w-80 max-w-full">
      <SummaryCard state={state} />
    </div>
  )
}

/** The States view: the worst-case record's properties, in the given state. */
export function SummaryCardStates({ state }: { state: FixtureState }): React.ReactElement {
  return (
    <section className="flex flex-col gap-related">
      <h2 className="font-medium text-sm">Worst case</h2>
      <div className="w-80 max-w-full">
        <SummaryCard state={state} record={worstSummaryRecord} details={worstRecordDetails} />
      </div>
      <h2 className="font-medium text-sm">Narrow</h2>
      <div className="w-60">
        <SummaryCard state={state} />
      </div>
    </section>
  )
}
