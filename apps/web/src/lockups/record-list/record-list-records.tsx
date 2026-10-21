import * as React from "react"
import { Entity, EntityDescription, EntityMedia, EntityName } from "@/components/entity.tsx"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"
import {
  RecordList,
  RecordRow,
  RecordRowDescription,
  RecordRowFact,
  RecordRowId,
  RecordRowLink,
  RecordRowMedia,
  RecordRowName,
  RecordRowSelect,
  RecordRowSubject,
} from "@/components/record-list.tsx"
import { RelativeTime } from "@/components/relative-time.tsx"
import { Status, StatusDescription, StatusMedia, StatusName } from "@/components/status.tsx"

const records = [
  {
    id: "REC-101",
    name: "Vendor onboarding checklist",
    description: "Procurement",
    fill: "none",
    status: "Draft",
    since: "since 14 Oct",
    owner: { initials: "MO", name: "Mira Okafor", team: "Security" },
    updated: "2026-10-15T10:40:00Z",
  },
  {
    id: "REC-104",
    name: "Quarterly access review",
    description: "Identity and access",
    fill: "half",
    status: "In review",
    since: "since 3 Oct",
    owner: { initials: "DP", name: "Dev Patel", team: "Platform" },
    updated: "2026-10-14T16:05:00Z",
  },
  {
    id: "REC-109",
    name: "Data retention policy",
    description: "Compliance",
    fill: "full",
    status: "Approved",
    since: "since 28 Sep",
    owner: { initials: "AL", name: "Ana Lim", team: "Legal" },
    updated: "2026-10-02T09:00:00Z",
  },
] as const

export function RecordListRecords(): React.ReactElement {
  const hintId = React.useId()
  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card text-card-foreground">
      <RecordList aria-label="Records" aria-describedby={hintId}>
        {records.map((record) => (
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
                        <StatusDescription>{record.since}</StatusDescription>
                      </Status>
                    </PreviewCardTrigger>
                    <PreviewCardContent>
                      <p className="font-medium">{record.status}</p>
                      <p className="text-muted-foreground">{record.since}</p>
                    </PreviewCardContent>
                  </PreviewCard>
                </RecordRowMedia>
                <RecordRowName>{record.name}</RecordRowName>
                <RecordRowDescription>{record.description}</RecordRowDescription>
              </RecordRowSubject>
              <RecordRowFact narrow="abbreviate">
                <PreviewCard>
                  <PreviewCardTrigger>
                    <Entity>
                      <EntityMedia>{record.owner.initials}</EntityMedia>
                      <EntityName>{record.owner.name}</EntityName>
                      <EntityDescription>{record.owner.team}</EntityDescription>
                    </Entity>
                  </PreviewCardTrigger>
                  <PreviewCardContent>
                    <p className="font-medium">{record.owner.name}</p>
                    <p className="text-muted-foreground">Record owner · {record.owner.team}</p>
                  </PreviewCardContent>
                </PreviewCard>
              </RecordRowFact>
              <RecordRowFact narrow="hide">
                <RelativeTime dateTime={record.updated} now="2026-10-15T11:12:00Z" />
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
