import { sampleRecordDetails } from "@workspace/fixtures/record-details.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import * as React from "react"
import {
  Constellation,
  type ConstellationGroup,
  type ConstellationPart,
} from "../playground/constellation.tsx"
import { Avatar, AvatarFallback, PeopleGroup, PeopleList, PersonCard } from "./avatar.tsx"
import { AvatarLockup, PeopleDrawingAnchors, PeoplePanel } from "./avatar-lockup.tsx"
import { cardSurface } from "./bullet-styles.ts"
import { clipSpecimen } from "./clip-specimen.tsx"

type Drawing = {
  parts: ReadonlyArray<ConstellationPart>
  groups: ReadonlyArray<ConstellationGroup>
  centre: React.ReactNode
}

/** The avatar experiment drawn as its constellation: the people panel at rest with its parts around it. */
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
            name: state === "error" ? "ErrorMessage" : "PeoplePanel",
            depth: 0,
            note:
              state === "error"
                ? "Replaces the people panel"
                : "Each property's name, then an empty circle and a bar",
          },
        ],
        groups: [],
        centre: (
          <div data-anchor={1}>
            <AvatarLockup state={state} />
          </div>
        ),
      }
    case "loaded":
    case "partial":
    case "no-permission":
      return panelDrawing(state)
  }
}

const reviewers = sampleRecordDetails.reviewers

const sizes = (
  <span className="flex items-center gap-3">
    <Avatar>
      <AvatarFallback>MO</AvatarFallback>
    </Avatar>
    <Avatar size="lg">
      <AvatarFallback>MO</AvatarFallback>
    </Avatar>
    <Avatar shape="square">
      <AvatarFallback>ST</AvatarFallback>
    </Avatar>
    <Avatar size="lg" shape="square">
      <AvatarFallback>ST</AvatarFallback>
    </Avatar>
  </span>
)

function panelDrawing(state: "loaded" | "partial" | "no-permission"): Drawing {
  const group = state === "loaded" ? sampleRecordDetails.watchers : reviewers
  const watchersPart: ReadonlyArray<ConstellationPart> =
    state === "partial"
      ? [{ n: 7, name: "RetryLink", depth: 1, note: "Watchers only: Could not load, then Retry" }]
      : state === "no-permission"
        ? [
            {
              n: 7,
              name: "Watcher count",
              depth: 1,
              note: "The count as text, and a note naming who can see the watchers",
            },
          ]
        : []
  const parts: ReadonlyArray<ConstellationPart> = [
    {
      n: 1,
      name: "PeoplePanel",
      depth: 0,
      note: "An owner beside their name, an assignee alone, reviewers in a bullet, watchers in a group",
    },
    {
      n: 2,
      name: "Avatar",
      depth: 1,
      note: "Initials, or a picture when there is one: 20px, or 24px at lg; round for a person, square for a team",
      specimen: sizes,
    },
    {
      n: 3,
      name: "AvatarGroup",
      depth: 1,
      note: "Three avatars overlapping by half, then +N for the rest",
      specimen: <PeopleGroup people={group} />,
    },
    {
      n: 4,
      name: "AvatarGroup, spread",
      depth: 2,
      note: "4px apart while the group or its control is hovered, focused or open; 150ms ease-out, instant under reduced motion",
      specimen: <PeopleGroup data-spread="" people={group} />,
    },
    {
      n: 5,
      name: "Popover",
      depth: 2,
      note: "Everyone in the group, on hover after 300ms or on press",
      specimen: (
        <div className={cardSurface}>
          <p className="mb-2 font-medium">Reviewers</p>
          <PeopleList people={reviewers} />
        </div>
      ),
    },
    {
      n: 6,
      name: "PreviewCard",
      depth: 1,
      note: "The name of an avatar drawn alone, on hover after 300ms; its link is the keyboard route",
      specimen: (
        <div className={cardSurface}>
          <PersonCard person={sampleRecordDetails.assignee} />
        </div>
      ),
    },
    ...watchersPart,
  ]

  const groups: ReadonlyArray<ConstellationGroup> = [
    {
      title: "Fact",
      rank: 2,
      summary: "Who owns, holds and reviews the record, drawn as avatars",
      reveal: "always",
      links: [
        { part: 2, anchor: 2 },
        { part: 3, anchor: 3 },
        ...(watchersPart.length > 0 ? [{ part: 7, anchor: 7 }] : []),
      ],
    },
    {
      title: "Spread",
      rank: null,
      summary: "The overlap opens so each avatar shows whole",
      reveal: "revealed",
      gesture: "Hover, focus or open",
      links: [{ part: 4, anchor: 3 }],
    },
    {
      title: "Enrich",
      rank: 4,
      summary: "The names the avatars stand for",
      reveal: "revealed",
      gesture: "Hover; press for a group",
      links: [
        { part: 5, anchor: 3 },
        { part: 6, anchor: 6 },
      ],
    },
  ]

  return {
    parts,
    groups,
    centre: (
      <div data-anchor={1} className="bg-background">
        <PeopleDrawingAnchors anchors={{ owner: 2, reviewers: 3, assignee: 6, watchers: 7 }}>
          <PeoplePanel state={state} />
        </PeopleDrawingAnchors>
      </div>
    ),
  }
}
