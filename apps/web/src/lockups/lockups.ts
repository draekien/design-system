import { type RegistryItem, requireRegistryItem } from "../playground/registry-items.ts"
import type { FileRoutesByTo } from "../routeTree.gen.ts"
import { componentModule } from "./list/component-module.ts"

export type Lockup = {
  name: string
  title: string
  description: string
  page: Extract<keyof FileRoutesByTo, `/playground/lockups/${string}`>
  components: ReadonlyArray<RegistryItem>
}

export const listLockup: Lockup = {
  name: "list",
  title: "List",
  description:
    "Rows for any data: rank each value, and the row decides where it goes, how it reads and what it does when the list is narrow.",
  page: "/playground/lockups/list",
  components: [...new Set(["list", ...Object.values(componentModule)])].map(requireRegistryItem),
}

export const tableLockup: Lockup = {
  name: "table",
  title: "Table",
  description:
    "Rows for comparing values down a column: group, sort, expand and select them, and the table decides which columns stay when it is narrow.",
  page: "/playground/lockups/table",
  components: ["table", "status", "preview-card"].map(requireRegistryItem),
}

export const lockups: ReadonlyArray<Lockup> = [listLockup, tableLockup]

export function usedIn(component: RegistryItem): ReadonlyArray<Lockup> {
  return lockups.filter((lockup) => lockup.components.some((part) => part.name === component.name))
}
