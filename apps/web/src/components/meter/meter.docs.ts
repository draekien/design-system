import type { Meter as BaseMeter } from "@base-ui/react/meter"
import type { Meter } from "@/components/meter.tsx"
import { type ApiTable, type ComponentDocs, requireSource } from "../item-docs.ts"
import { MeterFill } from "./meter-fill.tsx"
import { MeterRange } from "./meter-range.tsx"

const sources = import.meta.glob<string>("./*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

export const meterDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import { Meter } from "@/components/meter"`,
    code: `<Meter value={0.4} max={1} format={{ style: "percent" }} aria-label="Paid" />`,
    description: null,
  },
  composition: {
    name: "Meter",
    item: null,
    children: [],
  },
  examples: [
    {
      name: "meter-fill",
      title: "Fill",
      description: "Empty, part and full, each with its value printed.",
      Preview: MeterFill,
      source: requireSource(sources, "./meter-fill.tsx"),
    },
    {
      name: "meter-range",
      title: "Range",
      description: "Set min and max for a range that does not start at zero.",
      Preview: MeterRange,
      source: requireSource(sources, "./meter-range.tsx"),
    },
  ],
  api: [
    {
      kind: "part",
      name: "Meter",
      description: "A 64px bar and its formatted value for a measurement within a known range.",
      spreads: {
        label: "Base UI Meter",
        href: "https://base-ui.com/react/components/meter#api-reference",
      },
      props: {} satisfies ApiTable<typeof Meter, typeof BaseMeter.Root>,
    },
  ],
}
