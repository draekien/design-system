import {
  FieldCard,
  FieldCardContent,
  FieldCardTrigger,
} from "@workspace/ui/components/field-card.tsx"
import { FieldState } from "@workspace/ui/components/field-state.tsx"
import { Figure } from "@workspace/ui/components/figure.tsx"
import { PersonMark } from "@workspace/ui/components/person-mark.tsx"
import {
  RecordList,
  RecordRow,
  RecordRowGlyph,
  RecordRowIdentify,
  RecordRowKey,
  RecordRowLink,
  RecordRowName,
  RecordRowSelect,
} from "@workspace/ui/components/record-list.tsx"
import { RelativeTime } from "@workspace/ui/components/relative-time.tsx"
import {
  StatusMark,
  StatusMarkDot,
  StatusMarkLabel,
} from "@workspace/ui/components/status-mark.tsx"
import { Track } from "@workspace/ui/components/track.tsx"
import * as React from "react"

export type ComponentSpecimen = {
  fileName: string
  code: string
  Preview: () => React.ReactElement
}

const listRecords = [
  { id: "REC-101", name: "Vendor onboarding checklist", fill: "none", status: "Draft" },
  { id: "REC-104", name: "Quarterly access review", fill: "half", status: "In review" },
  { id: "REC-109", name: "Data retention policy", fill: "full", status: "Approved" },
] as const

function RecordListPreview() {
  const hintId = React.useId()
  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card text-card-foreground">
      <RecordList aria-label="Records" aria-describedby={hintId}>
        {listRecords.map((record) => (
          <RecordRow key={record.id} value={record.id} className="last:border-b-0">
            <RecordRowSelect />
            <RecordRowLink href={`#${record.id}`}>
              <RecordRowIdentify>
                <RecordRowKey narrow="hide">{record.id}</RecordRowKey>
                <RecordRowGlyph>
                  <StatusMark>
                    <StatusMarkDot fill={record.fill} />
                    <StatusMarkLabel>{record.status}</StatusMarkLabel>
                  </StatusMark>
                </RecordRowGlyph>
                <RecordRowName>{record.name}</RecordRowName>
              </RecordRowIdentify>
            </RecordRowLink>
          </RecordRow>
        ))}
      </RecordList>
      <p id={hintId} className="border-t px-3 py-2 text-muted-foreground text-xs">
        ↑ ↓ move between rows · X selects the focused row
      </p>
    </div>
  )
}

const recordListCode = `import {
  RecordList,
  RecordRow,
  RecordRowGlyph,
  RecordRowIdentify,
  RecordRowKey,
  RecordRowLink,
  RecordRowName,
  RecordRowSelect,
} from "@/components/record-list"
import { StatusMark, StatusMarkDot, StatusMarkLabel } from "@/components/status-mark"
import * as React from "react"

const records = [
  { id: "REC-101", name: "Vendor onboarding checklist", fill: "none", status: "Draft" },
  { id: "REC-104", name: "Quarterly access review", fill: "half", status: "In review" },
  { id: "REC-109", name: "Data retention policy", fill: "full", status: "Approved" },
] as const

export function RecordListExample() {
  const hintId = React.useId()
  return (
    <>
      <RecordList aria-label="Records" aria-describedby={hintId}>
        {records.map((record) => (
          <RecordRow key={record.id} value={record.id}>
            <RecordRowSelect />
            <RecordRowLink href={\`/records/\${record.id}\`}>
              <RecordRowIdentify>
                <RecordRowKey narrow="hide">{record.id}</RecordRowKey>
                <RecordRowGlyph>
                  <StatusMark>
                    <StatusMarkDot fill={record.fill} />
                    <StatusMarkLabel>{record.status}</StatusMarkLabel>
                  </StatusMark>
                </RecordRowGlyph>
                <RecordRowName>{record.name}</RecordRowName>
              </RecordRowIdentify>
            </RecordRowLink>
          </RecordRow>
        ))}
      </RecordList>
      <p id={hintId}>↑ ↓ move between rows · X selects the focused row</p>
    </>
  )
}
`

function StatusMarkPreview() {
  return (
    <div className="flex flex-wrap items-center gap-6 text-sm">
      <StatusMark>
        <StatusMarkDot fill="none" />
        <StatusMarkLabel>Draft</StatusMarkLabel>
      </StatusMark>
      <StatusMark>
        <StatusMarkDot fill="half" />
        <StatusMarkLabel>In review</StatusMarkLabel>
      </StatusMark>
      <StatusMark>
        <StatusMarkDot fill="full" />
        <StatusMarkLabel>Approved</StatusMarkLabel>
      </StatusMark>
    </div>
  )
}

const statusMarkCode = `import { StatusMark, StatusMarkDot, StatusMarkLabel } from "@/components/status-mark"

export function StatusMarkExample() {
  return (
    <>
      <StatusMark>
        <StatusMarkDot fill="none" />
        <StatusMarkLabel>Draft</StatusMarkLabel>
      </StatusMark>
      <StatusMark>
        <StatusMarkDot fill="half" />
        <StatusMarkLabel>In review</StatusMarkLabel>
      </StatusMark>
      <StatusMark>
        <StatusMarkDot fill="full" />
        <StatusMarkLabel>Approved</StatusMarkLabel>
      </StatusMark>
    </>
  )
}
`

function PersonMarkPreview() {
  return (
    <div className="text-sm">
      <PersonMark name="Mira Okafor" />
    </div>
  )
}

const personMarkCode = `import { PersonMark } from "@/components/person-mark"

export function PersonMarkExample() {
  return <PersonMark name="Mira Okafor" />
}
`

function FigurePreview() {
  return (
    <div className="flex w-40 text-sm">
      <Figure value={12_840.5} format={{ style: "currency", currency: "AUD" }} locale="en-AU" />
    </div>
  )
}

const figureCode = `import { Figure } from "@/components/figure"

export function FigureExample() {
  return <Figure value={12_840.5} format={{ style: "currency", currency: "AUD" }} locale="en-AU" />
}
`

function TrackPreview() {
  return (
    <div className="text-sm">
      <Track value={0.4} max={1} format={{ style: "percent" }} aria-label="Paid" />
    </div>
  )
}

const trackCode = `import { Track } from "@/components/track"

export function TrackExample() {
  return <Track value={0.4} max={1} format={{ style: "percent" }} aria-label="Paid" />
}
`

function RelativeTimePreview() {
  return (
    <div className="text-sm">
      <RelativeTime dateTime="2026-10-15T09:12:00Z" now="2026-10-15T11:12:00Z" />
    </div>
  )
}

const relativeTimeCode = `import { RelativeTime } from "@/components/relative-time"

export function RelativeTimeExample() {
  return <RelativeTime dateTime="2026-10-15T09:12:00Z" now="2026-10-15T11:12:00Z" />
}
`

function FieldStatePreview() {
  return (
    <div className="flex flex-wrap items-center gap-6 text-sm">
      <FieldState state="unavailable" />
      <FieldState state="hidden" />
    </div>
  )
}

const fieldStateCode = `import { FieldState } from "@/components/field-state"

export function FieldStateExample() {
  return (
    <>
      <FieldState state="unavailable" />
      <FieldState state="hidden" />
    </>
  )
}
`

function FieldCardPreview() {
  return (
    <div className="text-sm">
      <FieldCard>
        <FieldCardTrigger>
          <PersonMark name="Mira Okafor" />
        </FieldCardTrigger>
        <FieldCardContent>
          <p className="font-medium text-sm">Mira Okafor</p>
          <p className="mt-1 text-muted-foreground">Record owner · Security</p>
        </FieldCardContent>
      </FieldCard>
    </div>
  )
}

const fieldCardCode = `import { FieldCard, FieldCardContent, FieldCardTrigger } from "@/components/field-card"
import { PersonMark } from "@/components/person-mark"

export function FieldCardExample() {
  return (
    <FieldCard>
      <FieldCardTrigger>
        <PersonMark name="Mira Okafor" />
      </FieldCardTrigger>
      <FieldCardContent>
        <p className="font-medium text-sm">Mira Okafor</p>
        <p className="mt-1 text-muted-foreground">Record owner · Security</p>
      </FieldCardContent>
    </FieldCard>
  )
}
`

export const componentSpecimens: Readonly<Record<string, ComponentSpecimen>> = {
  "record-list": {
    fileName: "record-list-example.tsx",
    code: recordListCode,
    Preview: RecordListPreview,
  },
  "status-mark": {
    fileName: "status-mark-example.tsx",
    code: statusMarkCode,
    Preview: StatusMarkPreview,
  },
  "person-mark": {
    fileName: "person-mark-example.tsx",
    code: personMarkCode,
    Preview: PersonMarkPreview,
  },
  figure: { fileName: "figure-example.tsx", code: figureCode, Preview: FigurePreview },
  track: { fileName: "track-example.tsx", code: trackCode, Preview: TrackPreview },
  "relative-time": {
    fileName: "relative-time-example.tsx",
    code: relativeTimeCode,
    Preview: RelativeTimePreview,
  },
  "field-state": {
    fileName: "field-state-example.tsx",
    code: fieldStateCode,
    Preview: FieldStatePreview,
  },
  "field-card": {
    fileName: "field-card-example.tsx",
    code: fieldCardCode,
    Preview: FieldCardPreview,
  },
}
