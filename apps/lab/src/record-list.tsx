import { Link } from "@tanstack/react-router"
import { type RecordStatus, type SampleRecord, sampleRecords } from "@workspace/fixtures/records.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import { cn } from "cn"
import * as React from "react"
import { ExplodedPart } from "./exploded-part.tsx"
import type { CanvasView } from "./lab-search.ts"

type ListState = Exclude<FixtureState, "error">

type RowState = Exclude<FixtureState, "error" | "loading">

type RowLook = "rest" | "hover" | "focus"

const statusLabel: Readonly<Record<RecordStatus, string>> = {
  draft: "Draft",
  "in-review": "In review",
  approved: "Approved",
}

const statusFill: Readonly<Record<RecordStatus, string>> = {
  draft: "bg-transparent",
  "in-review": "bg-[linear-gradient(90deg,currentColor_50%,transparent_50%)]",
  approved: "bg-current",
}

const slot = {
  select: "flex size-6 shrink-0 items-center justify-center pointer-coarse:size-11",
  id: "hidden w-16 shrink-0 sm:block",
  status: "flex size-6 shrink-0 items-center justify-center",
  title: "min-w-0 flex-1",
  updated: "hidden w-20 shrink-0 justify-end md:flex",
}

const ownerSlotWidth: Readonly<Record<RowState, string>> = {
  loaded: "w-6 sm:w-36",
  partial: "w-20 sm:w-36",
  "no-permission": "w-20 sm:w-36",
}

const cardSurface =
  "block w-56 max-w-full rounded-md border bg-background p-3 text-left text-xs font-normal shadow-sm"

const rowKeyShortcuts = "Space X ArrowUp ArrowDown Home End Escape"

/** The record list wireframe, drawn as the composed lockup or as its exploded parts. */
export function RecordListCanvas({
  state,
  view,
}: {
  state: FixtureState
  view: CanvasView
}): React.ReactElement {
  return (
    <main className="p-4 sm:p-6">
      <h1 className="sr-only">Record list</h1>
      {view === "lockup" ? <Lockup state={state} /> : <ExplodedView state={state} />}
    </main>
  )
}

function Lockup({ state }: { state: FixtureState }) {
  return state === "error" ? (
    <ErrorMessage subject="The records" />
  ) : (
    <RecordList key={state} state={state} />
  )
}

function useRecordList() {
  const [activeId, setActiveId] = React.useState(sampleRecords[0]?.id ?? null)
  const [peekedId, setPeekedId] = React.useState<string | null>(null)
  const [selectedIds, setSelectedIds] = React.useState<ReadonlySet<string>>(new Set())
  const linkRefs = React.useRef(new Map<string, HTMLAnchorElement>())

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

  function focusRow(index: number) {
    const record = sampleRecords[index]
    if (record === undefined) {
      return
    }
    linkRefs.current.get(record.id)?.focus()
    if (peekedId !== null) {
      setPeekedId(record.id)
    }
  }

  function onRowKeyDown(event: React.KeyboardEvent<HTMLAnchorElement>, id: string) {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return
    }
    const index = sampleRecords.findIndex((record) => record.id === id)
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
        focusRow(index + 1)
        return
      case "ArrowUp":
        event.preventDefault()
        focusRow(index - 1)
        return
      case "Home":
        event.preventDefault()
        focusRow(0)
        return
      case "End":
        event.preventDefault()
        focusRow(sampleRecords.length - 1)
        return
      case "Escape":
        if (peekedId !== null) {
          setPeekedId(null)
        } else {
          setSelectedIds(new Set())
        }
        return
      default:
        return
    }
  }

  function registerLink(id: string, element: HTMLAnchorElement | null) {
    if (element === null) {
      linkRefs.current.delete(id)
    } else {
      linkRefs.current.set(id, element)
    }
  }

  return {
    activeId,
    peekedId,
    selectedIds,
    onRowFocus: setActiveId,
    onRowKeyDown,
    onToggleSelected: toggleSelected,
    onClearSelection: () => setSelectedIds(new Set()),
    registerLink,
  }
}

function RecordList({ state }: { state: ListState }) {
  const list = useRecordList()
  const hintId = React.useId()
  const inlinePeekId = React.useId()
  const panelPeekId = React.useId()
  const peeked = sampleRecords.find((record) => record.id === list.peekedId) ?? null

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="rounded-md border">
        {state === "loading" ? (
          <ul aria-busy="true" aria-label="Records, loading" className="flex flex-col">
            {sampleRecords.map((record) => (
              <LoadingRow key={record.id} />
            ))}
          </ul>
        ) : (
          <ul aria-label="Records" aria-describedby={hintId} className="flex flex-col">
            {sampleRecords.map((record) => (
              <React.Fragment key={record.id}>
                <RecordRow
                  record={record}
                  state={state}
                  look="rest"
                  peekIds={`${inlinePeekId} ${panelPeekId}`}
                  isActive={record.id === list.activeId}
                  isPeeked={record.id === list.peekedId}
                  isSelected={list.selectedIds.has(record.id)}
                  linkRef={(element) => list.registerLink(record.id, element)}
                  onFocus={() => list.onRowFocus(record.id)}
                  onKeyDown={(event) => list.onRowKeyDown(event, record.id)}
                  onToggleSelected={() => list.onToggleSelected(record.id)}
                />
                {record.id === list.peekedId && (
                  <li id={inlinePeekId} className="border-b bg-muted/40 px-4 py-3 lg:hidden">
                    <PeekContent record={record} state={state} />
                  </li>
                )}
              </React.Fragment>
            ))}
          </ul>
        )}
        <ListFooter
          state={state}
          hintId={hintId}
          selectedCount={list.selectedIds.size}
          onClearSelection={list.onClearSelection}
        />
      </div>
      <PeekPanel id={panelPeekId} record={peeked} state={state} className="hidden lg:block" />
    </div>
  )
}

type RecordRowProps = {
  record: SampleRecord
  state: RowState
  look: RowLook
  peekIds: string
  isActive: boolean
  isPeeked: boolean
  isSelected: boolean
  linkRef: (element: HTMLAnchorElement | null) => void
  onFocus: () => void
  onKeyDown: (event: React.KeyboardEvent<HTMLAnchorElement>) => void
  onToggleSelected: () => void
}

function RecordRow({
  record,
  state,
  look,
  peekIds,
  isActive,
  isPeeked,
  isSelected,
  linkRef,
  onFocus,
  onKeyDown,
  onToggleSelected,
}: RecordRowProps) {
  return (
    <li
      className={cn(
        "group flex h-11 items-center gap-1 border-b px-2 hover:bg-muted/60 has-[a:focus-visible]:bg-muted/60",
        look !== "rest" && "bg-muted/60",
        isPeeked && "bg-muted hover:bg-muted has-[a:focus-visible]:bg-muted"
      )}
    >
      <SelectSlot
        label={`Select ${record.title}`}
        isSelected={isSelected}
        isRevealed={look !== "rest"}
        onToggleSelected={onToggleSelected}
      />
      <Link
        to="/records/$recordId"
        params={{ recordId: record.id }}
        ref={linkRef}
        tabIndex={isActive ? 0 : -1}
        aria-expanded={isPeeked}
        aria-controls={peekIds}
        aria-keyshortcuts={rowKeyShortcuts}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        className={cn(
          "flex h-full min-w-0 flex-1 items-center gap-3 rounded-sm px-1 outline-none focus-visible:outline-2 focus-visible:outline-foreground focus-visible:-outline-offset-2",
          look === "focus" && "outline-2 outline-foreground -outline-offset-2"
        )}
      >
        <RecordId record={record} />
        <HoverCard align="start" trigger={<StatusChip record={record} />}>
          <StatusCard record={record} />
        </HoverCard>
        <RecordTitle record={record} />
        <OwnerSlot record={record} state={state} />
        <RecordUpdated record={record} />
        {isSelected ? <span className="sr-only">Selected</span> : null}
      </Link>
    </li>
  )
}

function SelectSlot({
  label,
  isSelected,
  isRevealed,
  onToggleSelected,
}: {
  label: string
  isSelected: boolean
  isRevealed: boolean
  onToggleSelected: () => void
}) {
  return (
    <label className={cn(slot.select, "cursor-pointer")}>
      <input
        type="checkbox"
        tabIndex={-1}
        aria-label={label}
        checked={isSelected}
        onChange={onToggleSelected}
        className={cn(
          "invisible size-4 accent-foreground group-hover:visible group-has-[a:focus-visible]:visible pointer-coarse:visible",
          (isSelected || isRevealed) && "visible"
        )}
      />
    </label>
  )
}

function RecordId({ record }: { record: SampleRecord }) {
  return (
    <span className={cn(slot.id, "text-muted-foreground text-xs tabular-nums")}>{record.id}</span>
  )
}

function StatusChip({ record }: { record: SampleRecord }) {
  return (
    <span className={slot.status}>
      <span
        aria-hidden="true"
        className={cn(
          "size-2.5 rounded-full border-[1.5px] border-current",
          statusFill[record.status]
        )}
      />
      <span className="sr-only">{statusLabel[record.status]}</span>
    </span>
  )
}

function StatusCard({ record }: { record: SampleRecord }) {
  return (
    <>
      <span className="block text-muted-foreground">Time in status</span>
      <span className="mt-1 block font-medium">
        {statusLabel[record.status]} · {record.statusAge}
      </span>
    </>
  )
}

function RecordTitle({ record }: { record: SampleRecord }) {
  return <span className={cn(slot.title, "truncate font-medium text-sm")}>{record.title}</span>
}

function OwnerSlot({ record, state }: { record: SampleRecord; state: RowState }) {
  return (
    <span className={cn("flex shrink-0 items-center text-sm", ownerSlotWidth[state])}>
      <OwnerValue record={record} state={state} />
    </span>
  )
}

function OwnerValue({ record, state }: { record: SampleRecord; state: RowState }) {
  switch (state) {
    case "partial":
      return <span className="truncate text-muted-foreground text-xs sm:text-sm">Unavailable</span>
    case "no-permission":
      return <span className="truncate text-muted-foreground text-xs sm:text-sm">Hidden</span>
    case "loaded":
      return (
        <HoverCard align="end" trigger={<OwnerChip record={record} />}>
          <OwnerCard record={record} />
        </HoverCard>
      )
  }
}

function OwnerChip({ record }: { record: SampleRecord }) {
  return (
    <span className="flex min-h-6 min-w-0 items-center gap-2">
      <Initials name={record.owner} />
      <span className="sr-only truncate sm:not-sr-only">{record.owner}</span>
    </span>
  )
}

function OwnerCard({ record }: { record: SampleRecord }) {
  return (
    <>
      <span className="flex items-center gap-2">
        <Initials name={record.owner} />
        <span className="font-medium">{record.owner}</span>
      </span>
      <span className="mt-2 block text-muted-foreground">Record owner</span>
    </>
  )
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

function RecordUpdated({ record }: { record: SampleRecord }) {
  return <span className={cn(slot.updated, "text-muted-foreground text-xs")}>{record.updated}</span>
}

const cardAlign = { start: "left-0", end: "right-0" } as const

function HoverCard({
  align,
  trigger,
  children,
}: {
  align: keyof typeof cardAlign
  trigger: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <span className="group/card relative">
      {trigger}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-full z-10 block pt-1 opacity-0 transition-opacity duration-0 group-hover/card:pointer-events-auto group-hover/card:opacity-100 group-hover/card:delay-300",
          cardAlign[align]
        )}
      >
        <span className={cardSurface}>{children}</span>
      </span>
    </span>
  )
}

function LoadingRow() {
  return (
    <li className="flex h-11 items-center gap-1 border-b px-2">
      <span className={slot.select} />
      <span className="flex h-full min-w-0 flex-1 items-center gap-3 px-1">
        <span className={slot.id}>
          <Bar className="w-full" />
        </span>
        <span className={slot.status}>
          <span className="size-2.5 rounded-full bg-muted" />
        </span>
        <span className={slot.title}>
          <Bar className="w-2/3" />
        </span>
        <span className={cn("flex shrink-0 items-center", ownerSlotWidth.loaded)}>
          <Bar className="w-full" />
        </span>
        <span className={slot.updated}>
          <Bar className="w-full" />
        </span>
      </span>
    </li>
  )
}

function Bar({ className }: { className: string }) {
  return <span className={cn("block h-2.5 rounded-full bg-muted", className)} />
}

function ListFooter({
  state,
  hintId,
  selectedCount,
  onClearSelection,
}: {
  state: ListState
  hintId: string
  selectedCount: number
  onClearSelection: () => void
}) {
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-muted-foreground text-xs">
      <FooterMessage state={state} />
      {selectedCount > 0 && (
        <span className="flex items-center gap-2">
          {selectedCount} selected
          <button
            type="button"
            onClick={onClearSelection}
            className="inline-flex min-h-6 items-center font-medium text-foreground underline underline-offset-4"
          >
            Clear selection
          </button>
        </span>
      )}
      {state !== "loading" && (
        <span id={hintId} className="ml-auto pointer-coarse:hidden">
          <Kbd>Space</Kbd> peek · <Kbd>↑</Kbd> <Kbd>↓</Kbd> move · <Kbd>X</Kbd> select ·{" "}
          <Kbd>Enter</Kbd> open
        </span>
      )}
    </div>
  )
}

function FooterMessage({ state }: { state: ListState }) {
  switch (state) {
    case "loaded":
      return <span>{sampleRecords.length} records</span>
    case "loading":
      return <span>Loading {sampleRecords.length} records…</span>
    case "partial":
      return (
        <span className="flex flex-wrap items-center gap-x-3">
          Owners could not load: the directory service did not respond.
          <Link
            to="/record-list"
            search={{ state: "loaded" }}
            className="inline-flex min-h-6 items-center font-medium text-foreground underline underline-offset-4"
          >
            Retry owners
          </Link>
        </span>
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
  className,
}: {
  id: string
  record: SampleRecord | null
  state: ListState
  className: string
}) {
  return (
    <aside id={id} aria-label="Peek" className={cn("rounded-md border p-4 text-sm", className)}>
      <PeekPanelBody record={record} state={state} />
    </aside>
  )
}

function PeekPanelBody({ record, state }: { record: SampleRecord | null; state: ListState }) {
  if (state === "loading") {
    return <p className="text-muted-foreground">Peek is available once the records load.</p>
  }
  if (record === null) {
    return (
      <p className="text-muted-foreground">
        <span className="pointer-coarse:hidden">
          Focus a row and press <Kbd>Space</Kbd> to peek at it here.
        </span>
        <span className="hidden pointer-coarse:inline">Tap a row to open the record.</span>
      </p>
    )
  }
  return <PeekContent record={record} state={state} />
}

function PeekContent({ record, state }: { record: SampleRecord; state: RowState }) {
  return (
    <>
      <p className="text-muted-foreground text-xs tabular-nums">{record.id}</p>
      <h3 className="mt-1 font-semibold">{record.title}</h3>
      <p className="mt-2 max-w-prose text-pretty text-sm">{record.summary}</p>
      <RecordFields record={record} state={state} />
      <Link
        to="/records/$recordId"
        params={{ recordId: record.id }}
        className="mt-3 inline-flex min-h-6 items-center font-medium text-xs underline underline-offset-4"
      >
        Open {record.id}
      </Link>
    </>
  )
}

function RecordFields({ record, state }: { record: SampleRecord; state: RowState }) {
  return (
    <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-xs">
      <dt className="text-muted-foreground">Status</dt>
      <dd>
        {statusLabel[record.status]} for {record.statusAge}
      </dd>
      <dt className="text-muted-foreground">Owner</dt>
      <dd>
        <FieldOwner record={record} state={state} />
      </dd>
      <dt className="text-muted-foreground">Team</dt>
      <dd>{record.team}</dd>
      <dt className="text-muted-foreground">Updated</dt>
      <dd>
        {record.updated} ({record.updatedAt})
      </dd>
    </dl>
  )
}

function FieldOwner({ record, state }: { record: SampleRecord; state: RowState }) {
  switch (state) {
    case "partial":
      return <span className="text-muted-foreground">Unavailable</span>
    case "no-permission":
      return <span className="text-muted-foreground">Hidden</span>
    case "loaded":
      return record.owner
  }
}

function ErrorMessage({ subject }: { subject: string }) {
  return (
    <section
      role="alert"
      className="flex min-h-52 flex-col items-center justify-center rounded-md border px-6 text-center"
    >
      <p className="font-medium">{subject} could not load.</p>
      <p className="mt-1 max-w-sm text-muted-foreground text-sm">
        The request timed out after 10 seconds. Retry, or check your connection and reload the page.
      </p>
      <Link
        to="."
        search={(previous) => ({ ...previous, state: "loaded" })}
        className="mt-4 inline-flex min-h-9 items-center rounded-md border px-4 font-medium text-sm hover:bg-muted"
      >
        Retry
      </Link>
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

/** The record page that a record row links to. */
export function RecordPage({
  record,
  state,
}: {
  record: SampleRecord
  state: FixtureState
}): React.ReactElement {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <Link
        to="/record-list"
        className="inline-flex min-h-6 items-center self-start text-muted-foreground text-sm underline underline-offset-4"
      >
        Back to records
      </Link>
      <RecordPageBody record={record} state={state} />
    </main>
  )
}

function RecordPageBody({ record, state }: { record: SampleRecord; state: FixtureState }) {
  switch (state) {
    case "error":
      return <ErrorMessage subject={record.id} />
    case "loading":
      return (
        <p aria-busy="true" className="text-muted-foreground text-sm">
          Loading {record.id}…
        </p>
      )
    case "loaded":
    case "partial":
    case "no-permission":
      return (
        <article>
          <p className="text-muted-foreground text-xs tabular-nums">{record.id}</p>
          <h1 className="mt-1 font-semibold text-xl">{record.title}</h1>
          <p className="mt-3 max-w-prose text-pretty">{record.summary}</p>
          <RecordFields record={record} state={state} />
        </article>
      )
  }
}

function ExplodedView({ state }: { state: FixtureState }) {
  switch (state) {
    case "error":
      return (
        <ExplodedPart name="ErrorMessage" note="Replaces RecordList and PeekPanel">
          <ErrorMessage subject="The records" />
        </ExplodedPart>
      )
    case "loading":
      return <ExplodedLoadingList />
    case "loaded":
    case "partial":
    case "no-permission":
      return <ExplodedRecordList state={state} />
  }
}

function ExplodedLoadingList() {
  const peekId = React.useId()
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <ExplodedPart name="RecordList" note="One LoadingRow per expected record, then ListFooter">
        <ExplodedPart
          name="LoadingRow"
          note="44px high; a bar in each RecordRow slot, at the slot's width"
        >
          <ul className="rounded-md border">
            <LoadingRow />
          </ul>
        </ExplodedPart>
        <ExplodedPart name="ListFooter" note="States how many records are loading">
          <ListFooter
            state="loading"
            hintId={peekId}
            selectedCount={0}
            onClearSelection={() => undefined}
          />
        </ExplodedPart>
      </ExplodedPart>
      <ExplodedPart name="PeekPanel" note="Says peek is available once the records load">
        <PeekPanel id={peekId} record={null} state="loading" className="block" />
      </ExplodedPart>
    </div>
  )
}

const rowSpecimens: ReadonlyArray<{
  label: string
  look: RowLook
  isSelected: boolean
  isPeeked: boolean
}> = [
  { label: "At rest", look: "rest", isSelected: false, isPeeked: false },
  { label: "Hovered", look: "hover", isSelected: false, isPeeked: false },
  { label: "Focused", look: "focus", isSelected: false, isPeeked: false },
  { label: "Selected", look: "rest", isSelected: true, isPeeked: false },
  { label: "Peeked", look: "focus", isSelected: false, isPeeked: true },
]

function ExplodedRecordList({ state }: { state: RowState }) {
  const peekId = React.useId()
  const hintId = React.useId()
  const record = sampleRecords[0]
  if (record === undefined) {
    throw new Error("sampleRecords is empty; the exploded view needs one record.")
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <ExplodedPart name="RecordList" note="List of RecordRow, then ListFooter">
        <ExplodedPart name="RecordRow" note="44px high; selection slot plus RecordLink">
          <div className="grid gap-2">
            {rowSpecimens.map((specimen) => (
              <div key={specimen.label} className="flex flex-col gap-1">
                <p className="text-muted-foreground text-xs">{specimen.label}</p>
                <ul className="rounded-md border">
                  <RecordRow
                    record={record}
                    state={state}
                    look={specimen.look}
                    peekIds={peekId}
                    isActive={false}
                    isPeeked={specimen.isPeeked}
                    isSelected={specimen.isSelected}
                    linkRef={() => undefined}
                    onFocus={() => undefined}
                    onKeyDown={() => undefined}
                    onToggleSelected={() => undefined}
                  />
                </ul>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ExplodedPart
              name="SelectSlot"
              note="24×24, 44×44 on a coarse pointer; checkbox drawn on hover, focus or selection"
            >
              <span className="flex gap-3">
                <SelectSlot
                  label="Select, unchecked"
                  isSelected={false}
                  isRevealed
                  onToggleSelected={() => undefined}
                />
                <SelectSlot
                  label="Select, checked"
                  isSelected
                  isRevealed
                  onToggleSelected={() => undefined}
                />
              </span>
            </ExplodedPart>
            <ExplodedPart
              name="RecordLink"
              note="Links to the record page; the row's one tab stop; Space, ↑ ↓, Home, End, X, Esc, Enter"
            >
              <ExplodedPart name="RecordId" note="64px wide; hidden below sm">
                <RecordId record={record} />
              </ExplodedPart>
              <ExplodedPart name="StatusChip" note="24×24; opens StatusCard on hover">
                <StatusChip record={record} />
                <ExplodedPart name="StatusCard" note="Hover card: time in status">
                  <span className={cardSurface}>
                    <StatusCard record={record} />
                  </span>
                </ExplodedPart>
              </ExplodedPart>
              <ExplodedPart name="RecordTitle" note="Fills the remaining width; truncates">
                <RecordTitle record={record} />
              </ExplodedPart>
              <ExplodedPart name="OwnerSlot" note={ownerSlotNote[state]}>
                <ExplodedOwner record={record} state={state} />
              </ExplodedPart>
              <ExplodedPart name="RecordUpdated" note="80px wide; hidden below md">
                <RecordUpdated record={record} />
              </ExplodedPart>
            </ExplodedPart>
          </div>
        </ExplodedPart>
        <ExplodedPart
          name="ListFooter"
          note="State message, selection count with Clear selection, key hints"
        >
          <ListFooter
            state={state}
            hintId={hintId}
            selectedCount={1}
            onClearSelection={() => undefined}
          />
        </ExplodedPart>
      </ExplodedPart>
      <ExplodedPart
        name="PeekPanel"
        note="Beside RecordList at lg and wider; under the peeked row below lg"
      >
        <PeekPanel id={peekId} record={record} state={state} className="block" />
      </ExplodedPart>
    </div>
  )
}

const ownerSlotNote: Readonly<Record<RowState, string>> = {
  loaded: "Initials below sm, initials and name from sm (144px); holds OwnerChip",
  partial: "Reads Unavailable when owners fail to load",
  "no-permission": "Reads Hidden when the owner is withheld",
}

function ExplodedOwner({ record, state }: { record: SampleRecord; state: RowState }) {
  if (state !== "loaded") {
    return <OwnerSlot record={record} state={state} />
  }
  return (
    <ExplodedPart name="OwnerChip" note="Opens OwnerCard on hover">
      <OwnerChip record={record} />
      <ExplodedPart name="Initials" note="24×24; first letter of each name">
        <Initials name={record.owner} />
      </ExplodedPart>
      <ExplodedPart name="OwnerCard" note="Hover card: name and role">
        <span className={cardSurface}>
          <OwnerCard record={record} />
        </span>
      </ExplodedPart>
    </ExplodedPart>
  )
}
