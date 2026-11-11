import { cardDocs } from "../../components/card/card.docs.ts"
import { entityDocs } from "../../components/entity/entity.docs.ts"
import { type ComponentDocs, requireSource } from "../../components/item-docs.ts"
import { previewCardDocs } from "../../components/preview-card/preview-card.docs.ts"
import { relativeTimeDocs } from "../../components/relative-time/relative-time.docs.ts"
import { statusDocs } from "../../components/status/status.docs.ts"
import { RecordCardEmpty } from "./record-card-empty.tsx"
import { RecordCardNarrow } from "./record-card-narrow.tsx"
import { RecordCardPictures } from "./record-card-pictures.tsx"

const sources = import.meta.glob<string>("./record-card-{pictures,narrow,empty}.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

export const recordCardDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import {
  Card,
  CardFact,
  CardFacts,
  CardId,
  CardLink,
  CardName,
  CardSubject,
} from "@/components/card"
import { Entity, EntityMedia, EntityName } from "@/components/entity"
import { RelativeTime } from "@/components/relative-time"
import { Status, StatusMedia, StatusName } from "@/components/status"`,
    code: `<Card render={<li />}>
  <CardSubject>
    <CardId>REC-104</CardId>
    <CardName>
      <CardLink href="/records/REC-104">Quarterly access review</CardLink>
    </CardName>
  </CardSubject>
  <CardFacts>
    <CardFact label="Status">
      <Status>
        <StatusMedia fill="half" />
        <StatusName>In review</StatusName>
      </Status>
    </CardFact>
    <CardFact label="Owner" narrow="abbreviate">
      <Entity>
        <EntityMedia>MO</EntityMedia>
        <EntityName>Mira Okafor</EntityName>
      </Entity>
    </CardFact>
    <CardFact label="Updated" narrow="hide">
      <RelativeTime dateTime="2026-10-15T09:12:00Z" now="2026-10-15T11:12:00Z" />
    </CardFact>
  </CardFacts>
</Card>`,
    description:
      "Draw each fact with its own component. Lay record cards in a grid 8px apart, with the facts in the same order on every card.",
  },
  composition: {
    name: "Records",
    item: null,
    children: [{ ...cardDocs.composition, item: "card" }],
  },
  examples: [
    {
      name: "record-card-pictures",
      title: "Pictures",
      description:
        "Pass CardMedia only where callers recognise records by their pictures; a record with none draws the empty 16:9 box.",
      Preview: RecordCardPictures,
      source: requireSource(sources, "./record-card-pictures.tsx"),
    },
    {
      name: "record-card-narrow",
      title: "Narrow",
      description: "At 240px the owner shows as initials; at 200px the update time is dropped.",
      Preview: RecordCardNarrow,
      source: requireSource(sources, "./record-card-narrow.tsx"),
    },
    {
      name: "record-card-empty",
      title: "No records",
      description: "One line in place of the grid, saying what makes a record appear.",
      Preview: RecordCardEmpty,
      source: requireSource(sources, "./record-card-empty.tsx"),
    },
  ],
  api: [
    ...cardDocs.api,
    ...statusDocs.api,
    ...entityDocs.api,
    ...relativeTimeDocs.api,
    ...previewCardDocs.api,
  ],
}
