import type * as React from "react"
import {
  Card,
  CardAside,
  CardFact,
  CardFacts,
  CardId,
  CardLink,
  CardName,
  CardSubject,
} from "@/components/card.tsx"
import { Status, StatusMedia, StatusName } from "@/components/status.tsx"

export function CardLabelled(): React.ReactElement {
  return (
    <div className="w-full max-w-xs">
      <Card>
        <CardSubject>
          <CardId>REC-118</CardId>
          <CardName>
            <CardLink href="#REC-118">Rotate audit log keys</CardLink>
          </CardName>
        </CardSubject>
        <CardAside>
          <Status>
            <StatusMedia fill="full" />
            <StatusName>Done</StatusName>
          </Status>
        </CardAside>
        <CardFacts layout="labelled">
          <CardFact label="Owner">Jonas Lindqvist</CardFact>
          <CardFact label="Workspace">Platform</CardFact>
        </CardFacts>
      </Card>
    </div>
  )
}
