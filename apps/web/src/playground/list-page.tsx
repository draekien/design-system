import { DiceIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { getRouteApi } from "@tanstack/react-router"
import * as React from "react"
import { cn } from "@/lib/cn.ts"
import { datasetParts, invoicesDataset, recordsDataset } from "../lockups/list/datasets.tsx"
import { listLockupDocs } from "../lockups/list/list.docs.ts"
import { listCode, listStatesCode } from "../lockups/list/list-code.ts"
import { listRules } from "../lockups/list/list-rules.ts"
import { listLockup } from "../lockups/lockups.ts"
import { ListConstellation } from "./list-canvas.tsx"
import { LockupPage } from "./lockup-page.tsx"
import { ControlGroup, Segmented } from "./playground-controls.tsx"
import {
  canvasCounts,
  type ListPart,
  listParts,
  maxSeed,
  type PlaygroundSearch,
} from "./playground-search.ts"
import { focusRing, segmentItem } from "./playground-styles.ts"

const route = getRouteApi("/playground/lockups/list")

const datasets = { records: recordsDataset, invoices: invoicesDataset } as const

const datasetLabel = { records: "Records", invoices: "Invoices" } as const

function useSetSearch() {
  const navigate = route.useNavigate()
  return (patch: Partial<PlaygroundSearch>) =>
    void navigate({
      search: (previous) => ({ ...previous, ...patch }),
      replace: true,
      resetScroll: false,
    })
}

export function ListPage({ search }: { search: PlaygroundSearch }): React.ReactElement {
  const setSearch = useSetSearch()
  const hidden = new Set(search.hide)
  const dataset = datasets[search.dataset]
  const lockupCode =
    search.dataset === "invoices"
      ? listCode(invoicesDataset, hidden)
      : listCode(recordsDataset, hidden)
  const statesCode =
    search.dataset === "invoices"
      ? listStatesCode(invoicesDataset, hidden, search.state)
      : listStatesCode(recordsDataset, hidden, search.state)

  return (
    <LockupPage
      lockup={listLockup}
      intro={
        <>
          <code className="font-mono text-[0.875em] text-foreground">List</code> holds the keyboard
          model, <code className="font-mono text-[0.875em] text-foreground">ListRow</code> the
          ranked parts.
        </>
      }
      noun="list"
      canvas="/canvas/lockups/list"
      search={search}
      lockupCode={{ code: lockupCode, fileName: `${dataset.noun}.tsx` }}
      statesCode={{
        code: statesCode,
        fileName:
          search.state === "loading"
            ? `${dataset.noun}-loading.tsx`
            : `${dataset.item}-row-states.tsx`,
      }}
      constellation={<ListConstellation options={search} />}
      constellationDescription="How the row encodes the rules: each part sits with its information rank and connects to where it shows or is revealed in the row."
      docs={listLockupDocs}
      rules={listRules}
      controls={<CanvasControls search={search} hidden={hidden} />}
      onSearchChange={setSearch}
    />
  )
}

function CanvasControls({
  search,
  hidden,
}: {
  search: PlaygroundSearch
  hidden: ReadonlySet<ListPart>
}) {
  const setSearch = useSetSearch()
  const dataset = datasets[search.dataset]
  const parts =
    search.dataset === "invoices" ? datasetParts(invoicesDataset) : datasetParts(recordsDataset)

  function togglePart(part: ListPart) {
    setSearch({
      hide: listParts.filter((candidate) =>
        candidate === part ? !hidden.has(candidate) : hidden.has(candidate)
      ),
    })
  }

  return (
    <>
      <ControlGroup
        label="Data"
        hint={
          search.data === "random"
            ? `The same seed always generates the same ${dataset.noun}, so a copied link shows what you see.`
            : dataset.sampleHint
        }
      >
        <Segmented label="Dataset" className="self-start">
          {(["records", "invoices"] as const).map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={search.dataset === name}
              onClick={() => setSearch({ dataset: name })}
              className={segmentItem}
            >
              {datasetLabel[name]}
            </button>
          ))}
        </Segmented>
        <Segmented label="Data source" className="self-start">
          <button
            type="button"
            aria-pressed={search.data === "sample"}
            onClick={() => setSearch({ data: "sample" })}
            className={segmentItem}
          >
            Sample
          </button>
          <button
            type="button"
            aria-pressed={search.data === "random"}
            onClick={() => setSearch({ data: "random" })}
            className={segmentItem}
          >
            Random
          </button>
        </Segmented>
        {search.data === "random" && <RandomDataControls search={search} />}
      </ControlGroup>

      <ControlGroup
        label="Parts"
        hint="ListRowLink, ListRowSubject and ListRowName are required. The code follows these choices."
      >
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
                  onChange={() => togglePart(part)}
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
      </ControlGroup>
    </>
  )
}

function RandomDataControls({ search }: { search: PlaygroundSearch }) {
  const setSearch = useSetSearch()
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
              setSearch({ seed })
            }
          }}
          className={cn(
            "min-h-8 w-0 min-w-0 flex-1 rounded-lg border bg-background px-2.5 font-mono text-xs tabular-nums",
            focusRing
          )}
        />
        <button
          type="button"
          onClick={() => setSearch({ seed: Math.floor(Math.random() * (maxSeed + 1)) })}
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
              onClick={() => setSearch({ count })}
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
