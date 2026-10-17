import { z } from "zod"

const sortColumns = ["invoice", "customer", "amount", "paid", "due"] as const

const directions = ["ascending", "descending"] as const

export const tableSearchDefaults: {
  sort: (typeof sortColumns)[number]
  direction: (typeof directions)[number]
  collapsed: Array<string>
  expanded: Array<string>
} = { sort: "due", direction: "ascending", collapsed: [], expanded: [] }

export const tableSearch = z.object({
  sort: z.enum(sortColumns).default(tableSearchDefaults.sort).catch(tableSearchDefaults.sort),
  direction: z
    .enum(directions)
    .default(tableSearchDefaults.direction)
    .catch(tableSearchDefaults.direction),
  collapsed: z
    .array(z.string())
    .default(tableSearchDefaults.collapsed)
    .catch(tableSearchDefaults.collapsed),
  expanded: z
    .array(z.string())
    .default(tableSearchDefaults.expanded)
    .catch(tableSearchDefaults.expanded),
  focus: z.string().optional().catch(undefined),
})

export type TableSearch = z.output<typeof tableSearch>
