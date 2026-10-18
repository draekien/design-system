import registry from "@workspace/ui/registry.json" with { type: "json" }
import { z } from "zod"
import { componentModule } from "./record-list-code.ts"

export const itemStatuses = ["experiment", "beta", "stable", "deprecated"] as const

export type ItemStatus = (typeof itemStatuses)[number]

const itemMetaSchema = z.object({
  status: z.enum(itemStatuses),
  a11yReviewed: z.iso.date().nullable(),
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

export type ItemPart = { item: RegistryItem; installs: "with" | "separately" }

const registryPrefix = "draekien/design-system/"

export const registryItems: ReadonlyArray<RegistryItem> = registry.items.map((item) => ({
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
}))

export const tokensItemName = "tokens"

export const cnItemName = "cn"

const lockupParts: Readonly<Record<string, ReadonlyArray<string>>> = {
  "record-list": Object.values(componentModule),
}

export const lockupItems: ReadonlyArray<RegistryItem> = registryItems.filter(
  (item) => item.name in lockupParts
)

export const componentItems: ReadonlyArray<RegistryItem> = registryItems.filter(
  (item) => item.type === "registry:ui" && !(item.name in lockupParts)
)

export function usageText(docs: string): string {
  return docs.replace(/\s*Playground: \S+$/, "")
}

export function installCommand(name: string): string {
  const names = requireRegistryItem(name).registryDependencies.includes(tokensItemName)
    ? [tokensItemName, name]
    : [name]
  return `pnpm dlx shadcn@latest add ${names.map((item) => `${registryPrefix}${item}`).join(" ")}`
}

export function requireRegistryItem(name: string): RegistryItem {
  const item = registryItems.find((candidate) => candidate.name === name)
  if (item === undefined) {
    throw new Error(`registry.json has no item named ${name}.`)
  }
  return item
}

export function builtFrom(lockup: RegistryItem): ReadonlyArray<ItemPart> {
  const installed = lockup.registryDependencies.filter(
    (name) => requireRegistryItem(name).type === "registry:ui"
  )
  const separate = [...new Set(lockupParts[lockup.name] ?? [])].filter(
    (name) => !installed.includes(name)
  )
  return [
    ...installed.map((name) => ({ item: requireRegistryItem(name), installs: "with" as const })),
    ...separate.map((name) => ({
      item: requireRegistryItem(name),
      installs: "separately" as const,
    })),
  ]
}

export function usedIn(component: RegistryItem): ReadonlyArray<RegistryItem> {
  return lockupItems.filter((lockup) =>
    builtFrom(lockup).some((part) => part.item.name === component.name)
  )
}
