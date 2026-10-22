import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import {
  List,
  ListRow,
  ListRowDescription,
  ListRowFact,
  ListRowId,
  ListRowLoading,
  ListRowMedia,
  ListRowName,
  ListRowSelect,
} from "@workspace/registry/components/list.tsx"
import * as React from "react"
import { cn } from "@/lib/cn.ts"
import {
  capitalise,
  type Dataset,
  type FactDefinition,
  factProps,
  type Hidden,
  hasCard,
  invoicesDataset,
  listSurface,
  type RowState,
  recordsDataset,
  shownFacts,
} from "../lockups/list/datasets.tsx"
import {
  ErrorMessage,
  ListFooter,
  ListLockup,
  PeekContent,
  RowParts,
} from "../lockups/list/list-lockup.tsx"
import { CardSpecimen } from "./card-specimen.tsx"
import {
  Constellation,
  type ConstellationGroup,
  type ConstellationPart,
  type Drawing,
} from "./constellation.tsx"
import type { CanvasOptions } from "./playground-search.ts"
import { StatesSection } from "./states-section.tsx"

/** The list constellation, drawn in the docs page rather than in a canvas frame. */
export function ListConstellation({
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

export function ListCanvas({ options }: { options: CanvasOptions }): React.ReactElement {
  const hidden = React.useMemo(() => new Set(options.hide), [options.hide])
  return (
    <main className="p-4 sm:p-6">
      <h1 className="sr-only">List</h1>
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
        <ListLockup
          key={`${dataset.id}-${options.state}`}
          dataset={dataset}
          state={options.state}
          items={items}
          hidden={hidden}
        />
      )
  }
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
    name: "List",
    depth: 0,
    note: "aria-busy; one ListRowLoading per expected item",
  })
  add("row", {
    name: "ListRowLoading",
    depth: 1,
    note: "Same parts as ListRow; each part draws a bar in its own column",
    specimen: (
      <List aria-label={`${capitalise(dataset.noun)}, loading`} aria-busy="true">
        <ListRowLoading className="border-b-0 px-0">
          <RowParts dataset={dataset} item={item} state="loaded" hidden={hidden} />
        </ListRowLoading>
      </List>
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
        <List aria-label={`${capitalise(dataset.noun)}, loading`} aria-busy="true">
          <ListRowLoading data-anchor={slots.get("row")}>
            <RowParts dataset={dataset} item={item} state="loaded" hidden={hidden} />
          </ListRowLoading>
        </List>
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
  const facts = shownFacts(dataset, hidden)
  const media =
    dataset.media !== undefined && !hidden.has(dataset.media.part) ? dataset.media : undefined
  const carded = [...(media === undefined ? [] : [media]), ...facts].filter(
    (fact) => hasCard(fact, hidden) && (fact.cardStates?.includes(state) ?? true)
  )
  const cardOf = (fact: FactDefinition<TItem>) => (carded.includes(fact) ? fact.card : undefined)

  add("list", { name: "List", depth: 0, note: "One tab stop; ↑ ↓ Home End, Space, X, Esc" })
  add("row", {
    name: "ListRow",
    depth: 1,
    note: "One item: the select slot, then the link holding ranks 1 and 2",
  })
  if (!hidden.has("select")) {
    add("select", {
      name: "ListRowSelect",
      depth: 2,
      note: "24×24, 44×44 on a coarse pointer; not a tab stop",
      specimen: (
        <PartRow dataset={dataset} item={item} selected>
          <ListRowSelect className="visible" />
        </PartRow>
      ),
    })
  }
  add("link", {
    name: "ListRowLink",
    depth: 2,
    note: "Rank 5: the row's one focus target; render your router's link through render",
    specimen: <ItemPageHead dataset={dataset} item={item} />,
  })
  add("subject", { name: "ListRowSubject", depth: 3, note: "Rank 1: what the row is about" })
  if (!hidden.has("key")) {
    add("key", {
      name: "ListRowId",
      depth: 4,
      note: narrowNote[dataset.keyNarrow],
      specimen: (
        <PartRow dataset={dataset} item={item}>
          <ListRowId>{dataset.key(item)}</ListRowId>
        </PartRow>
      ),
    })
  }
  if (media !== undefined) {
    add(media.part, {
      name: "ListRowMedia",
      depth: 4,
      note: `${media.label}, a ${media.content}: 24×24, the name read by screen readers only`,
      specimen: (
        <PartRow dataset={dataset} item={item}>
          <ListRowMedia>{media.render(item, { state, withCard: false })}</ListRowMedia>
        </PartRow>
      ),
    })
    const card = cardOf(media)
    if (card !== undefined) {
      add(card, {
        name: "PreviewCard",
        depth: 5,
        note: `Rank 4: ${media.label.toLowerCase()} detail, opened 300ms after the pointer enters`,
        specimen: (
          <CardSpecimen>
            {(container) => (
              <PartRow dataset={dataset} item={item}>
                <ListRowMedia>
                  {media.render(item, {
                    state,
                    withCard: true,
                    cardOpen: true,
                    cardContainer: container,
                  })}
                </ListRowMedia>
              </PartRow>
            )}
          </CardSpecimen>
        ),
      })
    }
  }
  add("name", {
    name: "ListRowName",
    depth: 4,
    note: "Takes the width it needs; truncates after the description; never hidden",
    specimen: (
      <PartRow dataset={dataset} item={item}>
        <ListRowName>{dataset.name(item)}</ListRowName>
      </PartRow>
    ),
  })
  if (!hidden.has("description")) {
    add("description", {
      name: "ListRowDescription",
      depth: 4,
      note: "One muted line; fills the remaining width, truncates first, hidden below 640px",
      specimen: (
        <PartRow dataset={dataset} item={item}>
          <ListRowDescription className="col-span-full pl-0">
            {dataset.summary(item)}
          </ListRowDescription>
        </PartRow>
      ),
    })
  }
  for (const fact of facts) {
    add(fact.part, {
      name: "ListRowFact",
      depth: 3,
      note: `Rank 2: ${fact.label}, a ${fact.content}; ${narrowNote[fact.narrow]}`,
      specimen: (
        <PartRow dataset={dataset} item={item}>
          <ListRowFact className="pl-0" {...factProps(fact, item, { state, withCard: false })} />
        </PartRow>
      ),
    })
    const card = cardOf(fact)
    if (card !== undefined) {
      add(card, {
        name: "PreviewCard",
        depth: 4,
        note: `Rank 4: ${fact.label.toLowerCase()} detail, opened 300ms after the pointer enters`,
        specimen: (
          <CardSpecimen>
            {(container) => (
              <PartRow dataset={dataset} item={item}>
                <ListRowFact className="col-span-full justify-end pl-0">
                  {fact.render(item, {
                    state,
                    withCard: true,
                    cardOpen: true,
                    cardContainer: container,
                  })}
                </ListRowFact>
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
      title: "Subject",
      rank: 1,
      reveal: "always",
      summary: `What the ${dataset.item} is, at the start of every row`,
      links: [
        ...link("key"),
        ...(media === undefined ? [] : link(media.part)),
        ...link("name"),
        ...link("description"),
      ],
    },
    {
      title: "Fact",
      rank: 2,
      reveal: "always",
      summary: "What the list is scanned for, each value in its own column",
      links: facts.flatMap((fact) => link(fact.part)),
    },
    {
      title: "Enrich",
      rank: 4,
      reveal: "revealed",
      gesture: "Hover 300ms",
      summary:
        "A hover card on the value it describes; peek and the page hold the same fields for keyboard and touch",
      links: carded.flatMap((fact) => (fact.card === undefined ? [] : link(fact.card, fact.part))),
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
        <List
          aria-label={capitalise(dataset.noun)}
          aria-describedby={hintIds.centre}
          selectedValues={selectedValues}
          onSelectedValuesChange={onSelectedValuesChange}
        >
          <ListRow value={value} data-anchor={slots.get("row")}>
            <RowParts
              dataset={dataset}
              item={item}
              state={state}
              hidden={hidden}
              anchors={slots}
              cardContainer={stage}
              onOpen={handleSpecimenChange}
            />
          </ListRow>
        </List>
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
          description="One ListRowLoading per expected item; each part draws a bar in its own column"
        >
          <div className={listSurface}>
            <List aria-label={`${capitalise(dataset.noun)}, loading`} aria-busy="true">
              <ListRowLoading className="border-b-0">
                <RowParts dataset={dataset} item={item} state="loaded" hidden={hidden} />
              </ListRowLoading>
            </List>
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
                    <List aria-label={`${capitalise(dataset.item)} row, ${specimen.label}`}>
                      <ListRow value={dataset.value(item)} className="border-b-0">
                        <RowParts dataset={dataset} item={item} state={state} hidden={hidden} />
                      </ListRow>
                    </List>
                  </div>
                </div>
              ))}
            </div>
          </StatesSection>
        </div>
      )
  }
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
        <List
          aria-label={`${capitalise(dataset.item)} row, ${specimen.label.toLowerCase()}`}
          selectedValues={specimen.isSelected ? [value] : []}
          onSelectedValuesChange={handleSpecimenChange}
          peekValue={specimen.isPeeked ? value : null}
          onPeekValueChange={handleSpecimenChange}
        >
          <ListRow value={value} className={cn("border-b-0", specimen.rowClassName)}>
            <RowParts
              dataset={dataset}
              item={item}
              state={state}
              hidden={hidden}
              nameClassName={specimen.nameClassName}
              selectClassName={isHighlighted ? "visible" : undefined}
            />
          </ListRow>
        </List>
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
    <List
      aria-label={`${dataset.name(item)}, one part`}
      selectedValues={selected ? [value] : []}
      onSelectedValuesChange={handleSpecimenChange}
    >
      <ListRow value={value} className="min-h-11 border-b-0 px-0 hover:bg-transparent">
        {children}
      </ListRow>
    </List>
  )
}
