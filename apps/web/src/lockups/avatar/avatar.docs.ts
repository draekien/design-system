import { avatarDocs } from "../../components/avatar/avatar.docs.ts"
import { entityDocs } from "../../components/entity/entity.docs.ts"
import { type ComponentDocs, requireSource } from "../../components/item-docs.ts"
import { previewCardDocs } from "../../components/preview-card/preview-card.docs.ts"
import { AvatarEmpty } from "./avatar-empty.tsx"
import { AvatarPeople } from "./avatar-people.tsx"

const sources = import.meta.glob<string>("./avatar-{people,empty}.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

export const avatarLockupDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import { Popover } from "@base-ui/react/popover"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/avatar"
import { Entity, EntityMedia, EntityName } from "@/components/entity"
import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@/components/preview-card"`,
    code: `<dl>
  <dt>Assignee</dt>
  <dd>
    <PreviewCard>
      <PreviewCardTrigger render={<a href={assignee.profileUrl} />}>
        <Entity>
          <EntityMedia>JL</EntityMedia>
          <EntityName>Jonas Lindqvist</EntityName>
        </Entity>
      </PreviewCardTrigger>
      <PreviewCardContent>Jonas Lindqvist · Compliance</PreviewCardContent>
    </PreviewCard>
  </dd>
  <dt>Watchers</dt>
  <dd>
    <Popover.Root>
      <AvatarGroup size="lg" label="6 watchers" render={<Popover.Trigger openOnHover delay={300} />}>
        {watchers.map((watcher) => (
          <Avatar key={watcher.name}>
            <AvatarFallback>{watcher.initials}</AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
      <Popover.Portal>…the watchers as links…</Popover.Portal>
    </Popover.Root>
  </dd>
</dl>`,
    description:
      "Name the assignee and owner with entity; draw a group as a popover trigger whose popup lists everyone.",
  },
  composition: {
    name: "PeoplePanel",
    item: null,
    children: [
      {
        name: "PreviewCard",
        item: "preview-card",
        children: [{ ...entityDocs.composition, item: "entity" }],
      },
      { ...avatarDocs.composition, item: "avatar" },
    ],
  },
  examples: [
    {
      name: "avatar-people",
      title: "People panel",
      description: "The assignee and owner by name, then the reviewers and watchers.",
      Preview: AvatarPeople,
      source: requireSource(sources, "./avatar-people.tsx"),
    },
    {
      name: "avatar-empty",
      title: "Empty values",
      description: "Unassigned and None, in muted text.",
      Preview: AvatarEmpty,
      source: requireSource(sources, "./avatar-empty.tsx"),
    },
  ],
  api: [...avatarDocs.api, ...entityDocs.api, ...previewCardDocs.api],
}
