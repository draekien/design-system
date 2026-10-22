import type { Checkbox } from "@base-ui/react/checkbox"
import type {
  List,
  ListRow,
  ListRowDescription,
  ListRowFact,
  ListRowId,
  ListRowLink,
  ListRowLoading,
  ListRowMedia,
  ListRowName,
  ListRowPeek,
  ListRowSelect,
  ListRowSubject,
} from "@/components/list.tsx"
import { type ApiTable, type ComponentDocs, requireSource } from "../item-docs.ts"
import { ListFigures } from "./list-figures.tsx"
import { ListMissing } from "./list-missing.tsx"
import { ListNarrow } from "./list-narrow.tsx"

const sources = import.meta.glob<string>("./*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

const li = { label: "<li>", href: null }
const span = { label: "<span>", href: null }

const renderProp = {
  type: "React.ReactElement | ((props, state) => React.ReactElement)",
  required: false,
  default: null,
  description: "Replaces the rendered element, or receives its props and state to render it.",
} as const

const narrowProp = {
  type: '"keep" | "abbreviate" | "hide"',
  required: false,
  default: '"keep"',
  description:
    "How the part behaves when the list is narrow: keep draws it in full, abbreviate swaps it for its short form below 768px, hide also removes it below 640px.",
} as const

export const listDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import {
  List,
  ListRow,
  ListRowLink,
  ListRowName,
  ListRowSubject,
} from "@/components/list"`,
    code: `<List aria-label="Records">
  <ListRow value="REC-104">
    <ListRowLink href="/records/REC-104">
      <ListRowSubject>
        <ListRowName>Quarterly access review</ListRowName>
      </ListRowSubject>
    </ListRowLink>
  </ListRow>
</List>`,
    description:
      "Put one value in each ListRowFact, at most eight per row. Show the keyboard hints near the list and point aria-describedby at them.",
  },
  composition: {
    name: "List",
    item: null,
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
                  {
                    name: "ListRowMedia",
                    item: null,
                    children: [
                      { name: "Status", item: "status", children: [] },
                      { name: "Entity", item: "entity", children: [] },
                    ],
                  },
                  { name: "ListRowName", item: null, children: [] },
                  { name: "ListRowDescription", item: null, children: [] },
                ],
              },
              {
                name: "ListRowFact",
                item: null,
                children: [
                  { name: "Status", item: "status", children: [] },
                  { name: "Entity", item: "entity", children: [] },
                  { name: "Figure", item: "figure", children: [] },
                  { name: "Meter", item: "meter", children: [] },
                  { name: "RelativeTime", item: "relative-time", children: [] },
                ],
              },
            ],
          },
          { name: "ListRowPeek", item: null, children: [] },
        ],
      },
      { name: "ListRowLoading", item: null, children: [] },
    ],
  },
  examples: [
    {
      name: "list-figures",
      title: "Figures",
      description: "Each fact lines up in its own column.",
      Preview: ListFigures,
      source: requireSource(sources, "./list-figures.tsx"),
    },
    {
      name: "list-narrow",
      title: "Narrow list",
      description: "abbreviate shortens the total; hide removes the ID and the date.",
      Preview: ListNarrow,
      source: requireSource(sources, "./list-narrow.tsx"),
    },
    {
      name: "list-missing",
      title: "Missing facts and peek",
      description: "missing draws a word in place of the value. Hover a row for its peek button.",
      Preview: ListMissing,
      source: requireSource(sources, "./list-missing.tsx"),
    },
  ],
  api: [
    {
      kind: "part",
      name: "List",
      description:
        "The list, and its keyboard model: one tab stop, arrow keys between rows, Space to peek, X to select, Esc to close peek then clear selection.",
      spreads: { label: "<ul>", href: null },
      props: {
        render: renderProp,
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
          description: "Called with the next selection when X, the row checkbox or Esc changes it.",
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
            "Called when Space or a ListRowPeek toggles peek, Esc closes it, or peek follows focus to another row.",
        },
      } satisfies ApiTable<typeof List, "ul">,
    },
    {
      kind: "part",
      name: "ListRow",
      description: "One item in the list, named by its value.",
      spreads: li,
      props: {
        render: renderProp,
        value: {
          type: "string",
          required: true,
          default: null,
          description: "The item's unique value, which list selection and peek refer to.",
        },
      } satisfies ApiTable<typeof ListRow, "li">,
    },
    {
      kind: "part",
      name: "ListRowSelect",
      description:
        "The selection checkbox, drawn on a hovered, focused or selected row and always on a coarse pointer.",
      spreads: {
        label: "Base UI Checkbox.Root",
        href: "https://base-ui.com/react/components/checkbox#api-reference",
      },
      props: {} satisfies ApiTable<typeof ListRowSelect, typeof Checkbox.Root>,
    },
    {
      kind: "part",
      name: "ListRowLink",
      description:
        "The link to the item's own page, which holds the subject and the facts and is the row's one focus target.",
      spreads: { label: "<a>", href: null },
      props: { render: renderProp } satisfies ApiTable<typeof ListRowLink, "a">,
    },
    {
      kind: "part",
      name: "ListRowSubject",
      description: "Rank 1: what the row is about, at the start of the row.",
      spreads: span,
      props: { render: renderProp } satisfies ApiTable<typeof ListRowSubject, "span">,
    },
    {
      kind: "part",
      name: "ListRowId",
      description: "The item's ID, in muted tabular figures.",
      spreads: span,
      props: { render: renderProp, narrow: narrowProp } satisfies ApiTable<
        typeof ListRowId,
        "span"
      >,
    },
    {
      kind: "part",
      name: "ListRowMedia",
      description:
        "A 24px picture of the item, such as its status dot, its owner's initials or a kind icon.",
      spreads: span,
      props: {
        render: renderProp,
        narrow: narrowProp,
        variant: {
          type: '"default" | "icon"',
          required: false,
          default: '"default"',
          description:
            "default holds a status or entity and draws only its media; icon holds one muted icon and requires label.",
        },
        label: {
          type: "string",
          required: false,
          default: null,
          description:
            'Required with variant="icon": what the icon stands for, read by screen readers in place of the icon.',
        },
      } satisfies ApiTable<typeof ListRowMedia, "span">,
    },
    {
      kind: "part",
      name: "ListRowName",
      description: "The item's name. It truncates and is never hidden.",
      spreads: span,
      props: { render: renderProp } satisfies ApiTable<typeof ListRowName, "span">,
    },
    {
      kind: "part",
      name: "ListRowDescription",
      description:
        "One muted line after the name. It truncates before the name does and is hidden below 640px.",
      spreads: span,
      props: { render: renderProp } satisfies ApiTable<typeof ListRowDescription, "span">,
    },
    {
      kind: "part",
      name: "ListRowFact",
      description:
        "Rank 2: one fact the list exists to compare, in its own column. A row holds at most eight.",
      spreads: span,
      props: {
        render: {
          ...renderProp,
          description: `${renderProp.description} Not allowed with missing.`,
        },
        narrow: narrowProp,
        missing: {
          type: '"unavailable" | "hidden"',
          required: false,
          default: null,
          description:
            "Why the fact cannot be shown: unavailable when it failed to load, hidden when the viewer's role cannot see it.",
        },
      } satisfies ApiTable<typeof ListRowFact, "span">,
    },
    {
      kind: "part",
      name: "ListRowPeek",
      description:
        "A button at the end of the row that toggles peek by pointer, drawn on a hovered, focused or peeked row.",
      spreads: { label: "<button>", href: null },
      props: {} satisfies ApiTable<typeof ListRowPeek, "button">,
    },
    {
      kind: "part",
      name: "ListRowLoading",
      description:
        "A placeholder row for loading items; each part inside draws a bar so the columns match the rows that replace it.",
      spreads: li,
      props: { render: renderProp } satisfies ApiTable<typeof ListRowLoading, "li">,
    },
  ],
}
