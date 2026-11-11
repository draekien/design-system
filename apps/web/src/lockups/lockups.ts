import { type RegistryItem, requireRegistryItem } from "../playground/registry-items.ts"
import type { FileRoutesByTo } from "../routeTree.gen.ts"
import { componentModule } from "./list/component-module.ts"

export type Lockup = {
  name: string
  title: string
  /** The sidebar label the lockup is listed under, beside lockups with the same group. */
  group: string | null
  description: string
  page: Extract<keyof FileRoutesByTo, `/playground/lockups/${string}`>
  components: ReadonlyArray<RegistryItem>
}

export const listLockup: Lockup = {
  name: "list",
  title: "List",
  group: null,
  description:
    "Rows for any data: rank each value, and the row decides where it goes, how it reads and what it does when the list is narrow.",
  page: "/playground/lockups/list",
  components: [...new Set(["list", ...Object.values(componentModule)])].map(requireRegistryItem),
}

export const tableLockup: Lockup = {
  name: "table",
  title: "Table",
  group: null,
  description:
    "Rows for comparing values down a column: group, sort, expand and select them, and the table decides which columns stay when it is narrow.",
  page: "/playground/lockups/table",
  components: ["table", "status", "preview-card"].map(requireRegistryItem),
}

export const avatarLockup: Lockup = {
  name: "avatar",
  title: "Avatar",
  group: null,
  description:
    "The people on a record: the assignee and owner by name, then the reviewers and watchers as groups whose popover lists everyone.",
  page: "/playground/lockups/avatar",
  components: ["avatar", "entity", "preview-card"].map(requireRegistryItem),
}

export const bulletLockup: Lockup = {
  name: "bullet",
  title: "Bullet",
  group: null,
  description:
    "A record's details panel: one fact per line after its property's name, each a picker, a popover, a hover card, a link or a plain fact.",
  page: "/playground/lockups/bullet",
  components: ["bullet", "avatar", "preview-card"].map(requireRegistryItem),
}

export const recordCardLockup: Lockup = {
  name: "record-card",
  title: "Record card",
  group: "Cards",
  description:
    "One record per card, in a grid: its picture, ID and name, then its facts in the same order on every card, with its summary one click away.",
  page: "/playground/lockups/record-card",
  components: ["card", "status", "entity", "relative-time", "preview-card"].map(
    requireRegistryItem
  ),
}

export const summaryCardLockup: Lockup = {
  name: "summary-card",
  title: "Summary card",
  group: "Cards",
  description:
    "One record's properties on its own page: its ID and name, then one fact per line after its property's name.",
  page: "/playground/lockups/summary-card",
  components: ["card", "status", "entity", "preview-card"].map(requireRegistryItem),
}

export const metricCardLockup: Lockup = {
  name: "metric-card",
  title: "Metric card",
  group: "Cards",
  description:
    "One figure per card, in a row: the figure at the top left, its change against last month at the top right, then its name and unit.",
  page: "/playground/lockups/metric-card",
  components: ["card", "figure", "preview-card"].map(requireRegistryItem),
}

export const lockups: ReadonlyArray<Lockup> = [
  avatarLockup,
  bulletLockup,
  recordCardLockup,
  summaryCardLockup,
  metricCardLockup,
  listLockup,
  tableLockup,
]

/** The lockups in sidebar order, with each run of lockups that share a group gathered under it. */
export const lockupNav: ReadonlyArray<{ group: string | null; lockups: ReadonlyArray<Lockup> }> =
  lockups.reduce<Array<{ group: string | null; lockups: Array<Lockup> }>>((nav, lockup) => {
    const last = nav.at(-1)
    if (lockup.group !== null && last?.group === lockup.group) {
      last.lockups.push(lockup)
    } else {
      nav.push({ group: lockup.group, lockups: [lockup] })
    }
    return nav
  }, [])

export function usedIn(component: RegistryItem): ReadonlyArray<Lockup> {
  return lockups.filter((lockup) => lockup.components.some((part) => part.name === component.name))
}
