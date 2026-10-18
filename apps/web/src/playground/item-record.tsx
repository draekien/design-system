import type * as React from "react"
import { cn } from "@/lib/cn.ts"
import {
  type Changelog,
  changelogByDate,
  type ItemMeta,
  type ItemStatus,
} from "./registry-items.ts"

const statusLabel: Readonly<Record<ItemStatus, string>> = {
  experiment: "Experiment",
  beta: "Beta",
  stable: "Stable",
  deprecated: "Deprecated",
}

const dateFormat = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeZone: "UTC" })

function formatDate(date: string) {
  return dateFormat.format(new Date(date))
}

export function ItemMetaList({
  meta,
  className,
}: {
  meta: ItemMeta
  className?: string
}): React.ReactElement {
  return (
    <dl className={cn("flex flex-wrap gap-x-6 gap-y-1 text-sm", className)}>
      <div className="flex gap-2">
        <dt className="text-muted-foreground">Status</dt>
        <dd className="font-medium">{statusLabel[meta.status]}</dd>
      </div>
      <div className="flex gap-2">
        <dt className="text-muted-foreground">Accessibility review</dt>
        <dd className="font-medium">
          {meta.a11yReviewed === null ? (
            "Not reviewed yet"
          ) : (
            <time dateTime={meta.a11yReviewed}>{formatDate(meta.a11yReviewed)}</time>
          )}
        </dd>
      </div>
    </dl>
  )
}

export function ItemChanges({ changelog }: { changelog: Changelog }): React.ReactElement {
  return (
    <ol className="flex max-w-2xl flex-col text-sm">
      {changelogByDate(changelog).map((day) => (
        <li
          key={day.date}
          className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 border-b py-2.5 first:pt-0 last:border-b-0"
        >
          <time dateTime={day.date} className="text-muted-foreground tabular-nums">
            {formatDate(day.date)}
          </time>
          {day.descriptions.length === 1 ? (
            <span className="text-pretty">{day.descriptions[0]}</span>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {day.descriptions.map((description) => (
                <li key={description} className="text-pretty">
                  {description}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  )
}
