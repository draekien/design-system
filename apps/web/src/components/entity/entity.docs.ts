import type { Avatar } from "@/components/avatar.tsx"
import type { Entity, EntityDescription, EntityMedia, EntityName } from "@/components/entity.tsx"
import { type ApiTable, type ComponentDocs, requireSource } from "../item-docs.ts"
import { EntityPicture } from "./entity-picture.tsx"
import { EntityTruncation } from "./entity-truncation.tsx"

const sources = import.meta.glob<string>("./*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

const span = { label: "<span>", href: null }

export const entityDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import { Entity, EntityMedia, EntityName } from "@/components/entity"`,
    code: `<Entity>
  <EntityMedia>MO</EntityMedia>
  <EntityName>Mira Okafor</EntityName>
</Entity>`,
    description: null,
  },
  composition: {
    name: "Entity",
    item: null,
    children: [
      { name: "EntityMedia", item: "avatar", children: [] },
      { name: "EntityName", item: null, children: [] },
      { name: "EntityDescription", item: null, children: [] },
    ],
  },
  examples: [
    {
      name: "entity-truncation",
      title: "Truncation",
      description: "The description truncates first.",
      Preview: EntityTruncation,
      source: requireSource(sources, "./entity-truncation.tsx"),
    },
    {
      name: "entity-picture",
      title: "Picture",
      description: "A picture or initials in EntityMedia, square for a team.",
      Preview: EntityPicture,
      source: requireSource(sources, "./entity-picture.tsx"),
    },
  ],
  api: [
    {
      kind: "part",
      name: "Entity",
      description: "Lays out the media, the name and the description in one line.",
      spreads: span,
      props: {} satisfies ApiTable<typeof Entity, "span">,
    },
    {
      kind: "part",
      name: "EntityMedia",
      description:
        "An Avatar at size lg (24px) holding initials or a picture. Hidden from screen readers.",
      spreads: { label: "Avatar", href: "/playground/components/avatar" },
      props: {} satisfies ApiTable<typeof EntityMedia, typeof Avatar>,
    },
    {
      kind: "part",
      name: "EntityName",
      description: "The entity's name, such as Mira Okafor.",
      spreads: span,
      props: {} satisfies ApiTable<typeof EntityName, "span">,
    },
    {
      kind: "part",
      name: "EntityDescription",
      description: "One line after the name, in muted text. It truncates before the name does.",
      spreads: span,
      props: {} satisfies ApiTable<typeof EntityDescription, "span">,
    },
  ],
}
