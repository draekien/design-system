import {
  fixtureNow,
  type RecordStatus,
  type SampleRecord,
  sampleRecords,
} from "@workspace/fixtures/records.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import {
  CardDescription,
  CardFact,
  CardFacts,
  CardName,
  CardSubject,
} from "@workspace/registry/components/card.tsx"
import { Entity, EntityMedia, EntityName } from "@workspace/registry/components/entity.tsx"
import type { ListRowFactProps, ListRowNarrow } from "@workspace/registry/components/list.tsx"
import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@workspace/registry/components/preview-card.tsx"
import { RelativeTime } from "@workspace/registry/components/relative-time.tsx"
import {
  Status,
  StatusMedia,
  type StatusMediaProps,
  StatusName,
} from "@workspace/registry/components/status.tsx"
import type * as React from "react"
import type { CanvasOptions, ListPart } from "../../playground/playground-search.ts"
import { absoluteTime, randomRecords } from "./random-records.ts"

export type RowState = Exclude<FixtureState, "error" | "loading">

export type Hidden = ReadonlySet<ListPart>

export type FactContext = {
  state: RowState
  cardOpen?: boolean
  withCard: boolean
  cardContainer?: HTMLElement | null
}

export type Missing = Extract<ListRowFactProps, { missing: string }>["missing"]

type MissingByState = Partial<Readonly<Record<RowState, Missing>>>

export type FactDefinition<TItem> = {
  part: ListPart
  card?: ListPart
  cardStates?: ReadonlyArray<RowState>
  label: string
  narrow: ListRowNarrow
  content: string
  missing?: MissingByState
  render: (item: TItem, context: FactContext) => React.ReactNode
  code: (withCard: boolean) => ReadonlyArray<string>
  components: (withCard: boolean) => ReadonlyArray<string>
}

export type Field = { label: string; value: React.ReactNode }

export type DatasetGroup = {
  value: string
  name: string
  fill: StatusMediaProps["fill"]
}

export type Dataset<TItem> = {
  noun: string
  item: string
  sampleHint: string
  keyNarrow: ListRowNarrow
  items: (options: Pick<CanvasOptions, "data" | "seed" | "count">) => ReadonlyArray<TItem>
  value: (item: TItem) => string
  key: (item: TItem) => string
  name: (item: TItem) => string
  nameField: string
  summary: (item: TItem) => string
  summaryField: string
  media?: FactDefinition<TItem>
  facts: ReadonlyArray<FactDefinition<TItem>>
  fields: (item: TItem, state: RowState) => ReadonlyArray<Field>
  groups: ReadonlyArray<DatasetGroup>
  groupOf: (item: TItem) => string
  draft: (group: string, items: ReadonlyArray<TItem>) => TItem
  partialMessage: string
  partialRetry: string
  noPermissionMessage: string
}

export type ItemGroup<TItem> = DatasetGroup & { items: ReadonlyArray<TItem> }

export function groupItems<TItem>(
  dataset: Dataset<TItem>,
  items: ReadonlyArray<TItem>
): ReadonlyArray<ItemGroup<TItem>> {
  return dataset.groups
    .map((group) => ({
      ...group,
      items: items.filter((item) => dataset.groupOf(item) === group.value),
    }))
    .filter((group) => group.items.length > 0)
}

export type DatasetPart = { part: ListPart; label: string; parent?: ListPart }

export function datasetParts<TItem>(dataset: Dataset<TItem>): ReadonlyArray<DatasetPart> {
  return [
    { part: "select", label: "ListRowSelect" },
    { part: "key", label: "ListRowId" },
    { part: "description", label: "ListRowDescription" },
    ...[...(dataset.media === undefined ? [] : [dataset.media]), ...dataset.facts].flatMap(
      (fact) => [
        { part: fact.part, label: `${fact.label} · ${fact.content}` },
        ...(fact.card === undefined
          ? []
          : [{ part: fact.card, label: `${fact.label} hover card`, parent: fact.part }]),
      ]
    ),
  ]
}

export function factProps<TItem>(
  fact: FactDefinition<TItem>,
  item: TItem,
  context: FactContext
): ListRowFactProps {
  const missing = fact.missing?.[context.state]
  return missing === undefined ? { children: fact.render(item, context) } : { missing }
}

const missingLabel: Readonly<Record<Missing, string>> = {
  unavailable: "Unavailable",
  hidden: "Hidden",
}

function fieldValue(missing: Missing | undefined, value: React.ReactNode) {
  return missing === undefined ? (
    value
  ) : (
    <span className="text-muted-foreground">{missingLabel[missing]}</span>
  )
}

const missingWhenUnloaded: MissingByState = { partial: "unavailable", "no-permission": "hidden" }

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/)
  return `${parts[0]?.[0] ?? ""}${parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""}`
}

export function ownerEntity(owner: string): React.ReactElement {
  return (
    <Entity>
      <EntityMedia>{initialsOf(owner)}</EntityMedia>
      <EntityName>{owner}</EntityName>
    </Entity>
  )
}

export function isPartShown(hidden: Hidden, part: ListPart, parent?: ListPart) {
  return !hidden.has(part) && (parent === undefined || !hidden.has(parent))
}

function withCardLines(
  withCard: boolean,
  trigger: ReadonlyArray<string>,
  card: ReadonlyArray<string>
) {
  if (!withCard) {
    return trigger
  }
  return [
    "<PreviewCard>",
    "  <PreviewCardTrigger>",
    ...trigger.map((line) => `    ${line}`),
    "  </PreviewCardTrigger>",
    "  <PreviewCardContent>",
    ...card.map((line) => `    ${line}`),
    "  </PreviewCardContent>",
    "</PreviewCard>",
  ]
}

function withCard(
  context: FactContext,
  trigger: React.ReactNode,
  card: React.ReactNode,
  align: "start" | "end" = "start"
) {
  if (!context.withCard) {
    return trigger
  }
  return (
    <PreviewCard open={context.cardOpen}>
      <PreviewCardTrigger>{trigger}</PreviewCardTrigger>
      <PreviewCardContent
        align={align}
        container={context.cardContainer}
        collisionAvoidance={context.cardOpen === true ? { side: "none" } : undefined}
      >
        {card}
      </PreviewCardContent>
    </PreviewCard>
  )
}

const cardComponents = ["PreviewCard", "PreviewCardContent", "PreviewCardTrigger"]

const factCardComponents = [...cardComponents, "CardFacts", "CardFact"]

const subjectCardComponents = [...cardComponents, "CardSubject", "CardName", "CardDescription"]

const recordStatusLabel: Readonly<Record<RecordStatus, string>> = {
  draft: "Draft",
  "in-review": "In review",
  approved: "Approved",
}

const recordStatusFill: Readonly<Record<RecordStatus, StatusMediaProps["fill"]>> = {
  draft: "none",
  "in-review": "half",
  approved: "full",
}

export function recordStatus(record: SampleRecord): React.ReactElement {
  return (
    <Status>
      <StatusMedia fill={recordStatusFill[record.status]} />
      <StatusName>{recordStatusLabel[record.status]}</StatusName>
    </Status>
  )
}

export const listSurface = "rounded-2xl border bg-card p-3 text-card-foreground"

export function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function shownFacts<TItem>(dataset: Dataset<TItem>, hidden: Hidden) {
  return dataset.facts.filter((fact) => !hidden.has(fact.part))
}

export function hasCard<TItem>(fact: FactDefinition<TItem>, hidden: Hidden) {
  return fact.card !== undefined && isPartShown(hidden, fact.card, fact.part)
}

const recordStatuses: ReadonlyArray<RecordStatus> = ["in-review", "draft", "approved"]

const draftIso = new Date(Date.parse(fixtureNow) - 60_000).toISOString()

const draftTime = absoluteTime.format(Date.parse(draftIso))

function draftRecord(group: string, records: ReadonlyArray<SampleRecord>): SampleRecord {
  const status = recordStatuses.find((value) => value === group)
  if (status === undefined) {
    throw new Error(`${group} is not a record status.`)
  }
  const next = Math.max(100, ...records.map((record) => Number(record.id.slice(4)))) + 1
  return {
    id: `REC-${next}`,
    title: "Untitled record",
    status,
    statusAge: "1 minute",
    owner: "Mira Okafor",
    team: "Security",
    updated: "1 minute ago",
    updatedAt: draftTime,
    updatedIso: draftIso,
    summary: "Added from the list; open it to fill in the details.",
  }
}

export const recordsDataset: Dataset<SampleRecord> = {
  noun: "records",
  item: "record",
  sampleHint: "Four fixed records from packages/fixtures.",
  keyNarrow: "hide",
  items: (options) =>
    options.data === "random" ? randomRecords(options.seed, options.count) : sampleRecords,
  value: (record) => record.id,
  key: (record) => record.id,
  name: (record) => record.title,
  nameField: "title",
  summary: (record) => record.summary,
  summaryField: "summary",
  media: {
    part: "status",
    card: "status-card",
    label: "Status",
    narrow: "keep",
    content: "Status",
    render: (record, context) =>
      withCard(
        context,
        recordStatus(record),
        <CardFacts layout="labelled">
          <CardFact label="Time in status">
            {recordStatusLabel[record.status]} for {record.statusAge}
          </CardFact>
        </CardFacts>
      ),
    code: (card) =>
      withCardLines(
        card,
        [
          "<Status>",
          "  <StatusMedia fill={statusFill[record.status]} />",
          "  <StatusName>{statusLabel[record.status]}</StatusName>",
          "</Status>",
        ],
        [
          '<CardFacts layout="labelled">',
          '  <CardFact label="Time in status">',
          "    {statusLabel[record.status]} for {record.statusAge}",
          "  </CardFact>",
          "</CardFacts>",
        ]
      ),
    components: (card) => [
      "Status",
      "StatusMedia",
      "StatusName",
      ...(card ? factCardComponents : []),
    ],
  },
  facts: [
    {
      part: "owner",
      card: "owner-card",
      cardStates: ["loaded"],
      label: "Owner",
      narrow: "abbreviate",
      content: "Entity",
      missing: missingWhenUnloaded,
      render: (record, context) =>
        withCard(
          context,
          ownerEntity(record.owner),
          <CardSubject>
            <CardName>{record.owner}</CardName>
            <CardDescription>Record owner · {record.team}</CardDescription>
          </CardSubject>,
          "end"
        ),
      code: (card) =>
        withCardLines(
          card,
          [
            "<Entity>",
            "  <EntityMedia>{initialsOf(record.owner)}</EntityMedia>",
            "  <EntityName>{record.owner}</EntityName>",
            "</Entity>",
          ],
          [
            "<CardSubject>",
            "  <CardName>{record.owner}</CardName>",
            "  <CardDescription>Record owner · {record.team}</CardDescription>",
            "</CardSubject>",
          ]
        ),
      components: (card) => [
        "Entity",
        "EntityMedia",
        "EntityName",
        ...(card ? subjectCardComponents : []),
      ],
    },
    {
      part: "updated",
      label: "Updated",
      narrow: "hide",
      content: "RelativeTime",
      render: (record) => <RelativeTime dateTime={record.updatedIso} now={fixtureNow} />,
      code: () => ["<RelativeTime dateTime={record.updatedAt} now={now} />"],
      components: () => ["RelativeTime"],
    },
  ],
  fields: (record, state) => [
    {
      label: "Status",
      value: `${recordStatusLabel[record.status]} for ${record.statusAge}`,
    },
    { label: "Owner", value: fieldValue(missingWhenUnloaded[state], record.owner) },
    { label: "Updated", value: `${record.updated} (${record.updatedAt})` },
    { label: "Team", value: record.team },
  ],
  groups: recordStatuses.map((status) => ({
    value: status,
    name: recordStatusLabel[status],
    fill: recordStatusFill[status],
  })),
  groupOf: (record) => record.status,
  draft: draftRecord,
  partialMessage: "Owners could not load: the directory service did not respond.",
  partialRetry: "Retry owners",
  noPermissionMessage:
    "Owner is visible to the Compliance viewer role. Ask a workspace admin for access.",
}
