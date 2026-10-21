import { Popover } from "@base-ui/react/popover"
import { sampleRecordDetails as details } from "@workspace/fixtures/record-details.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@workspace/registry/components/preview-card.tsx"
import * as React from "react"
import { PeopleGroup, PeoplePopup, PersonAvatar, PersonCard } from "./avatar.tsx"
import { Bullet, BulletLabel } from "./bullet.tsx"
import { Bar, ErrorMessage, RetryLink } from "./wireframe-parts.tsx"

/** The centre parts of the people panel that a constellation connector ends on, by part number. */
export type PeopleAnchors = Readonly<{
  owner?: number
  assignee?: number
  reviewers?: number
  watchers?: number
}>

const AnchorsContext = React.createContext<PeopleAnchors | null>(null)

/**
 * Draws the people panel inside it at rest for a constellation: nothing opens, and the parts named
 * in `anchors` carry `data-anchor` for the connectors.
 */
export function PeopleDrawingAnchors({
  anchors,
  children,
}: {
  anchors: PeopleAnchors
  children: React.ReactNode
}): React.ReactElement {
  return <AnchorsContext.Provider value={anchors}>{children}</AnchorsContext.Provider>
}

const properties = ["Owner", "Assignee", "Reviewers", "Watchers"] as const

const panelClass = "w-80 max-w-full rounded-md border p-4"

const listClass =
  "mt-4 grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-related gap-y-1 [&_dd]:flex [&_dd]:min-h-7 [&_dd]:min-w-0 [&_dd]:items-center [&_dt]:text-muted-foreground [&_dt]:text-xs"

/** The wireframe this experiment renders for `state`: the people on a record, drawn as avatars. */
export function AvatarLockup({ state }: { state: FixtureState }): React.ReactElement {
  switch (state) {
    case "error":
      return (
        <div className="w-80 max-w-full">
          <ErrorMessage subject="The record's people" />
        </div>
      )
    case "loading":
      return <PeopleLoading />
    case "loaded":
    case "partial":
    case "no-permission":
      return <PeoplePanel state={state} />
  }
}

function PeopleLoading(): React.ReactElement {
  return (
    <section aria-label="People, loading" aria-busy="true" className={panelClass}>
      <Bar className="w-16" />
      <dl className={listClass}>
        {properties.map((name) => (
          <React.Fragment key={name}>
            <dt>{name}</dt>
            <dd className="gap-related">
              <span className="size-5 rounded-full bg-muted" />
              <Bar className="w-20" />
            </dd>
          </React.Fragment>
        ))}
      </dl>
    </section>
  )
}

/** The people on a record: an owner beside their name, an assignee alone, and two groups. */
export function PeoplePanel({
  state,
}: {
  state: "loaded" | "partial" | "no-permission"
}): React.ReactElement {
  const titleId = React.useId()
  const anchors = React.use(AnchorsContext)
  const values: Readonly<Record<(typeof properties)[number], React.ReactNode>> = {
    Owner: (
      <Bullet size="lg" data-anchor={anchors?.owner}>
        <PersonAvatar person={details.owner} />
        <BulletLabel>{details.owner.name}</BulletLabel>
      </Bullet>
    ),
    Assignee: <AssigneeAvatar />,
    Reviewers: <ReviewersBullet />,
    Watchers:
      state === "partial" ? (
        <span data-anchor={anchors?.watchers} className="flex items-center gap-related text-sm">
          Could not load
          <RetryLink className="min-h-6 underline underline-offset-2 pointer-coarse:min-h-11" />
        </span>
      ) : state === "no-permission" ? (
        <span data-anchor={anchors?.watchers} className="text-sm">
          {details.watchers.length} watchers
        </span>
      ) : (
        <WatchersGroup />
      ),
  }
  return (
    <section aria-labelledby={titleId} className={panelClass}>
      <h2 id={titleId} className="font-medium text-sm">
        People
      </h2>
      <dl className={listClass}>
        {properties.map((name) => (
          <React.Fragment key={name}>
            <dt>{name}</dt>
            <dd>{values[name]}</dd>
          </React.Fragment>
        ))}
      </dl>
      {state === "no-permission" ? (
        <p className="mt-4 text-muted-foreground text-xs">
          Only members of the Security team can see who is watching.
        </p>
      ) : null}
    </section>
  )
}

function AssigneeAvatar() {
  const anchors = React.use(AnchorsContext)
  const assignee = details.assignee
  if (anchors !== null) {
    return (
      <span data-anchor={anchors.assignee} className="flex min-h-6 items-center">
        <PersonAvatar person={assignee} size="lg" />
      </span>
    )
  }
  return (
    <PreviewCard>
      <PreviewCardTrigger
        render={<a href={assignee.profileUrl} />}
        className="focus-ring rounded-full pointer-coarse:min-h-11 pointer-coarse:min-w-11"
      >
        <PersonAvatar person={assignee} size="lg" />
        <span className="sr-only">{assignee.name}</span>
      </PreviewCardTrigger>
      <PreviewCardContent>
        <PersonCard person={assignee} />
      </PreviewCardContent>
    </PreviewCard>
  )
}

const hoverTrigger = <Popover.Trigger openOnHover delay={300} closeDelay={0} />

function ReviewersBullet() {
  const anchors = React.use(AnchorsContext)
  return (
    <Popover.Root>
      <Bullet
        size="lg"
        data-anchor={anchors?.reviewers}
        render={anchors === null ? hoverTrigger : undefined}
      >
        <PeopleGroup people={details.reviewers} />
        <BulletLabel>{details.reviewers.length} reviewers</BulletLabel>
      </Bullet>
      <PeoplePopup title="Reviewers" people={details.reviewers} />
    </Popover.Root>
  )
}

function WatchersGroup() {
  const anchors = React.use(AnchorsContext)
  return (
    <Popover.Root>
      <PeopleGroup
        size="lg"
        people={details.watchers}
        label={`${details.watchers.length} watchers`}
        render={anchors === null ? hoverTrigger : undefined}
      />
      <PeoplePopup title="Watchers" people={details.watchers} />
    </Popover.Root>
  )
}
