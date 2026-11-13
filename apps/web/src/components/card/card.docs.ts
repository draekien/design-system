import type {
  Card,
  CardAction,
  CardAside,
  CardDescription,
  CardExplain,
  CardFact,
  CardFacts,
  CardFooter,
  CardId,
  CardLink,
  CardMedia,
  CardMissing,
  CardName,
  CardSubject,
} from "@/components/card.tsx"
import { type ApiTable, type ComponentDocs, requireSource } from "../item-docs.ts"
import { CardAsideActions } from "./card-aside-actions.tsx"
import { CardLabelled } from "./card-labelled.tsx"
import { CardRecord } from "./card-record.tsx"

export const cardSources = import.meta.glob<string>("./*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

const icon = {
  type: "ReactNode",
  required: false,
  default: null,
  description: "A 16px icon from any icon library, or an inline SVG.",
} as const

export const cardDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import {
  Card,
  CardAside,
  CardFact,
  CardFacts,
  CardId,
  CardLink,
  CardName,
  CardSubject,
} from "@/components/card"`,
    code: `<Card>
  <CardSubject>
    <CardId>REC-104</CardId>
    <CardName>
      <CardLink href="/records/REC-104">Quarterly access review</CardLink>
    </CardName>
  </CardSubject>
  <CardAside>In review</CardAside>
  <CardFacts>
    <CardFact label="Owner">Mira Okafor</CardFact>
  </CardFacts>
</Card>`,
    description:
      "One record or one figure per card. Put the link in the name; it covers the whole card. Pass icons from your own icon library.",
  },
  composition: {
    name: "Card",
    item: null,
    children: [
      {
        name: "CardSubject",
        item: null,
        children: [
          { name: "CardMedia", item: null, children: [] },
          { name: "CardId", item: null, children: [] },
          {
            name: "CardName",
            item: null,
            children: [{ name: "CardLink", item: null, children: [] }],
          },
          { name: "CardDescription", item: null, children: [] },
        ],
      },
      {
        name: "CardAside",
        item: null,
        children: [{ name: "CardAction", item: null, children: [] }],
      },
      {
        name: "CardFacts",
        item: null,
        children: [
          {
            name: "CardFact",
            item: null,
            children: [{ name: "CardMissing", item: null, children: [] }],
          },
        ],
      },
      { name: "CardExplain", item: null, children: [] },
      { name: "CardFooter", item: null, children: [] },
    ],
  },
  examples: [
    {
      name: "card-record",
      title: "Record",
      description:
        "A picture box, the ID, the linked name, a status in the aside, the facts in a row and a summary one click away.",
      Preview: CardRecord,
      source: requireSource(cardSources, "./card-record.tsx"),
    },
    {
      name: "card-labelled",
      title: "Labelled facts",
      description:
        "One fact per line after its property's name, for a card that summarises one record.",
      Preview: CardLabelled,
      source: requireSource(cardSources, "./card-labelled.tsx"),
    },
    {
      name: "card-aside-actions",
      title: "Aside actions",
      description:
        "A pin and a ⋮ menu appear on hover or focus; Draft slides left to make room. Icons from Hugeicons.",
      Preview: CardAsideActions,
      source: requireSource(cardSources, "./card-aside-actions.tsx"),
    },
  ],
  api: [
    {
      kind: "part",
      name: "Card",
      description: "The container: 12px padding, the card radius and a hairline border.",
      spreads: { label: "<div>", href: null },
      props: {
        render: {
          type: "ReactElement | ((props, state) => ReactElement)",
          required: false,
          default: null,
          description: "The element to render, such as an <article> or an <li>.",
        },
      } satisfies ApiTable<typeof Card, "div">,
    },
    {
      kind: "part",
      name: "CardSubject",
      description: "Rank 1: the picture, ID, name and description, in that order.",
      spreads: { label: "<div>", href: null },
      props: {} satisfies ApiTable<typeof CardSubject, "div">,
    },
    {
      kind: "part",
      name: "CardMedia",
      description:
        "The 16:9 picture. Without one, the box names why: No picture, Hidden, or Unavailable when it fails to load.",
      spreads: { label: "<img> or <div>", href: null },
      props: {
        kind: {
          type: '"picture" | "missing"',
          required: true,
          default: null,
          description: "Whether the record has a picture.",
        },
        src: {
          type: "string",
          required: false,
          default: null,
          description: 'The picture\'s URL. Required when kind is "picture".',
        },
        alt: {
          type: "string",
          required: false,
          default: '""',
          description: "Empty by default: the name beside the picture names the record.",
        },
        reason: {
          type: '"No picture" | "Hidden"',
          required: false,
          default: null,
          description: 'Why there is no picture. Required when kind is "missing".',
        },
        icon: { ...icon, description: "Replaces the picture icon in the empty box." },
      } satisfies ApiTable<typeof CardMedia, "div">,
    },
    {
      kind: "part",
      name: "CardId",
      description: "The record's ID, in muted tabular figures.",
      spreads: { label: "<span>", href: null },
      props: {} satisfies ApiTable<typeof CardId, "span">,
    },
    {
      kind: "part",
      name: "CardName",
      description: "The record's name, a heading clamped to two lines.",
      spreads: { label: "<h3>", href: null },
      props: {} satisfies ApiTable<typeof CardName, "h3">,
    },
    {
      kind: "part",
      name: "CardLink",
      description: "Rank 5: the link to the record's page. Its hit area covers the card.",
      spreads: { label: "<a>", href: null },
      props: {} satisfies ApiTable<typeof CardLink, "a">,
    },
    {
      kind: "part",
      name: "CardDescription",
      description: "One line about the record, under the name.",
      spreads: { label: "<p>", href: null },
      props: {} satisfies ApiTable<typeof CardDescription, "p">,
    },
    {
      kind: "part",
      name: "CardAside",
      description:
        "The top right. Its children always show, in at most a third of the card's width.",
      spreads: { label: "<div>", href: null },
      props: {
        actions: {
          type: "ReactNode",
          required: false,
          default: null,
          description:
            "At most two CardActions, then a ⋮ menu. They show on hover, on focus, while a menu is open, and always on touch screens. They mount twice: a hidden, inert copy reserves their width, so query them inside the visible row.",
        },
      } satisfies ApiTable<typeof CardAside, "div">,
    },
    {
      kind: "part",
      name: "CardAction",
      description:
        "A 24px button for one icon or one short word, with a 44px hit area on touch screens. Render a Base UI trigger with it.",
      spreads: { label: "<button>", href: null },
      props: {} satisfies ApiTable<typeof CardAction, "button">,
    },
    {
      kind: "part",
      name: "CardFacts",
      description: "Rank 2: the facts the surface compares.",
      spreads: { label: "<dl>", href: null },
      props: {
        layout: {
          type: '"row" | "labelled" | "bullets"',
          required: false,
          default: '"row"',
          description:
            "A row on one line, or one bullet per line, with names for screen readers only; or one labelled fact per line when the label is the information.",
        },
      } satisfies ApiTable<typeof CardFacts, "dl">,
    },
    {
      kind: "part",
      name: "CardFact",
      description:
        "One fact, named by its label: a status, entity, figure or relative time, or text.",
      spreads: { label: "<div>", href: null },
      props: {
        label: {
          type: "string",
          required: true,
          default: null,
          description: "The property's name.",
        },
        narrow: {
          type: '"keep" | "abbreviate" | "hide"',
          required: false,
          default: '"keep"',
          description:
            "In a row: abbreviates when the card's content is narrower than 16rem, and hides below 13rem when set to hide.",
        },
        icon: { ...icon, description: "In bullets, the icon before the value." },
      } satisfies ApiTable<typeof CardFact, "div">,
    },
    {
      kind: "part",
      name: "CardMissing",
      description: "A fact the caller cannot see: Unavailable or Hidden, in muted text.",
      spreads: { label: "<span>", href: null },
      props: {
        children: {
          type: "string",
          required: true,
          default: null,
          description: "Unavailable or Hidden.",
        },
      } satisfies ApiTable<typeof CardMissing, "span">,
    },
    {
      kind: "part",
      name: "CardExplain",
      description: "Rank 3: content read on some visits, one click away.",
      spreads: {
        label: "Base UI Collapsible.Root",
        href: "https://base-ui.com/react/components/collapsible#api-reference",
      },
      props: {
        trigger: {
          type: "string",
          required: true,
          default: null,
          description: "Names the content, such as Summary.",
        },
        icon: { ...icon, description: "Replaces the chevron. Point it to the inline end." },
      } satisfies ApiTable<typeof CardExplain, "div">,
    },
    {
      kind: "part",
      name: "CardFooter",
      description:
        "The last part of the card: one muted line, such as when the record last changed, which truncates. A link or a button in it throws.",
      spreads: { label: "<div>", href: null },
      props: {} satisfies ApiTable<typeof CardFooter, "div">,
    },
  ],
}
