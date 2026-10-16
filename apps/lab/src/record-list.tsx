import { Link } from "@tanstack/react-router"
import { type RecordStatus, type SampleRecord, sampleRecords } from "@workspace/fixtures/records.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import { cn } from "cn"
import * as React from "react"
import {
  Anchor,
  ConstellationDrawing,
  type DrawingGroup,
  type DrawingPart,
  type DrawingPlane,
  Part,
} from "./constellation-drawing.tsx"
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

/** The record list wireframe, drawn as the composed lockup or as its constellation of parts. */
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
      {view === "lockup" ? <Lockup state={state} /> : <ConstellationView state={state} />}
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

const drawingStateLabel: Readonly<Record<FixtureState, string>> = {
  loaded: "Loaded",
  loading: "Loading",
  partial: "Partial",
  error: "Error",
  "no-permission": "No permission",
}

function ConstellationView({ state }: { state: FixtureState }) {
  const peekId = React.useId()
  const drawing = recordListDrawing(state, peekId)
  return (
    <ConstellationDrawing
      key={state}
      assembly="RecordList"
      state={drawingStateLabel[state]}
      parts={drawing.parts}
      planes={drawing.planes}
      groups={drawing.groups}
      centre={drawing.centre}
    />
  )
}

type Drawing = {
  readonly parts: ReadonlyArray<DrawingPart>
  readonly planes: ReadonlyArray<DrawingPlane>
  readonly groups: ReadonlyArray<DrawingGroup>
  readonly centre: React.ReactNode
}

const listWidth = "w-[32rem]"

function recordListDrawing(state: FixtureState, peekId: string): Drawing {
  switch (state) {
    case "error":
      return errorDrawing
    case "loading":
      return loadingDrawing(peekId)
    case "loaded":
    case "partial":
    case "no-permission":
      return rowDrawing(state, peekId)
  }
}

const errorDrawing: Drawing = {
  parts: [
    {
      n: 1,
      name: "ErrorMessage",
      depth: 0,
      qty: 1,
      note: "Replaces RecordList and PeekPanel",
      specimen: (
        <div className={listWidth}>
          <ErrorMessage subject="The records" />
        </div>
      ),
    },
  ],
  planes: [
    {
      name: "Message",
      content: (
        <Part n={1} className={cn(listWidth, "bg-background")}>
          <ErrorMessage subject="The records" />
        </Part>
      ),
    },
  ],
  groups: [],
  centre: (
    <Anchor n={1} className={listWidth}>
      <ErrorMessage subject="The records" />
    </Anchor>
  ),
}

function LoadingFooter() {
  return (
    <ListFooter
      state="loading"
      hintId="hint-loading"
      selectedCount={0}
      onClearSelection={() => undefined}
    />
  )
}

function loadingDrawing(peekId: string): Drawing {
  return {
    parts: [
      {
        n: 1,
        name: "RecordList",
        depth: 0,
        qty: 1,
        note: "One LoadingRow per expected record, then ListFooter",
        specimen: (
          <div className={cn(listWidth, "rounded-md border")}>
            <ul>
              <LoadingRow />
            </ul>
            <LoadingFooter />
          </div>
        ),
      },
      {
        n: 2,
        name: "LoadingRow",
        depth: 1,
        qty: sampleRecords.length,
        note: "44px high; a bar in each RecordRow slot, at the slot's width",
        specimen: (
          <ul className={cn(listWidth, "rounded-md border")}>
            <LoadingRow />
          </ul>
        ),
      },
      {
        n: 3,
        name: "ListFooter",
        depth: 1,
        qty: 1,
        note: "States how many records are loading",
        specimen: (
          <div className={listWidth}>
            <LoadingFooter />
          </div>
        ),
      },
      {
        n: 4,
        name: "PeekPanel",
        depth: 0,
        qty: 1,
        note: "Says peek is available once the records load",
        specimen: <PeekPanel id={peekId} record={null} state="loading" className="block w-64" />,
      },
    ],
    groups: [
      {
        title: "Placeholder",
        rank: null,
        summary:
          "Bars hold each slot at its loaded width, so rows do not shift when records arrive",
        reveal: "always",
        links: [{ part: 2, anchor: 2 }],
      },
      {
        title: "Status",
        rank: null,
        summary: "The footer counts the records still loading",
        reveal: "always",
        links: [{ part: 3, anchor: 3 }],
      },
      {
        title: "Explain",
        rank: 3,
        summary: "Peek says it waits until the records load",
        reveal: "revealed",
        gesture: "Space",
        links: [{ part: 4, anchor: 2 }],
      },
    ],
    centre: (
      <Anchor n={1} className={cn(listWidth, "rounded-md border")}>
        <Anchor n={2} className="rounded-none">
          <ul>
            <LoadingRow />
          </ul>
        </Anchor>
        <Anchor n={3} className="rounded-none">
          <LoadingFooter />
        </Anchor>
      </Anchor>
    ),
    planes: [
      {
        name: "List",
        content: (
          <ListPlane
            inner={
              <div className="invisible">
                <ul>
                  <LoadingRow />
                </ul>
                <LoadingFooter />
              </div>
            }
            peek={<PeekPanel id={peekId} record={null} state="loading" className="block" />}
            peekN={4}
          />
        ),
      },
      {
        name: "Rows",
        content: (
          <div className={cn(listWidth, "p-px")}>
            <Part n={2}>
              <ul>
                <LoadingRow />
              </ul>
            </Part>
            <Part n={3}>
              <LoadingFooter />
            </Part>
          </div>
        ),
      },
    ],
  }
}

function ListPlane({
  inner,
  peek,
  peekN,
}: {
  inner: React.ReactNode
  peek: React.ReactNode
  peekN: number
}) {
  return (
    <div className="flex items-start gap-10">
      <Part
        n={1}
        className={cn(
          listWidth,
          "shrink-0 rounded-md border border-muted-foreground/60 bg-background"
        )}
      >
        {inner}
      </Part>
      <Part n={peekN} className="w-80 shrink-0 rounded-md bg-background">
        {peek}
      </Part>
    </div>
  )
}

const ownerSlotNote: Readonly<Record<RowState, string>> = {
  loaded: "Initials below sm, initials and name from sm (144px); holds OwnerChip",
  partial: "Reads Unavailable when owners fail to load",
  "no-permission": "Reads Hidden when the owner is withheld",
}

function rowParts(
  state: RowState,
  updatedN: number,
  record: SampleRecord,
  peekId: string,
  footer: React.ReactNode
): ReadonlyArray<DrawingPart> {
  const row = (
    <RecordRow
      record={record}
      state={state}
      look="rest"
      peekIds={peekId}
      isActive={false}
      isPeeked={false}
      isSelected
      linkRef={() => undefined}
      onFocus={() => undefined}
      onKeyDown={() => undefined}
      onToggleSelected={() => undefined}
    />
  )
  const owner: ReadonlyArray<DrawingPart> =
    state === "loaded"
      ? [
          {
            n: 9,
            name: "OwnerSlot",
            depth: 3,
            qty: 1,
            note: ownerSlotNote[state],
            specimen: <OwnerSlot record={record} state={state} />,
          },
          {
            n: 10,
            name: "OwnerChip",
            depth: 4,
            qty: 1,
            note: "Opens OwnerCard on hover",
            specimen: <OwnerChip record={record} />,
          },
          {
            n: 11,
            name: "Initials",
            depth: 5,
            qty: 1,
            note: "24×24; first letter of each name",
            specimen: <Initials name={record.owner} />,
          },
          {
            n: 12,
            name: "OwnerCard",
            depth: 5,
            qty: 1,
            note: "Hover card: name and role",
            specimen: (
              <span className={cardSurface}>
                <OwnerCard record={record} />
              </span>
            ),
          },
        ]
      : [
          {
            n: 9,
            name: "OwnerSlot",
            depth: 3,
            qty: 1,
            note: ownerSlotNote[state],
            specimen: <OwnerSlot record={record} state={state} />,
          },
        ]
  return [
    {
      n: 1,
      name: "RecordList",
      depth: 0,
      qty: 1,
      note: "List of RecordRow, then ListFooter",
      specimen: (
        <div className={cn(listWidth, "rounded-md border")}>
          <ul>{row}</ul>
          {footer}
        </div>
      ),
    },
    {
      n: 2,
      name: "RecordRow",
      depth: 1,
      qty: sampleRecords.length,
      note: "44px high; selection slot plus RecordLink",
      specimen: <ul className={cn(listWidth, "rounded-md border")}>{row}</ul>,
    },
    {
      n: 3,
      name: "SelectSlot",
      depth: 2,
      qty: 1,
      note: "24×24, 44×44 on a coarse pointer; checkbox drawn on hover, focus or selection",
      specimen: (
        <SelectSlot
          label="Select, checked"
          isSelected
          isRevealed
          onToggleSelected={() => undefined}
        />
      ),
    },
    {
      n: 4,
      name: "RecordLink",
      depth: 2,
      qty: 1,
      note: "Links to the record page; the row's one tab stop; Space, ↑ ↓, Home, End, X, Esc, Enter",
      specimen: (
        <div className="flex h-11 w-[29rem] items-center gap-3 rounded-sm px-1 outline-2 outline-foreground -outline-offset-2 [mask-image:linear-gradient(to_right,black_10rem,transparent_16rem)]">
          <RecordId record={record} />
          <StatusChip record={record} />
          <RecordTitle record={record} />
          <OwnerSlot record={record} state={state} />
          <RecordUpdated record={record} />
        </div>
      ),
    },
    {
      n: 5,
      name: "RecordId",
      depth: 3,
      qty: 1,
      note: "64px wide; hidden below sm",
      specimen: <span className="text-muted-foreground text-xs tabular-nums">{record.id}</span>,
    },
    {
      n: 6,
      name: "StatusChip",
      depth: 3,
      qty: 1,
      note: "24×24; opens StatusCard on hover",
      specimen: <StatusChip record={record} />,
    },
    {
      n: 7,
      name: "StatusCard",
      depth: 4,
      qty: 1,
      note: "Hover card: time in status",
      specimen: (
        <span className={cardSurface}>
          <StatusCard record={record} />
        </span>
      ),
    },
    {
      n: 8,
      name: "RecordTitle",
      depth: 3,
      qty: 1,
      note: "Fills the remaining width; truncates",
      specimen: (
        <div className="flex w-48">
          <RecordTitle record={record} />
        </div>
      ),
    },
    ...owner,
    {
      n: updatedN,
      name: "RecordUpdated",
      depth: 3,
      qty: 1,
      note: "80px wide; hidden below md",
      specimen: <span className="text-muted-foreground text-xs">{record.updated}</span>,
    },
    {
      n: updatedN + 1,
      name: "ListFooter",
      depth: 1,
      qty: 1,
      note: "State message, selection count with Clear selection, key hints",
      specimen: <div className="w-[32rem] max-w-full">{footer}</div>,
    },
    {
      n: updatedN + 2,
      name: "PeekPanel",
      depth: 0,
      qty: 1,
      note: "Beside RecordList at lg and wider; under the peeked row below lg",
      specimen: <PeekPanel id={peekId} record={record} state={state} className="block w-64" />,
    },
  ]
}

function rowDrawing(state: RowState, peekId: string): Drawing {
  const record = sampleRecords[0]
  if (record === undefined) {
    throw new Error("sampleRecords is empty; the constellation needs one record.")
  }
  const isLoaded = state === "loaded"
  const updatedN = isLoaded ? 13 : 10
  const footer = (
    <ListFooter
      state={state}
      hintId="hint-drawing"
      selectedCount={1}
      onClearSelection={() => undefined}
    />
  )

  const planes: Array<DrawingPlane> = [
    {
      name: "List",
      content: (
        <ListPlane
          inner={
            <div className="invisible">
              <div className="h-11 border-b" />
              {footer}
            </div>
          }
          peek={<PeekPanel id={peekId} record={record} state={state} className="block" />}
          peekN={updatedN + 2}
        />
      ),
    },
    {
      name: "Rows",
      content: (
        <div className={cn(listWidth, "p-px")}>
          <Part n={2}>
            <div className="h-11 rounded-sm border border-muted-foreground/60 bg-muted/60" />
          </Part>
          <Part n={updatedN + 1}>{footer}</Part>
        </div>
      ),
    },
    {
      name: "Row parts",
      content: (
        <RowSeats
          state={state}
          select={
            <Part n={3}>
              <SelectSlot
                label="Select, checked"
                isSelected
                isRevealed
                onToggleSelected={() => undefined}
              />
            </Part>
          }
          link={
            <Part n={4} className="absolute inset-0">
              <div className="size-full rounded-sm outline-2 outline-foreground -outline-offset-2" />
            </Part>
          }
        />
      ),
    },
    {
      name: "Slots",
      content: (
        <RowSeats
          state={state}
          id={
            <Part n={5}>
              <RecordId record={record} />
            </Part>
          }
          status={
            <Part n={6}>
              <StatusChip record={record} />
            </Part>
          }
          title={
            <Part n={8} className="flex min-w-0 flex-1">
              <RecordTitle record={record} />
            </Part>
          }
          owner={
            isLoaded ? (
              <Part
                n={9}
                anchor="bottom"
                className="h-6 w-full rounded-sm border border-muted-foreground border-dashed"
              />
            ) : (
              <Part n={9} className="flex w-full">
                <OwnerSlot record={record} state={state} />
              </Part>
            )
          }
          updated={
            <Part n={updatedN} className="flex w-full justify-end">
              <RecordUpdated record={record} />
            </Part>
          }
        />
      ),
    },
    {
      name: "Slot parts",
      content: (
        <RowSeats
          state={state}
          status={
            <Part n={7} className="absolute top-full left-0 pt-1">
              <span className={cardSurface}>
                <StatusCard record={record} />
              </span>
            </Part>
          }
          owner={
            isLoaded ? (
              <Part n={10} anchor="bottom" className="flex min-h-6 min-w-0 items-center gap-2">
                <span className="size-6 shrink-0 rounded-full border border-muted-foreground border-dashed" />
                <span className="sr-only truncate sm:not-sr-only">{record.owner}</span>
              </Part>
            ) : null
          }
        />
      ),
    },
  ]

  if (isLoaded) {
    planes.push({
      name: "Chip parts",
      content: (
        <RowSeats
          state={state}
          owner={
            <div className="relative flex">
              <span className="invisible">
                <OwnerChip record={record} />
              </span>
              <Part n={11} className="absolute top-0 left-0">
                <Initials name={record.owner} />
              </Part>
              <Part n={12} className="absolute top-full right-0 pt-1">
                <span className={cardSurface}>
                  <OwnerCard record={record} />
                </span>
              </Part>
            </div>
          }
        />
      ),
    })
  }

  const footerN = updatedN + 1
  const peekN = updatedN + 2
  const groups: ReadonlyArray<DrawingGroup> = [
    {
      title: "Identify",
      rank: 1,
      summary: "What the record is: its ID and title",
      reveal: "always",
      links: [
        { part: 5, anchor: 5 },
        { part: 8, anchor: 8 },
      ],
    },
    {
      title: "Read",
      rank: 2,
      summary: "What the list is scanned for: status, owner and last update",
      reveal: "always",
      links: [
        { part: 6, anchor: 6 },
        { part: 9, anchor: 9 },
        { part: updatedN, anchor: updatedN },
      ],
    },
    {
      title: "Explain",
      rank: 3,
      summary: "Peek on the focused row: summary, team and time in status",
      reveal: "revealed",
      gesture: "Space",
      links: [{ part: peekN, anchor: 2 }],
    },
    {
      title: "Enrich",
      rank: 4,
      summary: isLoaded
        ? "Hover cards on status and owner"
        : "The status hover card; the owner has none while it is withheld or failed",
      reveal: "revealed",
      gesture: "Hover 300ms",
      links: isLoaded
        ? [
            { part: 7, anchor: 6 },
            { part: 12, anchor: 10 },
          ]
        : [{ part: 7, anchor: 6 }],
    },
    {
      title: "Elsewhere",
      rank: 5,
      summary: "The row link opens the record page, which shows every field peek shows",
      reveal: "revealed",
      gesture: "Enter or click",
      links: [{ part: 4, anchor: 4 }],
    },
    {
      title: "Act",
      rank: null,
      summary: "Selection: the checkbox in its reserved slot, and the footer's count",
      reveal: "revealed",
      gesture: "Hover, focus or X",
      links: [
        { part: 3, anchor: 3 },
        { part: footerN, anchor: footerN },
      ],
    },
  ]
  const centre = (
    <Anchor n={1} className={cn(listWidth, "rounded-md border")}>
      <Anchor n={2} className="rounded-none border-b">
        <RowSeats
          state={state}
          select={
            <Anchor
              n={3}
              className="outline-1 outline-muted-foreground/60 outline-dashed -outline-offset-2"
            >
              <SelectSlot
                label="Select"
                isSelected={false}
                isRevealed={false}
                onToggleSelected={() => undefined}
              />
            </Anchor>
          }
          link={<Anchor n={4} className="absolute inset-0" />}
          id={
            <Anchor n={5}>
              <RecordId record={record} />
            </Anchor>
          }
          status={
            <Anchor n={6}>
              <StatusChip record={record} />
            </Anchor>
          }
          title={
            <Anchor n={8} className="flex min-w-0 flex-1">
              <RecordTitle record={record} />
            </Anchor>
          }
          owner={
            <Anchor n={9} className="flex w-full">
              {isLoaded ? (
                <HoverCard
                  align="end"
                  trigger={
                    <Anchor n={10} className="flex min-h-6 min-w-0 items-center gap-2">
                      <Anchor n={11} className="rounded-full">
                        <Initials name={record.owner} />
                      </Anchor>
                      <span className="sr-only truncate sm:not-sr-only">{record.owner}</span>
                    </Anchor>
                  }
                >
                  <OwnerCard record={record} />
                </HoverCard>
              ) : (
                <OwnerSlot record={record} state={state} />
              )}
            </Anchor>
          }
          updated={
            <Anchor n={updatedN} className="flex w-full justify-end">
              <RecordUpdated record={record} />
            </Anchor>
          }
        />
      </Anchor>
      <Anchor n={footerN} className="rounded-none">
        <ListFooter
          state={state}
          hintId="hint-centre"
          selectedCount={0}
          onClearSelection={() => undefined}
        />
      </Anchor>
    </Anchor>
  )

  return { parts: rowParts(state, updatedN, record, peekId, footer), planes, groups, centre }
}

function RowSeats({
  state,
  select,
  link,
  id,
  status,
  title,
  owner,
  updated,
}: {
  state: RowState
  select?: React.ReactNode
  link?: React.ReactNode
  id?: React.ReactNode
  status?: React.ReactNode
  title?: React.ReactNode
  owner?: React.ReactNode
  updated?: React.ReactNode
}) {
  return (
    <div className={cn(listWidth, "p-px")}>
      <div className="flex h-11 items-center gap-1 px-2">
        <div className={cn(slot.select, "relative")}>{select}</div>
        <div className="relative flex h-full min-w-0 flex-1 items-center gap-3 px-1">
          {link}
          <div className={cn(slot.id, "relative")}>{id}</div>
          <div className={cn(slot.status, "relative")}>{status}</div>
          <div className={cn(slot.title, "relative flex")}>{title}</div>
          <div className={cn("relative flex shrink-0 items-center", ownerSlotWidth[state])}>
            {owner}
          </div>
          <div className={cn(slot.updated, "relative")}>{updated}</div>
        </div>
      </div>
    </div>
  )
}
