import { Alert02Icon, LockIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import { type RecordStatus, type SampleRecord, sampleRecords } from "@workspace/fixtures/records.ts"
import { type FixtureState, fixtureStates } from "@workspace/fixtures/state.ts"
import * as React from "react"
import { cn } from "@/lib/cn.ts"
import { stateRules } from "./state-rules.ts"
import { StateSwap } from "./state-swap.tsx"

const statusLabel: Readonly<Record<RecordStatus, string>> = {
  draft: "Draft",
  "in-review": "In review",
  approved: "Approved",
}

const statusDot: Readonly<Record<RecordStatus, string>> = {
  draft: "bg-transparent",
  "in-review": "bg-[linear-gradient(90deg,currentColor_50%,transparent_50%)]",
  approved: "bg-current",
}

const rowHeight = "h-13"
const idCell = "hidden w-24 sm:table-cell"
const updatedCell = "hidden w-28 md:table-cell"

export function RecordDemo({ state }: { state: FixtureState }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StateSwitcher state={state} />
        <p className="text-muted-foreground text-xs">Sample records</p>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-8px_rgb(0_0_0/0.08)]">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <caption className="sr-only">
            Sample records, shown in the {stateRules[state].label} state
          </caption>
          <thead>
            <tr className="border-b text-muted-foreground text-xs">
              <th scope="col" className={cn(idCell, "px-4 py-3 font-medium")}>
                ID
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Title
              </th>
              <th scope="col" className="w-28 px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="w-36 px-4 py-3 font-medium sm:w-40">
                Owner
              </th>
              <th scope="col" className={cn(updatedCell, "px-4 py-3 font-medium")}>
                Updated
              </th>
            </tr>
          </thead>
          <RecordRows key={state} state={state} />
        </table>
        <TableFooter state={state} />
      </div>
    </div>
  )
}

function StateSwitcher({ state }: { state: FixtureState }) {
  return (
    <fieldset className="flex min-w-0 max-w-full gap-1 overflow-x-auto rounded-lg border bg-card p-1">
      <legend className="sr-only">Demo state</legend>
      {fixtureStates.map((option) => (
        <Link
          key={option}
          to="/"
          search={{ state: option }}
          replace
          resetScroll={false}
          aria-current={option === state ? "true" : undefined}
          className={cn(
            "inline-flex min-h-8 shrink-0 items-center rounded-md px-3 text-muted-foreground text-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
            option === state && "bg-foreground text-background hover:text-background"
          )}
        >
          {stateRules[option].label}
        </Link>
      ))}
    </fieldset>
  )
}

function RecordRows({ state }: { state: FixtureState }) {
  const [peekedId, setPeekedId] = React.useState<string | null>(null)

  if (state === "error") {
    return (
      <tbody>
        <tr>
          <td colSpan={5} className="h-52 px-6 text-center">
            <p className="font-medium">The records could not load.</p>
            <p className="mx-auto mt-1 max-w-sm text-muted-foreground">
              The request timed out after 10 seconds. Retry, or check your connection and reload the
              page.
            </p>
            <Link
              to="/"
              search={{ state: "loaded" }}
              replace
              resetScroll={false}
              className="mt-4 inline-flex min-h-9 items-center rounded-md border bg-card px-4 font-medium shadow-xs hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            >
              Retry
            </Link>
          </td>
        </tr>
      </tbody>
    )
  }

  if (state === "loading") {
    return (
      <tbody aria-busy="true">
        {sampleRecords.map((record) => (
          <tr key={record.id} className={cn(rowHeight, "border-b last:border-b-0")}>
            <td className={cn(idCell, "px-4")}>
              <Bar className="w-14" />
            </td>
            <td className="px-4">
              <Bar className="w-3/4" />
            </td>
            <td className="px-4">
              <Bar className="w-16" />
            </td>
            <td className="px-4">
              <Bar className="w-24" />
            </td>
            <td className={cn(updatedCell, "px-4")}>
              <Bar className="w-16" />
            </td>
          </tr>
        ))}
      </tbody>
    )
  }

  function handleRowKeyDown(event: React.KeyboardEvent<HTMLTableRowElement>, id: string) {
    if (event.key === " ") {
      event.preventDefault()
      setPeekedId((current) => (current === id ? null : id))
      return
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return
    }
    event.preventDefault()
    const rows = Array.from(
      event.currentTarget
        .closest("tbody")
        ?.querySelectorAll<HTMLTableRowElement>("[data-record-row]") ?? []
    )
    const next = rows[rows.indexOf(event.currentTarget) + (event.key === "ArrowDown" ? 1 : -1)]
    if (next === undefined) {
      return
    }
    next.focus()
    if (peekedId !== null) {
      setPeekedId(next.dataset.recordRow ?? null)
    }
  }

  function handleRowClick(id: string) {
    setPeekedId((current) => (current === id ? null : id))
  }

  return (
    <tbody>
      {sampleRecords.map((record) => (
        <React.Fragment key={record.id}>
          <tr
            data-record-row={record.id}
            tabIndex={0}
            aria-expanded={peekedId === record.id}
            onKeyDown={(event) => handleRowKeyDown(event, record.id)}
            onClick={() => handleRowClick(record.id)}
            className={cn(
              rowHeight,
              "cursor-default border-b outline-none transition-colors last:border-b-0 hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:shadow-[inset_2px_0_0_var(--ring)]",
              peekedId === record.id && "bg-muted/60"
            )}
          >
            <td className={cn(idCell, "px-4 text-muted-foreground tabular-nums")}>{record.id}</td>
            <td className="truncate px-4 font-medium">{record.title}</td>
            <td className="px-4">
              <StatusCell status={record.status} />
            </td>
            <td className="truncate px-4">
              <OwnerCell record={record} state={state} />
            </td>
            <td className={cn(updatedCell, "px-4 text-muted-foreground")}>{record.updated}</td>
          </tr>
          {peekedId === record.id && <PeekRow record={record} state={state} />}
        </React.Fragment>
      ))}
    </tbody>
  )
}

function PeekRow({ record, state }: { record: SampleRecord; state: FixtureState }) {
  return (
    <tr className="border-b bg-muted/40">
      <td colSpan={5} className="px-4 py-4 sm:pl-28">
        <p className="max-w-prose text-pretty">{record.summary}</p>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground text-xs">
          <div className="flex gap-1.5">
            <dt>Team</dt>
            <dd className="text-foreground">{record.team}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Owner</dt>
            <dd className="text-foreground">
              <OwnerCell record={record} state={state} />
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Updated</dt>
            <dd className="text-foreground">{record.updated}</dd>
          </div>
        </dl>
      </td>
    </tr>
  )
}

function StatusCell({ status }: { status: RecordStatus }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn("size-2.5 rounded-full border-[1.5px] border-current", statusDot[status])}
      />
      {statusLabel[status]}
    </span>
  )
}

function OwnerCell({ record, state }: { record: SampleRecord; state: FixtureState }) {
  if (state === "partial") {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <HugeiconsIcon icon={Alert02Icon} size={14} strokeWidth={1.75} aria-hidden="true" />
        Unavailable
      </span>
    )
  }
  if (state === "no-permission") {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <HugeiconsIcon icon={LockIcon} size={14} strokeWidth={1.75} aria-hidden="true" />
        Hidden
      </span>
    )
  }
  return record.owner
}

function TableFooter({ state }: { state: FixtureState }) {
  return (
    <div className="border-t bg-muted/30 px-4 py-2.5 text-muted-foreground text-xs">
      <StateSwap
        state={state}
        renderState={(option) => <FooterMessage state={option} />}
        className="flex min-h-6 flex-wrap items-center gap-x-3 gap-y-1"
      />
    </div>
  )
}

function FooterMessage({ state }: { state: FixtureState }) {
  if (state === "loaded") {
    return (
      <>
        <span>{sampleRecords.length} records</span>
        <span>
          Focus a row and press <Kbd>Space</Kbd> to peek, <Kbd>↑</Kbd> <Kbd>↓</Kbd> to move
        </span>
      </>
    )
  }
  if (state === "loading") {
    return <span>Loading {sampleRecords.length} records…</span>
  }
  if (state === "partial") {
    return (
      <>
        <span>Owners could not load: the directory service did not respond.</span>
        <Link
          to="/"
          search={{ state: "loaded" }}
          replace
          resetScroll={false}
          className="font-medium text-foreground underline decoration-primary decoration-2 underline-offset-4 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          Retry owners
        </Link>
      </>
    )
  }
  if (state === "error") {
    return <span>0 of {sampleRecords.length} records loaded</span>
  }
  return (
    <span>Owner is visible to the Compliance viewer role. Ask a workspace admin for access.</span>
  )
}

function Bar({ className }: { className: string }) {
  return (
    <span
      className={cn("block h-2.5 rounded-full bg-muted motion-safe:animate-pulse", className)}
    />
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 inline-flex min-w-5 items-center justify-center rounded border border-b-2 bg-card px-1 font-sans text-[0.6875rem] text-foreground">
      {children}
    </kbd>
  )
}
