import type { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card"
import type {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@/components/preview-card.tsx"
import { type ApiTable, type ComponentDocs, requireSource } from "../item-docs.ts"
import { PreviewCardLink } from "./preview-card-link.tsx"
import { PreviewCardPlacement } from "./preview-card-placement.tsx"

const sources = import.meta.glob<string>("./*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

const reference = "https://base-ui.com/react/components/preview-card#api-reference"

export const previewCardDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@/components/preview-card"`,
    code: `<PreviewCard>
  <PreviewCardTrigger>Mira Okafor</PreviewCardTrigger>
  <PreviewCardContent>Record owner · Security</PreviewCardContent>
</PreviewCard>`,
    description:
      "The trigger is not focusable, so every field in the card must also appear in peek and on the item's page.",
  },
  composition: {
    name: "PreviewCard",
    item: null,
    children: [
      { name: "PreviewCardTrigger", item: null, children: [] },
      { name: "PreviewCardContent", item: null, children: [] },
    ],
  },
  examples: [
    {
      name: "preview-card-link",
      title: "Link in the card",
      description: "The card may hold links.",
      Preview: PreviewCardLink,
      source: requireSource(sources, "./preview-card-link.tsx"),
    },
    {
      name: "preview-card-placement",
      title: "Placement",
      description: "side and align place the card.",
      Preview: PreviewCardPlacement,
      source: requireSource(sources, "./preview-card-placement.tsx"),
    },
  ],
  api: [
    {
      kind: "part",
      name: "PreviewCard",
      description: "Holds the open state shared by the trigger and the card.",
      spreads: { label: "Base UI PreviewCard.Root", href: reference },
      props: {} satisfies ApiTable<typeof PreviewCard, typeof BasePreviewCard.Root>,
    },
    {
      kind: "part",
      name: "PreviewCardTrigger",
      description:
        "The value that opens the card on hover after 300ms and closes it on pointer leave.",
      spreads: { label: "Base UI PreviewCard.Trigger", href: reference },
      props: {} satisfies ApiTable<typeof PreviewCardTrigger, typeof BasePreviewCard.Trigger>,
    },
    {
      kind: "part",
      name: "PreviewCardContent",
      description: "The card drawn beside its trigger; it may hold links.",
      spreads: { label: "Base UI PreviewCard.Popup", href: reference },
      props: {
        align: {
          type: '"start" | "center" | "end"',
          required: false,
          default: '"start"',
          description: "Which edge of the trigger the card lines up with.",
        },
        side: {
          type: '"top" | "bottom" | "left" | "right" | "inline-start" | "inline-end"',
          required: false,
          default: '"bottom"',
          description: "Which side of the trigger the card opens on.",
        },
        sideOffset: {
          type: "number | OffsetFunction",
          required: false,
          default: "6",
          description: "Distance in pixels between the trigger and the card.",
        },
        collisionAvoidance: {
          type: "CollisionAvoidance",
          required: false,
          default: null,
          description: "How the card moves when it would overflow the viewport.",
        },
        container: {
          type: "HTMLElement | ShadowRoot | RefObject<HTMLElement | ShadowRoot | null> | null",
          required: false,
          default: null,
          description:
            "The element the card renders into instead of the body, such as a scaled canvas.",
        },
      } satisfies ApiTable<typeof PreviewCardContent, typeof BasePreviewCard.Popup>,
    },
  ],
}
