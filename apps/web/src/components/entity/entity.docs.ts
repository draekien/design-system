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
      { name: "EntityMedia", item: null, children: [] },
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
      description: "An img or initials in EntityMedia.",
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
      description: "A 24px circle holding initials or an image. Hidden from screen readers.",
      spreads: span,
      props: {} satisfies ApiTable<typeof EntityMedia, "span">,
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
