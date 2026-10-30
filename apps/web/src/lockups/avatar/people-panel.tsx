import { Popover } from "@base-ui/react/popover"
import { Link } from "@tanstack/react-router"
import {
  sampleRecordDetails as details,
  type SamplePerson,
} from "@workspace/fixtures/record-details.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import * as React from "react"
import { PeopleGroup, PeoplePopup, PersonEntity, PersonLink } from "./people.tsx"
import { type RecordPeople, samplePeople } from "./people-data.ts"

/** The centre parts of the panel that a constellation connector ends on, by part number. */
export type PeopleAnchors = Readonly<{
  assignee?: number
  owner?: number
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

const properties = ["Assignee", "Owner", "Reviewers", "Watchers"] as const

type Property = (typeof properties)[number]

const sectionClass = "flex w-full min-w-0 flex-col gap-related text-sm"

const listClass =
  "grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-related gap-y-run [&_dd]:flex [&_dd]:min-h-8 [&_dd]:min-w-0 [&_dd]:items-center [&_dt]:font-medium [&_dt]:text-muted-foreground [&_dt]:text-xs"

const retryClass =
  "focus-ring inline-flex min-h-6 items-center rounded-floor font-medium text-foreground underline underline-offset-4 pointer-coarse:min-h-11"

function PanelSection({ busy, children }: { busy?: boolean; children: React.ReactNode }) {
  const titleId = React.useId()
  return (
    <section aria-labelledby={titleId} aria-busy={busy} className={sectionClass}>
      <h2 id={titleId} className="font-semibold text-sm">
        People
      </h2>
      {children}
    </section>
  )
}

function Retry({ children }: { children: React.ReactNode }) {
  return (
    <Link to="." search={(previous) => ({ ...previous, state: "loaded" })} className={retryClass}>
      {children}
    </Link>
  )
}

/** The people panel this lockup renders in `state`. */
export function PeoplePanelLockup({
  state,
  people = samplePeople,
}: {
  state: FixtureState
  people?: RecordPeople
}): React.ReactElement {
  switch (state) {
    case "error":
      return <PeopleError />
    case "loading":
      return <PeopleLoading />
    case "loaded":
    case "partial":
    case "no-permission":
      return <PeoplePanel state={state} people={people} />
  }
}

function PeopleError() {
  return (
    <PanelSection>
      <div role="alert" className="flex flex-col items-start gap-related">
        <p className="font-medium">The people on {details.recordId} could not load.</p>
        <p className="text-pretty text-muted-foreground">
          The request timed out after 10 seconds. Retry, or check your connection and reload the
          page.
        </p>
        <Retry>Retry</Retry>
      </div>
    </PanelSection>
  )
}

function PeopleLoading() {
  return (
    <PanelSection busy>
      <dl className={listClass}>
        {properties.map((name) => (
          <React.Fragment key={name}>
            <dt>{name}</dt>
            <dd className="gap-related">
              <span className="size-6 shrink-0 rounded-full bg-foreground/8 motion-safe:animate-pulse" />
              <span className="h-2 w-24 rounded-floor bg-foreground/8 motion-safe:animate-pulse" />
            </dd>
          </React.Fragment>
        ))}
      </dl>
    </PanelSection>
  )
}

const empty: Readonly<Record<Exclude<Property, "Owner">, string>> = {
  Assignee: "Unassigned",
  Reviewers: "None",
  Watchers: "None",
}

function Empty({ property }: { property: Exclude<Property, "Owner"> }) {
  return <span className="text-muted-foreground">{empty[property]}</span>
}

/** The people on a record: the assignee and owner by name, then the reviewers and watchers. */
export function PeoplePanel({
  state,
  people,
}: {
  state: "loaded" | "partial" | "no-permission"
  people: RecordPeople
}): React.ReactElement {
  const anchors = React.use(AnchorsContext)
  const values: Readonly<Record<Property, React.ReactNode>> = {
    Assignee:
      people.assignee === null ? (
        <Empty property="Assignee" />
      ) : (
        <Person person={people.assignee} anchor={anchors?.assignee} />
      ),
    Owner: <Person person={people.owner} anchor={anchors?.owner} />,
    Reviewers: <Group title="Reviewers" people={people.reviewers} anchor={anchors?.reviewers} />,
    Watchers:
      state === "partial" ? (
        <span data-anchor={anchors?.watchers} className="flex items-center gap-related">
          <span className="text-muted-foreground">Could not load.</span>
          <Retry>Retry</Retry>
        </span>
      ) : state === "no-permission" ? (
        <span data-anchor={anchors?.watchers} className="text-muted-foreground tabular-nums">
          {people.watchers.length}
        </span>
      ) : (
        <Group title="Watchers" people={people.watchers} anchor={anchors?.watchers} />
      ),
  }
  return (
    <PanelSection>
      <dl className={listClass}>
        {properties.map((name) => (
          <React.Fragment key={name}>
            <dt>{name}</dt>
            <dd>{values[name]}</dd>
          </React.Fragment>
        ))}
      </dl>
      {state === "no-permission" ? (
        <p className="text-pretty text-muted-foreground text-xs">
          Only members of the Security team can see who is watching. Ask a Security team admin for
          access.
        </p>
      ) : null}
    </PanelSection>
  )
}

function Person({ person, anchor }: { person: SamplePerson; anchor: number | undefined }) {
  const anchors = React.use(AnchorsContext)
  if (anchors !== null) {
    return (
      <span data-anchor={anchor} className="flex min-h-6 min-w-0 items-center">
        <PersonEntity person={person} />
      </span>
    )
  }
  return <PersonLink person={person} />
}

const hoverTrigger = <Popover.Trigger openOnHover delay={300} />

function Group({
  title,
  people,
  anchor,
}: {
  title: "Reviewers" | "Watchers"
  people: ReadonlyArray<SamplePerson>
  anchor: number | undefined
}) {
  const anchors = React.use(AnchorsContext)
  if (people.length === 0) {
    return <Empty property={title} />
  }
  return (
    <Popover.Root>
      <PeopleGroup
        size="lg"
        people={people}
        label={`${people.length} ${title.toLowerCase()}`}
        data-anchor={anchor}
        render={anchors === null ? hoverTrigger : undefined}
      />
      <PeoplePopup title={title} people={people} />
    </Popover.Root>
  )
}
