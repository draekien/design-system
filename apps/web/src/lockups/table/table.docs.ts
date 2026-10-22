import {
  type ComponentDocs,
  type CompositionNode,
  requireSource,
} from "../../components/item-docs.ts"
import { previewCardDocs } from "../../components/preview-card/preview-card.docs.ts"
import { statusDocs } from "../../components/status/status.docs.ts"
import { tableDocs } from "../../components/table/table.docs.ts"
import { TableInvoices } from "./table-invoices.tsx"
import { TableLoading } from "./table-loading.tsx"

const tableLockupSources = import.meta.glob<string>("./table-{invoices,loading}.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

const previewCard: CompositionNode = {
  name: "PreviewCard",
  item: "preview-card",
  children: [
    { name: "PreviewCardTrigger", item: null, children: [] },
    { name: "PreviewCardContent", item: null, children: [] },
  ],
}

function withPreviewCard(node: CompositionNode): CompositionNode {
  return {
    ...node,
    children: node.name === "TableRowLink" ? [previewCard] : node.children.map(withPreviewCard),
  }
}

export const tableLockupDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@/components/preview-card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableGroupRow,
  TableHead,
  TableHeader,
  TableRow,
  TableRowExpand,
  TableRowLink,
  TableRowSelect,
} from "@/components/table"`,
    code: `<Table expandedValues={expanded} onExpandedValuesChange={setExpanded}>
  <TableCaption>Invoices by status</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead><span className="sr-only">Group</span></TableHead>
      <TableHead>Customer</TableHead>
      <TableHead align="end">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableGroupRow value="sent" values={["INV-2041"]}>
      <TableCell><TableRowExpand /></TableCell>
      <TableHead>Sent · 1</TableHead>
      <TableCell align="end">$12,840.50</TableCell>
    </TableGroupRow>
    <TableRow value="INV-2041" level={2}>
      <TableCell />
      <TableHead>
        <TableRowLink href="/invoices/INV-2041">
          <PreviewCard>
            <PreviewCardTrigger>Harbour Print Co.</PreviewCardTrigger>
            <PreviewCardContent>Sam Okafor, billing contact</PreviewCardContent>
          </PreviewCard>
        </TableRowLink>
      </TableHead>
      <TableCell align="end">$12,840.50</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
    description:
      "Use a table when people compare values down a column, and a list when they scan for one record. On a coarse pointer there is no peek: a column hidden below 640px is read on the row's page.",
  },
  composition: { ...withPreviewCard(tableDocs.composition), item: "table" },
  examples: [
    {
      name: "table-invoices",
      title: "Invoices",
      description:
        "Invoices grouped by status, sorted by amount, each customer with a preview card of its billing contact. The lockup adds the selection bar.",
      Preview: TableInvoices,
      source: requireSource(tableLockupSources, "./table-invoices.tsx"),
    },
    {
      name: "table-loading",
      title: "Loading",
      description: "Loading rows draw a bar for each cell the loaded rows will fill.",
      Preview: TableLoading,
      source: requireSource(tableLockupSources, "./table-loading.tsx"),
    },
  ],
  api: [...tableDocs.api, ...statusDocs.api, ...previewCardDocs.api],
}
