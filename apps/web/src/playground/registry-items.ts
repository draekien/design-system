import registry from "@workspace/ui/registry.json" with { type: "json" }
import { z } from "zod"

export const itemStatuses = ["experiment", "beta", "stable", "deprecated"] as const

export type ItemStatus = (typeof itemStatuses)[number]

const itemMetaSchema = z.object({
  status: z.enum(itemStatuses),
  a11yReviewed: z.iso.date().nullable(),
  critiqued: z.iso.date().nullable(),
})

export type ItemMeta = z.output<typeof itemMetaSchema>

const changelogSchema = z
  .array(z.object({ date: z.iso.date(), description: z.string().min(1) }))
  .min(1, "has no entry")
  .refine(
    (entries) =>
      entries.every((entry, index) => (entries[index - 1]?.date ?? entry.date) >= entry.date),
    "is not newest first"
  )

export type Changelog = z.output<typeof changelogSchema>

type ChangelogDay = { date: string; descriptions: ReadonlyArray<string> }

export function changelogByDate(changelog: Changelog): ReadonlyArray<ChangelogDay> {
  const days = new Map<string, Array<string>>()
  for (const entry of changelog) {
    const descriptions = days.get(entry.date)
    if (descriptions === undefined) {
      days.set(entry.date, [entry.description])
    } else {
      descriptions.push(entry.description)
    }
  }
  return Array.from(days, ([date, descriptions]) => ({ date, descriptions }))
}

const itemTypeSchema = z.enum(["registry:ui", "registry:theme", "registry:lib"])

export type RegistryItem = {
  name: string
  type: z.output<typeof itemTypeSchema>
  title: string
  description: string
  docs: string
  registryDependencies: ReadonlyArray<string>
  meta: ItemMeta
  changelog: Changelog
}

const changelogFiles: Readonly<Record<string, unknown>> = import.meta.glob(
  "../../../../packages/ui/src/**/*.changelog.json",
  { eager: true, import: "default" }
)

export function parseItemMeta(name: string, meta: unknown): ItemMeta {
  const parsed = itemMetaSchema.safeParse(meta)
  if (!parsed.success) {
    throw new Error(`registry.json item ${name} has invalid meta: ${z.prettifyError(parsed.error)}`)
  }
  return parsed.data
}

export function parseChangelog(name: string, files: Readonly<Record<string, unknown>>): Changelog {
  const fileName = `${name}.changelog.json`
  const path = Object.keys(files).find((candidate) => candidate.endsWith(`/${fileName}`))
  if (path === undefined) {
    throw new Error(`${name} has no ${fileName} beside its source.`)
  }
  const parsed = changelogSchema.safeParse(files[path])
  if (!parsed.success) {
    throw new Error(`${fileName} is invalid: ${z.prettifyError(parsed.error)}`)
  }
  return parsed.data
}

/** Lists each lifecycle criterion in `docs/contexts/component-lifecycle.md` that registry.json alone shows an item fails. */
export function lifecycleFailures(
  item: Pick<RegistryItem, "name" | "description" | "docs" | "meta">,
  itemNames: ReadonlyArray<string>
): ReadonlyArray<string> {
  const { status, critiqued, a11yReviewed } = item.meta
  const usage = usageText(item.docs)
  const namesReplacement = itemNames.some(
    (name) => name !== item.name && new RegExp(String.raw`(?<![\w-])${name}(?![\w-])`).test(usage)
  )
  return [
    ...(usage.trim() === "" ? ["has no docs"] : []),
    ...(status === "experiment" ? ["is published as an experiment"] : []),
    ...(status === "stable" && (critiqued === null || a11yReviewed === null)
      ? ["is stable without a critique and a review date"]
      : []),
    ...(status === "deprecated" && !(item.description.startsWith("Deprecated:") && namesReplacement)
      ? ["is deprecated without naming its replacement"]
      : []),
  ]
}

const itemNames = registry.items.map((item) => item.name)

function meetsLifecycle(item: RegistryItem): RegistryItem {
  const failures = lifecycleFailures(item, itemNames)
  if (failures.length > 0) {
    throw new Error(`registry.json item ${item.name} ${failures.join(", ")}.`)
  }
  return item
}

const registryPrefix = "draekien/design-system/"

export const registryItems: ReadonlyArray<RegistryItem> = registry.items.map((item) =>
  meetsLifecycle({
    name: item.name,
    type: itemTypeSchema.parse(item.type),
    title: item.title,
    description: item.description,
    docs: item.docs,
    registryDependencies: (
      ("registryDependencies" in item ? item.registryDependencies : undefined) ?? []
    ).map((dependency) => dependency.replace(registryPrefix, "")),
    meta: parseItemMeta(item.name, "meta" in item ? item.meta : undefined),
    changelog: parseChangelog(item.name, changelogFiles),
  })
)

export const tokensItemName = "tokens"

export const componentItems: ReadonlyArray<RegistryItem> = registryItems.filter(
  (item) => item.type === "registry:ui"
)

export const libItems: ReadonlyArray<RegistryItem> = registryItems.filter(
  (item) => item.type === "registry:lib"
)

export function usageText(docs: string): string {
  return docs.replace(/\s*Playground: \S+$/, "")
}

export function installCommand(name: string): string {
  const tokens = requireRegistryItem(name).registryDependencies.includes(tokensItemName)
    ? `${registryPrefix}${tokensItemName} `
    : ""
  return `pnpm dlx shadcn@latest add ${tokens}${registryPrefix}${name}`
}

export function requireRegistryItem(name: string): RegistryItem {
  const item = registryItems.find((candidate) => candidate.name === name)
  if (item === undefined) {
    throw new Error(`registry.json has no item named ${name}.`)
  }
  return item
}
