import * as React from "react"
import {
  List,
  ListGroup,
  ListGroupAdd,
  ListGroupCount,
  ListGroupHeader,
  ListGroupName,
  ListGroupRows,
  ListGroupTrigger,
  ListRow,
  ListRowId,
  ListRowLink,
  ListRowName,
  ListRowSelect,
  ListRowSubject,
} from "@/components/list.tsx"
import { Status, StatusMedia, StatusName } from "@/components/status.tsx"

const groups = [
  {
    value: "in-review",
    name: "In review",
    fill: "half",
    records: [
      { id: "REC-104", name: "Quarterly access review" },
      { id: "REC-107", name: "Incident response runbook" },
    ],
  },
  {
    value: "approved",
    name: "Approved",
    fill: "full",
    records: [{ id: "REC-109", name: "Data retention policy" }],
  },
] as const

export function ListGroups(): React.ReactElement {
  const hintId = React.useId()
  return (
    <div className="w-full">
      <List
        aria-label="Records"
        aria-describedby={hintId}
        defaultExpandedValues={groups.map((group) => group.value)}
      >
        {groups.map((group) => (
          <ListGroup
            key={group.value}
            value={group.value}
            values={group.records.map((record) => record.id)}
          >
            <ListGroupHeader>
              <ListRowSelect />
              <ListGroupTrigger>
                <ListGroupName>
                  <Status>
                    <StatusMedia fill={group.fill} />
                    <StatusName>{group.name}</StatusName>
                  </Status>
                </ListGroupName>
                <ListGroupCount>{group.records.length}</ListGroupCount>
              </ListGroupTrigger>
              <ListGroupAdd />
            </ListGroupHeader>
            <ListGroupRows>
              {group.records.map((record) => (
                <ListRow key={record.id} value={record.id}>
                  <ListRowSelect />
                  <ListRowLink href={`#${record.id}`}>
                    <ListRowSubject>
                      <ListRowId>{record.id}</ListRowId>
                      <ListRowName>{record.name}</ListRowName>
                    </ListRowSubject>
                  </ListRowLink>
                </ListRow>
              ))}
            </ListGroupRows>
          </ListGroup>
        ))}
      </List>
      <p id={hintId} className="px-2 pt-3 text-muted-foreground text-xs">
        ← collapses a group · → expands it · X selects the focused row or group
      </p>
    </div>
  )
}
