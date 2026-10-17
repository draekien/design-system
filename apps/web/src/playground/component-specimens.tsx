import {
  FieldCard,
  FieldCardContent,
  FieldCardTrigger,
} from "@workspace/ui/components/field-card.tsx"
import { FieldState } from "@workspace/ui/components/field-state.tsx"
import { Figure } from "@workspace/ui/components/figure.tsx"
import { PersonMark } from "@workspace/ui/components/person-mark.tsx"
import { RecordList } from "@workspace/ui/components/record-list.tsx"
import {
  RecordRow,
  RecordRowGlyph,
  RecordRowIdentify,
  RecordRowKey,
  RecordRowLink,
  RecordRowName,
  RecordRowRead,
  RecordRowSelect,
} from "@workspace/ui/components/record-row.tsx"
import { RelativeTime } from "@workspace/ui/components/relative-time.tsx"
import {
  StatusMark,
  StatusMarkDot,
  StatusMarkLabel,
} from "@workspace/ui/components/status-mark.tsx"
import { Track } from "@workspace/ui/components/track.tsx"
import type * as React from "react"

export type ComponentSpecimen = {
  fileName: string
  code: string
  Preview: () => React.ReactElement
}

function RecordRowPreview() {
  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card text-card-foreground">
      <RecordList aria-label="Records">
        <RecordRow value="REC-104" className="border-b-0">
          <RecordRowSelect />
          <RecordRowLink href="#REC-104">
            <RecordRowIdentify>
              <RecordRowKey narrow="hide">REC-104</RecordRowKey>
              <RecordRowGlyph>
                <StatusMark>
                  <StatusMarkDot fill="half" />
                  <StatusMarkLabel>In review</StatusMarkLabel>
                </StatusMark>
              </RecordRowGlyph>
              <RecordRowName>Quarterly access review</RecordRowName>
            </RecordRowIdentify>
            <RecordRowRead narrow="abbreviate">
              <PersonMark name="Mira Okafor" />
            </RecordRowRead>
            <RecordRowRead narrow="hide">
              <RelativeTime dateTime="2026-10-15T09:12:00Z" now="2026-10-15T11:12:00Z" />
            </RecordRowRead>
          </RecordRowLink>
        </RecordRow>
      </RecordList>
    </div>
  )
}

const recordRowCode = `import { PersonMark } from "@/components/person-mark"
import { RecordList } from "@/components/record-list"
import {
  RecordRow,
  RecordRowGlyph,
  RecordRowIdentify,
  RecordRowKey,
  RecordRowLink,
  RecordRowName,
  RecordRowRead,
  RecordRowSelect,
} from "@/components/record-row"
import { RelativeTime } from "@/components/relative-time"
import { StatusMark, StatusMarkDot, StatusMarkLabel } from "@/components/status-mark"

export function RecordRowExample() {
  return (
    <RecordList aria-label="Records">
      <RecordRow value="REC-104">
        <RecordRowSelect />
        <RecordRowLink href="/records/REC-104">
          <RecordRowIdentify>
            <RecordRowKey narrow="hide">REC-104</RecordRowKey>
            <RecordRowGlyph>
              <StatusMark>
                <StatusMarkDot fill="half" />
                <StatusMarkLabel>In review</StatusMarkLabel>
              </StatusMark>
            </RecordRowGlyph>
            <RecordRowName>Quarterly access review</RecordRowName>
          </RecordRowIdentify>
          <RecordRowRead narrow="abbreviate">
            <PersonMark name="Mira Okafor" />
          </RecordRowRead>
          <RecordRowRead narrow="hide">
            <RelativeTime dateTime="2026-10-15T09:12:00Z" now="2026-10-15T11:12:00Z" />
          </RecordRowRead>
        </RecordRowLink>
      </RecordRow>
    </RecordList>
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
  "record-row": {
    fileName: "record-row-example.tsx",
    code: recordRowCode,
    Preview: RecordRowPreview,
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
