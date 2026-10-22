import { entityDocs } from "../../components/entity/entity.docs.ts"
import { figureDocs } from "../../components/figure/figure.docs.ts"
import {
  type ComponentDocs,
  type CompositionNode,
  requireSource,
} from "../../components/item-docs.ts"
import { listDocs } from "../../components/list/list.docs.ts"
import { meterDocs } from "../../components/meter/meter.docs.ts"
import { previewCardDocs } from "../../components/preview-card/preview-card.docs.ts"
import { relativeTimeDocs } from "../../components/relative-time/relative-time.docs.ts"
import { statusDocs } from "../../components/status/status.docs.ts"
import { ListInvoices } from "./list-invoices.tsx"
import { ListRecords } from "./list-records.tsx"

const sources = import.meta.glob<string>("./list-{records,invoices}.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

const previewCard = (trigger: ReadonlyArray<CompositionNode>): CompositionNode => ({
  name: "PreviewCard",
  item: "preview-card",
  children: [
    { name: "PreviewCardTrigger", item: null, children: trigger },
    { name: "PreviewCardContent", item: null, children: [] },
  ],
})

const status: CompositionNode = { name: "Status", item: "status", children: [] }
const entity: CompositionNode = { name: "Entity", item: "entity", children: [] }

export const listLockupDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import { Entity, EntityMedia, EntityName } from "@/components/entity"
import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@/components/preview-card"
import {
  List,
  ListRow,
  ListRowFact,
  ListRowLink,
  ListRowMedia,
  ListRowName,
  ListRowSubject,
} from "@/components/list"
import { Status, StatusMedia, StatusName } from "@/components/status"`,
    code: `<List aria-label="Records">
  <ListRow value="REC-104">
    <ListRowLink href="/records/REC-104">
      <ListRowSubject>
        <ListRowMedia>
          <PreviewCard>
            <PreviewCardTrigger>
              <Status>
                <StatusMedia fill="half" />
                <StatusName>In review</StatusName>
              </Status>
            </PreviewCardTrigger>
            <PreviewCardContent>In review since 3 Oct</PreviewCardContent>
          </PreviewCard>
        </ListRowMedia>
        <ListRowName>Quarterly access review</ListRowName>
      </ListRowSubject>
      <ListRowFact>
        <PreviewCard>
          <PreviewCardTrigger>
            <Entity>
              <EntityMedia>DP</EntityMedia>
              <EntityName>Dev Patel</EntityName>
            </Entity>
          </PreviewCardTrigger>
          <PreviewCardContent>Record owner · Platform</PreviewCardContent>
        </PreviewCard>
      </ListRowFact>
    </ListRowLink>
  </ListRow>
</List>`,
    description:
      "Use a list when people scan for one record, and a table when they compare values down a column.",
  },
  composition: {
    name: "List",
    item: "list",
    children: [
      {
        name: "ListRow",
        item: null,
        children: [
          { name: "ListRowSelect", item: null, children: [] },
          {
            name: "ListRowLink",
            item: null,
            children: [
              {
                name: "ListRowSubject",
                item: null,
                children: [
                  { name: "ListRowId", item: null, children: [] },
                  { name: "ListRowMedia", item: null, children: [previewCard([status, entity])] },
                  { name: "ListRowName", item: null, children: [] },
                  { name: "ListRowDescription", item: null, children: [] },
                ],
              },
              {
                name: "ListRowFact",
                item: null,
                children: [
                  previewCard([entity]),
                  { name: "Figure", item: "figure", children: [] },
                  { name: "Meter", item: "meter", children: [] },
                  { name: "RelativeTime", item: "relative-time", children: [] },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  examples: [
    {
      name: "list-records",
      title: "Records",
      description: "A status dot and an owner, each with a preview card.",
      Preview: ListRecords,
      source: requireSource(sources, "./list-records.tsx"),
    },
    {
      name: "list-invoices",
      title: "Invoices",
      description: "The customer, then the total, the amount paid and the due date.",
      Preview: ListInvoices,
      source: requireSource(sources, "./list-invoices.tsx"),
    },
  ],
  api: [
    ...listDocs.api,
    ...statusDocs.api,
    ...entityDocs.api,
    ...figureDocs.api,
    ...meterDocs.api,
    ...relativeTimeDocs.api,
    ...previewCardDocs.api,
  ],
}
