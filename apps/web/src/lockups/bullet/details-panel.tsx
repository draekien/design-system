import { Menu } from "@base-ui/react/menu"
import { Popover } from "@base-ui/react/popover"
import {
  Alert02Icon,
  ArrowUpRight01Icon,
  Calendar03Icon,
  Clock01Icon,
  File02Icon,
  Flag03Icon,
  Folder01Icon,
  SquareLock02Icon,
  Tick02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  sampleRecordDetails as details,
  type RecordPriority,
  recordPriorities,
} from "@workspace/fixtures/record-details.ts"
import { sampleRecords } from "@workspace/fixtures/records.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@workspace/registry/components/preview-card.tsx"
import * as React from "react"
import { Bullet, BulletLabel, BulletMedia } from "@/components/bullet.tsx"
import { cn } from "@/lib/cn.ts"
import { Bar, ErrorMessage, RetryLink } from "../../experiments/wireframe-parts.tsx"
import { PeopleGroup, PeoplePopup } from "../avatar/people.tsx"
import { menuItem, menuSurface } from "../table/table-styles.ts"

const record = detailsRecord()

function detailsRecord() {
  const found = sampleRecords.find((sample) => sample.id === details.recordId)
  if (found === undefined) {
    throw new Error(`No sample record has the id ${details.recordId}.`)
  }
  return found
}

const properties = ["Priority", "Reviewers", "Workspace", "Policy", "Due"] as const

const panelClass = "w-80 max-w-full rounded-card border bg-card p-3 text-card-foreground"

const listClass =
  "mt-4 grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-related gap-y-1 [&_dd]:flex [&_dd]:min-w-0 pointer-coarse:[&_dd]:min-h-hit-coarse [&_dt]:text-muted-foreground [&_dt]:text-xs"

/** The centre parts of the details panel that a constellation connector ends on, by part number. */
export type Anchors = Readonly<{
  media?: number
  stack?: number
  label?: number
  policy?: number
  priority?: number
  reviewers?: number
  workspace?: number
}>

const AnchorsContext = React.createContext<Anchors | null>(null)

/**
 * Draws the details panel inside it at rest for a constellation: each bullet opens nothing, and
 * the parts named in `anchors` carry `data-anchor` for the connectors.
 */
export function DrawingAnchors({
  anchors,
  children,
}: {
  anchors: Anchors
  children: React.ReactNode
}): React.ReactElement {
  return <AnchorsContext.Provider value={anchors}>{children}</AnchorsContext.Provider>
}

/** The bullet lockup for `state`: a record's details panel built from bullets. */
export function BulletLockup({ state }: { state: FixtureState }): React.ReactElement {
  switch (state) {
    case "error":
      return <DetailsError />
    case "loading":
      return <DetailsLoading />
    case "loaded":
    case "partial":
    case "no-permission":
      return <DetailsPanel state={state} />
  }
}

/** Says the details panel could not load. */
export function DetailsError(): React.ReactElement {
  return (
    <div className="w-80 max-w-full">
      <ErrorMessage subject="The record's details" />
    </div>
  )
}

/** The details panel while its facts load: each property's name, then a placeholder bullet. */
export function DetailsLoading(): React.ReactElement {
  return (
    <article aria-label="Record details, loading" aria-busy="true" className={panelClass}>
      <Bar className="w-40" />
      <Bar className="mt-2 w-14" />
      <Bar className="mt-4 w-36" />
      <dl className={listClass}>
        {properties.map((name) => (
          <React.Fragment key={name}>
            <dt>{name}</dt>
            <dd className="flex min-h-hit-min items-center gap-related">
              <span className="size-4 rounded-full bg-muted" />
              <Bar className="w-20" />
            </dd>
          </React.Fragment>
        ))}
      </dl>
    </article>
  )
}

/** A record's details panel: one bullet per fact, each a trigger, a link or a plain fact. */
export function DetailsPanel({
  state,
}: {
  state: "loaded" | "partial" | "no-permission"
}): React.ReactElement {
  const titleId = React.useId()
  const canEdit = state !== "no-permission"
  const values: Readonly<Record<(typeof properties)[number], React.ReactNode>> = {
    Priority: <PriorityBullet canEdit={canEdit} />,
    Reviewers: state === "partial" ? <ReviewersFailed /> : <ReviewersBullet />,
    Workspace: <WorkspaceBullet />,
    Policy: <PolicyBullet />,
    Due: (
      <Bullet size="lg">
        <DueContent />
      </Bullet>
    ),
  }
  return (
    <article aria-labelledby={titleId} className={panelClass}>
      <h2 id={titleId} className="font-medium text-sm">
        {record.title}
      </h2>
      <p className="text-muted-foreground text-xs">{details.recordId}</p>
      <RecordMeta />
      <dl className={listClass}>
        {properties.map((name) => (
          <React.Fragment key={name}>
            <dt>{name}</dt>
            <dd>{values[name]}</dd>
          </React.Fragment>
        ))}
      </dl>
      {canEdit ? null : (
        <p className="mt-4 text-muted-foreground text-xs">
          Only {details.owner.name}, the record's owner, can change its priority.
        </p>
      )}
    </article>
  )
}

function RecordMeta() {
  return (
    <p className="mt-2 flex flex-wrap gap-x-4 text-muted-foreground">
      <Bullet>
        <BulletMedia>
          <HugeiconsIcon icon={UserGroupIcon} />
        </BulletMedia>
        <BulletLabel>{record.team}</BulletLabel>
      </Bullet>
      <Bullet>
        <BulletMedia>
          <HugeiconsIcon icon={Clock01Icon} />
        </BulletMedia>
        <BulletLabel>Updated {record.updated}</BulletLabel>
      </Bullet>
    </p>
  )
}

/** The due date after a calendar icon. */
export function DueContent(): React.ReactElement {
  const anchors = React.use(AnchorsContext)
  return (
    <>
      <BulletMedia>
        <HugeiconsIcon icon={Calendar03Icon} />
      </BulletMedia>
      <BulletLabel data-anchor={anchors?.label}>{details.dueAt}</BulletLabel>
    </>
  )
}

/** A document icon, the policy's title, then an icon saying the link opens in a new tab. */
export function PolicyContent(): React.ReactElement {
  return (
    <>
      <BulletMedia>
        <HugeiconsIcon icon={File02Icon} />
      </BulletMedia>
      <BulletLabel>{details.policyTitle}</BulletLabel>
      <BulletMedia label=", opens in a new tab">
        <HugeiconsIcon icon={ArrowUpRight01Icon} />
      </BulletMedia>
    </>
  )
}

function PolicyBullet() {
  const anchors = React.use(AnchorsContext)
  return (
    <Bullet
      size="lg"
      data-anchor={anchors?.policy}
      render={<a href={details.policyUrl} target="_blank" rel="noreferrer" />}
    >
      <PolicyContent />
    </Bullet>
  )
}

/** A flag, then the priority's name. */
export function PriorityContent({ priority }: { priority: RecordPriority }): React.ReactElement {
  const anchors = React.use(AnchorsContext)
  return (
    <>
      <BulletMedia data-anchor={anchors?.media}>
        <HugeiconsIcon icon={Flag03Icon} />
      </BulletMedia>
      <BulletLabel>{priority}</BulletLabel>
    </>
  )
}

function PriorityBullet({ canEdit }: { canEdit: boolean }) {
  const anchors = React.use(AnchorsContext)
  const [priority, setPriority] = React.useState<RecordPriority>(details.priority)

  if (!canEdit || anchors !== null) {
    return (
      <Bullet size="lg" data-anchor={anchors?.priority}>
        <PriorityContent priority={priority} />
      </Bullet>
    )
  }

  return (
    <Menu.Root>
      <Bullet size="lg" render={<Menu.Trigger aria-label={`Change priority, now ${priority}`} />}>
        <PriorityContent priority={priority} />
      </Bullet>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" sideOffset={4} className="z-popover">
          <Menu.Popup className={menuSurface}>
            <Menu.RadioGroup
              value={priority}
              onValueChange={(value) => {
                const next = recordPriorities.find((option) => option === value)
                if (next !== undefined) {
                  setPriority(next)
                }
              }}
            >
              {recordPriorities.map((option) => (
                <Menu.RadioItem
                  key={option}
                  value={option}
                  closeOnClick
                  className={cn(menuItem, "gap-related")}
                >
                  <span className="flex size-4 items-center justify-center">
                    <Menu.RadioItemIndicator>
                      <HugeiconsIcon icon={Tick02Icon} className="size-4" />
                    </Menu.RadioItemIndicator>
                  </span>
                  {option}
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

/** The reviewers' avatars, overlapping, then their count. */
export function ReviewersContent(): React.ReactElement {
  const anchors = React.use(AnchorsContext)
  return (
    <>
      <PeopleGroup data-anchor={anchors?.stack} people={details.reviewers} />
      <BulletLabel>{details.reviewers.length} reviewers</BulletLabel>
    </>
  )
}

function ReviewersBullet() {
  const anchors = React.use(AnchorsContext)
  return (
    <Popover.Root>
      <Bullet
        size="lg"
        data-anchor={anchors?.reviewers}
        render={
          anchors === null ? <Popover.Trigger openOnHover delay={300} closeDelay={0} /> : undefined
        }
      >
        <ReviewersContent />
      </Bullet>
      <PeoplePopup title="Reviewers" people={details.reviewers} />
    </Popover.Root>
  )
}

function ReviewersFailed() {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-related">
      <Bullet size="lg" className="shrink-0">
        <BulletMedia>
          <HugeiconsIcon icon={Alert02Icon} />
        </BulletMedia>
        <BulletLabel>Could not load</BulletLabel>
      </Bullet>
      <RetryLink className="min-h-hit-min text-sm underline underline-offset-2 pointer-coarse:min-h-hit-coarse" />
    </span>
  )
}

/** The workspace's name, then a lock when only some people may open it. */
export function WorkspaceContent(): React.ReactElement {
  return (
    <>
      <BulletMedia>
        <HugeiconsIcon icon={Folder01Icon} />
      </BulletMedia>
      <BulletLabel>{details.workspace}</BulletLabel>
      {details.workspaceRestrictedTo === null ? null : (
        <BulletMedia label=", restricted">
          <HugeiconsIcon icon={SquareLock02Icon} />
        </BulletMedia>
      )}
    </>
  )
}

/** Who may open the workspace, as its hover card says it. */
export function WorkspaceCard(): React.ReactElement {
  return (
    <>
      <p className="font-medium">{details.workspace} workspace</p>
      <p className="mt-1 text-muted-foreground">
        {details.workspaceRestrictedTo === null
          ? "Everyone in the organisation can open it."
          : `Restricted: only ${details.workspaceRestrictedTo} can open it.`}
      </p>
    </>
  )
}

function WorkspaceBullet() {
  const anchors = React.use(AnchorsContext)
  if (anchors !== null) {
    return (
      <Bullet size="lg" data-anchor={anchors.workspace}>
        <WorkspaceContent />
      </Bullet>
    )
  }
  return (
    <PreviewCard>
      <Bullet size="lg" render={<PreviewCardTrigger render={<a href={details.workspaceUrl} />} />}>
        <WorkspaceContent />
      </Bullet>
      <PreviewCardContent>
        <WorkspaceCard />
      </PreviewCardContent>
    </PreviewCard>
  )
}
