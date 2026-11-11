import type * as React from "react"
import {
  Card,
  CardAside,
  CardExplain,
  CardFact,
  CardFacts,
  CardId,
  CardLink,
  CardMedia,
  CardName,
  CardSubject,
} from "@/components/card.tsx"
import { Status, StatusMedia, StatusName } from "@/components/status.tsx"

export function CardRecord(): React.ReactElement {
  return (
    <div className="w-full max-w-xs">
      <Card>
        <CardSubject>
          <CardMedia kind="missing" reason="No picture" />
          <CardId>REC-104</CardId>
          <CardName>
            <CardLink href="#REC-104">Quarterly access review</CardLink>
          </CardName>
        </CardSubject>
        <CardAside>
          <Status>
            <StatusMedia fill="half" />
            <StatusName>In review</StatusName>
          </Status>
        </CardAside>
        <CardFacts>
          <CardFact label="Owner">Mira Okafor</CardFact>
          <CardFact label="Workspace" narrow="hide">
            Security
          </CardFact>
        </CardFacts>
        <CardExplain trigger="Summary">
          Confirms who can reach the billing workspace before the audit closes.
        </CardExplain>
      </Card>
    </div>
  )
}
