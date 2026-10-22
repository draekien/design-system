import { DiceIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as React from "react"
import { cn } from "@/lib/cn.ts"
import { Segmented } from "./playground-controls.tsx"
import { canvasCounts, maxSeed, type PlaygroundSearch } from "./playground-search.ts"
import { focusRing, segmentItem } from "./playground-styles.ts"

type SearchChange = (patch: Partial<PlaygroundSearch>) => void

/** The Sample and Random toggle, with the seed and row count while Random is on. */
export function DataSourceControls({
  search,
  onSearchChange,
}: {
  search: PlaygroundSearch
  onSearchChange: SearchChange
}): React.ReactElement {
  return (
    <>
      <Segmented label="Data source" className="self-start">
        <button
          type="button"
          aria-pressed={search.data === "sample"}
          onClick={() => onSearchChange({ data: "sample" })}
          className={segmentItem}
        >
          Sample
        </button>
        <button
          type="button"
          aria-pressed={search.data === "random"}
          onClick={() => onSearchChange({ data: "random" })}
          className={segmentItem}
        >
          Random
        </button>
      </Segmented>
      {search.data === "random" && (
        <RandomDataControls search={search} onSearchChange={onSearchChange} />
      )}
    </>
  )
}

function RandomDataControls({
  search,
  onSearchChange,
}: {
  search: PlaygroundSearch
  onSearchChange: SearchChange
}) {
  const seedId = React.useId()

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <label htmlFor={seedId} className="w-10 text-muted-foreground text-xs">
          Seed
        </label>
        <input
          key={search.seed}
          id={seedId}
          type="number"
          inputMode="numeric"
          min={0}
          max={maxSeed}
          defaultValue={search.seed}
          onChange={(event) => {
            const seed = Number(event.target.value)
            if (
              event.target.value !== "" &&
              Number.isInteger(seed) &&
              seed >= 0 &&
              seed <= maxSeed
            ) {
              onSearchChange({ seed })
            }
          }}
          className={cn(
            "min-h-8 w-0 min-w-0 flex-1 rounded-lg border bg-background px-2.5 font-mono text-xs tabular-nums",
            focusRing
          )}
        />
        <button
          type="button"
          onClick={() => onSearchChange({ seed: Math.floor(Math.random() * (maxSeed + 1)) })}
          className={cn(
            "inline-flex min-h-8 items-center gap-1.5 rounded-lg border bg-background px-2.5 font-medium text-xs hover:bg-muted",
            focusRing
          )}
        >
          <HugeiconsIcon icon={DiceIcon} size={14} strokeWidth={1.75} aria-hidden="true" />
          New seed
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-10 text-muted-foreground text-xs">Rows</span>
        <Segmented label="Rows">
          {canvasCounts.map((count) => (
            <button
              key={count}
              type="button"
              aria-pressed={search.count === count}
              onClick={() => onSearchChange({ count })}
              className={cn(segmentItem, "min-w-10 tabular-nums")}
            >
              {count}
            </button>
          ))}
        </Segmented>
      </div>
    </div>
  )
}

/** One part the Parts control can hide; a part with a `parent` is disabled while its parent is hidden. */
export type PartOption<TPart extends string> = { part: TPart; label: string; parent?: TPart }

/** A checkbox per part; a part's code name is set in monospace, a nested part's label is not. */
export function PartsControls<TPart extends string>({
  parts,
  hidden,
  onToggle,
}: {
  parts: ReadonlyArray<PartOption<TPart>>
  hidden: ReadonlySet<TPart>
  onToggle: (part: TPart) => void
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-0.5">
      {parts.map(({ part, label, parent }) => {
        const isParentHidden = parent !== undefined && hidden.has(parent)
        return (
          <label
            key={part}
            className={cn(
              "flex min-h-8 cursor-pointer items-center gap-2.5 rounded-md px-2 text-sm hover:bg-muted has-disabled:cursor-not-allowed has-disabled:text-muted-foreground has-disabled:hover:bg-transparent",
              parent !== undefined && "ml-5"
            )}
          >
            <input
              type="checkbox"
              checked={!hidden.has(part) && !isParentHidden}
              disabled={isParentHidden}
              onChange={() => onToggle(part)}
              className={cn("size-4 accent-primary", focusRing)}
            />
            <span
              className={cn(
                "truncate",
                parent === undefined && "font-mono text-[0.8125rem] tracking-tight"
              )}
            >
              {label}
            </span>
          </label>
        )
      })}
    </div>
  )
}
