import type { FixtureState } from "@workspace/fixtures/state.ts"
import { Card } from "@workspace/registry/components/card.tsx"
import * as React from "react"
import { cn } from "@/lib/cn.ts"
import {
  Constellation,
  type ConstellationGroup,
  type ConstellationPart,
} from "../playground/constellation.tsx"
import { clipSpecimen } from "./clip-specimen.tsx"
import {
  CardMenuItem,
  CardMenuSeparator,
  CardMenuView,
  PersonCardParts,
  PopoverCardLockup,
} from "./popover-card.tsx"
import { people, popoverCardSurface } from "./popover-card-data.ts"

/** The popover card experiment drawn as its constellation: the details panel at rest with its cards drawn open around it. */
export function PopoverCardConstellation({ state }: { state: FixtureState }): React.ReactElement {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null)
  const drawing = popoverCardDrawing(state)
  return (
    <Constellation
      key={state}
      label="Popover card constellation"
      stage={stage}
      onStageChange={setStage}
      parts={drawing.parts.map(clipSpecimen)}
      groups={drawing.groups}
      centre={drawing.centre}
    />
  )
}

type Drawing = {
  parts: ReadonlyArray<ConstellationPart>
  groups: ReadonlyArray<ConstellationGroup>
  centre: React.ReactNode
}

function popoverCardDrawing(state: FixtureState): Drawing {
  switch (state) {
    case "error":
    case "loading":
      return {
        parts: [
          {
            n: 1,
            name: state === "error" ? "ErrorMessage" : "DetailsPanel",
            depth: 0,
            note:
              state === "error"
                ? "Replaces the people"
                : "Each role's name, then a placeholder: a circle and a bar",
          },
        ],
        groups: [],
        centre: (
          <div data-anchor={1} className="w-96 bg-background p-4">
            <PopoverCardLockup state={state} />
          </div>
        ),
      }
    case "loaded":
    case "partial":
    case "no-permission":
      return cardDrawing(state)
  }
}

function cardDrawing(state: "loaded" | "partial" | "no-permission"): Drawing {
  const canManage = state !== "no-permission"
  const owner = people[0]
  if (owner === undefined) {
    throw new Error("The popover card fixture names no people.")
  }
  const openCard = (
    <div className={cn(popoverCardSurface, "w-full")}>
      <Card className="bg-transparent">
        <PersonCardParts person={owner.person} team={owner.team} open={owner.open} state={state} />
      </Card>
    </div>
  )
  const menu = (
    <div className={cn(popoverCardSurface, "w-full")}>
      <CardMenuView label={`More actions for ${owner.person.name}`}>
        <CardMenuItem>Reassign their records</CardMenuItem>
        <CardMenuItem>Copy email address</CardMenuItem>
        <CardMenuSeparator />
        <CardMenuItem destructive>Remove from record</CardMenuItem>
      </CardMenuView>
    </div>
  )
  const parts: ReadonlyArray<ConstellationPart> = [
    { n: 1, name: "DetailsPanel", depth: 0, note: "Each role's name, then a person" },
    {
      n: 2,
      name: "PopoverCardTrigger",
      depth: 1,
      note: "A Bullet rendered as the trigger: the avatar and the name; it opens on press, Enter or Space",
    },
    {
      n: 3,
      name: "PopoverCardContent",
      depth: 2,
      note: "A Card with the popover shadow, 4px below the trigger and start-aligned",
      specimen: openCard,
    },
    {
      n: 4,
      name: "CardAside",
      depth: 3,
      note: canManage
        ? "Email, then the ⋮ CardMenu; they show while the pointer is over the card or focus is in it"
        : "Email only: the caller cannot manage people",
    },
    {
      n: 5,
      name: "CardSubject",
      depth: 3,
      note: "The name, a link to their profile, then one line about them",
    },
    {
      n: 6,
      name: "CardFacts",
      depth: 3,
      note:
        state === "partial"
          ? "Bullets: Security team, then Open records unavailable"
          : "Bullets: an icon, then a value that names itself: Security team, 4 open records",
    },
    {
      n: 7,
      name: "CardFooter",
      depth: 3,
      note: "One muted line; it holds no action",
    },
    ...(canManage
      ? [
          {
            n: 8,
            name: "CardMenuView",
            depth: 4,
            note: "Replaces the card's parts: a back button naming the menu, then the items, destructive last",
            specimen: menu,
          },
        ]
      : []),
  ]
  const groups: ReadonlyArray<ConstellationGroup> = [
    {
      title: "Identify",
      rank: 1,
      summary: "Who the value names",
      reveal: "always",
      links: [{ part: 2, anchor: 2 }],
    },
    {
      title: "Act",
      rank: null,
      summary: "The card about the person, with the actions on them",
      reveal: "revealed",
      gesture: "Press, Enter or Space",
      links: [{ part: 3, anchor: 2 }],
    },
    ...(canManage
      ? [
          {
            title: "More actions",
            rank: null,
            summary: "The ⋮ menu drawn in place of the card",
            reveal: "revealed" as const,
            gesture: "Press ⋮; Esc goes back",
            links: [{ part: 8, anchor: 2 }],
          },
        ]
      : []),
  ]
  return {
    parts,
    groups,
    centre: (
      <div data-anchor={1} className="w-96 bg-background p-4">
        <div data-anchor={2}>
          <PopoverCardLockup state={state} />
        </div>
      </div>
    ),
  }
}
