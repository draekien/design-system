import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import {
  List,
  ListGroup,
  ListGroupAdd,
  ListGroupCount,
  ListGroupHeader,
  ListGroupName,
  ListGroupRows,
  ListGroupTrigger,
  ListPeek,
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
import { Status, StatusMedia, StatusName } from "@workspace/registry/components/status.tsx"
import * as React from "react"
import { flushSync } from "react-dom"
import { cn } from "@/lib/cn.ts"
import { Kbd } from "../kbd.tsx"
import { textLink } from "../lockup-styles.ts"
import {
  capitalise,
  type Dataset,
  factProps,
  groupItems,
  type Hidden,
  hasCard,
  type ItemGroup,
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
  const [added, setAdded] = React.useState<ReadonlyArray<TItem>>([])
  const [expandedValues, setExpandedValues] = React.useState<ReadonlyArray<string>>(() =>
    dataset.groups.map((group) => group.value)
  )
  const listRef = React.useRef<HTMLDivElement>(null)
  const hintId = React.useId()
  const peekId = React.useId()
  const allItems = [...added, ...items]
  const groups = groupItems(dataset, allItems)
  const peeked = allItems.find((item) => dataset.value(item) === peekValue) ?? null
  const opened = allItems.find((item) => dataset.value(item) === openValue) ?? null

  function handleOpen(value: string) {
    setPeekValue(null)
    setOpenValue(value)
  }

  function focusRow(value: string) {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-slot="list-row-link"][data-value="${value}"]`)
      ?.focus()
  }

  function handleBack(value: string) {
    flushSync(() => setOpenValue(null))
    focusRow(value)
  }

  function handleAdd(group: string) {
    const draft = dataset.draft(group, allItems)
    flushSync(() => {
      setAdded((previous) => [draft, ...previous])
      setExpandedValues((previous) => (previous.includes(group) ? previous : [...previous, group]))
    })
    focusRow(dataset.value(draft))
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
      <div ref={listRef} hidden={opened !== null}>
        {state === "loading" ? (
          <List aria-label={`${capitalise(dataset.noun)}, loading`} aria-busy="true">
            {groupItems(dataset, items).map((group) => (
              <React.Fragment key={group.value}>
                <LoadingGroupHeader group={group} hidden={hidden} />
                {group.items.map((item) => (
                  <ListRowLoading key={dataset.value(item)}>
                    <RowParts dataset={dataset} item={item} state="loaded" hidden={hidden} />
                  </ListRowLoading>
                ))}
              </React.Fragment>
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
            expandedValues={expandedValues}
            onExpandedValuesChange={setExpandedValues}
          >
            {groups.map((group) => (
              <ListGroup
                key={group.value}
                value={group.value}
                values={group.items.map((item) => dataset.value(item))}
              >
                <GroupHeader group={group} hidden={hidden} onAdd={() => handleAdd(group.value)} />
                <ListGroupRows>
                  {group.items.map((item) => (
                    <ListRow key={dataset.value(item)} value={dataset.value(item)}>
                      <RowParts
                        dataset={dataset}
                        item={item}
                        state={state}
                        hidden={hidden}
                        peekId={dataset.value(item) === peekValue ? peekId : undefined}
                        onOpen={handleOpen}
                      />
                    </ListRow>
                  ))}
                </ListGroupRows>
              </ListGroup>
            ))}
            <ListPeek id={peekId} aria-label="Peek">
              {peeked !== null && (
                <PeekContent dataset={dataset} item={peeked} state={state} onOpen={handleOpen} />
              )}
            </ListPeek>
          </List>
        )}
        <ListFooter
          dataset={dataset}
          state={state}
          count={allItems.length}
          hintId={hintId}
          selectedCount={selectedValues.length}
          isSelectable={!hidden.has("select")}
          onClearSelection={() => setSelectedValues([])}
        />
      </div>
    </>
  )
}

export function GroupHeader({
  group,
  hidden,
  anchors,
  className,
  revealClassName,
  onAdd,
}: {
  group: ItemGroup<unknown>
  hidden: Hidden
  anchors?: RowAnchors
  className?: string
  revealClassName?: string
  onAdd?: () => void
}) {
  return (
    <ListGroupHeader data-anchor={anchors?.get("group-header")} className={className}>
      {!hidden.has("select") && (
        <ListRowSelect className={revealClassName} data-anchor={anchors?.get("group-select")} />
      )}
      <ListGroupTrigger data-anchor={anchors?.get("group-trigger")}>
        <GroupName group={group} anchor={anchors?.get("group-name")} />
        <ListGroupCount data-anchor={anchors?.get("group-count")}>
          {group.items.length}
        </ListGroupCount>
      </ListGroupTrigger>
      <ListGroupAdd
        className={revealClassName}
        data-anchor={anchors?.get("group-add")}
        onClick={onAdd}
      />
    </ListGroupHeader>
  )
}

export function LoadingGroupHeader({
  group,
  hidden,
  anchor,
}: {
  group: ItemGroup<unknown>
  hidden: Hidden
  anchor?: number
}) {
  return (
    <ListRowLoading data-anchor={anchor}>
      {!hidden.has("select") && <ListRowSelect />}
      <ListGroupTrigger>
        <GroupName group={group} />
        <ListGroupCount>{group.items.length}</ListGroupCount>
      </ListGroupTrigger>
    </ListRowLoading>
  )
}

function GroupName({ group, anchor }: { group: ItemGroup<unknown>; anchor?: number }) {
  return (
    <ListGroupName data-anchor={anchor}>
      <Status>
        <StatusMedia fill={group.fill} />
        <StatusName>{group.name}</StatusName>
      </Status>
    </ListGroupName>
  )
}

export function RowParts<TItem>({
  dataset,
  item,
  state,
  hidden,
  peekId,
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
  peekId?: string
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
        aria-controls={peekId}
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
          <ListRowName data-anchor={anchors?.get("name")}>{dataset.name(item)}</ListRowName>
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
  isSelectable,
  anchor,
  onClearSelection,
}: {
  dataset: Dataset<TItem>
  state: ListState
  count: number
  hintId: string
  selectedCount: number
  isSelectable: boolean
  anchor?: number
  onClearSelection: () => void
}) {
  return (
    <div
      data-anchor={anchor}
      className={cn(
        "flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1.5 pr-2 text-muted-foreground text-xs",
        isSelectable ? "pl-9 pointer-coarse:pl-14" : "pl-3"
      )}
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
      <span
        id={hintId}
        className={cn("ml-auto pointer-coarse:hidden", state === "loading" && "invisible")}
      >
        <Kbd>Space</Kbd> peek <Separator /> <Kbd>↑</Kbd> <Kbd>↓</Kbd> move <Separator />{" "}
        <Kbd>←</Kbd> <Kbd>→</Kbd> group <Separator />{" "}
        {isSelectable ? (
          <>
            <Kbd>X</Kbd> select <Separator />{" "}
          </>
        ) : null}
        <Kbd>Enter</Kbd> open
      </span>
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
    <div className="flex flex-col items-start gap-section">
      <div className="flex flex-col gap-related">
        <p className="text-muted-foreground text-xs tabular-nums">{dataset.key(item)}</p>
        <h2 className="text-balance font-semibold">{dataset.name(item)}</h2>
      </div>
      <ItemFields dataset={dataset} item={item} state={state} />
      <a
        href={`#${value}`}
        onClick={(event) => {
          event.preventDefault()
          onOpen(value)
        }}
        className={cn(textLink, "text-xs")}
      >
        Open {dataset.key(item)}
      </a>
    </div>
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
    <article className={cn(listSurface, "flex max-w-2xl flex-col items-start gap-section text-sm")}>
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 inline-flex min-h-6 items-center gap-1 rounded-sm px-1 font-medium text-muted-foreground text-xs hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={1.75} aria-hidden="true" />
        Back to {dataset.noun}
      </button>
      <div className="flex flex-col gap-related">
        <p className="text-muted-foreground text-xs tabular-nums">{dataset.key(item)}</p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-balance font-semibold text-xl tracking-tight outline-none"
        >
          {dataset.name(item)}
        </h2>
      </div>
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
    <div className="flex flex-col gap-section">
      <p className="max-w-prose text-pretty text-sm leading-relaxed">{dataset.summary(item)}</p>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-related text-xs">
        {dataset.fields(item, state).map((field) => (
          <React.Fragment key={field.label}>
            <dt className="text-muted-foreground">{field.label}</dt>
            <dd className="tabular-nums">{field.value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
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
        className="mt-5 inline-flex min-h-9 items-center rounded-sm border bg-background px-4 font-medium text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
      >
        Retry
      </Link>
    </section>
  )
}

export type RowAnchors = ReadonlyMap<string, number>
