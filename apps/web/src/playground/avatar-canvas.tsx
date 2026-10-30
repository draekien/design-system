import type { SamplePerson } from "@workspace/fixtures/record-details.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import * as React from "react"
import { cn } from "@/lib/cn.ts"
import { clipSpecimen } from "../experiments/clip-specimen.tsx"
import {
  PeopleGroup,
  PeoplePopupBody,
  PersonAvatar,
  PersonCard,
} from "../lockups/avatar/people.tsx"
import { emptyPeople, type RecordPeople, samplePeople } from "../lockups/avatar/people-data.ts"
import {
  PeopleDrawingAnchors,
  PeoplePanel,
  PeoplePanelLockup,
} from "../lockups/avatar/people-panel.tsx"
import { popupSurface } from "../lockups/avatar/people-styles.ts"
import { Constellation, type ConstellationGroup, type ConstellationPart } from "./constellation.tsx"
import type { CanvasOptions } from "./playground-search.ts"
import { StatesSection } from "./states-section.tsx"

const railClass = "w-80 max-w-full"

/** The avatar lockup canvas: the people panel in a record's rail, or its States view. */
export function AvatarCanvas({ options }: { options: CanvasOptions }): React.ReactElement {
  return (
    <main className="p-4 sm:p-6">
      <h1 className="sr-only">People</h1>
      {options.view === "states" ? (
        <StatesView state={options.state} />
      ) : (
        <aside aria-label="Record details" className={railClass}>
          <PeoplePanelLockup state={options.state} />
        </aside>
      )}
    </main>
  )
}

const firstNames = ["Ana", "Ben", "Chen", "Dara", "Eli", "Femi", "Gus", "Hana", "Ivo", "Juno"]
const lastNames = ["Abara", "Brandt", "Costa", "Dube", "Engel"]

const manyWatchers: ReadonlyArray<SamplePerson> = lastNames.flatMap((last) =>
  firstNames.map((first) => ({
    name: `${first} ${last}`,
    initials: `${first[0]}${last[0]}`,
    kind: "person" as const,
    summary: "Watcher",
    profileUrl: `https://example.com/people/${first}-${last}`.toLowerCase(),
  }))
)

const securityTeam = samplePeople.watchers.find((person) => person.kind === "team")

if (securityTeam === undefined) {
  throw new Error("The avatar states need a team among the sample watchers.")
}

const valueSpecimens: ReadonlyArray<{ label: string; people: RecordPeople }> = [
  {
    label: "Empty: Unassigned and None",
    people: emptyPeople,
  },
  {
    label: "One watcher; four reviewers draw as four, never +1",
    people: {
      ...samplePeople,
      reviewers: samplePeople.watchers.slice(0, 4),
      watchers: samplePeople.watchers.slice(0, 1),
    },
  },
  {
    label: "Fifty watchers: three, then +47",
    people: { ...samplePeople, watchers: manyWatchers },
  },
  {
    label: "A team as the assignee, and a long name that truncates",
    people: {
      ...samplePeople,
      assignee: securityTeam,
      owner: { ...samplePeople.owner, name: "Evangeline Vandenberghe-Okonkwo" },
    },
  },
]

const narrowSpecimens = [
  { label: "320px: the rail at its usual width", width: "w-80" },
  { label: "240px: names truncate", width: "w-60" },
] as const

const reviewers = samplePeople.reviewers

function StatesView({ state }: { state: FixtureState }) {
  switch (state) {
    case "error":
    case "loading":
      return (
        <StatesSection
          title={state === "error" ? "Error" : "Loading"}
          description={
            state === "error"
              ? "The heading stays; the message says what failed and offers Retry"
              : "Each property's name, then a 24px circle and a bar where its value will be"
          }
        >
          <div className={railClass}>
            <PeoplePanelLockup state={state} />
          </div>
        </StatesSection>
      )
    case "loaded":
    case "partial":
    case "no-permission":
      return (
        <div className="flex flex-col gap-12">
          <StatesSection
            title="Group states"
            description="The reviewers at rest, spread while hovered, focused or open, and open"
          >
            <div className="flex flex-wrap items-start gap-8">
              <Specimen label="At rest">
                <PeopleGroup size="lg" people={reviewers} />
              </Specimen>
              <Specimen label="Hovered, focused or open">
                <PeopleGroup size="lg" people={reviewers} data-spread="" />
              </Specimen>
              <Specimen label="Open">
                <PeoplePopupBody title="Reviewers" people={reviewers} />
              </Specimen>
              <Specimen label="Assignee hover card">
                <div className={popupSurface}>
                  <PersonCard person={samplePeople.assignee ?? samplePeople.owner} />
                </div>
              </Specimen>
            </div>
          </StatesSection>
          {state === "loaded" ? (
            <StatesSection
              title="Values"
              description="Empty values, the group's limits, a team and a long name"
            >
              <div className="flex flex-wrap items-start gap-8">
                {valueSpecimens.map((specimen) => (
                  <Specimen key={specimen.label} label={specimen.label} className={railClass}>
                    <PeoplePanel state={state} people={specimen.people} />
                  </Specimen>
                ))}
              </div>
            </StatesSection>
          ) : null}
          <StatesSection
            title="Narrow widths"
            description="The panel fills its rail; names truncate before they wrap"
          >
            <div className="flex flex-wrap items-start gap-8">
              {narrowSpecimens.map((specimen) => (
                <Specimen
                  key={specimen.label}
                  label={specimen.label}
                  className={cn(specimen.width, "max-w-full")}
                >
                  <PeoplePanel state={state} people={samplePeople} />
                </Specimen>
              ))}
            </div>
          </StatesSection>
        </div>
      )
  }
}

function Specimen({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <p className="text-muted-foreground text-xs">{label}</p>
      {children}
    </div>
  )
}

type Drawing = {
  parts: ReadonlyArray<ConstellationPart>
  groups: ReadonlyArray<ConstellationGroup>
  centre: React.ReactNode
}

/** The people panel drawn as its constellation: the panel at rest with its parts around it. */
export function AvatarConstellation({ state }: { state: FixtureState }): React.ReactElement {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null)
  const drawing = avatarDrawing(state)
  return (
    <Constellation
      key={state}
      label="Avatar constellation"
      stage={stage}
      onStageChange={setStage}
      parts={drawing.parts.map(clipSpecimen)}
      groups={drawing.groups}
      centre={drawing.centre}
    />
  )
}

function avatarDrawing(state: FixtureState): Drawing {
  switch (state) {
    case "error":
    case "loading":
      return {
        parts: [
          {
            n: 1,
            name: "PeoplePanel",
            depth: 0,
            note:
              state === "error"
                ? "The heading, what failed, and Retry"
                : "Each property's name, then a circle and a bar",
          },
        ],
        groups: [],
        centre: (
          <div data-anchor={1} className={cn(railClass, "bg-background")}>
            <PeoplePanelLockup state={state} />
          </div>
        ),
      }
    case "loaded":
    case "partial":
    case "no-permission":
      return panelDrawing(state)
  }
}

const sizes = (
  <span className="flex items-center gap-3">
    <PersonAvatar person={samplePeople.owner} />
    <PersonAvatar person={samplePeople.owner} size="lg" />
    <PersonAvatar person={securityTeam} size="lg" />
  </span>
)

function panelDrawing(state: "loaded" | "partial" | "no-permission"): Drawing {
  const watchersPart: ReadonlyArray<ConstellationPart> =
    state === "partial"
      ? [{ n: 8, name: "Retry", depth: 1, note: "Watchers only: Could not load, then Retry" }]
      : state === "no-permission"
        ? [
            {
              n: 8,
              name: "Watcher count",
              depth: 1,
              note: "The count in muted text, and a note naming who can see the watchers",
            },
          ]
        : []
  const parts: ReadonlyArray<ConstellationPart> = [
    {
      n: 1,
      name: "PeoplePanel",
      depth: 0,
      note: "Assignee and owner by name, then the reviewers and watchers as groups",
    },
    {
      n: 2,
      name: "Entity",
      depth: 1,
      note: "The assignee's and owner's avatar and name, a link to their profile",
    },
    {
      n: 3,
      name: "Avatar",
      depth: 2,
      note: "Initials, or a picture when there is one: 20px, or 24px at lg; round for a person, square for a team",
      specimen: sizes,
    },
    {
      n: 4,
      name: "AvatarGroup",
      depth: 1,
      note: "Three avatars overlapping by half, then +N for the rest",
      specimen: <PeopleGroup size="lg" people={reviewers} />,
    },
    {
      n: 5,
      name: "AvatarGroup, spread",
      depth: 2,
      note: "4px apart while hovered, focused or open; 150ms ease-out, at once under reduced motion",
      specimen: <PeopleGroup size="lg" people={reviewers} data-spread="" />,
    },
    {
      n: 6,
      name: "Popover",
      depth: 2,
      note: "Everyone in the group as links to their profiles, on hover after 300ms or on press",
      specimen: <PeoplePopupBody title="Reviewers" people={reviewers} />,
    },
    {
      n: 7,
      name: "PreviewCard",
      depth: 2,
      note: "The person's name and team, on hover after 300ms; the link is the keyboard route",
      specimen: (
        <div className={popupSurface}>
          <PersonCard person={samplePeople.assignee ?? samplePeople.owner} />
        </div>
      ),
    },
    ...watchersPart,
  ]

  const groups: ReadonlyArray<ConstellationGroup> = [
    {
      title: "Fact",
      rank: 2,
      summary: "Who does, owns, reviews and watches the record",
      reveal: "always",
      links: [
        { part: 2, anchor: 2 },
        { part: 3, anchor: 2 },
        { part: 4, anchor: 4 },
        ...(watchersPart.length > 0 ? [{ part: 8, anchor: 8 }] : []),
      ],
    },
    {
      title: "Spread",
      rank: null,
      summary: "The overlap opens so each avatar shows whole",
      reveal: "revealed",
      gesture: "Hover, focus or open",
      links: [{ part: 5, anchor: 4 }],
    },
    {
      title: "Enrich",
      rank: 4,
      summary: "The names the avatars stand for",
      reveal: "revealed",
      gesture: "Hover; press for a group",
      links: [
        { part: 6, anchor: 4 },
        { part: 7, anchor: 2 },
      ],
    },
  ]

  return {
    parts,
    groups,
    centre: (
      <div data-anchor={1} className={cn(railClass, "bg-background")}>
        <PeopleDrawingAnchors
          anchors={{ assignee: 2, reviewers: 4, ...(state === "loaded" ? {} : { watchers: 8 }) }}
        >
          <PeoplePanel state={state} people={samplePeople} />
        </PeopleDrawingAnchors>
      </div>
    ),
  }
}
