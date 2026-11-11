import { Menu } from "@base-ui/react/menu"
import { Tooltip } from "@base-ui/react/tooltip"
import type { useRender } from "@base-ui/react/use-render"
import {
  LockIcon,
  MoreVerticalIcon,
  PencilEdit01Icon,
  PinIcon,
  Share08Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { fixtureNow, type SampleRecord, sampleRecords } from "@workspace/fixtures/records.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import type * as React from "react"
import {
  Card,
  CardAction,
  CardAside,
  CardDescription,
  CardExplain,
  CardFact,
  CardFacts,
  CardId,
  CardLink,
  CardMedia,
  CardMissing,
  CardName,
  CardSubject,
} from "@/components/card.tsx"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"
import { RelativeTime } from "@/components/relative-time.tsx"
import { cn } from "@/lib/cn.ts"
import { Bar, ErrorMessage, RetryLink } from "../../experiments/wireframe-parts.tsx"
import { ownerEntity, recordStatus } from "../list/datasets.tsx"
import { menuDivider, menuItem, menuSurface } from "../table/table-styles.ts"
import { belowTrigger, retryClass } from "./card-styles.ts"
import { worstRecords } from "./card-worst-cases.ts"

const loadingMedia =
  "aspect-video w-(--card-media-width) max-w-none shrink-0 rounded-floor bg-muted"

/** A muted line above or inside the cards that states what is missing and why. */
export function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-xs">{children}</p>
}

/** The centre parts of a record card that a constellation connector ends on, by part number. */
type CardAnchors = Readonly<{
  card: number
  subject: number
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
      return <CardMissing>Owner unavailable</CardMissing>
    case "no-permission":
      return <CardMissing>Owner hidden</CardMissing>
    case "loaded":
      return anchor === undefined ? (
        <PreviewCard>
          <PreviewCardTrigger className="relative z-raised justify-start">
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
}lockups/record-card/`

const pictures: Readonly<Record<string, string>> = {
  "REC-104": `${pictureBase}rec-104.svg`,
  "REC-103": `${pictureBase}rec-103.svg`,
  "REC-102": `${pictureBase}rec-102.svg`,
  "REC-100004231": `${pictureBase}portrait.svg`,
  "REC-100004230": `${pictureBase}panorama.svg`,
  "REC-100004229": `${pictureBase}rec-102.svg`,
}

const failingPicture = "REC-103"

function RecordMedia({ record, state }: { record: SampleRecord; state: FactsState }) {
  if (state === "no-permission") {
    return <CardMedia kind="missing" reason="Hidden" />
  }
  const src = pictures[record.id]
  if (src === undefined) {
    return <CardMedia kind="missing" reason="No picture" />
  }
  const fails = state === "partial" && record.id === failingPicture
  return <CardMedia kind="picture" src={fails ? `${pictureBase}unreachable.svg` : src} />
}

/** One record at rest: its picture and rank 1 head with the link to its page, three facts in a row and its summary one click away. */
export function RecordCard({
  record,
  state,
  media,
  anchors,
  render,
}: {
  record: SampleRecord
  state: FactsState
  /** Draws the record's picture; pass it only where callers recognise records by their pictures. */
  media: boolean
  anchors?: CardAnchors
  render?: useRender.ComponentProps<"div">["render"]
}): React.ReactElement {
  return (
    <Card render={render} data-anchor={anchors?.card}>
      <CardSubject data-anchor={anchors?.subject}>
        {media ? <RecordMedia record={record} state={state} /> : null}
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
  media,
  render,
}: {
  media: boolean
  render?: useRender.ComponentProps<"div">["render"]
}): React.ReactElement {
  return (
    <Card render={render} aria-hidden="true">
      {media ? <span className={loadingMedia} /> : null}
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

/** The records as cards in a grid, or the loading, error or empty line in their place. */
export function Records({
  state,
  records,
  label,
  media,
}: {
  state: FixtureState
  records: ReadonlyArray<SampleRecord>
  label: string
  media: boolean
}) {
  switch (state) {
    case "error":
      return <ErrorMessage subject="The records" />
    case "loading":
      return (
        <ul aria-label={`${label}, loading`} aria-busy="true" className={gridClass}>
          {records.map((record) => (
            <RecordCardLoading key={record.id} media={media} render={<li />} />
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
              {media && records.some((record) => record.id === failingPicture)
                ? "Owners and one picture could not load."
                : "Owners could not load."}{" "}
              <RetryLink className={retryClass} />
            </Note>
          ) : null}
          {state === "no-permission" ? (
            <Note>
              {media ? "Owners and pictures are hidden" : "Owners are hidden"}: only members of a
              record's team can see them.
            </Note>
          ) : null}
          <ul aria-label={label} className={gridClass}>
            {records.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                state={state}
                media={media}
                render={<li />}
              />
            ))}
          </ul>
        </div>
      )
  }
}

/** The record card lockup: the sample records in a grid, 8px apart, without pictures, since callers do not recognise these records by their pictures. */
export function RecordCardLockup({ state }: { state: FixtureState }): React.ReactElement {
  return <Records state={state} records={sampleRecords} label="Records" media={false} />
}

const narrowCards = [
  { label: "240px: the owner shows as initials", width: "w-60" },
  { label: "200px: the update time is dropped", width: "w-50" },
] as const

/** The record cards at the widths where the owner abbreviates and the update time is dropped. */
export function NarrowRecordCards({ state }: { state: FactsState }): React.ReactElement {
  const record = sampleRecords[0]
  if (record === undefined) {
    throw new Error("The narrow record cards need a sample record.")
  }
  return (
    <ul aria-label="Narrow cards" className="flex flex-wrap items-start gap-related">
      {narrowCards.map((narrow) => (
        <li key={narrow.width} className={cn("flex flex-col gap-related", narrow.width)}>
          <p className="text-muted-foreground text-xs">{narrow.label}</p>
          <RecordCard record={record} state={state} media />
        </li>
      ))}
    </ul>
  )
}

/** The States view: the narrow widths, worst-case records, an empty run and every aside, in the given state. */
export function RecordCardStates({ state }: { state: FixtureState }): React.ReactElement {
  if (state === "loading" || state === "error") {
    return <RecordCardLockup state={state} />
  }
  return (
    <section className="flex flex-col gap-related">
      <h2 className="font-medium text-sm">Worst case</h2>
      <NarrowRecordCards state={state} />
      <Records state={state} records={worstRecords} label="Worst-case records" media />
      <Records state={state} records={[]} label="No records" media={false} />
      <AsideSpecimens media={false} />
      <AsideSpecimens media />
    </section>
  )
}

function IconAction({ label, icon }: { label: string; icon: typeof PinIcon }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger delay={300} render={<CardAction aria-label={label} />}>
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
      <Menu.Trigger aria-label="More actions" render={<CardAction />}>
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

const asideRecord = firstWorstRecord()

function firstWorstRecord() {
  const found = worstRecords[0]
  if (found === undefined) {
    throw new Error("The aside specimens need a worst-case record.")
  }
  return found
}

const asideSpecimens: ReadonlyArray<{
  label: string
  media: React.ComponentProps<typeof CardMedia>
  aside: React.ReactElement
}> = [
  {
    label: "One text action",
    media: { kind: "picture", src: `${pictureBase}rec-104.svg` },
    aside: <CardAside actions={<CardAction>Edit</CardAction>} />,
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
              <CardId>{asideRecord.id}</CardId>
              <CardName>
                <CardLink href={`#${asideRecord.id}`}>{asideRecord.title}</CardLink>
              </CardName>
              <CardDescription>{asideRecord.team}</CardDescription>
            </CardSubject>
            {specimen.aside}
            <CardFacts>
              <CardFact label="Status">{recordStatus(asideRecord)}</CardFact>
            </CardFacts>
          </Card>
        </li>
      ))}
    </ul>
  )
}
