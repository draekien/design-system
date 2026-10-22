import * as React from "react"
import { Entity, EntityDescription, EntityMedia, EntityName } from "@/components/entity.tsx"
import {
  List,
  ListRow,
  ListRowDescription,
  ListRowFact,
  ListRowId,
  ListRowLink,
  ListRowMedia,
  ListRowName,
  ListRowSelect,
  ListRowSubject,
} from "@/components/list.tsx"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"
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

export function ListRecords(): React.ReactElement {
  const hintId = React.useId()
  return (
    <div className="w-full">
      <List aria-label="Records" aria-describedby={hintId}>
        {records.map((record) => (
          <ListRow key={record.id} value={record.id}>
            <ListRowSelect />
            <ListRowLink href={`#${record.id}`}>
              <ListRowSubject>
                <ListRowId narrow="hide">{record.id}</ListRowId>
                <ListRowMedia>
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
                </ListRowMedia>
                <ListRowName>{record.name}</ListRowName>
                <ListRowDescription>{record.description}</ListRowDescription>
              </ListRowSubject>
              <ListRowFact narrow="abbreviate">
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
              </ListRowFact>
              <ListRowFact narrow="hide">
                <RelativeTime dateTime={record.updated} now="2026-10-15T11:12:00Z" />
              </ListRowFact>
            </ListRowLink>
          </ListRow>
        ))}
      </List>
      <p id={hintId} className="px-2 pt-3 text-muted-foreground text-xs">
        ↑ ↓ move between rows · X selects the focused row
      </p>
    </div>
  )
}
