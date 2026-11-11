import { Flag03Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { recordPriorities, sampleRecordDetails } from "@workspace/fixtures/record-details.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import * as React from "react"
import { Bullet, BulletLabel, BulletMedia } from "@/components/bullet.tsx"
import { cn } from "@/lib/cn.ts"
import { clipSpecimen } from "../experiments/clip-specimen.tsx"
import { PeopleGroup, PeopleList } from "../lockups/avatar/people.tsx"
import {
  BulletLockup,
  DetailsError,
  DetailsLoading,
  DetailsPanel,
  DrawingAnchors,
  DueContent,
  PolicyContent,
  PriorityContent,
  ReviewersContent,
  WorkspaceCard,
  WorkspaceContent,
} from "../lockups/bullet/details-panel.tsx"
import { cardSurface } from "../lockups/lockup-styles.ts"
import { menuItem, menuSurface } from "../lockups/table/table-styles.ts"
import { Constellation, type ConstellationGroup, type ConstellationPart } from "./constellation.tsx"
import type { CanvasOptions } from "./playground-search.ts"
import { StatesSection } from "./states-section.tsx"

/** The bullet lockup canvas: a record's details panel, or its States view. */
export function BulletCanvas({ options }: { options: CanvasOptions }): React.ReactElement {
  return (
    <main className="p-4 sm:p-6">
      <h1 className="sr-only">Record details</h1>
      {options.view === "states" ? (
        <StatesView state={options.state} />
      ) : (
        <BulletLockup state={options.state} />
      )}
    </main>
  )
}

const interactionSpecimens = [
  { label: "At rest", props: {} },
  { label: "Hovered: Ink at 4%", props: { className: "before:bg-foreground/4" } },
  { label: "Open: Ink at 7%", props: { "data-popup-open": "" } },
  {
    label: "Focused: the outline 4px past each side",
    props: { className: "before:outline-2 before:outline-foreground before:outline-solid" },
  },
] as const

const narrowSpecimens = [
  { label: "320px: the panel at its usual width", width: "w-80" },
  { label: "240px: labels truncate before their icons", width: "w-60" },
] as const

function StatesView({ state }: { state: FixtureState }) {
  switch (state) {
    case "error":
    case "loading":
      return (
        <StatesSection
          title={state === "error" ? "Error" : "Loading"}
          description={
            state === "error"
              ? "The message says what failed and offers Retry"
              : "Each property's name, then a circle and a bar where its bullet will be"
          }
        >
          <BulletLockup state={state} />
        </StatesSection>
      )
    case "loaded":
    case "partial":
    case "no-permission":
      return (
        <div className="flex flex-col gap-12">
          <StatesSection
            title="Interaction states"
            description="A bullet rendered as a button at rest, hovered, open and focused"
          >
            <div className="flex flex-wrap items-start gap-8">
              {interactionSpecimens.map((specimen) => (
                <Specimen key={specimen.label} label={specimen.label}>
                  <Bullet size="lg" render={<button type="button" />} {...specimen.props}>
                    <PriorityContent priority={sampleRecordDetails.priority} />
                  </Bullet>
                </Specimen>
              ))}
              <Specimen label="Sizes: default, then lg">{sizes}</Specimen>
            </div>
          </StatesSection>
          <StatesSection
            title="Narrow widths"
            description="The panel fills its container; each label truncates before its icons"
          >
            <div className="flex flex-wrap items-start gap-8">
              {narrowSpecimens.map((specimen) => (
                <Specimen
                  key={specimen.label}
                  label={specimen.label}
                  className={cn(specimen.width, "max-w-full")}
                >
                  <DetailsPanel state={state} />
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
    <div className={cn("flex flex-col items-start gap-1.5", className)}>
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

/** The bullet lockup drawn as its constellation: the details panel at rest with its parts around it. */
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

const sizes = (
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
      specimen: sizes,
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
                  <div key={option} className={cn(menuItem, "gap-related")}>
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
