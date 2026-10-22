import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import {
  List,
  ListRow,
  ListRowDescription,
  ListRowFact,
  ListRowId,
  ListRowLink,
  ListRowLoading,
  ListRowMedia,
  ListRowName,
  ListRowSelect,
  ListRowSubject,
} from "@workspace/registry/components/list.tsx"
import * as React from "react"
import { flushSync } from "react-dom"
import { cn } from "@/lib/cn.ts"
import { Kbd } from "../kbd.tsx"
import { textLink } from "../lockup-styles.ts"
import {
  capitalise,
  type Dataset,
  factProps,
  type Hidden,
  hasCard,
  listSurface,
  type RowState,
  shownFacts,
} from "./datasets.tsx"

export type ListState = Exclude<FixtureState, "error">

export function ListLockup<TItem>({
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
      ?.querySelector<HTMLElement>(`[data-slot="list-row-link"][data-value="${value}"]`)
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
            <List aria-label={`${capitalise(dataset.noun)}, loading`} aria-busy="true">
              {items.map((item) => (
                <ListRowLoading key={dataset.value(item)}>
                  <RowParts dataset={dataset} item={item} state="loaded" hidden={hidden} />
                </ListRowLoading>
              ))}
            </List>
          ) : (
            <List
              aria-label={capitalise(dataset.noun)}
              aria-describedby={hintId}
              peekValue={peekValue}
              onPeekValueChange={setPeekValue}
              selectedValues={selectedValues}
              onSelectedValuesChange={setSelectedValues}
            >
              {items.map((item) => (
                <React.Fragment key={dataset.value(item)}>
                  <ListRow value={dataset.value(item)}>
                    <RowParts
                      dataset={dataset}
                      item={item}
                      state={state}
                      hidden={hidden}
                      peekIds={`${inlinePeekId} ${panelPeekId}`}
                      onOpen={setOpenValue}
                    />
                  </ListRow>
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
            </List>
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

export function RowParts<TItem>({
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
        <ListRowSelect className={selectClassName} data-anchor={anchors?.get("select")} />
      )}
      <ListRowLink
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
        <ListRowSubject data-anchor={anchors?.get("subject")}>
          {!hidden.has("key") && (
            <ListRowId narrow={dataset.keyNarrow} data-anchor={anchors?.get("key")}>
              {dataset.key(item)}
            </ListRowId>
          )}
          {dataset.media !== undefined && !hidden.has(dataset.media.part) && (
            <ListRowMedia data-anchor={anchors?.get(dataset.media.part)}>
              {dataset.media.render(item, {
                ...context,
                withCard: hasCard(dataset.media, hidden),
              })}
            </ListRowMedia>
          )}
          <ListRowName className={nameClassName} data-anchor={anchors?.get("name")}>
            {dataset.name(item)}
          </ListRowName>
          {!hidden.has("description") && (
            <ListRowDescription data-anchor={anchors?.get("description")}>
              {dataset.summary(item)}
            </ListRowDescription>
          )}
        </ListRowSubject>
        {shownFacts(dataset, hidden).map((fact) => (
          <ListRowFact
            key={fact.part}
            narrow={fact.narrow}
            data-anchor={anchors?.get(fact.part)}
            {...factProps(fact, item, { ...context, withCard: hasCard(fact, hidden) })}
          />
        ))}
      </ListRowLink>
    </>
  )
}

export function ListFooter<TItem>({
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

export function PeekContent<TItem>({
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

export function ErrorMessage<TItem>({
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

export type RowAnchors = ReadonlyMap<string, number>
