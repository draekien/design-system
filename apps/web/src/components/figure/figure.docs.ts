import type { Figure } from "@/components/figure.tsx"
import { type ApiTable, type ComponentDocs, requireSource } from "../item-docs.ts"
import { FigureColumn } from "./figure-column.tsx"
import { FigureFormats } from "./figure-formats.tsx"

const sources = import.meta.glob<string>("./*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

export const figureDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import { Figure } from "@/components/figure"`,
    code: `<Figure value={12_840.5} format={{ style: "currency", currency: "AUD" }} locale="en-AU" />`,
    description: "Pass a locale so the server and the browser render the same text.",
  },
  composition: {
    name: "Figure",
    item: null,
    children: [],
  },
  examples: [
    {
      name: "figure-column",
      title: "Column",
      description: "Tabular digits, aligned to the end, line up down a list.",
      Preview: FigureColumn,
      source: requireSource(sources, "./figure-column.tsx"),
    },
    {
      name: "figure-formats",
      title: "Formats",
      description: "Percent, number and unit formats.",
      Preview: FigureFormats,
      source: requireSource(sources, "./figure-formats.tsx"),
    },
  ],
  api: [
    {
      kind: "part",
      name: "Figure",
      description: "A formatted number in tabular figures, pushed to the end of its row.",
      spreads: { label: "<data>", href: null },
      props: {
        value: {
          type: "number",
          required: true,
          default: null,
          description: "The number to format.",
        },
        format: {
          type: "Intl.NumberFormatOptions",
          required: false,
          default: null,
          description: "How to format the number, as Intl.NumberFormat options.",
        },
        locale: {
          type: "Intl.LocalesArgument",
          required: false,
          default: '"en"',
          description:
            "The locale to format in; the fixed default keeps server and browser text equal.",
        },
      } satisfies ApiTable<typeof Figure, "data">,
    },
  ],
}
