import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import { RecordList } from "@workspace/ui/components/record-list.tsx"
import {
  RecordRow,
  RecordRowDescription,
  RecordRowGlyph,
  RecordRowIdentify,
  RecordRowKey,
  RecordRowLink,
  RecordRowLoading,
  RecordRowName,
  RecordRowRead,
  RecordRowSelect,
} from "@workspace/ui/components/record-row.tsx"
import * as React from "react"
import { flushSync } from "react-dom"
import { cn } from "@/lib/cn.ts"
import { Constellation, type ConstellationGroup, type ConstellationPart } from "./constellation.tsx"
import {
  type Dataset,
  type Hidden,
  invoicesDataset,
  isPartShown,
  type ReadDefinition,
  type RowState,
  recordsDataset,
} from "./datasets.tsx"
import type { CanvasOptions } from "./playground-search.ts"

type ListState = Exclude<FixtureState, "error">

const listSurface =
  "overflow-hidden rounded-xl border bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.1)]"

const textLink =
  "inline-flex min-h-6 items-center rounded-sm font-medium underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-ring"

/** The record list constellation, drawn in the docs page rather than in a canvas frame. */
export function RecordListConstellation({
  options,
}: {
  options: Omit<CanvasOptions, "view">
}): React.ReactElement {
  const hidden = React.useMemo(() => new Set(options.hide), [options.hide])
  return options.dataset === "invoices" ? (
    <DatasetConstellation dataset={invoicesDataset} options={options} hidden={hidden} />
  ) : (
    <DatasetConstellation dataset={recordsDataset} options={options} hidden={hidden} />
  )
}

function DatasetConstellation<TItem>({
  dataset,
  options,
  hidden,
}: {
  dataset: Dataset<TItem>
  options: Omit<CanvasOptions, "view">
  hidden: Hidden
}) {
  const { items: load } = dataset
  const items = React.useMemo(() => load(options), [load, options])
  return (
    <ConstellationView
      key={`${dataset.id}-${options.state}`}
      dataset={dataset}
      state={options.state}
      items={items}
      hidden={hidden}
    />
  )
}

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

  switch (options.view) {
    case "states":
      return <StatesView dataset={dataset} state={options.state} items={items} hidden={hidden} />
    case "lockup":
      return options.state === "error" ? (
        <ErrorMessage dataset={dataset} />
      ) : (
        <PlaygroundRecordList
          key={`${dataset.id}-${options.state}`}
          dataset={dataset}
          state={options.state}
          items={items}
          hidden={hidden}
        />
      )
  }
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
          className="hidden rounded-xl border bg-card p-4 text-card-foreground text-sm lg:sticky lg:top-6 lg:block lg:max-h-[calc(100svh-3rem)] lg:overflow-y-auto"
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
  cardContainer,
  anchors,
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
  cardContainer?: HTMLElement | null
  anchors?: RowAnchors
  onOpen?: (value: string) => void
}) {
  const value = dataset.value(item)
  const context = { state, cardOpen, cardContainer }
  return (
    <>
      {!hidden.has("select") && (
        <RecordRowSelect className={selectClassName} data-anchor={anchors?.get("select")} />
      )}
      <RecordRowLink
        href={`#${value}`}
        data-anchor={anchors?.get("link")}
        aria-controls={peekIds === "" ? undefined : peekIds}
        onClick={(event) => {
          if (onOpen !== undefined) {
            event.preventDefault()
            onOpen(value)
          }
        }}
      >
        <RecordRowIdentify data-anchor={anchors?.get("identify")}>
          {!hidden.has("key") && (
            <RecordRowKey narrow={dataset.keyNarrow} data-anchor={anchors?.get("key")}>
              {dataset.key(item)}
            </RecordRowKey>
          )}
          {dataset.glyph !== undefined && !hidden.has(dataset.glyph.part) && (
            <RecordRowGlyph data-anchor={anchors?.get(dataset.glyph.part)}>
              {dataset.glyph.render(item, {
                ...context,
                withCard: hasCard(dataset.glyph, hidden),
              })}
            </RecordRowGlyph>
          )}
          <RecordRowName className={nameClassName} data-anchor={anchors?.get("name")}>
            {dataset.name(item)}
          </RecordRowName>
          {!hidden.has("description") && (
            <RecordRowDescription data-anchor={anchors?.get("description")}>
              {dataset.summary(item)}
            </RecordRowDescription>
          )}
        </RecordRowIdentify>
        {shownReads(dataset, hidden).map((read) => (
          <RecordRowRead key={read.part} narrow={read.narrow} data-anchor={anchors?.get(read.part)}>
            {read.render(item, { ...context, withCard: hasCard(read, hidden) })}
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
  anchor,
  onClearSelection,
}: {
  dataset: Dataset<TItem>
  state: ListState
  count: number
  hintId: string
  selectedCount: number
  anchor?: number
  onClearSelection: () => void
}) {
  return (
    <div
      data-anchor={anchor}
      className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1.5 px-3 py-2.5 text-muted-foreground text-xs"
    >
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

function ErrorMessage<TItem>({
  dataset,
  anchors,
}: {
  dataset: Dataset<TItem>
  anchors?: { message: number; retry: number }
}) {
  return (
    <section
      role="alert"
      data-anchor={anchors?.message}
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
        data-anchor={anchors?.retry}
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

type RowAnchors = ReadonlyMap<string, number>

type Drawing = {
  parts: ReadonlyArray<ConstellationPart>
  groups: ReadonlyArray<ConstellationGroup>
  centre: React.ReactNode
}

function partNumbers() {
  const parts: Array<ConstellationPart> = []
  const slots = new Map<string, number>()
  function add(slot: string, part: Omit<ConstellationPart, "n">) {
    const n = parts.length + 1
    parts.push({ n, ...part })
    slots.set(slot, n)
  }
  function link(slot: string, anchorSlot = slot) {
    const part = slots.get(slot)
    const anchor = slots.get(anchorSlot)
    return part === undefined || anchor === undefined ? [] : [{ part, anchor }]
  }
  return { parts, slots, add, link }
}

function ConstellationView<TItem>({
  dataset,
  state,
  items,
  hidden,
}: {
  dataset: Dataset<TItem>
  state: FixtureState
  items: ReadonlyArray<TItem>
  hidden: Hidden
}) {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null)
  const [selectedValues, setSelectedValues] = React.useState<ReadonlyArray<string>>([])
  const centreHintId = React.useId()
  const specimenHintId = React.useId()
  const item = items[0]
  if (item === undefined) {
    throw new Error(
      `The ${dataset.item} set is empty; the constellation needs one ${dataset.item}.`
    )
  }

  function drawing(): Drawing {
    switch (state) {
      case "error":
        return errorDrawing(dataset)
      case "loading":
        return loadingDrawing({ dataset, item, count: items.length, hidden, hintId: centreHintId })
      case "loaded":
      case "partial":
      case "no-permission":
        return rowDrawing({
          dataset,
          item,
          state,
          count: items.length,
          hidden,
          stage,
          hintIds: { centre: centreHintId, specimen: specimenHintId },
          selectedValues,
          onSelectedValuesChange: setSelectedValues,
        })
    }
  }

  return (
    <Constellation
      label={`${capitalise(dataset.item)} row constellation`}
      stage={stage}
      onStageChange={setStage}
      {...drawing()}
    />
  )
}

function errorDrawing<TItem>(dataset: Dataset<TItem>): Drawing {
  const { parts, add, link } = partNumbers()
  add("message", {
    name: "ErrorMessage",
    depth: 0,
    note: "Playground part: replaces the list and peek when the request fails",
  })
  add("retry", { name: "Retry", depth: 1, note: "Loads the list again" })
  return {
    parts,
    groups: [
      {
        title: "Recover",
        rank: null,
        reveal: "always",
        summary: "States what went wrong, then how to fix it",
        links: link("retry"),
      },
    ],
    centre: (
      <div className="w-[36rem]">
        <ErrorMessage dataset={dataset} anchors={{ message: 1, retry: 2 }} />
      </div>
    ),
  }
}

function loadingDrawing<TItem>({
  dataset,
  item,
  count,
  hidden,
  hintId,
}: {
  dataset: Dataset<TItem>
  item: TItem
  count: number
  hidden: Hidden
  hintId: string
}): Drawing {
  const { parts, slots, add, link } = partNumbers()
  add("list", {
    name: "RecordList",
    depth: 0,
    note: "aria-busy; one RecordRowLoading per expected item",
  })
  add("row", {
    name: "RecordRowLoading",
    depth: 1,
    note: "Same parts as RecordRow; each part draws a bar in its own column",
    specimen: (
      <RecordList aria-label={`${capitalise(dataset.noun)}, loading`} aria-busy="true">
        <RecordRowLoading className="border-b-0 px-0">
          <RowParts dataset={dataset} item={item} state="loaded" hidden={hidden} />
        </RecordRowLoading>
      </RecordList>
    ),
  })
  add("footer", {
    name: "ListFooter",
    depth: 1,
    note: "Playground part: says how many items are loading",
    specimen: (
      <p className="py-1 text-muted-foreground text-xs">
        Loading {count} {dataset.noun}…
      </p>
    ),
  })
  return {
    parts,
    groups: [
      {
        title: "Placeholder",
        rank: null,
        reveal: "always",
        summary: `Each part draws a bar at its loaded width, so the row does not move when the ${dataset.noun} arrive`,
        links: link("row"),
      },
      {
        title: "Status",
        rank: null,
        reveal: "always",
        summary: `The footer says how many ${dataset.noun} are loading`,
        links: link("footer"),
      },
    ],
    centre: (
      <div data-anchor={slots.get("list")} className={cn(listSurface, "w-[52rem]")}>
        <RecordList aria-label={`${capitalise(dataset.noun)}, loading`} aria-busy="true">
          <RecordRowLoading data-anchor={slots.get("row")}>
            <RowParts dataset={dataset} item={item} state="loaded" hidden={hidden} />
          </RecordRowLoading>
        </RecordList>
        <ListFooter
          dataset={dataset}
          state="loading"
          count={count}
          hintId={hintId}
          selectedCount={0}
          anchor={slots.get("footer")}
          onClearSelection={handleSpecimenChange}
        />
      </div>
    ),
  }
}

function rowDrawing<TItem>({
  dataset,
  item,
  state,
  count,
  hidden,
  stage,
  hintIds,
  selectedValues,
  onSelectedValuesChange,
}: {
  dataset: Dataset<TItem>
  item: TItem
  state: RowState
  count: number
  hidden: Hidden
  stage: HTMLDivElement | null
  hintIds: { centre: string; specimen: string }
  selectedValues: ReadonlyArray<string>
  onSelectedValuesChange: (values: ReadonlyArray<string>) => void
}): Drawing {
  const { parts, slots, add, link } = partNumbers()
  const value = dataset.value(item)
  const reads = shownReads(dataset, hidden)
  const glyph =
    dataset.glyph !== undefined && !hidden.has(dataset.glyph.part) ? dataset.glyph : undefined
  const carded = [...(glyph === undefined ? [] : [glyph]), ...reads].filter(
    (read) => hasCard(read, hidden) && (read.cardStates?.includes(state) ?? true)
  )
  const cardOf = (read: ReadDefinition<TItem>) => (carded.includes(read) ? read.card : undefined)

  add("list", { name: "RecordList", depth: 0, note: "One tab stop; ↑ ↓ Home End, Space, X, Esc" })
  add("row", {
    name: "RecordRow",
    depth: 1,
    note: "One item: the select slot, then the link holding ranks 1 and 2",
  })
  if (!hidden.has("select")) {
    add("select", {
      name: "RecordRowSelect",
      depth: 2,
      note: "24×24, 44×44 on a coarse pointer; not a tab stop",
      specimen: (
        <PartRow dataset={dataset} item={item} selected>
          <RecordRowSelect className="visible" />
        </PartRow>
      ),
    })
  }
  add("link", {
    name: "RecordRowLink",
    depth: 2,
    note: "Rank 5: the row's one focus target; render your router's link through render",
    specimen: <ItemPageHead dataset={dataset} item={item} />,
  })
  add("identify", { name: "RecordRowIdentify", depth: 3, note: "Rank 1: what the item is" })
  if (!hidden.has("key")) {
    add("key", {
      name: "RecordRowKey",
      depth: 4,
      note: narrowNote[dataset.keyNarrow],
      specimen: (
        <PartRow dataset={dataset} item={item}>
          <RecordRowKey>{dataset.key(item)}</RecordRowKey>
        </PartRow>
      ),
    })
  }
  if (glyph !== undefined) {
    add(glyph.part, {
      name: "RecordRowGlyph",
      depth: 4,
      note: `${glyph.label}, a ${glyph.content}: 24×24, the word read by screen readers only`,
      specimen: (
        <PartRow dataset={dataset} item={item}>
          <RecordRowGlyph>{glyph.render(item, { state, withCard: false })}</RecordRowGlyph>
        </PartRow>
      ),
    })
    const card = cardOf(glyph)
    if (card !== undefined) {
      add(card, {
        name: "FieldCard",
        depth: 5,
        note: `Rank 4: ${glyph.label.toLowerCase()} detail, opened 300ms after the pointer enters`,
        specimen: (
          <CardSpecimen>
            {(container) => (
              <PartRow dataset={dataset} item={item}>
                <RecordRowGlyph>
                  {glyph.render(item, {
                    state,
                    withCard: true,
                    cardOpen: true,
                    cardContainer: container,
                  })}
                </RecordRowGlyph>
              </PartRow>
            )}
          </CardSpecimen>
        ),
      })
    }
  }
  add("name", {
    name: "RecordRowName",
    depth: 4,
    note: "Takes the width it needs; truncates after the description; never hidden",
    specimen: (
      <PartRow dataset={dataset} item={item}>
        <RecordRowName>{dataset.name(item)}</RecordRowName>
      </PartRow>
    ),
  })
  if (!hidden.has("description")) {
    add("description", {
      name: "RecordRowDescription",
      depth: 4,
      note: "One muted line; fills the remaining width, truncates first, hidden below 640px",
      specimen: (
        <PartRow dataset={dataset} item={item}>
          <RecordRowDescription className="col-span-full pl-0">
            {dataset.summary(item)}
          </RecordRowDescription>
        </PartRow>
      ),
    })
  }
  for (const read of reads) {
    add(read.part, {
      name: "RecordRowRead",
      depth: 3,
      note: `Rank 2: ${read.label}, a ${read.content}; ${narrowNote[read.narrow]}`,
      specimen: (
        <PartRow dataset={dataset} item={item}>
          <RecordRowRead className="pl-0">
            {read.render(item, { state, withCard: false })}
          </RecordRowRead>
        </PartRow>
      ),
    })
    const card = cardOf(read)
    if (card !== undefined) {
      add(card, {
        name: "FieldCard",
        depth: 4,
        note: `Rank 4: ${read.label.toLowerCase()} detail, opened 300ms after the pointer enters`,
        specimen: (
          <CardSpecimen>
            {(container) => (
              <PartRow dataset={dataset} item={item}>
                <RecordRowRead className="col-span-full justify-end pl-0">
                  {read.render(item, {
                    state,
                    withCard: true,
                    cardOpen: true,
                    cardContainer: container,
                  })}
                </RecordRowRead>
              </PartRow>
            )}
          </CardSpecimen>
        ),
      })
    }
  }
  add("footer", {
    name: "ListFooter",
    depth: 1,
    note: "Playground part: the count, the selection and the key hints",
    specimen: (
      <ListFooter
        dataset={dataset}
        state={state}
        count={count}
        hintId={hintIds.specimen}
        selectedCount={1}
        onClearSelection={handleSpecimenChange}
      />
    ),
  })
  add("peek", {
    name: "Peek",
    depth: 0,
    note: "Playground part: a read-only preview of the page; beside the list at lg, under the row below",
    specimen: (
      <div className="py-1 text-sm">
        <PeekContent dataset={dataset} item={item} state={state} onOpen={handleSpecimenChange} />
      </div>
    ),
  })

  const groups: Array<ConstellationGroup> = [
    {
      title: "Identify",
      rank: 1,
      reveal: "always",
      summary: `What the ${dataset.item} is, at the start of every row`,
      links: [
        ...link("key"),
        ...(glyph === undefined ? [] : link(glyph.part)),
        ...link("name"),
        ...link("description"),
      ],
    },
    {
      title: "Read",
      rank: 2,
      reveal: "always",
      summary: "What the list is scanned for, each value in its own column",
      links: reads.flatMap((read) => link(read.part)),
    },
    {
      title: "Enrich",
      rank: 4,
      reveal: "revealed",
      gesture: "Hover 300ms",
      summary:
        "A hover card on the value it describes; peek and the page hold the same fields for keyboard and touch",
      links: carded.flatMap((read) => (read.card === undefined ? [] : link(read.card, read.part))),
    },
    {
      title: "Elsewhere",
      rank: 5,
      reveal: "revealed",
      gesture: "Enter or click; Space peeks",
      summary: `The link opens the ${dataset.item}'s page, which holds every field; peek previews it without leaving the list`,
      links: [...link("link"), ...link("peek", "link")],
    },
    {
      title: "Act",
      rank: null,
      reveal: "revealed",
      gesture: "Hover, focus or X",
      summary: "Selects the row; the footer counts the selection and clears it",
      links: [...link("select"), ...link("footer")],
    },
  ]

  return {
    parts,
    groups: groups.filter((group) => group.links.length > 0),
    centre: (
      <div data-anchor={slots.get("list")} className={cn(listSurface, "w-[52rem]")}>
        <RecordList
          aria-label={capitalise(dataset.noun)}
          aria-describedby={hintIds.centre}
          selectedValues={selectedValues}
          onSelectedValuesChange={onSelectedValuesChange}
        >
          <RecordRow value={value} data-anchor={slots.get("row")}>
            <RowParts
              dataset={dataset}
              item={item}
              state={state}
              hidden={hidden}
              anchors={slots}
              cardContainer={stage}
              onOpen={handleSpecimenChange}
            />
          </RecordRow>
        </RecordList>
        <ListFooter
          dataset={dataset}
          state={state}
          count={count}
          hintId={hintIds.centre}
          selectedCount={selectedValues.length}
          anchor={slots.get("footer")}
          onClearSelection={() => onSelectedValuesChange([])}
        />
      </div>
    ),
  }
}

function CardSpecimen({
  children,
}: {
  children: (container: HTMLElement | null) => React.ReactNode
}) {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null)
  return (
    <div ref={setContainer} className="relative pb-24">
      {children(container)}
    </div>
  )
}

function ItemPageHead<TItem>({ dataset, item }: { dataset: Dataset<TItem>; item: TItem }) {
  return (
    <div className="flex flex-col gap-1 py-1">
      <span className="inline-flex items-center gap-1 font-medium text-[0.6875rem] text-muted-foreground">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={12} strokeWidth={1.75} aria-hidden="true" />
        Back to {dataset.noun}
      </span>
      <span className="mt-1 text-muted-foreground tabular-nums">{dataset.key(item)}</span>
      <span className="text-balance font-semibold text-sm">{dataset.name(item)}</span>
    </div>
  )
}

function StatesView<TItem>({
  dataset,
  state,
  items,
  hidden,
}: {
  dataset: Dataset<TItem>
  state: FixtureState
  items: ReadonlyArray<TItem>
  hidden: Hidden
}) {
  const item = items[0]
  if (item === undefined) {
    throw new Error(`The ${dataset.item} set is empty; the states view needs one ${dataset.item}.`)
  }
  switch (state) {
    case "error":
      return <ErrorMessage dataset={dataset} />
    case "loading":
      return (
        <StatesSection
          title="Loading"
          description="One RecordRowLoading per expected item; each part draws a bar in its own column"
        >
          <div className={listSurface}>
            <RecordList aria-label={`${capitalise(dataset.noun)}, loading`} aria-busy="true">
              <RecordRowLoading className="border-b-0">
                <RowParts dataset={dataset} item={item} state="loaded" hidden={hidden} />
              </RecordRowLoading>
            </RecordList>
          </div>
        </StatesSection>
      )
    case "loaded":
    case "partial":
    case "no-permission":
      return (
        <div className="flex flex-col gap-12">
          <StatesSection
            title="Row states"
            description="One row at rest and in each state the list draws on it"
          >
            <div className="grid gap-4">
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
          </StatesSection>
          <StatesSection title="Narrow widths" description="Truncate, then abbreviate, then hide">
            <div className="grid gap-4 overflow-x-auto pb-1">
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
          </StatesSection>
        </div>
      )
  }
}

function StatesSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  const headingId = React.useId()
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <header>
        <h2 id={headingId} className="font-semibold text-base tracking-tight">
          {title}
        </h2>
        <p className="mt-1 text-pretty text-muted-foreground text-sm">{description}</p>
      </header>
      {children}
    </section>
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
