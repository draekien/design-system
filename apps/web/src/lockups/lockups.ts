import { type RegistryItem, requireRegistryItem } from "../playground/registry-items.ts"
import type { FileRoutesByTo } from "../routeTree.gen.ts"
import { componentModule } from "./record-list/component-module.ts"

export type Lockup = {
  name: string
  title: string
  description: string
  page: Extract<keyof FileRoutesByTo, `/playground/lockups/${string}`>
  components: ReadonlyArray<RegistryItem>
}

export const recordListLockup: Lockup = {
  name: "record-list",
  title: "Record list",
  description:
    "Rows for any data: rank each value, and the row decides where it goes, how it reads and what it does when the list is narrow.",
  page: "/playground/lockups/record-list",
  components: [...new Set(["record-list", ...Object.values(componentModule)])].map(
    requireRegistryItem
  ),
}

export const lockups: ReadonlyArray<Lockup> = [recordListLockup]

export function usedIn(component: RegistryItem): ReadonlyArray<Lockup> {
  return lockups.filter((lockup) => lockup.components.some((part) => part.name === component.name))
}
