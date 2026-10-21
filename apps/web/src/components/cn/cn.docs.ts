import { type LibDocs, requireSource } from "../item-docs.ts"
import { CnRadius } from "./cn-radius.tsx"
import { CnSpacing } from "./cn-spacing.tsx"

const sources = import.meta.glob<string>("./*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

export const cnDocs: LibDocs = {
  kind: "lib",
  usage: {
    imports: `import { cn } from "@/lib/cn"`,
    code: `cn("rounded-floor", "rounded-card")`,
    description: null,
  },
  examples: [
    {
      name: "cn-radius",
      title: "Radius",
      description: "A later rounded-card replaces an earlier rounded-floor.",
      Preview: CnRadius,
      source: requireSource(sources, "./cn-radius.tsx"),
    },
    {
      name: "cn-spacing",
      title: "Spacing",
      description: "A later gap-related replaces an earlier gap-section.",
      Preview: CnSpacing,
      source: requireSource(sources, "./cn-spacing.tsx"),
    },
  ],
  api: [
    {
      kind: "function",
      name: "cn",
      signature: "cn(...inputs: ClassValue[]): string",
      description:
        "Joins class names, drops falsy values, and keeps the last of any conflicting utilities, including the design-system token utilities.",
    },
  ],
}
