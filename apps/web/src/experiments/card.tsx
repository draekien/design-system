import { Collapsible } from "@base-ui/react/collapsible"
import { Menu } from "@base-ui/react/menu"
import { mergeProps } from "@base-ui/react/merge-props"
import { Tooltip } from "@base-ui/react/tooltip"
import { useRender } from "@base-ui/react/use-render"
import {
  ArrowRight01Icon,
  Image01Icon,
  LockIcon,
  MoreVerticalIcon,
  PencilEdit01Icon,
  PinIcon,
  Share08Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { outstandingLastMonth, sampleInvoices } from "@workspace/fixtures/invoices.ts"
import {
  type SampleRecordDetails,
  sampleRecordDetails,
} from "@workspace/fixtures/record-details.ts"
import { fixtureNow, type SampleRecord, sampleRecords } from "@workspace/fixtures/records.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import { Entity, EntityMedia, EntityName } from "@workspace/registry/components/entity.tsx"
import { Figure } from "@workspace/registry/components/figure.tsx"
import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@workspace/registry/components/preview-card.tsx"
import { RelativeTime } from "@workspace/registry/components/relative-time.tsx"
import * as React from "react"
import { cn } from "@/lib/cn.ts"
import { ownerEntity, recordStatus } from "../lockups/list/datasets.tsx"
import { focusRing, menuDivider, menuItem, menuSurface } from "../lockups/table/table-styles.ts"
import { worstMetrics, worstRecordDetails, worstRecords } from "./card-worst-cases.ts"
import { Bar, ErrorMessage, RetryLink } from "./wireframe-parts.tsx"

const cardClass = cn(
  "group/card @container relative isolate grid min-w-0 grid-cols-1 gap-x-related gap-y-related rounded-card border bg-card p-3 text-card-foreground text-sm",
  "*:col-span-full has-[>[data-slot=card-aside]]:grid-cols-[minmax(50%,1fr)_auto]",
  "*:data-[slot=card-aside]:col-[2] *:data-[slot=card-aside]:row-[1]",
  "has-[>[data-slot=card-subject]>[data-slot=card-media]]:*:data-[slot=card-aside]:mt-[calc(100cqw*9/16+var(--spacing-related))]",
  "has-[>[data-slot=card-aside]]:*:not-data-[slot=card-aside]:first:col-[1] [&>[data-slot=card-aside]:first-child+*]:col-[1]",
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit]",
  "has-[[data-slot=card-link]]:hover:before:bg-foreground/4",
  "has-[[data-slot=card-link]:focus-visible]:before:bg-foreground/4 has-[[data-slot=card-link]:focus-visible]:inset-ring has-[[data-slot=card-link]:focus-visible]:inset-ring-ring/40"
)

/** A record's ranks in one container: 12px padding, the card radius, a hairline border and no shadow. */
export function Card({
  render,
  className,
  ...props
}: useRender.ComponentProps<"div">): React.ReactElement {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: cn(cardClass, className) }, props),
  })
}

/** Rank 1: an optional picture, then the ID, the name and a one-line description, in that order, at the top of the card. */
export function CardSubject({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      data-slot="card-subject"
      className={cn("flex min-w-0 flex-col *:data-[slot=card-media]:mb-related", className)}
      {...props}
    />
  )
}

const coarseGap = "pointer-coarse:gap-[calc(var(--spacing-hit-coarse)-var(--spacing-hit-min))]"

const revealedActions =
  "grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity] duration-quick ease-out group-hover/card:grid-cols-[1fr] group-hover/card:opacity-100 group-focus-within/card:grid-cols-[1fr] group-focus-within/card:opacity-100 has-data-popup-open:grid-cols-[1fr] has-data-popup-open:opacity-100 pointer-coarse:grid-cols-[1fr] pointer-coarse:opacity-100 motion-reduce:transition-none"

/**
 * The slot at the top right of the card, beside its first other part. `children` always show: a
 * change, a word or an icon. `actions` show on card hover, focus or open menu and always on a coarse
 * pointer; as they appear the children slide toward the card's middle, and slide back as they hide.
 * The slot keeps the width of both, so the part beside it never reflows. `Card` places the slot
 * wherever it is rendered and adds its column only when it is present.
 */
export function CardAside({
  actions,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { actions?: React.ReactNode }): React.ReactElement {
  const gap = children === undefined ? null : "ps-related"
  const shown =
    children === undefined ? null : (
      <div className="flex min-w-0 max-w-[33cqw] justify-end">{children}</div>
    )
  const hasActions = actions !== undefined && actions !== null && actions !== false
  return (
    <div
      data-slot="card-aside"
      className={cn("pointer-events-none relative z-10 grid min-h-6 min-w-0 text-end", className)}
      {...props}
    >
      {hasActions ? (
        <div
          aria-hidden="true"
          inert
          className="invisible col-start-1 row-start-1 flex min-w-0 items-start"
        >
          {shown}
          <div className={cn("flex shrink-0 gap-run", coarseGap, gap)}>{actions}</div>
        </div>
      ) : null}
      <div className="col-start-1 row-start-1 flex min-w-0 items-start justify-end *:pointer-events-auto">
        {shown}
        {hasActions ? (
          <div className={revealedActions}>
            <div
              className={cn(
                "flex min-w-0 gap-run overflow-clip pointer-coarse:overflow-visible",
                coarseGap,
                gap
              )}
            >
              {actions}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

const mediaClass = "aspect-video w-[100cqw] max-w-none shrink-0 rounded-floor bg-muted"

/**
 * The picture a caller recognises the record by, first in `CardSubject`: the card's full width at
 * 16:9, cropped to fill, with the floor radius; a `CardAside` moves below it, beside the ID.
 * `alt` defaults to empty because the name below it names the record. A record
 * with no picture, a picture the caller may not see, and a picture that fails to load each draw an
 * empty 16:9 box naming why, so every card in a run keeps its name on the same line.
 */
export function CardMedia(
  props:
    | { kind: "picture"; src: string; alt?: string; "data-anchor"?: number }
    | { kind: "missing"; reason: "No picture" | "Hidden"; "data-anchor"?: number }
): React.ReactElement {
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null)
  if (props.kind === "picture" && failedSrc !== props.src) {
    const { src } = props
    return (
      <img
        data-slot="card-media"
        data-anchor={props["data-anchor"]}
        src={src}
        alt={props.alt ?? ""}
        loading="lazy"
        decoding="async"
        ref={(node) => {
          if (node?.complete && node.naturalWidth === 0) setFailedSrc(src)
        }}
        onError={() => setFailedSrc(src)}
        className={cn(mediaClass, "object-cover")}
      />
    )
  }
  return (
    <div
      data-slot="card-media"
      data-anchor={props["data-anchor"]}
      className={cn(
        mediaClass,
        "flex flex-col items-center justify-center gap-1 text-muted-foreground text-xs"
      )}
    >
      <HugeiconsIcon icon={Image01Icon} size={16} strokeWidth={1.75} aria-hidden="true" />
      <CardMissing>{props.kind === "missing" ? props.reason : "Unavailable"}</CardMissing>
    </div>
  )
}

/** The record's ID in muted tabular figures. */
export function CardId({ className, ...props }: React.ComponentProps<"span">): React.ReactElement {
  return (
    <span
      data-slot="card-id"
      className={cn("text-muted-foreground text-xs tabular-nums", className)}
      {...props}
    />
  )
}

/** The record's name, at most two lines. */
export function CardName({ className, ...props }: React.ComponentProps<"h3">): React.ReactElement {
  return (
    <h3
      data-slot="card-name"
      dir="auto"
      className={cn("line-clamp-2 wrap-break-word font-medium text-sm", className)}
      {...props}
    />
  )
}

/** One line after the name; it truncates. */
export function CardDescription({
  className,
  ...props
}: React.ComponentProps<"p">): React.ReactElement {
  return (
    <p
      data-slot="card-description"
      dir="auto"
      className={cn("truncate text-muted-foreground text-xs", className)}
      {...props}
    />
  )
}

/**
 * Rank 5: the link to the record's own page, rendered inside `CardName`. Its hit area covers the
 * card, so a click anywhere on the card except a control follows it.
 */
export function CardLink({ className, ...props }: React.ComponentProps<"a">): React.ReactElement {
  return (
    <a
      data-slot="card-link"
      className={cn(
        "outline-hidden after:absolute after:inset-0 after:rounded-card hover:underline hover:underline-offset-2",
        className
      )}
      {...props}
    />
  )
}

const FactsLayoutContext = React.createContext<"row" | "labelled">("row")

/**
 * Rank 2: the facts the surface compares. `"row"` draws them on one line in the same order on every
 * card, with each property's name read by screen readers only; `"labelled"` draws one per line
 * after its property's name, with the values on one left edge.
 */
export function CardFacts({
  layout = "row",
  className,
  ...props
}: React.ComponentProps<"dl"> & { layout?: "row" | "labelled" }): React.ReactElement {
  return (
    <FactsLayoutContext.Provider value={layout}>
      <dl
        data-slot="card-facts"
        className={cn(
          layout === "row"
            ? "flex min-w-0 items-center gap-x-3 text-xs"
            : "grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-1",
          className
        )}
        {...props}
      />
    </FactsLayoutContext.Provider>
  )
}

const abbreviateClass =
  "min-w-0 @max-3xs:**:data-[abbreviation=long]:sr-only @max-3xs:**:data-[abbreviation=short]:inline"

const narrowClass = {
  keep: "shrink-0",
  abbreviate: abbreviateClass,
  hide: `${abbreviateClass} shrink-0 @max-[13rem]:hidden`,
} as const

/**
 * One fact: `label` names its property, and the child is one status, entity, figure or relative
 * time. In a row, a narrow card abbreviates a fact marked `"abbreviate"` or `"hide"` and drops one
 * marked `"hide"`; the record's page still shows it.
 */
export function CardFact({
  label,
  narrow = "keep",
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  label: string
  narrow?: keyof typeof narrowClass
  children: React.ReactNode
}): React.ReactElement {
  const layout = React.use(FactsLayoutContext)
  const value =
    typeof children === "string" ? <span className="truncate">{children}</span> : children
  return (
    <div
      data-slot="card-fact"
      className={cn(
        layout === "row"
          ? cn("flex min-h-6 items-center", narrowClass[narrow])
          : "col-span-2 grid h-6 grid-cols-subgrid items-center *:last:overflow-clip *:last:whitespace-nowrap *:last:[overflow-clip-margin:4px]",
        className
      )}
      {...props}
    >
      <dt className={layout === "row" ? "sr-only" : "text-muted-foreground text-xs"}>{label}</dt>
      <dd className="flex min-w-0">{value}</dd>
    </div>
  )
}

/** Rank 3: content read on some visits, behind a trigger that names it and stays on screen at rest. */
export function CardExplain({
  trigger,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  trigger: string
  children: React.ReactNode
}): React.ReactElement {
  return (
    <Collapsible.Root data-slot="card-explain" className="flex flex-col items-start" {...props}>
      <Collapsible.Trigger className="group/explain relative z-10 -ms-1 inline-flex min-h-6 cursor-pointer items-center gap-1 rounded-floor px-1 text-muted-foreground text-xs hover:bg-foreground/7 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:min-h-11">
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={14}
          strokeWidth={1.75}
          aria-hidden="true"
          className="group-data-panel-open/explain:rotate-90 motion-safe:transition-transform rtl:-scale-x-100 rtl:group-data-panel-open/explain:-rotate-90"
        />
        {trigger}
      </Collapsible.Trigger>
      <Collapsible.Panel
        dir="auto"
        hiddenUntilFound
        className="relative z-10 wrap-break-word pt-1 text-muted-foreground text-xs"
      >
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
  )
}

const retryClass = "min-h-6 underline underline-offset-2 pointer-coarse:min-h-11"

function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-xs">{children}</p>
}

/** A rank 2 value the caller cannot see, in its slot: "Unavailable" or "Hidden". */
export function CardMissing({ children }: { children: string }): React.ReactElement {
  return <span className="text-muted-foreground">{children}</span>
}

/** The centre parts of a record card that a constellation connector ends on, by part number. */
export type CardAnchors = Readonly<{
  card: number
  subject: number
  media: number
  id: number
  name: number
  description: number
  facts: number
  fact: number
  explain: number
  owner: number
}>

type FactsState = "loaded" | "partial" | "no-permission"

function OwnerFact({
  record,
  state,
  anchor,
}: {
  record: SampleRecord
  state: FactsState
  anchor: number | undefined
}) {
  switch (state) {
    case "partial":
      return <CardMissing>Unavailable</CardMissing>
    case "no-permission":
      return <CardMissing>Hidden</CardMissing>
    case "loaded":
      return anchor === undefined ? (
        <PreviewCard>
          <PreviewCardTrigger className="relative z-10 justify-start">
            {ownerEntity(record.owner)}
          </PreviewCardTrigger>
          <PreviewCardContent>
            <p className="font-medium">{record.owner}</p>
            <p className="mt-1 text-muted-foreground">Owner · {record.team} team</p>
          </PreviewCardContent>
        </PreviewCard>
      ) : (
        <span data-anchor={anchor} className="flex min-w-0">
          {ownerEntity(record.owner)}
        </span>
      )
  }
}

const pictureBase = `${
  // biome-ignore lint/suspicious/noUndeclaredEnvVars: Vite derives BASE_URL from base, which turbo hashes through SITE_BASE_PATH
  import.meta.env.BASE_URL
}experiments/card/`

const pictures: Readonly<Record<string, string>> = {
  "REC-104": `${pictureBase}rec-104.svg`,
  "REC-103": `${pictureBase}rec-103.svg`,
  "REC-102": `${pictureBase}rec-102.svg`,
  "REC-100004231": `${pictureBase}portrait.svg`,
  "REC-100004230": `${pictureBase}panorama.svg`,
  "REC-100004229": `${pictureBase}rec-102.svg`,
}

const failingPicture = "REC-103"

function RecordMedia({
  record,
  state,
  anchor,
}: {
  record: SampleRecord
  state: FactsState
  anchor: number | undefined
}) {
  if (state === "no-permission") {
    return <CardMedia kind="missing" reason="Hidden" data-anchor={anchor} />
  }
  const src = pictures[record.id]
  if (src === undefined) {
    return <CardMedia kind="missing" reason="No picture" data-anchor={anchor} />
  }
  const fails = state === "partial" && record.id === failingPicture
  return (
    <CardMedia
      kind="picture"
      src={fails ? `${pictureBase}unreachable.svg` : src}
      data-anchor={anchor}
    />
  )
}

/** One record at rest: its picture and rank 1 head with the link to its page, three facts in a row and its summary one click away. */
export function RecordCard({
  record,
  state,
  anchors,
  render,
}: {
  record: SampleRecord
  state: FactsState
  anchors?: CardAnchors
  render?: useRender.ComponentProps<"div">["render"]
}): React.ReactElement {
  return (
    <Card render={render} data-anchor={anchors?.card}>
      <CardSubject data-anchor={anchors?.subject}>
        <RecordMedia record={record} state={state} anchor={anchors?.media} />
        <CardId data-anchor={anchors?.id}>{record.id}</CardId>
        <CardName data-anchor={anchors?.name}>
          <CardLink href={`#${record.id}`}>{record.title}</CardLink>
        </CardName>
        <CardDescription data-anchor={anchors?.description}>{record.team}</CardDescription>
      </CardSubject>
      <CardFacts data-anchor={anchors?.facts}>
        <CardFact label="Status" data-anchor={anchors?.fact}>
          {recordStatus(record)}
        </CardFact>
        <CardFact label="Owner" narrow="abbreviate">
          <OwnerFact record={record} state={state} anchor={anchors?.owner} />
        </CardFact>
        <CardFact label="Updated" narrow="hide">
          <RelativeTime dateTime={record.updatedIso} now={fixtureNow} />
        </CardFact>
      </CardFacts>
      <div data-anchor={anchors?.explain} className="flex">
        <CardExplain trigger="Summary">{record.summary}</CardExplain>
      </div>
    </Card>
  )
}

/** A record card while it loads: bars in place of the ID, name and facts. */
export function RecordCardLoading({
  render,
}: {
  render?: useRender.ComponentProps<"div">["render"]
}): React.ReactElement {
  return (
    <Card render={render} aria-hidden="true">
      <span className={mediaClass} />
      <div className="flex flex-col gap-2 py-1">
        <Bar className="w-14" />
        <Bar className="w-40" />
        <Bar className="w-20" />
      </div>
      <div className="flex min-h-6 items-center gap-3">
        <Bar className="w-16" />
        <Bar className="w-20" />
        <Bar className="w-12" />
      </div>
      <div className="flex min-h-6 items-center">
        <Bar className="w-16" />
      </div>
    </Card>
  )
}

const gridClass =
  "grid grid-cols-[repeat(auto-fill,minmax(min(18rem,100%),1fr))] items-start gap-related"

function Records({
  state,
  records,
  label,
}: {
  state: FixtureState
  records: ReadonlyArray<SampleRecord>
  label: string
}) {
  switch (state) {
    case "error":
      return <ErrorMessage subject="The records" />
    case "loading":
      return (
        <ul aria-label={`${label}, loading`} aria-busy="true" className={gridClass}>
          {records.map((record) => (
            <RecordCardLoading key={record.id} render={<li />} />
          ))}
        </ul>
      )
    case "loaded":
    case "partial":
    case "no-permission":
      if (records.length === 0) {
        return <Note>No records yet. A record shows here once someone creates it.</Note>
      }
      return (
        <div className="flex flex-col gap-related">
          {state === "partial" ? (
            <Note>
              {records.some((record) => record.id === failingPicture)
                ? "Owners and one picture could not load."
                : "Owners could not load."}{" "}
              <RetryLink className={retryClass} />
            </Note>
          ) : null}
          {state === "no-permission" ? (
            <Note>
              Owners and pictures are hidden: only members of a record's team can see them.
            </Note>
          ) : null}
          <ul aria-label={label} className={gridClass}>
            {records.map((record) => (
              <RecordCard key={record.id} record={record} state={state} render={<li />} />
            ))}
          </ul>
        </div>
      )
  }
}

function recordOf(details: SampleRecordDetails, records: ReadonlyArray<SampleRecord>) {
  const found = records.find((sample) => sample.id === details.recordId)
  if (found === undefined) {
    throw new Error(`No sample record has the id ${details.recordId}.`)
  }
  return found
}

const summaryRecord = recordOf(sampleRecordDetails, sampleRecords)
const worstSummaryRecord = recordOf(worstRecordDetails, worstRecords)

/** One record's properties: its head, then each fact after its property's name. Nothing links out. */
export function SummaryCard({
  state,
  record = summaryRecord,
  details = sampleRecordDetails,
}: {
  state: FixtureState
  record?: SampleRecord
  details?: SampleRecordDetails
}): React.ReactElement {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const workspaceRef = React.useRef<HTMLAnchorElement>(null)
  if (state === "error") {
    return <ErrorMessage subject="The record's properties" />
  }
  const loading = state === "loading"
  const rows: ReadonlyArray<{ label: string; value: React.ReactNode }> = [
    { label: "Status", value: recordStatus(record) },
    { label: "Priority", value: details.priority },
    {
      label: "Assignee",
      value:
        state === "partial" ? (
          <CardMissing>Unavailable</CardMissing>
        ) : (
          <Entity>
            <EntityMedia>{details.assignee.initials}</EntityMedia>
            <EntityName>{details.assignee.name}</EntityName>
          </Entity>
        ),
    },
    {
      label: "Workspace",
      value:
        state === "no-permission" ? (
          <CardMissing>Hidden</CardMissing>
        ) : (
          <PreviewCard>
            <PreviewCardTrigger ref={workspaceRef} className="w-full min-w-0 justify-start">
              <span className="truncate">{details.workspace}</span>
            </PreviewCardTrigger>
            <PreviewCardContent
              side="right"
              align="center"
              sideOffset={pastCardEdge(workspaceRef, cardRef)}
              collisionAvoidance={besideCard}
            >
              <p className="text-muted-foreground">Workspace</p>
              <p className="mt-1 font-medium">{details.workspace}</p>
            </PreviewCardContent>
          </PreviewCard>
        ),
    },
    { label: "Due", value: details.dueAt },
  ]
  return (
    <Card
      ref={cardRef}
      render={<section aria-busy={loading} aria-label={`${record.title} properties`} />}
    >
      <CardSubject>
        <CardId>{loading ? <Bar className="my-1 w-14" /> : record.id}</CardId>
        <CardName>{loading ? <Bar className="my-1 w-40" /> : record.title}</CardName>
      </CardSubject>
      <CardFacts layout="labelled">
        {rows.map((row) => (
          <CardFact key={row.label} label={row.label}>
            {loading ? <Bar className="w-20" /> : row.value}
          </CardFact>
        ))}
      </CardFacts>
      {state === "partial" ? (
        <Note>
          The assignee could not load. <RetryLink className={retryClass} />
        </Note>
      ) : null}
      {state === "no-permission" ? (
        <Note>The workspace is hidden: only {details.workspaceRestrictedTo} can open it.</Note>
      ) : null}
    </Card>
  )
}

const outstanding = sampleInvoices
  .filter((invoice) => invoice.status === "sent")
  .reduce((sum, invoice) => sum + invoice.amount * (1 - invoice.paid), 0)

const aud = { style: "currency", currency: "AUD" } as const

const audFormat = new Intl.NumberFormat("en", aud)

const fullFigureMaxLength = 12

const besideCard = { side: "flip", align: "shift", fallbackAxisSide: "end" } as const

function pastCardEdge(
  trigger: React.RefObject<HTMLElement | null>,
  card: React.RefObject<HTMLElement | null>
) {
  return ({ side }: { side: string }): number => {
    if (
      trigger.current === null ||
      card.current === null ||
      (side !== "left" && side !== "right")
    ) {
      return belowTrigger.sideOffset
    }
    const anchor = trigger.current.getBoundingClientRect()
    const edge = card.current.getBoundingClientRect()
    return (side === "left" ? anchor.left - edge.left : edge.right - anchor.right) + 6
  }
}

const belowTrigger = { side: "bottom", align: "start", sideOffset: 4 } as const

const compactClass = "*:data-[abbreviation=long]:sr-only *:data-[abbreviation=short]:inline"

const change = {
  style: "percent",
  signDisplay: "exceptZero",
  maximumFractionDigits: 1,
} as const

/** One figure at the top left and its change against the previous month at the top right, then the metric's name and unit. */
export function MetricCard({
  state,
  amount = outstanding,
  previous = outstandingLastMonth,
}: {
  state: FixtureState
  amount?: number
  previous?: number
}): React.ReactElement {
  if (state === "error") {
    return <ErrorMessage subject="Outstanding invoices" />
  }
  const loading = state === "loading"
  return (
    <Card render={<section aria-busy={loading} aria-label="Outstanding invoices" />}>
      <CardFacts>
        <CardFact label="Amount">
          {loading ? (
            <Bar className="my-2 w-28" />
          ) : state === "no-permission" ? (
            <CardMissing>Hidden</CardMissing>
          ) : (
            <Figure
              value={amount}
              format={aud}
              className={cn(
                "ms-0 font-semibold text-2xl",
                audFormat.format(amount).length > fullFigureMaxLength && compactClass
              )}
            />
          )}
        </CardFact>
      </CardFacts>
      <CardAside>
        <CardFacts>
          <CardFact label="Change">
            {loading ? (
              <Bar className="w-16" />
            ) : state !== "loaded" ? (
              <CardMissing>{state === "partial" ? "Unavailable" : "Hidden"}</CardMissing>
            ) : (
              <PreviewCard>
                <PreviewCardTrigger className="relative z-10">
                  {previous === 0 ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="font-medium text-muted-foreground text-sm"
                      >
                        —
                      </span>
                      <span className="sr-only">No percentage: September was A$0.00</span>
                    </>
                  ) : (
                    <>
                      <Figure
                        value={(amount - previous) / previous}
                        format={change}
                        className="ms-0 font-medium text-sm"
                      />
                      <span className="sr-only"> vs September</span>
                    </>
                  )}
                </PreviewCardTrigger>
                <PreviewCardContent {...belowTrigger}>
                  <p className="font-medium">
                    {previous === 0 ? "No percentage to show" : "Change against September"}
                  </p>
                  <dl className="mt-1 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 text-muted-foreground">
                    <dt>October</dt>
                    <dd className="flex">
                      <Figure value={amount} format={aud} className="text-foreground" />
                    </dd>
                    <dt>September</dt>
                    <dd className="flex">
                      <Figure value={previous} format={aud} className="text-foreground" />
                    </dd>
                  </dl>
                  {previous === 0 ? (
                    <p className="mt-1 text-muted-foreground">
                      A change from A$0.00 has no percentage.
                    </p>
                  ) : null}
                </PreviewCardContent>
              </PreviewCard>
            )}
          </CardFact>
        </CardFacts>
      </CardAside>
      <CardSubject>
        <CardName>Outstanding</CardName>
        <CardDescription>Unpaid on sent invoices, AUD</CardDescription>
      </CardSubject>
      {state === "partial" ? (
        <Note>
          September's total could not load. <RetryLink className={retryClass} />
        </Note>
      ) : null}
      {state === "no-permission" ? (
        <Note>Amounts are hidden: only the Finance team can see them.</Note>
      ) : null}
    </Card>
  )
}

/** The wireframe this experiment renders for `state`: record cards in a grid, a summary card and a metric card. */
export function CardLockup({ state }: { state: FixtureState }): React.ReactElement {
  return (
    <div className="flex flex-col gap-section">
      <section className="flex flex-col gap-related">
        <h2 className="font-medium text-sm">Records</h2>
        <Records state={state} records={sampleRecords} label="Records" />
      </section>
      <div className="flex flex-wrap items-start gap-section">
        <section className="flex w-80 max-w-full flex-col gap-related">
          <h2 className="font-medium text-sm">Summary</h2>
          <SummaryCard state={state} />
        </section>
        <section className="flex w-64 max-w-full flex-col gap-related">
          <h2 className="font-medium text-sm">Metric</h2>
          <MetricCard state={state} />
        </section>
      </div>
      {state === "loaded" || state === "partial" || state === "no-permission" ? (
        <WorstCase state={state} />
      ) : null}
    </div>
  )
}

function WorstCase({ state }: { state: FactsState }) {
  return (
    <section className="flex flex-col gap-related">
      <h2 className="font-medium text-sm">Worst case</h2>
      <Records state={state} records={worstRecords} label="Worst-case records" />
      <Records state={state} records={[]} label="No records" />
      <AsideSpecimens media={false} />
      <AsideSpecimens media />
      <div className="flex flex-wrap items-start gap-section">
        <div className="w-80 max-w-full">
          <SummaryCard state={state} record={worstSummaryRecord} details={worstRecordDetails} />
        </div>
        {worstMetrics.map((metric) => (
          <div key={metric.amount} className="w-64 max-w-full">
            <MetricCard state={state} amount={metric.amount} previous={metric.previous} />
          </div>
        ))}
      </div>
    </section>
  )
}

const coarseHit =
  "relative pointer-coarse:after:absolute pointer-coarse:after:-inset-[calc((var(--spacing-hit-coarse)-var(--spacing-hit-min))/2)]"

const iconButton = cn(
  "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-floor text-muted-foreground hover:bg-foreground/7 hover:text-foreground",
  coarseHit,
  focusRing
)

const textButton = cn(
  "inline-flex h-6 shrink-0 cursor-pointer items-center rounded-floor px-1.5 font-medium text-xs hover:bg-foreground/7",
  coarseHit,
  focusRing
)

function IconAction({ label, icon }: { label: string; icon: typeof PinIcon }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        delay={300}
        render={<button type="button" aria-label={label} className={iconButton} />}
      >
        <HugeiconsIcon icon={icon} size={16} strokeWidth={1.75} aria-hidden="true" />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="top" sideOffset={4} className="z-popover">
          <Tooltip.Popup className="rounded-floor bg-foreground px-1.5 py-0.5 text-background text-xs">
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

function MoreActions({ actions }: { actions: ReadonlyArray<string> }) {
  return (
    <Menu.Root>
      <Menu.Trigger aria-label="More actions" className={iconButton}>
        <HugeiconsIcon icon={MoreVerticalIcon} size={16} strokeWidth={1.75} aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner {...belowTrigger} className="z-popover">
          <Menu.Popup className={menuSurface}>
            {actions.map((action) => (
              <Menu.Item key={action} className={menuItem}>
                {action}
              </Menu.Item>
            ))}
            <Menu.Separator className={menuDivider} />
            <Menu.Item className={cn(menuItem, "text-destructive")}>Delete</Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

function AsideText({ children, detail }: { children: string; detail: string }) {
  return (
    <PreviewCard>
      <PreviewCardTrigger className="min-w-0 justify-end">
        <span dir="auto" className="truncate text-muted-foreground text-xs">
          {children}
        </span>
      </PreviewCardTrigger>
      <PreviewCardContent {...belowTrigger}>
        <p className="font-medium">{children}</p>
        <p className="mt-1 text-muted-foreground">{detail}</p>
      </PreviewCardContent>
    </PreviewCard>
  )
}

const asideSpecimens: ReadonlyArray<{
  label: string
  media: React.ComponentProps<typeof CardMedia>
  aside: React.ReactElement
}> = [
  {
    label: "One text action",
    media: { kind: "picture", src: `${pictureBase}rec-104.svg` },
    aside: (
      <CardAside
        actions={
          <button type="button" className={textButton}>
            Edit
          </button>
        }
      />
    ),
  },
  {
    label: "One icon action",
    media: { kind: "picture", src: `${pictureBase}panorama.svg` },
    aside: <CardAside actions={<IconAction label="Pin" icon={PinIcon} />} />,
  },
  {
    label: "Two actions, then a menu holding the rest",
    media: { kind: "picture", src: `${pictureBase}portrait.svg` },
    aside: (
      <CardAside
        actions={
          <>
            <IconAction label="Edit" icon={PencilEdit01Icon} />
            <IconAction label="Share" icon={Share08Icon} />
            <MoreActions actions={["Duplicate", "Pin", "Archive"]} />
          </>
        }
      />
    ),
  },
  {
    label: "Long text",
    media: { kind: "picture", src: `${pictureBase}rec-102.svg` },
    aside: (
      <CardAside>
        <AsideText detail="Finance approved on 14 Oct; Legal has not reviewed it yet.">
          Awaiting approval from Finance and Legal
        </AsideText>
      </CardAside>
    ),
  },
  {
    label: "Icon",
    media: { kind: "missing", reason: "No picture" },
    aside: (
      <CardAside>
        <PreviewCard>
          <PreviewCardTrigger className="text-muted-foreground">
            <HugeiconsIcon icon={LockIcon} size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className="sr-only">Restricted</span>
          </PreviewCardTrigger>
          <PreviewCardContent {...belowTrigger}>
            <p className="font-medium">Restricted</p>
            <p className="mt-1 text-muted-foreground">Only the Governance team can open it.</p>
          </PreviewCardContent>
        </PreviewCard>
      </CardAside>
    ),
  },
  {
    label: "Text and a menu",
    media: { kind: "missing", reason: "Hidden" },
    aside: (
      <CardAside actions={<MoreActions actions={["Edit", "Share"]} />}>
        <AsideText detail="Not shared with anyone yet.">Draft</AsideText>
      </CardAside>
    ),
  },
]

function AsideSpecimens({ media }: { media: boolean }) {
  return (
    <ul aria-label={media ? "Card aside with media" : "Card aside"} className={gridClass}>
      {asideSpecimens.map((specimen) => (
        <li key={specimen.label} className="flex flex-col gap-related">
          <p className="text-muted-foreground text-xs">{specimen.label}</p>
          <Card>
            <CardSubject>
              {media ? <CardMedia {...specimen.media} /> : null}
              <CardId>{worstSummaryRecord.id}</CardId>
              <CardName>
                <CardLink href={`#${worstSummaryRecord.id}`}>{worstSummaryRecord.title}</CardLink>
              </CardName>
              <CardDescription>{worstSummaryRecord.team}</CardDescription>
            </CardSubject>
            {specimen.aside}
            <CardFacts>
              <CardFact label="Status">{recordStatus(worstSummaryRecord)}</CardFact>
            </CardFacts>
          </Card>
        </li>
      ))}
    </ul>
  )
}
