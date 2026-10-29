import type { SampleInvoice } from "@workspace/fixtures/invoices.ts"
import { sampleInvoices } from "@workspace/fixtures/invoices.ts"
import {
  fixtureNow,
  type RecordStatus,
  type SampleRecord,
  sampleRecords,
} from "@workspace/fixtures/records.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import { Entity, EntityMedia, EntityName } from "@workspace/registry/components/entity.tsx"
import { Figure } from "@workspace/registry/components/figure.tsx"
import type { ListRowFactProps, ListRowNarrow } from "@workspace/registry/components/list.tsx"
import { Meter } from "@workspace/registry/components/meter.tsx"
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
import type { CanvasDataset, CanvasOptions, ListPart } from "../../playground/playground-search.ts"
import { dueClass, readDue } from "../table/table-model.ts"
import { randomInvoices, randomRecords } from "./random-records.ts"

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

export type Dataset<TItem> = {
  id: CanvasDataset
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
  partialMessage: string
  partialRetry: string
  noPermissionMessage: string
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

const missingWithoutPermission: MissingByState = { "no-permission": "hidden" }

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/)
  return `${parts[0]?.[0] ?? ""}${parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""}`
}

function ownerEntity(owner: string) {
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

function recordStatus(record: SampleRecord) {
  return (
    <Status>
      <StatusMedia fill={recordStatusFill[record.status]} />
      <StatusName>{recordStatusLabel[record.status]}</StatusName>
    </Status>
  )
}

export const listSurface = "rounded-card border bg-card p-3 text-card-foreground"

export function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function shownFacts<TItem>(dataset: Dataset<TItem>, hidden: Hidden) {
  return dataset.facts.filter((fact) => !hidden.has(fact.part))
}

export function hasCard<TItem>(fact: FactDefinition<TItem>, hidden: Hidden) {
  return fact.card !== undefined && isPartShown(hidden, fact.card, fact.part)
}

export const recordsDataset: Dataset<SampleRecord> = {
  id: "records",
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
        <>
          <p className="text-muted-foreground">Time in status</p>
          <p className="mt-1 font-medium text-sm">
            {recordStatusLabel[record.status]} for {record.statusAge}
          </p>
        </>
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
        ["{statusLabel[record.status]} for {record.statusAge}"]
      ),
    components: (card) => ["Status", "StatusMedia", "StatusName", ...(card ? cardComponents : [])],
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
          <>
            <p className="font-medium text-sm">{record.owner}</p>
            <p className="mt-1 text-muted-foreground">Record owner · {record.team}</p>
          </>,
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
          ["{record.owner} · {record.team}"]
        ),
      components: (card) => [
        "Entity",
        "EntityMedia",
        "EntityName",
        ...(card ? cardComponents : []),
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
  partialMessage: "Owners could not load: the directory service did not respond.",
  partialRetry: "Retry owners",
  noPermissionMessage:
    "Owner is visible to the Compliance viewer role. Ask a workspace admin for access.",
}

const invoiceStatusLabel = { draft: "Draft", sent: "Sent", paid: "Paid" } as const

const invoiceStatusFill = { draft: "none", sent: "half", paid: "full" } as const

const amountFormat: Intl.NumberFormatOptions = { style: "currency", currency: "AUD" }

const paidFormat: Intl.NumberFormatOptions = { style: "percent" }

function invoiceDue(invoice: SampleInvoice): React.ReactElement {
  const due = readDue(invoice)
  return (
    <span className={dueClass[due.kind]}>
      {due.kind === "overdue" ? (
        <>
          <span data-abbreviation="long">{due.text}</span>
          <span data-abbreviation="short" aria-hidden="true" className="hidden">
            Overdue {due.days}d
          </span>
        </>
      ) : (
        <>
          Due <RelativeTime dateTime={invoice.dueIso} now={fixtureNow} />
        </>
      )}
    </span>
  )
}

export const invoicesDataset: Dataset<SampleInvoice> = {
  id: "invoices",
  noun: "invoices",
  item: "invoice",
  sampleHint: "Four fixed invoices from packages/fixtures.",
  keyNarrow: "hide",
  items: (options) =>
    options.data === "random" ? randomInvoices(options.seed, options.count) : sampleInvoices,
  value: (invoice) => invoice.id,
  key: (invoice) => invoice.id,
  name: (invoice) => invoice.customer,
  nameField: "customer",
  summary: (invoice) => invoice.summary,
  summaryField: "summary",
  media: {
    part: "status",
    label: "Status",
    narrow: "keep",
    content: "Status",
    render: (invoice) => (
      <Status>
        <StatusMedia fill={invoiceStatusFill[invoice.status]} />
        <StatusName>{invoiceStatusLabel[invoice.status]}</StatusName>
      </Status>
    ),
    code: () => [
      "<Status>",
      "  <StatusMedia fill={statusFill[invoice.status]} />",
      "  <StatusName>{statusLabel[invoice.status]}</StatusName>",
      "</Status>",
    ],
    components: () => ["Status", "StatusMedia", "StatusName"],
  },
  facts: [
    {
      part: "amount",
      label: "Amount",
      narrow: "abbreviate",
      content: "Figure",
      missing: missingWithoutPermission,
      render: (invoice) => <Figure value={invoice.amount} format={amountFormat} locale="en-AU" />,
      code: () => [
        '<Figure value={invoice.amount} format={{ style: "currency", currency: "AUD" }} />',
      ],
      components: () => ["Figure"],
    },
    {
      part: "paid",
      label: "Paid",
      narrow: "abbreviate",
      content: "Meter",
      missing: missingWhenUnloaded,
      render: (invoice) => (
        <Meter value={invoice.paid} max={1} format={paidFormat} aria-label="Paid" />
      ),
      code: () => [
        '<Meter value={invoice.paid} max={1} format={{ style: "percent" }} aria-label="Paid" />',
      ],
      components: () => ["Meter"],
    },
    {
      part: "due",
      label: "Due",
      narrow: "abbreviate",
      content: "RelativeTime",
      render: invoiceDue,
      code: () => [
        "<span className={dueClass[due.kind]}>",
        '  {due.kind === "overdue" ? due.text : <>Due <RelativeTime dateTime={invoice.dueAt} now={now} /></>}',
        "</span>",
      ],
      components: () => ["RelativeTime"],
    },
  ],
  fields: (invoice, state) => [
    { label: "Status", value: invoiceStatusLabel[invoice.status] },
    {
      label: "Amount",
      value: fieldValue(
        missingWithoutPermission[state],
        new Intl.NumberFormat("en-AU", amountFormat).format(invoice.amount)
      ),
    },
    {
      label: "Paid",
      value: fieldValue(
        missingWhenUnloaded[state],
        new Intl.NumberFormat("en", paidFormat).format(invoice.paid)
      ),
    },
    { label: "Due", value: invoice.dueAt },
    { label: "Contact", value: invoice.contact },
  ],
  partialMessage: "Payments could not load: the payments service did not respond.",
  partialRetry: "Retry payments",
  noPermissionMessage:
    "Amounts are visible to the Finance viewer role. Ask a workspace admin for access.",
}
