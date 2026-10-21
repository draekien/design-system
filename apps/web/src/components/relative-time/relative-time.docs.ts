import type { RelativeTime } from "@/components/relative-time.tsx"
import { type ApiTable, type ComponentDocs, requireSource } from "../item-docs.ts"
import { RelativeTimeLocale } from "./relative-time-locale.tsx"
import { RelativeTimeRanges } from "./relative-time-ranges.tsx"

const sources = import.meta.glob<string>("./*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

export const relativeTimeDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import { RelativeTime } from "@/components/relative-time"`,
    code: `<RelativeTime dateTime="2026-10-15T09:12:00Z" now="2026-10-15T11:12:00Z" />`,
    description: "Pass now so the server and the browser render the same text.",
  },
  composition: {
    name: "RelativeTime",
    item: null,
    children: [],
  },
  examples: [
    {
      name: "relative-time-ranges",
      title: "Ranges",
      description: "Minutes, days and months, in the past and the future.",
      Preview: RelativeTimeRanges,
      source: requireSource(sources, "./relative-time-ranges.tsx"),
    },
    {
      name: "relative-time-locale",
      title: "Locale",
      description: "One moment in three locales.",
      Preview: RelativeTimeLocale,
      source: requireSource(sources, "./relative-time-locale.tsx"),
    },
  ],
  api: [
    {
      kind: "part",
      name: "RelativeTime",
      description: "A moment stated relative to now, such as 2 hours ago.",
      spreads: { label: "<time>", href: null },
      props: {
        dateTime: {
          type: "string",
          required: true,
          default: null,
          description: "The moment to state, as an ISO 8601 date-time string.",
        },
        now: {
          type: "string",
          required: true,
          default: null,
          description:
            "The moment to measure from, as an ISO 8601 string, so server and browser render the same text.",
        },
        locale: {
          type: "Intl.LocalesArgument",
          required: false,
          default: '"en"',
          description: "The locale to format the text in.",
        },
      } satisfies ApiTable<typeof RelativeTime, "time">,
    },
  ],
}
