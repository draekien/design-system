import { cardDocs } from "../../components/card/card.docs.ts"
import { entityDocs } from "../../components/entity/entity.docs.ts"
import { type ComponentDocs, requireSource } from "../../components/item-docs.ts"
import { previewCardDocs } from "../../components/preview-card/preview-card.docs.ts"
import { statusDocs } from "../../components/status/status.docs.ts"
import { SummaryCardMissing } from "./summary-card-missing.tsx"

const sources = import.meta.glob<string>("./summary-card-missing.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

export const summaryCardDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import {
  Card,
  CardFact,
  CardFacts,
  CardId,
  CardName,
  CardSubject,
} from "@/components/card"
import { Entity, EntityMedia, EntityName } from "@/components/entity"
import { Status, StatusMedia, StatusName } from "@/components/status"`,
    code: `<Card render={<section aria-label="Quarterly access review properties" />}>
  <CardSubject>
    <CardId>REC-104</CardId>
    <CardName>Quarterly access review</CardName>
  </CardSubject>
  <CardFacts layout="labelled">
    <CardFact label="Status">
      <Status>
        <StatusMedia fill="half" />
        <StatusName>In review</StatusName>
      </Status>
    </CardFact>
    <CardFact label="Assignee">
      <Entity>
        <EntityMedia>JL</EntityMedia>
        <EntityName>Jonas Lindqvist</EntityName>
      </Entity>
    </CardFact>
    <CardFact label="Due">22 Oct 2026</CardFact>
  </CardFacts>
</Card>`,
    description:
      "One record's properties, one per line after its name. Leave out CardLink: the card sits on the record's own page.",
  },
  composition: {
    name: "RecordProperties",
    item: null,
    children: [{ ...cardDocs.composition, item: "card" }],
  },
  examples: [
    {
      name: "summary-card-missing",
      title: "Missing values",
      description:
        "An assignee that failed to load shows Unavailable; a workspace the caller may not open shows Hidden.",
      Preview: SummaryCardMissing,
      source: requireSource(sources, "./summary-card-missing.tsx"),
    },
  ],
  api: [...cardDocs.api, ...statusDocs.api, ...entityDocs.api, ...previewCardDocs.api],
}
