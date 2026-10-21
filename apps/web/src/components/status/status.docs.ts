import type { Status, StatusDescription, StatusMedia, StatusName } from "@/components/status.tsx"
import { type ApiTable, type ComponentDocs, requireSource } from "../item-docs.ts"
import { StatusInRow } from "./status-in-row.tsx"
import { StatusWithDescription } from "./status-with-description.tsx"

const sources = import.meta.glob<string>("./*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

const span = { label: "<span>", href: null }

export const statusDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import { Status, StatusMedia, StatusName } from "@/components/status"`,
    code: `<Status>
  <StatusMedia fill="half" />
  <StatusName>In review</StatusName>
</Status>`,
    description: null,
  },
  composition: {
    name: "Status",
    item: null,
    children: [
      { name: "StatusMedia", item: null, children: [] },
      { name: "StatusName", item: null, children: [] },
      { name: "StatusDescription", item: null, children: [] },
    ],
  },
  examples: [
    {
      name: "status-in-row",
      title: "In a record row",
      description: "RecordRowMedia draws the dot alone. Hover it to read the state.",
      Preview: StatusInRow,
      source: requireSource(sources, "./status-in-row.tsx"),
    },
    {
      name: "status-with-description",
      title: "Description",
      description: "The description truncates first.",
      Preview: StatusWithDescription,
      source: requireSource(sources, "./status-with-description.tsx"),
    },
  ],
  api: [
    {
      kind: "part",
      name: "Status",
      description: "Lays out the dot, the name and the description in one line.",
      spreads: span,
      props: {} satisfies ApiTable<typeof Status, "span">,
    },
    {
      kind: "part",
      name: "StatusMedia",
      description: "The 10px dot. Hidden from screen readers; the name carries the state.",
      spreads: span,
      props: {
        fill: {
          type: '"none" | "half" | "full"',
          required: true,
          default: null,
          description:
            "How much of the dot is filled: none for a state not started, half in progress, full done.",
        },
      } satisfies ApiTable<typeof StatusMedia, "span">,
    },
    {
      kind: "part",
      name: "StatusName",
      description: "The state's name, such as In review.",
      spreads: span,
      props: {} satisfies ApiTable<typeof StatusName, "span">,
    },
    {
      kind: "part",
      name: "StatusDescription",
      description: "One line after the name, in muted text.",
      spreads: span,
      props: {} satisfies ApiTable<typeof StatusDescription, "span">,
    },
  ],
}
