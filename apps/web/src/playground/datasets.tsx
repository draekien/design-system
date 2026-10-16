import type { SampleInvoice } from "@workspace/fixtures/invoices.ts"
import { sampleInvoices } from "@workspace/fixtures/invoices.ts"
import {
  fixtureNow,
  type RecordStatus,
  type SampleRecord,
  sampleRecords,
} from "@workspace/fixtures/records.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import {
  FieldCard,
  FieldCardContent,
  FieldCardTrigger,
} from "@workspace/ui/components/field-card.tsx"
import { FieldState } from "@workspace/ui/components/field-state.tsx"
import { Figure } from "@workspace/ui/components/figure.tsx"
import { PersonMark } from "@workspace/ui/components/person-mark.tsx"
import type { RecordRowNarrow } from "@workspace/ui/components/record-row.tsx"
import { RelativeTime } from "@workspace/ui/components/relative-time.tsx"
import {
  StatusMark,
  StatusMarkDot,
  type StatusMarkDotProps,
  StatusMarkLabel,
} from "@workspace/ui/components/status-mark.tsx"
import { Track } from "@workspace/ui/components/track.tsx"
import type * as React from "react"
import type { CanvasDataset, CanvasOptions, RecordListPart } from "./playground-search.ts"
import { randomInvoices, randomRecords } from "./random-records.ts"

export type RowState = Exclude<FixtureState, "error" | "loading">

export type Hidden = ReadonlySet<RecordListPart>

export type ReadContext = {
  state: RowState
  cardOpen?: boolean
  withCard: boolean
  cardContainer?: HTMLElement | null
}

export type ReadDefinition<TItem> = {
  part: RecordListPart
  card?: RecordListPart
  cardStates?: ReadonlyArray<RowState>
  label: string
  narrow: RecordRowNarrow
  content: string
  render: (item: TItem, context: ReadContext) => React.ReactNode
  code: (withCard: boolean) => ReadonlyArray<string>
  components: (withCard: boolean) => ReadonlyArray<string>
}

export type Field = { label: string; value: React.ReactNode }

export type Dataset<TItem> = {
  id: CanvasDataset
  noun: string
  item: string
  sampleHint: string
  keyNarrow: RecordRowNarrow
  items: (options: Pick<CanvasOptions, "data" | "seed" | "count">) => ReadonlyArray<TItem>
  value: (item: TItem) => string
  key: (item: TItem) => string
  name: (item: TItem) => string
  nameField: string
  summary: (item: TItem) => string
  glyph?: ReadDefinition<TItem>
  reads: ReadonlyArray<ReadDefinition<TItem>>
  fields: (item: TItem, state: RowState) => ReadonlyArray<Field>
  partialMessage: string
  partialRetry: string
  noPermissionMessage: string
}

export type DatasetPart = { part: RecordListPart; label: string; parent?: RecordListPart }

export function datasetParts<TItem>(dataset: Dataset<TItem>): ReadonlyArray<DatasetPart> {
  return [
    { part: "select", label: "RecordRowSelect" },
    { part: "key", label: "RecordRowKey" },
    ...[...(dataset.glyph === undefined ? [] : [dataset.glyph]), ...dataset.reads].flatMap(
      (read) => [
        { part: read.part, label: `${read.label} · ${read.content}` },
        ...(read.card === undefined
          ? []
          : [{ part: read.card, label: `${read.label} hover card`, parent: read.part }]),
      ]
    ),
  ]
}

export function isPartShown(hidden: Hidden, part: RecordListPart, parent?: RecordListPart) {
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
    "<FieldCard>",
    "  <FieldCardTrigger>",
    ...trigger.map((line) => `    ${line}`),
    "  </FieldCardTrigger>",
    "  <FieldCardContent>",
    ...card.map((line) => `    ${line}`),
    "  </FieldCardContent>",
    "</FieldCard>",
  ]
}

function withCard(
  context: ReadContext,
  trigger: React.ReactNode,
  card: React.ReactNode,
  align: "start" | "end" = "start"
) {
  if (!context.withCard) {
    return trigger
  }
  return (
    <FieldCard open={context.cardOpen}>
      <FieldCardTrigger>{trigger}</FieldCardTrigger>
      <FieldCardContent
        align={align}
        container={context.cardContainer}
        collisionAvoidance={context.cardOpen === true ? { side: "none" } : undefined}
      >
        {card}
      </FieldCardContent>
    </FieldCard>
  )
}

const cardComponents = ["FieldCard", "FieldCardContent", "FieldCardTrigger"]

const recordStatusLabel: Readonly<Record<RecordStatus, string>> = {
  draft: "Draft",
  "in-review": "In review",
  approved: "Approved",
}

const recordStatusFill: Readonly<Record<RecordStatus, StatusMarkDotProps["fill"]>> = {
  draft: "none",
  "in-review": "half",
  approved: "full",
}

function recordStatusMark(record: SampleRecord) {
  return (
    <StatusMark>
      <StatusMarkDot fill={recordStatusFill[record.status]} />
      <StatusMarkLabel>{recordStatusLabel[record.status]}</StatusMarkLabel>
    </StatusMark>
  )
}

function ownerValue(record: SampleRecord, state: RowState, context?: ReadContext) {
  switch (state) {
    case "partial":
      return <FieldState state="unavailable" />
    case "no-permission":
      return <FieldState state="hidden" />
    case "loaded":
      return context === undefined
        ? record.owner
        : withCard(
            context,
            <PersonMark name={record.owner} />,
            <>
              <p className="font-medium text-sm">{record.owner}</p>
              <p className="mt-1 text-muted-foreground">Record owner · {record.team}</p>
            </>,
            "end"
          )
  }
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
  glyph: {
    part: "status",
    card: "status-card",
    label: "Status",
    narrow: "keep",
    content: "StatusMark",
    render: (record, context) =>
      withCard(
        context,
        recordStatusMark(record),
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
          "<StatusMark>",
          "  <StatusMarkDot fill={statusFill[record.status]} />",
          "  <StatusMarkLabel>{statusLabel[record.status]}</StatusMarkLabel>",
          "</StatusMark>",
        ],
        ["{statusLabel[record.status]} for {record.statusAge}"]
      ),
    components: (card) => [
      "StatusMark",
      "StatusMarkDot",
      "StatusMarkLabel",
      ...(card ? cardComponents : []),
    ],
  },
  reads: [
    {
      part: "owner",
      card: "owner-card",
      cardStates: ["loaded"],
      label: "Owner",
      narrow: "abbreviate",
      content: "PersonMark",
      render: (record, context) => ownerValue(record, context.state, context),
      code: (card) =>
        withCardLines(
          card,
          ["<PersonMark name={record.owner} />"],
          ["{record.owner} · {record.team}"]
        ),
      components: (card) => ["PersonMark", ...(card ? cardComponents : [])],
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
    { label: "Owner", value: ownerValue(record, state) },
    { label: "Team", value: record.team },
    { label: "Updated", value: `${record.updated} (${record.updatedAt})` },
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

function amountValue(invoice: SampleInvoice, state: RowState, inRow: boolean) {
  if (state === "no-permission") {
    return <FieldState state="hidden" />
  }
  return inRow ? (
    <Figure value={invoice.amount} format={amountFormat} locale="en-AU" />
  ) : (
    new Intl.NumberFormat("en-AU", amountFormat).format(invoice.amount)
  )
}

function paidValue(invoice: SampleInvoice, state: RowState, inRow: boolean) {
  switch (state) {
    case "partial":
      return <FieldState state="unavailable" />
    case "no-permission":
      return <FieldState state="hidden" />
    case "loaded":
      return inRow ? (
        <Track value={invoice.paid} max={1} format={paidFormat} aria-label="Paid" />
      ) : (
        new Intl.NumberFormat("en", paidFormat).format(invoice.paid)
      )
  }
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
  glyph: {
    part: "status",
    label: "Status",
    narrow: "keep",
    content: "StatusMark",
    render: (invoice) => (
      <StatusMark>
        <StatusMarkDot fill={invoiceStatusFill[invoice.status]} />
        <StatusMarkLabel>{invoiceStatusLabel[invoice.status]}</StatusMarkLabel>
      </StatusMark>
    ),
    code: () => [
      "<StatusMark>",
      "  <StatusMarkDot fill={statusFill[invoice.status]} />",
      "  <StatusMarkLabel>{statusLabel[invoice.status]}</StatusMarkLabel>",
      "</StatusMark>",
    ],
    components: () => ["StatusMark", "StatusMarkDot", "StatusMarkLabel"],
  },
  reads: [
    {
      part: "amount",
      label: "Amount",
      narrow: "abbreviate",
      content: "Figure",
      render: (invoice, context) => amountValue(invoice, context.state, true),
      code: () => [
        '<Figure value={invoice.amount} format={{ style: "currency", currency: "AUD" }} />',
      ],
      components: () => ["Figure"],
    },
    {
      part: "paid",
      label: "Paid",
      narrow: "abbreviate",
      content: "Track",
      render: (invoice, context) => paidValue(invoice, context.state, true),
      code: () => [
        '<Track value={invoice.paid} max={1} format={{ style: "percent" }} aria-label="Paid" />',
      ],
      components: () => ["Track"],
    },
    {
      part: "due",
      label: "Due",
      narrow: "hide",
      content: "RelativeTime",
      render: (invoice) => <RelativeTime dateTime={invoice.dueIso} now={fixtureNow} />,
      code: () => ["<RelativeTime dateTime={invoice.dueAt} now={now} />"],
      components: () => ["RelativeTime"],
    },
  ],
  fields: (invoice, state) => [
    { label: "Status", value: invoiceStatusLabel[invoice.status] },
    { label: "Amount", value: amountValue(invoice, state, false) },
    { label: "Paid", value: paidValue(invoice, state, false) },
    { label: "Contact", value: invoice.contact },
    { label: "Due", value: invoice.dueAt },
  ],
  partialMessage: "Payments could not load: the payments service did not respond.",
  partialRetry: "Retry payments",
  noPermissionMessage:
    "Amounts are visible to the Finance viewer role. Ask a workspace admin for access.",
}
