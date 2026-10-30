import { Flag03Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { recordPriorities, sampleRecordDetails } from "@workspace/fixtures/record-details.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import * as React from "react"
import { PeopleGroup, PeopleList } from "../lockups/avatar/people.tsx"
import {
  Constellation,
  type ConstellationGroup,
  type ConstellationPart,
} from "../playground/constellation.tsx"
import {
  Bullet,
  BulletLabel,
  BulletMedia,
  DetailsError,
  DetailsLoading,
  DetailsPanel,
  DrawingAnchors,
  DueContent,
  PolicyContent,
  ReviewersContent,
  WorkspaceCard,
  WorkspaceContent,
} from "./bullet.tsx"
import { cardSurface, menuItem, menuSurface } from "./bullet-styles.ts"
import { clipSpecimen } from "./clip-specimen.tsx"

type Drawing = {
  parts: ReadonlyArray<ConstellationPart>
  groups: ReadonlyArray<ConstellationGroup>
  centre: React.ReactNode
}

/** The bullet experiment drawn as its constellation: the details panel at rest with its parts around it. */
export function BulletConstellation({ state }: { state: FixtureState }): React.ReactElement {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null)
  const drawing = bulletDrawing(state)
  return (
    <Constellation
      key={state}
      label="Bullet constellation"
      stage={stage}
      onStageChange={setStage}
      parts={drawing.parts.map(clipSpecimen)}
      groups={drawing.groups}
      centre={drawing.centre}
    />
  )
}

function bulletDrawing(state: FixtureState): Drawing {
  switch (state) {
    case "error":
      return {
        parts: [
          {
            n: 1,
            name: "ErrorMessage",
            depth: 0,
            note: "Replaces the details panel",
            specimen: <DetailsError />,
          },
        ],
        groups: [],
        centre: (
          <div data-anchor={1}>
            <DetailsError />
          </div>
        ),
      }
    case "loading":
      return {
        parts: [
          {
            n: 1,
            name: "DetailsPanel",
            depth: 0,
            note: "Each property's name, then a placeholder bullet: a circle and a bar",
          },
        ],
        groups: [],
        centre: (
          <div data-anchor={1}>
            <DetailsLoading />
          </div>
        ),
      }
    case "loaded":
    case "partial":
    case "no-permission":
      return panelDrawing(state)
  }
}

const layoutContents = [
  <DueContent key="due" />,
  <WorkspaceContent key="workspace" />,
  <PolicyContent key="policy" />,
  <ReviewersContent key="reviewers" />,
]

const layouts = (
  <span className="flex flex-col items-start gap-3">
    {(["default", "lg"] as const).map((size) => (
      <span key={size} className="flex flex-col items-start gap-1">
        {layoutContents.map((content) => (
          <Bullet key={content.key} size={size}>
            {content}
          </Bullet>
        ))}
      </span>
    ))}
  </span>
)

function panelDrawing(state: "loaded" | "partial" | "no-permission"): Drawing {
  const hasReviewers = state !== "partial"
  const canEdit = state !== "no-permission"
  const parts: ReadonlyArray<ConstellationPart> = [
    {
      n: 1,
      name: "DetailsPanel",
      depth: 0,
      note: "One property name and one bullet per fact",
    },
    {
      n: 2,
      name: "Bullet",
      depth: 1,
      note: "One fact on one line, at least 24px high: [icon] [label], [icon] [label] [icon], [label] [icon], [icon stack] [label]; default size, then lg",
      specimen: layouts,
    },
    {
      n: 3,
      name: "BulletMedia",
      depth: 2,
      note: "A muted icon, 14px, or 16px at lg, before or after the label by the order of the parts",
      specimen: (
        <BulletMedia>
          <HugeiconsIcon icon={Flag03Icon} />
        </BulletMedia>
      ),
    },
    ...(hasReviewers
      ? [
          {
            n: 4,
            name: "AvatarGroup",
            depth: 2,
            note: "Avatars overlapping by half, 20px, or 24px at lg; they spread on hover or focus, and the label states the count",
            specimen: <PeopleGroup people={sampleRecordDetails.reviewers} />,
          },
        ]
      : []),
    {
      n: 5,
      name: "BulletLabel",
      depth: 2,
      note: "The fact in words; truncates before the media",
      specimen: <BulletLabel>{sampleRecordDetails.dueAt}</BulletLabel>,
    },
    ...(canEdit
      ? [
          {
            n: 6,
            name: "Menu",
            depth: 2,
            note: "Priority's picker; the current value is ticked",
            specimen: (
              <div className={menuSurface}>
                {recordPriorities.map((option) => (
                  <div key={option} className={menuItem}>
                    <span className="flex size-4 items-center justify-center">
                      {option === sampleRecordDetails.priority ? (
                        <HugeiconsIcon icon={Tick02Icon} className="size-4" />
                      ) : null}
                    </span>
                    {option}
                  </div>
                ))}
              </div>
            ),
          },
        ]
      : []),
    ...(hasReviewers
      ? [
          {
            n: 7,
            name: "Popover",
            depth: 2,
            note: "The reviewers' names, on hover after 300ms or on press",
            specimen: (
              <div className={cardSurface}>
                <p className="mb-2 font-medium">Reviewers</p>
                <PeopleList people={sampleRecordDetails.reviewers} />
              </div>
            ),
          },
        ]
      : []),
    {
      n: 8,
      name: "PreviewCard",
      depth: 2,
      note: "Who may open the workspace, on hover after 300ms",
      specimen: (
        <div className={cardSurface}>
          <WorkspaceCard />
        </div>
      ),
    },
  ]

  const groups: ReadonlyArray<ConstellationGroup> = [
    {
      title: "Fact",
      rank: 2,
      summary: "Icons and a label on one line, drawn the same whether or not it opens anything",
      reveal: "always",
      links: [
        { part: 2, anchor: 2 },
        { part: 3, anchor: 3 },
        ...(hasReviewers ? [{ part: 4, anchor: 4 }] : []),
        { part: 5, anchor: 5 },
      ],
    },
    ...(canEdit
      ? [
          {
            title: "Change",
            rank: null,
            summary: "A bullet rendered as a menu trigger opens a picker",
            reveal: "revealed" as const,
            gesture: "Press, Enter or Space",
            links: [{ part: 6, anchor: 6 }],
          },
        ]
      : []),
    {
      title: "Enrich",
      rank: 4,
      summary: "More about the one value the bullet names",
      reveal: "revealed",
      gesture: hasReviewers ? "Hover; press for reviewers" : "Hover",
      links: [...(hasReviewers ? [{ part: 7, anchor: 7 }] : []), { part: 8, anchor: 8 }],
    },
  ]

  return {
    parts,
    groups,
    centre: (
      <div data-anchor={1} className="bg-background">
        <DrawingAnchors
          anchors={{
            policy: 2,
            media: 3,
            stack: hasReviewers ? 4 : undefined,
            label: 5,
            priority: canEdit ? 6 : undefined,
            reviewers: hasReviewers ? 7 : undefined,
            workspace: 8,
          }}
        >
          <DetailsPanel state={state} />
        </DrawingAnchors>
      </div>
    ),
  }
}
