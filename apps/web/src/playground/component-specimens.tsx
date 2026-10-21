import {
  Entity,
  EntityDescription,
  EntityMedia,
  EntityName,
} from "@workspace/ui/components/entity.tsx"
import { Figure } from "@workspace/ui/components/figure.tsx"
import { Meter } from "@workspace/ui/components/meter.tsx"
import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@workspace/ui/components/preview-card.tsx"
import {
  RecordList,
  RecordRow,
  RecordRowFact,
  RecordRowId,
  RecordRowLink,
  RecordRowMedia,
  RecordRowName,
  RecordRowSelect,
  RecordRowSubject,
} from "@workspace/ui/components/record-list.tsx"
import { RelativeTime } from "@workspace/ui/components/relative-time.tsx"
import {
  Status,
  StatusDescription,
  StatusMedia,
  StatusName,
} from "@workspace/ui/components/status.tsx"
import * as React from "react"

export type ComponentSpecimen = {
  fileName: string
  code: string
  Preview: () => React.ReactElement
}

const listRecords = [
  {
    id: "REC-101",
    name: "Vendor onboarding checklist",
    fill: "none",
    status: "Draft",
    owner: { initials: "MO", name: "Mira Okafor" },
  },
  {
    id: "REC-104",
    name: "Quarterly access review",
    fill: "half",
    status: "In review",
    owner: { initials: "DP", name: "Dev Patel" },
  },
  {
    id: "REC-109",
    name: "Data retention policy",
    fill: "full",
    status: "Approved",
    owner: { initials: "AL", name: "Ana Lim" },
  },
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
              <RecordRowSubject>
                <RecordRowId narrow="hide">{record.id}</RecordRowId>
                <RecordRowMedia>
                  <PreviewCard>
                    <PreviewCardTrigger>
                      <Status>
                        <StatusMedia fill={record.fill} />
                        <StatusName>{record.status}</StatusName>
                      </Status>
                    </PreviewCardTrigger>
                    <PreviewCardContent>
                      <p className="font-medium text-sm">{record.status}</p>
                    </PreviewCardContent>
                  </PreviewCard>
                </RecordRowMedia>
                <RecordRowName>{record.name}</RecordRowName>
              </RecordRowSubject>
              <RecordRowFact narrow="abbreviate">
                <Entity>
                  <EntityMedia>{record.owner.initials}</EntityMedia>
                  <EntityName>{record.owner.name}</EntityName>
                </Entity>
              </RecordRowFact>
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

const recordListCode = `import { Entity, EntityMedia, EntityName } from "@/components/entity"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card"
import {
  RecordList,
  RecordRow,
  RecordRowFact,
  RecordRowId,
  RecordRowLink,
  RecordRowMedia,
  RecordRowName,
  RecordRowSelect,
  RecordRowSubject,
} from "@/components/record-list"
import { Status, StatusMedia, StatusName } from "@/components/status"
import * as React from "react"

const records = [
  {
    id: "REC-101",
    name: "Vendor onboarding checklist",
    fill: "none",
    status: "Draft",
    owner: { initials: "MO", name: "Mira Okafor" },
  },
  {
    id: "REC-104",
    name: "Quarterly access review",
    fill: "half",
    status: "In review",
    owner: { initials: "DP", name: "Dev Patel" },
  },
  {
    id: "REC-109",
    name: "Data retention policy",
    fill: "full",
    status: "Approved",
    owner: { initials: "AL", name: "Ana Lim" },
  },
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
              <RecordRowSubject>
                <RecordRowId narrow="hide">{record.id}</RecordRowId>
                <RecordRowMedia>
                  <PreviewCard>
                    <PreviewCardTrigger>
                      <Status>
                        <StatusMedia fill={record.fill} />
                        <StatusName>{record.status}</StatusName>
                      </Status>
                    </PreviewCardTrigger>
                    <PreviewCardContent>
                      <p className="font-medium text-sm">{record.status}</p>
                    </PreviewCardContent>
                  </PreviewCard>
                </RecordRowMedia>
                <RecordRowName>{record.name}</RecordRowName>
              </RecordRowSubject>
              <RecordRowFact narrow="abbreviate">
                <Entity>
                  <EntityMedia>{record.owner.initials}</EntityMedia>
                  <EntityName>{record.owner.name}</EntityName>
                </Entity>
              </RecordRowFact>
            </RecordRowLink>
          </RecordRow>
        ))}
      </RecordList>
      <p id={hintId}>↑ ↓ move between rows · X selects the focused row</p>
    </>
  )
}
`

function StatusPreview() {
  return (
    <div className="flex flex-wrap items-center gap-6 text-sm">
      <Status>
        <StatusMedia fill="none" />
        <StatusName>Draft</StatusName>
      </Status>
      <Status>
        <StatusMedia fill="half" />
        <StatusName>In review</StatusName>
        <StatusDescription>since 3 Oct</StatusDescription>
      </Status>
      <Status>
        <StatusMedia fill="full" />
        <StatusName>Approved</StatusName>
      </Status>
    </div>
  )
}

const statusCode = `import { Status, StatusDescription, StatusMedia, StatusName } from "@/components/status"

export function StatusExample() {
  return (
    <>
      <Status>
        <StatusMedia fill="none" />
        <StatusName>Draft</StatusName>
      </Status>
      <Status>
        <StatusMedia fill="half" />
        <StatusName>In review</StatusName>
        <StatusDescription>since 3 Oct</StatusDescription>
      </Status>
      <Status>
        <StatusMedia fill="full" />
        <StatusName>Approved</StatusName>
      </Status>
    </>
  )
}
`

function EntityPreview() {
  return (
    <div className="text-sm">
      <Entity>
        <EntityMedia>MO</EntityMedia>
        <EntityName>Mira Okafor</EntityName>
        <EntityDescription>Security</EntityDescription>
      </Entity>
    </div>
  )
}

const entityCode = `import { Entity, EntityDescription, EntityMedia, EntityName } from "@/components/entity"

export function EntityExample() {
  return (
    <Entity>
      <EntityMedia>MO</EntityMedia>
      <EntityName>Mira Okafor</EntityName>
      <EntityDescription>Security</EntityDescription>
    </Entity>
  )
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

function MeterPreview() {
  return (
    <div className="text-sm">
      <Meter value={0.4} max={1} format={{ style: "percent" }} aria-label="Paid" />
    </div>
  )
}

const meterCode = `import { Meter } from "@/components/meter"

export function MeterExample() {
  return <Meter value={0.4} max={1} format={{ style: "percent" }} aria-label="Paid" />
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

function PreviewCardPreview() {
  return (
    <div className="text-sm">
      <PreviewCard>
        <PreviewCardTrigger>
          <Entity>
            <EntityMedia>MO</EntityMedia>
            <EntityName>Mira Okafor</EntityName>
          </Entity>
        </PreviewCardTrigger>
        <PreviewCardContent>
          <p className="font-medium text-sm">Mira Okafor</p>
          <p className="mt-1 text-muted-foreground">Record owner · Security</p>
        </PreviewCardContent>
      </PreviewCard>
    </div>
  )
}

const previewCardCode = `import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card"
import { Entity, EntityMedia, EntityName } from "@/components/entity"

export function PreviewCardExample() {
  return (
    <PreviewCard>
      <PreviewCardTrigger>
        <Entity>
          <EntityMedia>MO</EntityMedia>
          <EntityName>Mira Okafor</EntityName>
        </Entity>
      </PreviewCardTrigger>
      <PreviewCardContent>
        <p className="font-medium text-sm">Mira Okafor</p>
        <p className="mt-1 text-muted-foreground">Record owner · Security</p>
      </PreviewCardContent>
    </PreviewCard>
  )
}
`

export const componentSpecimens: Readonly<Record<string, ComponentSpecimen>> = {
  "record-list": {
    fileName: "record-list-example.tsx",
    code: recordListCode,
    Preview: RecordListPreview,
  },
  status: { fileName: "status-example.tsx", code: statusCode, Preview: StatusPreview },
  entity: { fileName: "entity-example.tsx", code: entityCode, Preview: EntityPreview },
  figure: { fileName: "figure-example.tsx", code: figureCode, Preview: FigurePreview },
  meter: { fileName: "meter-example.tsx", code: meterCode, Preview: MeterPreview },
  "relative-time": {
    fileName: "relative-time-example.tsx",
    code: relativeTimeCode,
    Preview: RelativeTimePreview,
  },
  "preview-card": {
    fileName: "preview-card-example.tsx",
    code: previewCardCode,
    Preview: PreviewCardPreview,
  },
}
