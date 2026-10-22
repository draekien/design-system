import type { Checkbox } from "@base-ui/react/checkbox"
import type {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableCellDetail,
  TableColumn,
  TableColumnGroup,
  TableFooter,
  TableGroupRow,
  TableHead,
  TableHeader,
  TableRow,
  TableRowExpand,
  TableRowLink,
  TableRowLoading,
  TableRowSelect,
} from "@/components/table.tsx"
import { type ApiTable, type ComponentDocs, requireSource } from "../item-docs.ts"
import { TableChildRows } from "./table-child-rows.tsx"
import { TableGroups } from "./table-groups.tsx"
import { TableSortable } from "./table-sortable.tsx"
import { TableTotals } from "./table-totals.tsx"

export const tableSources = import.meta.glob<string>("./*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

const tr = { label: "<tr>", href: null }

const renderProp = {
  type: "React.ReactElement | ((props, state) => React.ReactElement)",
  required: false,
  default: null,
  description: "Replaces the rendered element, or receives its props and state to render it.",
} as const

const alignProp = {
  type: '"start" | "end"',
  required: false,
  default: '"start"',
  description: "end right-aligns the column in tabular figures, for numbers.",
} as const

const narrowProp = {
  type: '"keep" | "abbreviate" | "hide"',
  required: false,
  default: '"keep"',
  description:
    "How the column behaves when the table is narrow: keep draws it in full, abbreviate swaps its values for their short form below 768px, hide also removes it below 640px.",
} as const

const levelProp = {
  type: "number",
  required: false,
  default: "1",
  description: "The row's depth: 1 for a top-level row, 2 for its children, and so on.",
} as const

export const tableDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table"`,
    code: `<Table>
  <TableCaption>Invoices</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Customer</TableHead>
      <TableHead align="end">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableHead>Harbour Print Co.</TableHead>
      <TableCell align="end">$12,840.50</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
    description:
      "Name every table with TableCaption. Name each body row with a TableHead. Setting sort, expandedValues, selectedValues or peekValue makes the table a treegrid with one tab stop; give every body row a value then.",
  },
  composition: {
    name: "Table",
    item: null,
    children: [
      { name: "TableCaption", item: null, children: [] },
      {
        name: "TableColumnGroup",
        item: null,
        children: [{ name: "TableColumn", item: null, children: [] }],
      },
      {
        name: "TableHeader",
        item: null,
        children: [
          {
            name: "TableRow",
            item: null,
            children: [{ name: "TableHead", item: null, children: [] }],
          },
        ],
      },
      {
        name: "TableBody",
        item: null,
        children: [
          {
            name: "TableGroupRow",
            item: null,
            children: [
              {
                name: "TableCell",
                item: null,
                children: [
                  { name: "TableRowSelect", item: null, children: [] },
                  { name: "TableRowExpand", item: null, children: [] },
                ],
              },
              {
                name: "TableHead",
                item: null,
                children: [{ name: "Status", item: "status", children: [] }],
              },
            ],
          },
          {
            name: "TableRow",
            item: null,
            children: [
              {
                name: "TableHead",
                item: null,
                children: [
                  { name: "TableRowLink", item: null, children: [] },
                  { name: "TableCellDetail", item: null, children: [] },
                ],
              },
              {
                name: "TableCell",
                item: null,
                children: [
                  { name: "TableRowSelect", item: null, children: [] },
                  { name: "TableRowExpand", item: null, children: [] },
                  { name: "Status", item: "status", children: [] },
                  { name: "Entity", item: "entity", children: [] },
                  { name: "Figure", item: "figure", children: [] },
                  { name: "RelativeTime", item: "relative-time", children: [] },
                ],
              },
            ],
          },
          { name: "TableRowLoading", item: null, children: [] },
        ],
      },
      {
        name: "TableFooter",
        item: null,
        children: [
          {
            name: "TableRow",
            item: null,
            children: [
              { name: "TableHead", item: null, children: [] },
              { name: "TableCell", item: null, children: [] },
            ],
          },
        ],
      },
    ],
  },
  examples: [
    {
      name: "table-totals",
      title: "Caption, columns and totals",
      description:
        "A static table: the caption names it, the column group sizes the figures, and the footer totals them.",
      Preview: TableTotals,
      source: requireSource(tableSources, "./table-totals.tsx"),
    },
    {
      name: "table-sortable",
      title: "Sorting and selection",
      description:
        "Click a header to sort by it. Arrow keys move between rows; X selects the focused row. Compose a selection bar beside the table while any row is selected.",
      Preview: TableSortable,
      source: requireSource(tableSources, "./table-sortable.tsx"),
    },
    {
      name: "table-child-rows",
      title: "Child rows",
      description: "→ and ← expand and collapse an invoice to show its lines; Lines counts them.",
      Preview: TableChildRows,
      source: requireSource(tableSources, "./table-child-rows.tsx"),
    },
    {
      name: "table-groups",
      title: "Groups",
      description:
        "A group row names its status and totals its rows, and selects them together; its checkbox shows mixed while only some are selected. Compose a selection bar beside the table while any row is selected.",
      Preview: TableGroups,
      source: requireSource(tableSources, "./table-groups.tsx"),
    },
  ],
  api: [
    {
      kind: "part",
      name: "Table",
      description:
        "The table, and its keyboard model once any of sort, expandedValues, selectedValues or peekValue is set: one tab stop, arrow keys between rows, → and ← to expand and collapse, Enter to open, Space to peek, X to select, Esc to close peek then clear selection.",
      spreads: { label: "<table>", href: null },
      props: {
        render: renderProp,
        sort: {
          type: "TableSort | null",
          required: false,
          default: null,
          description:
            "The sorted column and direction. Pass with onSortChange to control sorting; the caller sorts the rows.",
        },
        defaultSort: {
          type: "TableSort | null",
          required: false,
          default: "null",
          description: "The sort on first render when sorting is uncontrolled.",
        },
        onSortChange: {
          type: "(sort: TableSort) => void",
          required: false,
          default: null,
          description:
            "Called when a header is clicked: ascending for a new column, the opposite direction for the sorted one.",
        },
        expandedValues: {
          type: "ReadonlyArray<string>",
          required: false,
          default: null,
          description:
            "The values of the expanded rows and groups. Pass with onExpandedValuesChange to control expansion.",
        },
        defaultExpandedValues: {
          type: "ReadonlyArray<string>",
          required: false,
          default: "[]",
          description: "The values expanded on first render when expansion is uncontrolled.",
        },
        onExpandedValuesChange: {
          type: "(values: ReadonlyArray<string>) => void",
          required: false,
          default: null,
          description: "Called when →, ←, Enter on a group or a TableRowExpand changes expansion.",
        },
        selectedValues: {
          type: "ReadonlyArray<string>",
          required: false,
          default: null,
          description:
            "The values of the selected rows. Pass with onSelectedValuesChange to control selection.",
        },
        defaultSelectedValues: {
          type: "ReadonlyArray<string>",
          required: false,
          default: "[]",
          description: "The values selected on first render when selection is uncontrolled.",
        },
        onSelectedValuesChange: {
          type: "(values: ReadonlyArray<string>) => void",
          required: false,
          default: null,
          description:
            "Called with the next selection when X, Shift+Space, a TableRowSelect or Esc changes it.",
        },
        peekValue: {
          type: "string | null",
          required: false,
          default: null,
          description:
            "The value of the peeked row, or null when peek is closed. Pass with onPeekValueChange to control peek.",
        },
        defaultPeekValue: {
          type: "string | null",
          required: false,
          default: "null",
          description: "The row peeked on first render when peek is uncontrolled.",
        },
        onPeekValueChange: {
          type: "(value: string | null) => void",
          required: false,
          default: null,
          description:
            "Called when Space toggles peek, Esc closes it, or peek follows focus to another row.",
        },
      } satisfies ApiTable<typeof Table, "table">,
    },
    {
      kind: "part",
      name: "TableCaption",
      description:
        "The table's name, drawn above it. Hide it with sr-only when a heading beside the table already names it.",
      spreads: { label: "<caption>", href: null },
      props: { render: renderProp } satisfies ApiTable<typeof TableCaption, "caption">,
    },
    {
      kind: "part",
      name: "TableColumnGroup",
      description: "A group of TableColumns, after TableCaption and before TableHeader.",
      spreads: { label: "<colgroup>", href: null },
      props: { render: renderProp } satisfies ApiTable<typeof TableColumnGroup, "colgroup">,
    },
    {
      kind: "part",
      name: "TableColumn",
      description: "One column, or span columns; set its width with className.",
      spreads: { label: "<col>", href: null },
      props: { render: renderProp } satisfies ApiTable<typeof TableColumn, "col">,
    },
    {
      kind: "part",
      name: "TableHeader",
      description: "The header rows, holding one TableHead per column.",
      spreads: { label: "<thead>", href: null },
      props: { render: renderProp } satisfies ApiTable<typeof TableHeader, "thead">,
    },
    {
      kind: "part",
      name: "TableBody",
      description: "The body rows.",
      spreads: { label: "<tbody>", href: null },
      props: { render: renderProp } satisfies ApiTable<typeof TableBody, "tbody">,
    },
    {
      kind: "part",
      name: "TableFooter",
      description: "Summary rows, such as totals, after the body.",
      spreads: { label: "<tfoot>", href: null },
      props: { render: renderProp } satisfies ApiTable<typeof TableFooter, "tfoot">,
    },
    {
      kind: "part",
      name: "TableRow",
      description:
        "One row. In a body, a value makes it a record the keyboard model can focus, expand, select and peek.",
      spreads: tr,
      props: {
        render: renderProp,
        value: {
          type: "string",
          required: false,
          default: null,
          description:
            "The row's unique value. Give one to every body row of an interactive table; omit it in header and footer rows.",
        },
        level: levelProp,
      } satisfies ApiTable<typeof TableRow, "tr">,
    },
    {
      kind: "part",
      name: "TableGroupRow",
      description:
        "The header row of a group, holding its name and its counts and sums. Enter and Space toggle it; render its rows after it only while it is expanded.",
      spreads: tr,
      props: {
        render: renderProp,
        value: {
          type: "string",
          required: true,
          default: null,
          description: "The group's unique value; it is expanded while expandedValues holds it.",
        },
        values: {
          type: "ReadonlyArray<string>",
          required: true,
          default: null,
          description:
            "The values of the rows in the group, which its TableRowSelect selects together.",
        },
        level: levelProp,
      } satisfies ApiTable<typeof TableGroupRow, "tr">,
    },
    {
      kind: "part",
      name: "TableRowLoading",
      description:
        "A placeholder row hidden from screen readers. Compose the same cells as the rows that replace it; each cell with children draws a bar.",
      spreads: tr,
      props: { render: renderProp } satisfies ApiTable<typeof TableRowLoading, "tr">,
    },
    {
      kind: "part",
      name: "TableHead",
      description:
        "A header cell. In TableHeader it names a column; in a body or footer row it names the row.",
      spreads: { label: "<th>", href: null },
      props: {
        render: renderProp,
        align: alignProp,
        narrow: narrowProp,
        column: {
          type: "string",
          required: false,
          default: null,
          description:
            "In TableHeader, the column's key. In a sortable table the header becomes a button that sorts by it.",
        },
      } satisfies ApiTable<typeof TableHead, "th">,
    },
    {
      kind: "part",
      name: "TableCell",
      description: "A data cell.",
      spreads: { label: "<td>", href: null },
      props: {
        render: renderProp,
        align: alignProp,
        narrow: narrowProp,
      } satisfies ApiTable<typeof TableCell, "td">,
    },
    {
      kind: "part",
      name: "TableCellDetail",
      description:
        "One muted line under a cell's value, drawn only below 640px, holding a hidden column's value.",
      spreads: { label: "<span>", href: null },
      props: { render: renderProp } satisfies ApiTable<typeof TableCellDetail, "span">,
    },
    {
      kind: "part",
      name: "TableRowSelect",
      description:
        "The row's selection checkbox, drawn on a hovered, focused or selected row and always on a coarse pointer. A row without one cannot be selected.",
      spreads: {
        label: "Base UI Checkbox.Root",
        href: "https://base-ui.com/react/components/checkbox#api-reference",
      },
      props: {} satisfies ApiTable<typeof TableRowSelect, typeof Checkbox.Root>,
    },
    {
      kind: "part",
      name: "TableRowExpand",
      description:
        "The chevron that shows or hides the row's children. Render it only on a row that has children.",
      spreads: { label: "<button>", href: null },
      props: {} satisfies ApiTable<typeof TableRowExpand, "button">,
    },
    {
      kind: "part",
      name: "TableRowLink",
      description:
        "The link to the row's own page, holding its name. A click anywhere on the row follows it, and so does Enter.",
      spreads: { label: "<a>", href: null },
      props: { render: renderProp } satisfies ApiTable<typeof TableRowLink, "a">,
    },
  ],
}
