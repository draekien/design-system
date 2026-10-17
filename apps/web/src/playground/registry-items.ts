import registry from "@workspace/ui/registry.json" with { type: "json" }
import { componentModule } from "./record-list-code.ts"

export type RegistryItem = {
  name: string
  title: string
  description: string
  docs: string
  registryDependencies: ReadonlyArray<string>
}

export type ItemPart = { item: RegistryItem; installs: "with" | "separately" }

const registryPrefix = "draekien/design-system/"

export const registryItems: ReadonlyArray<RegistryItem> = registry.items.map((item) => ({
  name: item.name,
  title: item.title,
  description: item.description,
  docs: item.docs,
  registryDependencies: (
    ("registryDependencies" in item ? item.registryDependencies : undefined) ?? []
  ).map((dependency) => dependency.replace(registryPrefix, "")),
}))

const lockupParts: Readonly<Record<string, ReadonlyArray<string>>> = {
  "record-list": Object.values(componentModule),
}

export const lockupItems: ReadonlyArray<RegistryItem> = registryItems.filter(
  (item) => item.name in lockupParts
)

export const componentItems: ReadonlyArray<RegistryItem> = registryItems.filter(
  (item) => !(item.name in lockupParts)
)

export function installCommand(name: string): string {
  return `pnpm dlx shadcn@latest add ${registryPrefix}${name}`
}

export function requireRegistryItem(name: string): RegistryItem {
  const item = registryItems.find((candidate) => candidate.name === name)
  if (item === undefined) {
    throw new Error(`registry.json has no item named ${name}.`)
  }
  return item
}

export function builtFrom(lockup: RegistryItem): ReadonlyArray<ItemPart> {
  const installed = lockup.registryDependencies
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

function dependsOn(item: RegistryItem, name: string, seen: Set<string>): boolean {
  return builtFrom(item).some((part) => {
    if (seen.has(part.item.name)) {
      return false
    }
    seen.add(part.item.name)
    return part.item.name === name || dependsOn(part.item, name, seen)
  })
}

export function usedIn(component: RegistryItem): ReadonlyArray<RegistryItem> {
  return lockupItems.filter((lockup) => dependsOn(lockup, component.name, new Set([lockup.name])))
}
