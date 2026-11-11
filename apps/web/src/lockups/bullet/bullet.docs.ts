import { avatarDocs } from "../../components/avatar/avatar.docs.ts"
import { bulletDocs } from "../../components/bullet/bullet.docs.ts"
import { type ComponentDocs, requireSource } from "../../components/item-docs.ts"
import { previewCardDocs } from "../../components/preview-card/preview-card.docs.ts"
import { BulletDetails } from "./bullet-details.tsx"
import { BulletReadonly } from "./bullet-readonly.tsx"

const sources = import.meta.glob<string>("./bullet-{details,readonly}.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

export const bulletLockupDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import { Menu } from "@base-ui/react/menu"
import { Bullet, BulletLabel, BulletMedia } from "@/components/bullet"`,
    code: `<dl>
  <dt>Priority</dt>
  <dd>
    <Menu.Root>
      <Bullet size="lg" render={<Menu.Trigger aria-label={\`Change priority, now \${priority}\`} />}>
        <BulletMedia>
          <FlagIcon />
        </BulletMedia>
        <BulletLabel>{priority}</BulletLabel>
      </Bullet>
      <Menu.Portal>…the priorities, the current one ticked…</Menu.Portal>
    </Menu.Root>
  </dd>
</dl>`,
    description:
      "Name each fact's property beside its bullet; render the bullet as the trigger of what it opens. A caller who cannot change a value sees a bullet that opens nothing and a note naming who can.",
  },
  composition: {
    name: "DetailsPanel",
    item: null,
    children: [
      { ...bulletDocs.composition, item: "bullet" },
      { name: "PreviewCard", item: "preview-card", children: [] },
    ],
  },
  examples: [
    {
      name: "bullet-details",
      title: "Details panel",
      description: "A hover card trigger, a link that opens a new tab, and a plain fact.",
      Preview: BulletDetails,
      source: requireSource(sources, "./bullet-details.tsx"),
    },
    {
      name: "bullet-readonly",
      title: "Read only",
      description: "Priority opens nothing, and a note names who can change it.",
      Preview: BulletReadonly,
      source: requireSource(sources, "./bullet-readonly.tsx"),
    },
  ],
  api: [...bulletDocs.api, ...avatarDocs.api, ...previewCardDocs.api],
}
