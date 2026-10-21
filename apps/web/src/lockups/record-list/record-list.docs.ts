import { entityDocs } from "../../components/entity/entity.docs.ts"
import { figureDocs } from "../../components/figure/figure.docs.ts"
import {
  type ComponentDocs,
  type CompositionNode,
  requireSource,
} from "../../components/item-docs.ts"
import { meterDocs } from "../../components/meter/meter.docs.ts"
import { previewCardDocs } from "../../components/preview-card/preview-card.docs.ts"
import { recordListDocs } from "../../components/record-list/record-list.docs.ts"
import { relativeTimeDocs } from "../../components/relative-time/relative-time.docs.ts"
import { statusDocs } from "../../components/status/status.docs.ts"
import { RecordListInvoices } from "./record-list-invoices.tsx"
import { RecordListRecords } from "./record-list-records.tsx"

const sources = import.meta.glob<string>("./record-list-{records,invoices}.tsx", {
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

export const recordListLockupDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import { Entity, EntityMedia, EntityName } from "@/components/entity"
import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@/components/preview-card"
import {
  RecordList,
  RecordRow,
  RecordRowFact,
  RecordRowLink,
  RecordRowMedia,
  RecordRowName,
  RecordRowSubject,
} from "@/components/record-list"
import { Status, StatusMedia, StatusName } from "@/components/status"`,
    code: `<RecordList aria-label="Records">
  <RecordRow value="REC-104">
    <RecordRowLink href="/records/REC-104">
      <RecordRowSubject>
        <RecordRowMedia>
          <PreviewCard>
            <PreviewCardTrigger>
              <Status>
                <StatusMedia fill="half" />
                <StatusName>In review</StatusName>
              </Status>
            </PreviewCardTrigger>
            <PreviewCardContent>In review since 3 Oct</PreviewCardContent>
          </PreviewCard>
        </RecordRowMedia>
        <RecordRowName>Quarterly access review</RecordRowName>
      </RecordRowSubject>
      <RecordRowFact>
        <PreviewCard>
          <PreviewCardTrigger>
            <Entity>
              <EntityMedia>DP</EntityMedia>
              <EntityName>Dev Patel</EntityName>
            </Entity>
          </PreviewCardTrigger>
          <PreviewCardContent>Record owner · Platform</PreviewCardContent>
        </PreviewCard>
      </RecordRowFact>
    </RecordRowLink>
  </RecordRow>
</RecordList>`,
    description:
      "Use a record list when people scan for one record, and a table when they compare values down a column.",
  },
  composition: {
    name: "RecordList",
    item: "record-list",
    children: [
      {
        name: "RecordRow",
        item: null,
        children: [
          { name: "RecordRowSelect", item: null, children: [] },
          {
            name: "RecordRowLink",
            item: null,
            children: [
              {
                name: "RecordRowSubject",
                item: null,
                children: [
                  { name: "RecordRowId", item: null, children: [] },
                  { name: "RecordRowMedia", item: null, children: [previewCard([status, entity])] },
                  { name: "RecordRowName", item: null, children: [] },
                  { name: "RecordRowDescription", item: null, children: [] },
                ],
              },
              {
                name: "RecordRowFact",
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
      name: "record-list-records",
      title: "Records",
      description: "A status dot and an owner, each with a preview card.",
      Preview: RecordListRecords,
      source: requireSource(sources, "./record-list-records.tsx"),
    },
    {
      name: "record-list-invoices",
      title: "Invoices",
      description: "The customer, then the total, the amount paid and the due date.",
      Preview: RecordListInvoices,
      source: requireSource(sources, "./record-list-invoices.tsx"),
    },
  ],
  api: [
    ...recordListDocs.api,
    ...statusDocs.api,
    ...entityDocs.api,
    ...figureDocs.api,
    ...meterDocs.api,
    ...relativeTimeDocs.api,
    ...previewCardDocs.api,
  ],
}
