import { Link } from "@tanstack/react-router"
import { type RecordStatus, type SampleRecord, sampleRecords } from "@workspace/fixtures/records.ts"
import { type FixtureState, fixtureStates } from "@workspace/fixtures/state.ts"
import { cn } from "cn"
import * as React from "react"

const statusLabel: Readonly<Record<RecordStatus, string>> = {
  draft: "Draft",
  "in-review": "In review",
  approved: "Approved",
}

const statusGlyph: Readonly<Record<RecordStatus, string>> = {
  draft: "○",
  "in-review": "◐",
  approved: "●",
}

const stateLabel: Readonly<Record<FixtureState, string>> = {
  loaded: "Loaded",
  loading: "Loading",
  partial: "Partial",
  error: "Error",
  "no-permission": "No permission",
}

type Rule = { rule: string; source: string }

const rules: ReadonlyArray<Rule> = [
  {
    rule: "A row shows ID, status, title, owner and updated; the summary and team wait for peek.",
    source: "Linear issue list (screenshots, 2026-10-08)",
  },
  {
    rule: "Space toggles peek on the focused row; ↑ ↓ move focus, and an open peek follows it; Esc closes peek.",
    source: "Linear Peek",
  },
  {
    rule: "Peek opens in a panel beside the list, not in place of it.",
    source: "Stripe Apps design",
  },
  {
    rule: "Every row reserves a checkbox slot; the checkbox is drawn on a hovered, focused or selected row.",
    source: "Linear select issues; Linear issue list (screenshots, 2026-10-08)",
  },
  {
    rule: "X toggles selection on the focused row.",
    source: "This design system's own decision",
  },
  {
    rule: "Status and owner open a hover card; peek shows the same fields, so the keyboard route is peek.",
    source: "Linear issue list (screenshots, 2026-10-08); design-rules.md",
  },
  {
    rule: "Every hit area is at least 24×24px.",
    source: "Primer designer checklist",
  },
  {
    rule: "Loading rows keep the height and slots of the rows they replace.",
    source: "This design system's own decision",
  },
  {
    rule: "A field that fails says so in its slot; the rest of the row stays readable.",
    source: "This design system's own decision",
  },
  {
    rule: "An error states what went wrong, then how to fix it.",
    source: "design-rules.md",
  },
  {
    rule: "A withheld field says it is hidden, and the footer names the role that can see it.",
    source: "This design system's own decision",
  },
]

export function RecordListWireframe({ state }: { state: FixtureState }): React.ReactElement {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-semibold text-xl">Record list row</h1>
        <StateSwitcher state={state} />
      </header>
      {state === "error" ? <ErrorMessage /> : <RecordList key={state} state={state} />}
      <RuleNotes />
    </main>
  )
}

function StateSwitcher({ state }: { state: FixtureState }) {
  return (
    <nav aria-label="Fixture state" className="flex flex-wrap gap-1 rounded-md border p-1">
      {fixtureStates.map((option) => (
        <Link
          key={option}
          to="/record-list"
          search={{ state: option }}
          replace
          aria-current={option === state ? "page" : undefined}
          className={cn(
            "inline-flex min-h-8 items-center rounded px-3 text-muted-foreground text-sm hover:text-foreground",
            option === state && "bg-foreground text-background hover:text-background"
          )}
        >
          {stateLabel[option]}
        </Link>
      ))}
    </nav>
  )
}

function useRecordList() {
  const firstId = sampleRecords[0]?.id ?? null
  const [activeId, setActiveId] = React.useState(firstId)
  const [peekedId, setPeekedId] = React.useState<string | null>(null)
  const [selectedIds, setSelectedIds] = React.useState<ReadonlySet<string>>(new Set())
  const rowRefs = React.useRef(new Map<string, HTMLDivElement>())

  function toggleSelected(id: string) {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function moveFocus(id: string, offset: 1 | -1) {
    const index = sampleRecords.findIndex((record) => record.id === id)
    const next = sampleRecords[index + offset]
    if (next === undefined) {
      return
    }
    rowRefs.current.get(next.id)?.focus()
    if (peekedId !== null) {
      setPeekedId(next.id)
    }
  }

  function onRowKeyDown(event: React.KeyboardEvent<HTMLDivElement>, id: string) {
    switch (event.key) {
      case " ":
        event.preventDefault()
        setPeekedId((current) => (current === id ? null : id))
        return
      case "x":
      case "X":
        event.preventDefault()
        toggleSelected(id)
        return
      case "ArrowDown":
        event.preventDefault()
        moveFocus(id, 1)
        return
      case "ArrowUp":
        event.preventDefault()
        moveFocus(id, -1)
        return
      case "Escape":
        setPeekedId(null)
        return
      default:
        return
    }
  }

  function registerRow(id: string, element: HTMLDivElement | null) {
    if (element === null) {
      rowRefs.current.delete(id)
    } else {
      rowRefs.current.set(id, element)
    }
  }

  return {
    activeId,
    peekedId,
    selectedIds,
    onRowFocus: setActiveId,
    onRowKeyDown,
    onToggleSelected: toggleSelected,
    registerRow,
  }
}

function RecordList({ state }: { state: Exclude<FixtureState, "error"> }) {
  const list = useRecordList()
  const peekId = React.useId()
  const peeked = sampleRecords.find((record) => record.id === list.peekedId) ?? null

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="rounded-md border">
        {state === "loading" ? (
          <ul aria-busy="true" aria-label="Records" className="flex flex-col">
            {sampleRecords.map((record) => (
              <LoadingRow key={record.id} />
            ))}
          </ul>
        ) : (
          <div
            role="listbox"
            aria-label="Records"
            aria-multiselectable="true"
            className="flex flex-col"
          >
            {sampleRecords.map((record) => (
              <RecordRow
                key={record.id}
                record={record}
                state={state}
                peekId={peekId}
                isActive={record.id === list.activeId}
                isPeeked={record.id === list.peekedId}
                isSelected={list.selectedIds.has(record.id)}
                rowRef={(element) => list.registerRow(record.id, element)}
                onFocus={() => list.onRowFocus(record.id)}
                onKeyDown={(event) => list.onRowKeyDown(event, record.id)}
                onToggleSelected={() => list.onToggleSelected(record.id)}
              />
            ))}
          </div>
        )}
        <ListFooter state={state} selectedCount={list.selectedIds.size} />
      </section>
      <PeekPanel id={peekId} record={peeked} state={state} />
    </div>
  )
}

type RecordRowProps = {
  record: SampleRecord
  state: Exclude<FixtureState, "error" | "loading">
  peekId: string
  isActive: boolean
  isPeeked: boolean
  isSelected: boolean
  rowRef: (element: HTMLDivElement | null) => void
  onFocus: () => void
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void
  onToggleSelected: () => void
}

function RecordRow({
  record,
  state,
  peekId,
  isActive,
  isPeeked,
  isSelected,
  rowRef,
  onFocus,
  onKeyDown,
  onToggleSelected,
}: RecordRowProps) {
  return (
    <div
      ref={rowRef}
      role="option"
      aria-selected={isSelected}
      aria-controls={peekId}
      tabIndex={isActive ? 0 : -1}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      className={cn(
        "group flex h-11 items-center gap-3 border-b px-2 outline-none hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:shadow-[inset_2px_0_0_var(--foreground)]",
        isPeeked && "bg-muted/60"
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          tabIndex={-1}
          aria-hidden="true"
          checked={isSelected}
          onChange={onToggleSelected}
          className={cn(
            "invisible size-4 accent-foreground group-hover:visible group-focus-visible:visible",
            isSelected && "visible"
          )}
        />
      </span>
      <span className="hidden w-16 shrink-0 text-muted-foreground text-xs tabular-nums sm:block">
        {record.id}
      </span>
      <HoverCard
        trigger={
          <span className="flex size-6 items-center justify-center">
            <span aria-hidden="true">{statusGlyph[record.status]}</span>
            <span className="sr-only">{statusLabel[record.status]}</span>
          </span>
        }
      >
        <p className="font-medium">{statusLabel[record.status]}</p>
        <p className="mt-1 text-muted-foreground">Updated {record.updated}</p>
      </HoverCard>
      <span className="min-w-0 flex-1 truncate font-medium text-sm">{record.title}</span>
      <span className="w-36 shrink-0">
        <OwnerSlot record={record} state={state} />
      </span>
      <span className="hidden w-20 shrink-0 text-right text-muted-foreground text-xs md:block">
        {record.updated}
      </span>
    </div>
  )
}

function OwnerSlot({
  record,
  state,
}: {
  record: SampleRecord
  state: Exclude<FixtureState, "error" | "loading">
}) {
  switch (state) {
    case "partial":
      return <span className="text-muted-foreground text-sm">Unavailable</span>
    case "no-permission":
      return <span className="text-muted-foreground text-sm">Hidden</span>
    case "loaded":
      return (
        <HoverCard
          trigger={
            <span className="flex min-h-6 items-center gap-2 text-sm">
              <Initials name={record.owner} />
              <span className="truncate">{record.owner}</span>
            </span>
          }
        >
          <div className="flex items-center gap-2">
            <Initials name={record.owner} />
            <p className="font-medium">{record.owner}</p>
          </div>
          <hr className="my-2" />
          <p className="text-muted-foreground">Team {record.team}</p>
        </HoverCard>
      )
  }
}

function Initials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] text-muted-foreground"
    >
      {initials}
    </span>
  )
}

function HoverCard({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="group/card relative">
      {trigger}
      <span
        aria-hidden="true"
        className="invisible absolute top-full right-0 z-10 mt-1 block w-56 rounded-md border bg-background p-3 text-xs shadow-sm group-hover/card:visible"
      >
        {children}
      </span>
    </span>
  )
}

function LoadingRow() {
  return (
    <li className="flex h-11 items-center gap-3 border-b px-2">
      <span className="size-6 shrink-0" />
      <Bar className="hidden w-12 sm:block" />
      <Bar className="w-4" />
      <span className="min-w-0 flex-1">
        <Bar className="w-2/3" />
      </span>
      <Bar className="w-28" />
      <Bar className="hidden w-14 md:block" />
    </li>
  )
}

function Bar({ className }: { className: string }) {
  return <span className={cn("block h-2.5 shrink-0 rounded-full bg-muted", className)} />
}

function ListFooter({
  state,
  selectedCount,
}: {
  state: Exclude<FixtureState, "error">
  selectedCount: number
}) {
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-muted-foreground text-xs">
      <FooterMessage state={state} />
      {selectedCount > 0 && <span>{selectedCount} selected</span>}
    </div>
  )
}

function FooterMessage({ state }: { state: Exclude<FixtureState, "error"> }) {
  switch (state) {
    case "loaded":
      return (
        <>
          <span>{sampleRecords.length} records</span>
          <span>
            <Kbd>Space</Kbd> peek · <Kbd>↑</Kbd> <Kbd>↓</Kbd> move · <Kbd>X</Kbd> select
          </span>
        </>
      )
    case "loading":
      return <span>Loading {sampleRecords.length} records…</span>
    case "partial":
      return (
        <>
          <span>Owners could not load: the directory service did not respond.</span>
          <Link
            to="/record-list"
            search={{ state: "loaded" }}
            replace
            className="inline-flex min-h-6 items-center font-medium text-foreground underline underline-offset-4"
          >
            Retry owners
          </Link>
        </>
      )
    case "no-permission":
      return (
        <span>
          Owner is visible to the Compliance viewer role. Ask a workspace admin for access.
        </span>
      )
  }
}

function PeekPanel({
  id,
  record,
  state,
}: {
  id: string
  record: SampleRecord | null
  state: Exclude<FixtureState, "error">
}) {
  return (
    <aside
      id={id}
      aria-label="Peek"
      aria-live="polite"
      className="min-h-48 rounded-md border p-4 text-sm"
    >
      {record === null || state === "loading" ? (
        <p className="text-muted-foreground">
          Focus a row and press <Kbd>Space</Kbd> to peek at it here.
        </p>
      ) : (
        <>
          <p className="text-muted-foreground text-xs tabular-nums">{record.id}</p>
          <h2 className="mt-1 font-semibold">{record.title}</h2>
          <p className="mt-3 text-pretty">{record.summary}</p>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
            <dt className="text-muted-foreground">Status</dt>
            <dd>{statusLabel[record.status]}</dd>
            <dt className="text-muted-foreground">Owner</dt>
            <dd>
              <PeekOwner record={record} state={state} />
            </dd>
            <dt className="text-muted-foreground">Team</dt>
            <dd>{record.team}</dd>
            <dt className="text-muted-foreground">Updated</dt>
            <dd>{record.updated}</dd>
          </dl>
        </>
      )}
    </aside>
  )
}

function PeekOwner({
  record,
  state,
}: {
  record: SampleRecord
  state: Exclude<FixtureState, "error" | "loading">
}) {
  switch (state) {
    case "partial":
      return <span className="text-muted-foreground">Unavailable</span>
    case "no-permission":
      return <span className="text-muted-foreground">Hidden</span>
    case "loaded":
      return record.owner
  }
}

function ErrorMessage() {
  return (
    <section className="flex min-h-52 flex-col items-center justify-center rounded-md border px-6 text-center">
      <p className="font-medium">The records could not load.</p>
      <p className="mt-1 max-w-sm text-muted-foreground text-sm">
        The request timed out after 10 seconds. Retry, or check your connection and reload the page.
      </p>
      <Link
        to="/record-list"
        search={{ state: "loaded" }}
        replace
        className="mt-4 inline-flex min-h-9 items-center rounded-md border px-4 font-medium text-sm hover:bg-muted"
      >
        Retry
      </Link>
    </section>
  )
}

function RuleNotes() {
  return (
    <section aria-label="Rules this wireframe encodes" className="text-sm">
      <h2 className="font-semibold">Rules this wireframe encodes</h2>
      <table className="mt-2 w-full border-collapse text-left">
        <thead className="text-muted-foreground text-xs">
          <tr className="border-b">
            <th scope="col" className="py-2 pr-4 font-medium">
              Rule
            </th>
            <th scope="col" className="py-2 font-medium">
              Source (docs/references/ux-references.md)
            </th>
          </tr>
        </thead>
        <tbody>
          {rules.map(({ rule, source }) => (
            <tr key={rule} className="border-b align-top">
              <td className="py-2 pr-4">{rule}</td>
              <td className="py-2 text-muted-foreground">{source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-5 items-center justify-center rounded border px-1 font-sans text-[0.6875rem] text-foreground">
      {children}
    </kbd>
  )
}
