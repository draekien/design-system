import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import { RecordList } from "@workspace/ui/components/record-list.tsx"
import {
  RecordRow,
  RecordRowGlyph,
  RecordRowIdentify,
  RecordRowKey,
  RecordRowLink,
  RecordRowLoading,
  RecordRowName,
  RecordRowRead,
  RecordRowSelect,
} from "@workspace/ui/components/record-row.tsx"
import { cn } from "cn"
import * as React from "react"
import { flushSync } from "react-dom"
import {
  type Dataset,
  type Hidden,
  invoicesDataset,
  isPartShown,
  type ReadDefinition,
  type RowState,
  recordsDataset,
} from "./datasets.tsx"
import { ExplodedPart } from "./exploded-part.tsx"
import type { CanvasOptions } from "./playground-search.ts"

type ListState = Exclude<FixtureState, "error">

const listSurface =
  "overflow-hidden rounded-xl border bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.1)]"

const textLink =
  "inline-flex min-h-6 items-center rounded-sm font-medium underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-ring"

export function RecordListCanvas({ options }: { options: CanvasOptions }): React.ReactElement {
  const hidden = React.useMemo(() => new Set(options.hide), [options.hide])
  return (
    <main className="p-4 sm:p-6">
      <h1 className="sr-only">Record list</h1>
      {options.dataset === "invoices" ? (
        <DatasetCanvas dataset={invoicesDataset} options={options} hidden={hidden} />
      ) : (
        <DatasetCanvas dataset={recordsDataset} options={options} hidden={hidden} />
      )}
    </main>
  )
}

function DatasetCanvas<TItem>({
  dataset,
  options,
  hidden,
}: {
  dataset: Dataset<TItem>
  options: CanvasOptions
  hidden: Hidden
}) {
  const { items: load } = dataset
  const items = React.useMemo(() => load(options), [load, options])

  if (options.state === "error") {
    return options.view === "lockup" ? (
      <ErrorMessage dataset={dataset} />
    ) : (
      <ExplodedPart name="ErrorMessage" note="Playground part; replaces the list and peek">
        <ErrorMessage dataset={dataset} />
      </ExplodedPart>
    )
  }
  return options.view === "lockup" ? (
    <PlaygroundRecordList
      key={`${dataset.id}-${options.state}`}
      dataset={dataset}
      state={options.state}
      items={items}
      hidden={hidden}
    />
  ) : (
    <ExplodedView dataset={dataset} state={options.state} items={items} hidden={hidden} />
  )
}

function PlaygroundRecordList<TItem>({
  dataset,
  state,
  items,
  hidden,
}: {
  dataset: Dataset<TItem>
  state: ListState
  items: ReadonlyArray<TItem>
  hidden: Hidden
}) {
  const [peekValue, setPeekValue] = React.useState<string | null>(null)
  const [selectedValues, setSelectedValues] = React.useState<ReadonlyArray<string>>([])
  const [openValue, setOpenValue] = React.useState<string | null>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const hintId = React.useId()
  const inlinePeekId = React.useId()
  const panelPeekId = React.useId()
  const peeked = items.find((item) => dataset.value(item) === peekValue) ?? null
  const opened = items.find((item) => dataset.value(item) === openValue) ?? null

  function handleBack(value: string) {
    flushSync(() => setOpenValue(null))
    listRef.current
      ?.querySelector<HTMLElement>(`[data-slot="record-row-link"][data-value="${value}"]`)
      ?.focus()
  }

  return (
    <>
      {opened !== null && state !== "loading" && (
        <ItemPage
          dataset={dataset}
          item={opened}
          state={state}
          onBack={() => handleBack(dataset.value(opened))}
        />
      )}
      <div
        ref={listRef}
        hidden={opened !== null}
        className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <div className={listSurface}>
          {state === "loading" ? (
            <RecordList aria-label={`${capitalise(dataset.noun)}, loading`} aria-busy="true">
              {items.map((item) => (
                <RecordRowLoading key={dataset.value(item)}>
                  <RowParts dataset={dataset} item={item} state="loaded" hidden={hidden} />
                </RecordRowLoading>
              ))}
            </RecordList>
          ) : (
            <RecordList
              aria-label={capitalise(dataset.noun)}
              aria-describedby={hintId}
              peekValue={peekValue}
              onPeekValueChange={setPeekValue}
              selectedValues={selectedValues}
              onSelectedValuesChange={setSelectedValues}
            >
              {items.map((item) => (
                <React.Fragment key={dataset.value(item)}>
                  <RecordRow value={dataset.value(item)}>
                    <RowParts
                      dataset={dataset}
                      item={item}
                      state={state}
                      hidden={hidden}
                      peekIds={`${inlinePeekId} ${panelPeekId}`}
                      onOpen={setOpenValue}
                    />
                  </RecordRow>
                  {dataset.value(item) === peekValue && (
                    <li
                      id={inlinePeekId}
                      className="col-span-full border-b bg-foreground/[0.025] px-4 py-4 lg:hidden"
                    >
                      <PeekContent
                        dataset={dataset}
                        item={item}
                        state={state}
                        onOpen={setOpenValue}
                      />
                    </li>
                  )}
                </React.Fragment>
              ))}
            </RecordList>
          )}
          <ListFooter
            dataset={dataset}
            state={state}
            count={items.length}
            hintId={hintId}
            selectedCount={selectedValues.length}
            onClearSelection={() => setSelectedValues([])}
          />
        </div>
        <aside
          id={panelPeekId}
          aria-label="Peek"
          className="hidden rounded-xl border bg-card p-4 text-card-foreground text-sm lg:block"
        >
          <PeekPanelBody dataset={dataset} item={peeked} state={state} onOpen={setOpenValue} />
        </aside>
      </div>
    </>
  )
}

function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function shownReads<TItem>(dataset: Dataset<TItem>, hidden: Hidden) {
  return dataset.reads.filter((read) => !hidden.has(read.part))
}

function hasCard<TItem>(read: ReadDefinition<TItem>, hidden: Hidden) {
  return read.card !== undefined && isPartShown(hidden, read.card, read.part)
}

function RowParts<TItem>({
  dataset,
  item,
  state,
  hidden,
  peekIds = "",
  nameClassName,
  selectClassName,
  cardOpen,
  onOpen,
}: {
  dataset: Dataset<TItem>
  item: TItem
  state: RowState
  hidden: Hidden
  peekIds?: string
  nameClassName?: string
  selectClassName?: string
  cardOpen?: boolean
  onOpen?: (value: string) => void
}) {
  const value = dataset.value(item)
  return (
    <>
      {!hidden.has("select") && <RecordRowSelect className={selectClassName} />}
      <RecordRowLink
        href={`#${value}`}
        aria-controls={peekIds === "" ? undefined : peekIds}
        onClick={(event) => {
          if (onOpen !== undefined) {
            event.preventDefault()
            onOpen(value)
          }
        }}
      >
        <RecordRowIdentify>
          {!hidden.has("key") && (
            <RecordRowKey narrow={dataset.keyNarrow}>{dataset.key(item)}</RecordRowKey>
          )}
          {dataset.glyph !== undefined && !hidden.has(dataset.glyph.part) && (
            <RecordRowGlyph>
              {dataset.glyph.render(item, {
                state,
                cardOpen,
                withCard: hasCard(dataset.glyph, hidden),
              })}
            </RecordRowGlyph>
          )}
          <RecordRowName className={nameClassName}>{dataset.name(item)}</RecordRowName>
        </RecordRowIdentify>
        {shownReads(dataset, hidden).map((read) => (
          <RecordRowRead key={read.part} narrow={read.narrow}>
            {read.render(item, { state, cardOpen, withCard: hasCard(read, hidden) })}
          </RecordRowRead>
        ))}
      </RecordRowLink>
    </>
  )
}

function ListFooter<TItem>({
  dataset,
  state,
  count,
  hintId,
  selectedCount,
  onClearSelection,
}: {
  dataset: Dataset<TItem>
  state: ListState
  count: number
  hintId: string
  selectedCount: number
  onClearSelection: () => void
}) {
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1.5 px-3 py-2.5 text-muted-foreground text-xs">
      <FooterMessage dataset={dataset} state={state} count={count} />
      {selectedCount > 0 && (
        <span className="flex items-center gap-2 text-foreground">
          {selectedCount} selected
          <button type="button" onClick={onClearSelection} className={textLink}>
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

function FooterMessage<TItem>({
  dataset,
  state,
  count,
}: {
  dataset: Dataset<TItem>
  state: ListState
  count: number
}) {
  switch (state) {
    case "loaded":
      return (
        <span>
          {count} {dataset.noun}
        </span>
      )
    case "loading":
      return (
        <span>
          Loading {count} {dataset.noun}…
        </span>
      )
    case "partial":
      return (
        <span className="flex flex-wrap items-center gap-x-3">
          {dataset.partialMessage}
          <Link
            to="."
            search={(previous) => ({ ...previous, state: "loaded" })}
            className={cn(textLink, "text-foreground")}
          >
            {dataset.partialRetry}
          </Link>
        </span>
      )
    case "no-permission":
      return <span>{dataset.noPermissionMessage}</span>
  }
}

function PeekPanelBody<TItem>({
  dataset,
  item,
  state,
  onOpen,
}: {
  dataset: Dataset<TItem>
  item: TItem | null
  state: ListState
  onOpen: (value: string) => void
}) {
  if (state === "loading") {
    return <p className="text-muted-foreground">Peek is available once the {dataset.noun} load.</p>
  }
  if (item === null) {
    return (
      <p className="text-pretty text-muted-foreground">
        <span className="pointer-coarse:hidden">
          Focus a row and press <Kbd>Space</Kbd> to peek at it here.
        </span>
        <span className="hidden pointer-coarse:inline">Tap a row to open the {dataset.item}.</span>
      </p>
    )
  }
  return <PeekContent dataset={dataset} item={item} state={state} onOpen={onOpen} />
}

function PeekContent<TItem>({
  dataset,
  item,
  state,
  onOpen,
}: {
  dataset: Dataset<TItem>
  item: TItem
  state: RowState
  onOpen: (value: string) => void
}) {
  const value = dataset.value(item)
  return (
    <>
      <p className="text-muted-foreground text-xs tabular-nums">{dataset.key(item)}</p>
      <h2 className="mt-1 text-balance font-semibold">{dataset.name(item)}</h2>
      <ItemFields dataset={dataset} item={item} state={state} />
      <a
        href={`#${value}`}
        onClick={(event) => {
          event.preventDefault()
          onOpen(value)
        }}
        className={cn(textLink, "mt-4 text-xs")}
      >
        Open {dataset.key(item)}
      </a>
    </>
  )
}

function ItemPage<TItem>({
  dataset,
  item,
  state,
  onBack,
}: {
  dataset: Dataset<TItem>
  item: TItem
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
        Back to {dataset.noun}
      </button>
      <p className="mt-5 text-muted-foreground text-xs tabular-nums">{dataset.key(item)}</p>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-1 text-balance font-semibold text-xl tracking-tight outline-none"
      >
        {dataset.name(item)}
      </h2>
      <ItemFields dataset={dataset} item={item} state={state} />
    </article>
  )
}

function ItemFields<TItem>({
  dataset,
  item,
  state,
}: {
  dataset: Dataset<TItem>
  item: TItem
  state: RowState
}) {
  return (
    <>
      <p className="mt-2 max-w-prose text-pretty text-sm leading-relaxed">
        {dataset.summary(item)}
      </p>
      <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-xs">
        {dataset.fields(item, state).map((field) => (
          <React.Fragment key={field.label}>
            <dt className="text-muted-foreground">{field.label}</dt>
            <dd className="tabular-nums">{field.value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </>
  )
}

function ErrorMessage<TItem>({ dataset }: { dataset: Dataset<TItem> }) {
  return (
    <section
      role="alert"
      className={cn(
        listSurface,
        "flex min-h-56 flex-col items-center justify-center px-6 text-center"
      )}
    >
      <p className="font-medium">The {dataset.noun} could not load.</p>
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

const rowSpecimens: ReadonlyArray<{
  label: string
  rowClassName?: string
  nameClassName?: string
  isSelected: boolean
  isPeeked: boolean
}> = [
  { label: "At rest", isSelected: false, isPeeked: false },
  { label: "Hovered", rowClassName: "bg-foreground/4", isSelected: false, isPeeked: false },
  {
    label: "Focused",
    rowClassName: "bg-foreground/7",
    nameClassName: "underline",
    isSelected: false,
    isPeeked: false,
  },
  { label: "Selected", isSelected: true, isPeeked: false },
  { label: "Peeked", nameClassName: "underline", isSelected: false, isPeeked: true },
]

const narrowSpecimens = [
  { label: "768px and wider: every part in full", width: "w-[52rem]" },
  {
    label: "640–768px: names truncate, abbreviated parts switch to short forms",
    width: "w-[44rem]",
  },
  { label: "Narrower than 640px: hidden parts drop out", width: "w-[34rem]" },
] as const

const narrowNote = {
  keep: "always drawn in full",
  abbreviate: 'narrow="abbreviate": short form below 768px',
  hide: 'narrow="hide": short form below 768px, removed below 640px',
} as const

function ExplodedView<TItem>({
  dataset,
  state,
  items,
  hidden,
}: {
  dataset: Dataset<TItem>
  state: ListState
  items: ReadonlyArray<TItem>
  hidden: Hidden
}) {
  const item = items[0]
  if (item === undefined) {
    throw new Error(
      `The ${dataset.item} set is empty; the exploded view needs one ${dataset.item}.`
    )
  }
  if (state === "loading") {
    return (
      <ExplodedPart name="RecordList" note="aria-busy; one RecordRowLoading per expected item">
        <ExplodedPart
          name="RecordRowLoading"
          note="Same parts as RecordRow; each part draws a bar in its own column"
        >
          <div className={listSurface}>
            <RecordList aria-label={`${capitalise(dataset.noun)}, loading`} aria-busy="true">
              <RecordRowLoading>
                <RowParts dataset={dataset} item={item} state="loaded" hidden={hidden} />
              </RecordRowLoading>
            </RecordList>
          </div>
        </ExplodedPart>
      </ExplodedPart>
    )
  }
  return (
    <ExplodedPart name="RecordList" note="One tab stop; ↑ ↓ Home End, Space, X, Esc">
      <ExplodedPart name="RecordRow" note="Rank 5 link holding rank 1 Identify and rank 2 Reads">
        <div className="grid gap-3">
          {rowSpecimens.map((specimen) => (
            <Specimen
              key={specimen.label}
              dataset={dataset}
              item={item}
              state={state}
              hidden={hidden}
              specimen={specimen}
            />
          ))}
        </div>
        <ExplodedPart name="Narrow widths" note="Truncate, then abbreviate, then hide">
          <div className="grid gap-3 overflow-x-auto">
            {narrowSpecimens.map((specimen) => (
              <div
                key={specimen.label}
                className={cn("flex shrink-0 flex-col gap-1.5", specimen.width)}
              >
                <p className="text-muted-foreground text-xs">{specimen.label}</p>
                <div className={listSurface}>
                  <RecordList aria-label={`${capitalise(dataset.item)} row, ${specimen.label}`}>
                    <RecordRow value={dataset.value(item)} className="border-b-0">
                      <RowParts dataset={dataset} item={item} state={state} hidden={hidden} />
                    </RecordRow>
                  </RecordList>
                </div>
              </div>
            ))}
          </div>
        </ExplodedPart>
        <div className="grid gap-3">
          {!hidden.has("select") && (
            <ExplodedPart
              name="RecordRowSelect"
              note="24×24, 44×44 on a coarse pointer; not a tab stop"
            >
              <PartRow dataset={dataset} item={item} selected>
                <RecordRowSelect className="visible" />
              </PartRow>
            </ExplodedPart>
          )}
          <ExplodedPart
            name="RecordRowLink"
            note="Rank 5: the row's one focus target; render your router's link through render"
          >
            <ExplodedPart name="RecordRowIdentify" note="Rank 1: what the item is">
              <div className="grid gap-3 sm:grid-cols-2">
                {!hidden.has("key") && (
                  <ExplodedPart name="RecordRowKey" note={narrowNote[dataset.keyNarrow]}>
                    <PartRow dataset={dataset} item={item}>
                      <RecordRowKey>{dataset.key(item)}</RecordRowKey>
                    </PartRow>
                  </ExplodedPart>
                )}
                {dataset.glyph !== undefined && !hidden.has(dataset.glyph.part) && (
                  <ExplodedPart
                    name="RecordRowGlyph"
                    note={`${dataset.glyph.label}, a ${dataset.glyph.content}: 24×24, the word read by screen readers only${hasCard(dataset.glyph, hidden) ? "; rank 4 FieldCard drawn open" : ""}`}
                    className={hasCard(dataset.glyph, hidden) ? "pb-24" : undefined}
                  >
                    <PartRow dataset={dataset} item={item}>
                      <RecordRowGlyph>
                        {dataset.glyph.render(item, {
                          state,
                          cardOpen: true,
                          withCard: hasCard(dataset.glyph, hidden),
                        })}
                      </RecordRowGlyph>
                    </PartRow>
                  </ExplodedPart>
                )}
                <ExplodedPart name="RecordRowName" note="Fills the remaining width; truncates">
                  <PartRow dataset={dataset} item={item}>
                    <RecordRowName>{dataset.name(item)}</RecordRowName>
                  </PartRow>
                </ExplodedPart>
              </div>
            </ExplodedPart>
            <div className="grid gap-3 sm:grid-cols-2">
              {shownReads(dataset, hidden).map((read) => {
                const card = hasCard(read, hidden)
                return (
                  <ExplodedPart
                    key={read.part}
                    name="RecordRowRead"
                    note={`Rank 2: ${read.label}, a ${read.content}; ${narrowNote[read.narrow]}${card ? "; rank 4 FieldCard drawn open" : ""}`}
                    className={card && state === "loaded" ? "pb-24" : undefined}
                  >
                    <PartRow dataset={dataset} item={item}>
                      <RecordRowRead className="pl-0">
                        {read.render(item, { state, cardOpen: true, withCard: card })}
                      </RecordRowRead>
                    </PartRow>
                  </ExplodedPart>
                )
              })}
            </div>
          </ExplodedPart>
        </div>
      </ExplodedPart>
    </ExplodedPart>
  )
}

function Specimen<TItem>({
  dataset,
  item,
  state,
  hidden,
  specimen,
}: {
  dataset: Dataset<TItem>
  item: TItem
  state: RowState
  hidden: Hidden
  specimen: (typeof rowSpecimens)[number]
}) {
  const value = dataset.value(item)
  const isHighlighted = specimen.rowClassName !== undefined || specimen.nameClassName !== undefined
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-muted-foreground text-xs">{specimen.label}</p>
      <div className={listSurface}>
        <RecordList
          aria-label={`${capitalise(dataset.item)} row, ${specimen.label.toLowerCase()}`}
          selectedValues={specimen.isSelected ? [value] : []}
          onSelectedValuesChange={handleSpecimenChange}
          peekValue={specimen.isPeeked ? value : null}
          onPeekValueChange={handleSpecimenChange}
        >
          <RecordRow value={value} className={cn("border-b-0", specimen.rowClassName)}>
            <RowParts
              dataset={dataset}
              item={item}
              state={state}
              hidden={hidden}
              nameClassName={specimen.nameClassName}
              selectClassName={isHighlighted ? "visible" : undefined}
            />
          </RecordRow>
        </RecordList>
      </div>
    </div>
  )
}

function PartRow<TItem>({
  dataset,
  item,
  selected = false,
  children,
}: {
  dataset: Dataset<TItem>
  item: TItem
  selected?: boolean
  children: React.ReactNode
}) {
  const value = dataset.value(item)
  return (
    <RecordList
      aria-label={`${dataset.name(item)}, one part`}
      selectedValues={selected ? [value] : []}
      onSelectedValuesChange={handleSpecimenChange}
    >
      <RecordRow value={value} className="min-h-11 border-b-0 px-0 hover:bg-transparent">
        {children}
      </RecordRow>
    </RecordList>
  )
}
