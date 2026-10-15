import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import { type RecordStatus, type SampleRecord, sampleRecords } from "@workspace/fixtures/records.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import { RecordList } from "@workspace/ui/components/record-list.tsx"
import {
  RecordRow,
  RecordRowCard,
  RecordRowCardContent,
  RecordRowCardTrigger,
  RecordRowFieldStatus,
  RecordRowId,
  RecordRowLink,
  RecordRowLoading,
  RecordRowOwner,
  RecordRowPerson,
  RecordRowSelect,
  RecordRowStatus,
  RecordRowTitle,
  RecordRowUpdated,
} from "@workspace/ui/components/record-row.tsx"
import { cn } from "cn"
import * as React from "react"
import { flushSync } from "react-dom"
import { ExplodedPart } from "./exploded-part.tsx"
import type { CanvasOptions, RecordListPart } from "./playground-search.ts"
import { randomRecords } from "./random-records.ts"

type RowState = Exclude<FixtureState, "error" | "loading">

type ListState = Exclude<FixtureState, "error">

type Hidden = ReadonlySet<RecordListPart>

const statusLabel: Readonly<Record<RecordStatus, string>> = {
  draft: "Draft",
  "in-review": "In review",
  approved: "Approved",
}

const statusFill: Readonly<Record<RecordStatus, string>> = {
  draft: "border-dashed text-muted-foreground",
  "in-review": "bg-[linear-gradient(90deg,currentColor_50%,transparent_50%)]",
  approved: "bg-current",
}

const listSurface =
  "overflow-hidden rounded-xl border bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.1)]"

export function RecordListCanvas({ options }: { options: CanvasOptions }): React.ReactElement {
  const records = React.useMemo(
    () => (options.data === "random" ? randomRecords(options.seed, options.count) : sampleRecords),
    [options.data, options.seed, options.count]
  )
  const hidden = React.useMemo(() => new Set(options.hide), [options.hide])

  return (
    <main className="p-4 sm:p-6">
      <h1 className="sr-only">Record list</h1>
      {options.view === "lockup" ? (
        <Lockup state={options.state} records={records} hidden={hidden} />
      ) : (
        <ExplodedView state={options.state} records={records} hidden={hidden} />
      )}
    </main>
  )
}

function Lockup({
  state,
  records,
  hidden,
}: {
  state: FixtureState
  records: ReadonlyArray<SampleRecord>
  hidden: Hidden
}) {
  return state === "error" ? (
    <ErrorMessage />
  ) : (
    <PlaygroundRecordList key={state} state={state} records={records} hidden={hidden} />
  )
}

function PlaygroundRecordList({
  state,
  records,
  hidden,
}: {
  state: ListState
  records: ReadonlyArray<SampleRecord>
  hidden: Hidden
}) {
  const [peekValue, setPeekValue] = React.useState<string | null>(null)
  const [selectedValues, setSelectedValues] = React.useState<ReadonlyArray<string>>([])
  const [openValue, setOpenValue] = React.useState<string | null>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const hintId = React.useId()
  const inlinePeekId = React.useId()
  const panelPeekId = React.useId()
  const peeked = records.find((record) => record.id === peekValue) ?? null
  const opened = records.find((record) => record.id === openValue) ?? null

  function handleBack(value: string) {
    flushSync(() => setOpenValue(null))
    listRef.current
      ?.querySelector<HTMLElement>(`[data-slot="record-row-link"][data-value="${value}"]`)
      ?.focus()
  }

  return (
    <>
      {opened !== null && state !== "loading" && (
        <RecordPage record={opened} state={state} onBack={() => handleBack(opened.id)} />
      )}
      <div
        ref={listRef}
        hidden={opened !== null}
        className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <div className={listSurface}>
          {state === "loading" ? (
            <RecordList aria-label="Records, loading" aria-busy="true">
              {records.map((record) => (
                <RecordRowLoading key={record.id}>
                  <RowSlots record={record} state="loaded" hidden={hidden} peekIds="" />
                </RecordRowLoading>
              ))}
            </RecordList>
          ) : (
            <RecordList
              aria-label="Records"
              aria-describedby={hintId}
              peekValue={peekValue}
              onPeekValueChange={setPeekValue}
              selectedValues={selectedValues}
              onSelectedValuesChange={setSelectedValues}
            >
              {records.map((record) => (
                <React.Fragment key={record.id}>
                  <RecordRow value={record.id}>
                    <RowSlots
                      record={record}
                      state={state}
                      hidden={hidden}
                      peekIds={`${inlinePeekId} ${panelPeekId}`}
                      onOpen={setOpenValue}
                    />
                  </RecordRow>
                  {record.id === peekValue && (
                    <li
                      id={inlinePeekId}
                      className="border-b bg-foreground/[0.025] px-4 py-4 lg:hidden"
                    >
                      <PeekContent record={record} state={state} onOpen={setOpenValue} />
                    </li>
                  )}
                </React.Fragment>
              ))}
            </RecordList>
          )}
          <ListFooter
            state={state}
            count={records.length}
            hintId={hintId}
            selectedCount={selectedValues.length}
            onClearSelection={() => setSelectedValues([])}
          />
        </div>
        <PeekPanel
          id={panelPeekId}
          record={peeked}
          state={state}
          onOpen={setOpenValue}
          className="hidden lg:block"
        />
      </div>
    </>
  )
}

function RowSlots({
  record,
  state,
  hidden,
  peekIds,
  titleClassName,
  selectClassName,
  cardsOpen,
  onOpen,
}: {
  record: SampleRecord
  state: RowState
  hidden: Hidden
  peekIds: string
  titleClassName?: string
  selectClassName?: string
  cardsOpen?: boolean
  onOpen?: (value: string) => void
}) {
  return (
    <>
      {!hidden.has("select") && <RecordRowSelect className={selectClassName} />}
      <RecordRowLink
        href={`#${record.id}`}
        aria-controls={peekIds === "" ? undefined : peekIds}
        onClick={(event) => {
          if (onOpen !== undefined) {
            event.preventDefault()
            onOpen(record.id)
          }
        }}
      >
        {!hidden.has("id") && <RecordRowId>{record.id}</RecordRowId>}
        {!hidden.has("status") && (
          <RecordRowStatus label={statusLabel[record.status]}>
            {hidden.has("status-card") ? (
              <StatusDot status={record.status} />
            ) : (
              <RecordRowCard open={cardsOpen}>
                <RecordRowCardTrigger>
                  <StatusDot status={record.status} />
                </RecordRowCardTrigger>
                <RecordRowCardContent>
                  <StatusCard record={record} />
                </RecordRowCardContent>
              </RecordRowCard>
            )}
          </RecordRowStatus>
        )}
        <RecordRowTitle className={titleClassName}>{record.title}</RecordRowTitle>
        {!hidden.has("owner") && (
          <RecordRowOwner>
            <OwnerValue record={record} state={state} hidden={hidden} cardsOpen={cardsOpen} />
          </RecordRowOwner>
        )}
        {!hidden.has("updated") && <RecordRowUpdated>{record.updated}</RecordRowUpdated>}
      </RecordRowLink>
    </>
  )
}

function StatusDot({ status }: { status: RecordStatus }) {
  return (
    <span
      className={cn("size-2.5 rounded-full border-[1.5px] border-current", statusFill[status])}
    />
  )
}

function StatusCard({ record }: { record: SampleRecord }) {
  return (
    <>
      <p className="text-muted-foreground">Time in status</p>
      <p className="mt-1 font-medium text-sm">
        {statusLabel[record.status]} for {record.statusAge}
      </p>
    </>
  )
}

function OwnerValue({
  record,
  state,
  hidden,
  cardsOpen,
}: {
  record: SampleRecord
  state: RowState
  hidden: Hidden
  cardsOpen?: boolean
}) {
  switch (state) {
    case "partial":
      return <RecordRowFieldStatus status="unavailable" />
    case "no-permission":
      return <RecordRowFieldStatus status="hidden" />
    case "loaded":
      return hidden.has("owner-card") ? (
        <RecordRowPerson name={record.owner} />
      ) : (
        <RecordRowCard open={cardsOpen}>
          <RecordRowCardTrigger>
            <RecordRowPerson name={record.owner} />
          </RecordRowCardTrigger>
          <RecordRowCardContent align="end">
            <OwnerCard record={record} />
          </RecordRowCardContent>
        </RecordRowCard>
      )
  }
}

function OwnerCard({ record }: { record: SampleRecord }) {
  return (
    <>
      <p className="font-medium text-sm">{record.owner}</p>
      <p className="mt-1 text-muted-foreground">Record owner · {record.team}</p>
    </>
  )
}

function ListFooter({
  state,
  count,
  hintId,
  selectedCount,
  onClearSelection,
}: {
  state: ListState
  count: number
  hintId: string
  selectedCount: number
  onClearSelection: () => void
}) {
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1.5 px-3 py-2.5 text-muted-foreground text-xs">
      <FooterMessage state={state} count={count} />
      {selectedCount > 0 && (
        <span className="flex items-center gap-2 text-foreground">
          {selectedCount} selected
          <button
            type="button"
            onClick={onClearSelection}
            className="inline-flex min-h-6 items-center rounded-sm font-medium underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            Clear selection
          </button>
        </span>
      )}
      {state !== "loading" && (
        <span id={hintId} className="ml-auto pointer-coarse:hidden">
          <Kbd>Space</Kbd> peek <Separator /> <Kbd>↑</Kbd> <Kbd>↓</Kbd> move <Separator />{" "}
          <Kbd>X</Kbd> select <Separator /> <Kbd>Enter</Kbd> open
        </span>
      )}
    </div>
  )
}

function Separator() {
  return <span aria-hidden="true">·</span>
}

function FooterMessage({ state, count }: { state: ListState; count: number }) {
  switch (state) {
    case "loaded":
      return <span>{count} records</span>
    case "loading":
      return <span>Loading {count} records…</span>
    case "partial":
      return (
        <span className="flex flex-wrap items-center gap-x-3">
          Owners could not load: the directory service did not respond.
          <Link
            to="."
            search={(previous) => ({ ...previous, state: "loaded" })}
            className="inline-flex min-h-6 items-center rounded-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-ring"
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
  onOpen,
  className,
}: {
  id: string
  record: SampleRecord | null
  state: ListState
  onOpen: (value: string) => void
  className: string
}) {
  return (
    <aside
      id={id}
      aria-label="Peek"
      className={cn("rounded-xl border bg-card p-4 text-card-foreground text-sm", className)}
    >
      <PeekPanelBody record={record} state={state} onOpen={onOpen} />
    </aside>
  )
}

function PeekPanelBody({
  record,
  state,
  onOpen,
}: {
  record: SampleRecord | null
  state: ListState
  onOpen: (value: string) => void
}) {
  if (state === "loading") {
    return <p className="text-muted-foreground">Peek is available once the records load.</p>
  }
  if (record === null) {
    return (
      <p className="text-pretty text-muted-foreground">
        <span className="pointer-coarse:hidden">
          Focus a row and press <Kbd>Space</Kbd> to peek at it here.
        </span>
        <span className="hidden pointer-coarse:inline">Tap a row to open the record.</span>
      </p>
    )
  }
  return <PeekContent record={record} state={state} onOpen={onOpen} />
}

function PeekContent({
  record,
  state,
  onOpen,
}: {
  record: SampleRecord
  state: RowState
  onOpen: (value: string) => void
}) {
  return (
    <>
      <p className="text-muted-foreground text-xs tabular-nums">{record.id}</p>
      <h2 className="mt-1 text-balance font-semibold">{record.title}</h2>
      <RecordFields record={record} state={state} />
      <a
        href={`#${record.id}`}
        onClick={(event) => {
          event.preventDefault()
          onOpen(record.id)
        }}
        className="mt-4 inline-flex min-h-6 items-center rounded-sm font-medium text-xs underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        Open {record.id}
      </a>
    </>
  )
}

function RecordPage({
  record,
  state,
  onBack,
}: {
  record: SampleRecord
  state: RowState
  onBack: () => void
}) {
  const headingRef = React.useRef<HTMLHeadingElement>(null)

  React.useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <article className={cn(listSurface, "max-w-2xl p-5 text-sm sm:p-6")}>
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 inline-flex min-h-6 items-center gap-1 rounded-sm px-1 font-medium text-muted-foreground text-xs hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={1.75} aria-hidden="true" />
        Back to records
      </button>
      <p className="mt-5 text-muted-foreground text-xs tabular-nums">{record.id}</p>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-1 text-balance font-semibold text-xl tracking-tight outline-none"
      >
        {record.title}
      </h2>
      <RecordFields record={record} state={state} />
    </article>
  )
}

function RecordFields({ record, state }: { record: SampleRecord; state: RowState }) {
  return (
    <>
      <p className="mt-2 max-w-prose text-pretty text-sm leading-relaxed">{record.summary}</p>
      <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-xs">
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
        <dd className="tabular-nums">
          {record.updated} ({record.updatedAt})
        </dd>
      </dl>
    </>
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

function ErrorMessage() {
  return (
    <section
      role="alert"
      className={cn(
        listSurface,
        "flex min-h-56 flex-col items-center justify-center px-6 text-center"
      )}
    >
      <p className="font-medium">The records could not load.</p>
      <p className="mt-1 max-w-sm text-pretty text-muted-foreground text-sm">
        The request timed out after 10 seconds. Retry, or check your connection and reload the page.
      </p>
      <Link
        to="."
        search={(previous) => ({ ...previous, state: "loaded" })}
        className="mt-5 inline-flex min-h-9 items-center rounded-lg border bg-background px-4 font-medium text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
      >
        Retry
      </Link>
    </section>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-background px-1 font-sans text-[0.6875rem] text-foreground shadow-[0_1px_0_var(--border)]">
      {children}
    </kbd>
  )
}

function handleSpecimenChange() {
  return undefined
}

function ExplodedView({
  state,
  records,
  hidden,
}: {
  state: FixtureState
  records: ReadonlyArray<SampleRecord>
  hidden: Hidden
}) {
  const record = records[0]
  if (record === undefined) {
    throw new Error("The record set is empty; the exploded view needs one record.")
  }
  switch (state) {
    case "error":
      return (
        <ExplodedPart name="ErrorMessage" note="Playground part; replaces the list and peek">
          <ErrorMessage />
        </ExplodedPart>
      )
    case "loading":
      return (
        <ExplodedPart name="RecordList" note="aria-busy; one RecordRowLoading per expected record">
          <ExplodedPart
            name="RecordRowLoading"
            note="Same slots as RecordRow; each slot draws a bar at its own width"
          >
            <div className={listSurface}>
              <RecordList aria-label="Records, loading" aria-busy="true">
                <RecordRowLoading>
                  <RowSlots record={record} state="loaded" hidden={hidden} peekIds="" />
                </RecordRowLoading>
              </RecordList>
            </div>
          </ExplodedPart>
        </ExplodedPart>
      )
    case "loaded":
    case "partial":
    case "no-permission":
      return <ExplodedRecordList state={state} record={record} hidden={hidden} />
  }
}

const rowSpecimens: ReadonlyArray<{
  label: string
  rowClassName?: string
  titleClassName?: string
  isSelected: boolean
  isPeeked: boolean
}> = [
  { label: "At rest", isSelected: false, isPeeked: false },
  { label: "Hovered", rowClassName: "bg-foreground/4", isSelected: false, isPeeked: false },
  {
    label: "Focused",
    rowClassName: "bg-foreground/7",
    titleClassName: "underline",
    isSelected: false,
    isPeeked: false,
  },
  { label: "Selected", isSelected: true, isPeeked: false },
  {
    label: "Peeked",
    titleClassName: "underline",
    isSelected: false,
    isPeeked: true,
  },
]

function Specimen({
  record,
  state,
  hidden,
  specimen,
}: {
  record: SampleRecord
  state: RowState
  hidden: Hidden
  specimen: (typeof rowSpecimens)[number]
}) {
  const isHighlighted = specimen.rowClassName !== undefined || specimen.titleClassName !== undefined
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-muted-foreground text-xs">{specimen.label}</p>
      <div className={listSurface}>
        <RecordList
          aria-label={`Record row, ${specimen.label.toLowerCase()}`}
          selectedValues={specimen.isSelected ? [record.id] : []}
          onSelectedValuesChange={handleSpecimenChange}
          peekValue={specimen.isPeeked ? record.id : null}
          onPeekValueChange={handleSpecimenChange}
        >
          <RecordRow value={record.id} className={cn("border-b-0", specimen.rowClassName)}>
            <RowSlots
              record={record}
              state={state}
              hidden={hidden}
              peekIds=""
              titleClassName={specimen.titleClassName}
              selectClassName={isHighlighted ? "visible" : undefined}
            />
          </RecordRow>
        </RecordList>
      </div>
    </div>
  )
}

const ownerNote: Readonly<Record<RowState, string>> = {
  loaded: "24px (initials) narrower than 640px, 144px from 640px; holds RecordRowPerson",
  partial: 'Holds RecordRowFieldStatus status="unavailable" when owners fail to load',
  "no-permission": 'Holds RecordRowFieldStatus status="hidden" when the owner is withheld',
}

function ExplodedRecordList({
  state,
  record,
  hidden,
}: {
  state: RowState
  record: SampleRecord
  hidden: Hidden
}) {
  const cardsHidden = { status: hidden.has("status-card"), owner: hidden.has("owner-card") }
  return (
    <ExplodedPart name="RecordList" note="One tab stop; ↑ ↓ Home End, Space, X, Esc">
      <ExplodedPart name="RecordRow" note="44px high; RecordRowSelect, then RecordRowLink">
        <div className="grid gap-3">
          {rowSpecimens.map((specimen) => (
            <Specimen
              key={specimen.label}
              record={record}
              state={state}
              hidden={hidden}
              specimen={specimen}
            />
          ))}
        </div>
        <div className="grid gap-3">
          {!hidden.has("select") && (
            <ExplodedPart
              name="RecordRowSelect"
              note="24×24, 44×44 on a coarse pointer; not a tab stop"
            >
              <PartRow record={record} selected>
                <RecordRowSelect className="visible" />
              </PartRow>
            </ExplodedPart>
          )}
          <ExplodedPart
            name="RecordRowLink"
            note="The row's one focus target; render your router's link through render"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {!hidden.has("id") && (
                <ExplodedPart name="RecordRowId" note="64px; hidden narrower than 640px">
                  <PartRow record={record}>
                    <RecordRowId className="block">{record.id}</RecordRowId>
                  </PartRow>
                </ExplodedPart>
              )}
              {!hidden.has("status") && (
                <ExplodedPart
                  name="RecordRowStatus"
                  note="24×24 glyph; label for screen readers"
                  className={cardsHidden.status ? undefined : "pb-24"}
                >
                  <PartRow record={record}>
                    <RecordRowStatus label={statusLabel[record.status]}>
                      {cardsHidden.status ? (
                        <StatusDot status={record.status} />
                      ) : (
                        <RecordRowCard open>
                          <RecordRowCardTrigger>
                            <StatusDot status={record.status} />
                          </RecordRowCardTrigger>
                          <RecordRowCardContent>
                            <StatusCard record={record} />
                          </RecordRowCardContent>
                        </RecordRowCard>
                      )}
                    </RecordRowStatus>
                  </PartRow>
                </ExplodedPart>
              )}
              <ExplodedPart name="RecordRowTitle" note="Fills the remaining width; truncates">
                <PartRow record={record}>
                  <RecordRowTitle>{record.title}</RecordRowTitle>
                </PartRow>
              </ExplodedPart>
              {!hidden.has("updated") && (
                <ExplodedPart name="RecordRowUpdated" note="80px; hidden narrower than 768px">
                  <PartRow record={record}>
                    <RecordRowUpdated className="flex">{record.updated}</RecordRowUpdated>
                  </PartRow>
                </ExplodedPart>
              )}
              {!hidden.has("owner") && (
                <ExplodedPart
                  name="RecordRowOwner"
                  note={ownerNote[state]}
                  className={cn(
                    "sm:col-span-2",
                    state === "loaded" && !cardsHidden.owner && "pb-24"
                  )}
                >
                  <PartRow record={record}>
                    <OwnerValue
                      record={record}
                      state={state}
                      hidden={hidden}
                      cardsOpen={!cardsHidden.owner}
                    />
                  </PartRow>
                </ExplodedPart>
              )}
            </div>
          </ExplodedPart>
        </div>
      </ExplodedPart>
    </ExplodedPart>
  )
}

function PartRow({
  record,
  selected = false,
  children,
}: {
  record: SampleRecord
  selected?: boolean
  children: React.ReactNode
}) {
  return (
    <RecordList
      aria-label={`${record.title}, one part`}
      selectedValues={selected ? [record.id] : []}
      onSelectedValuesChange={handleSpecimenChange}
    >
      <RecordRow value={record.id} className="h-auto min-h-11 border-b-0 px-0 hover:bg-transparent">
        {children}
      </RecordRow>
    </RecordList>
  )
}
