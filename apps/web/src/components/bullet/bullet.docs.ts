import type { Bullet, BulletLabel, BulletMedia } from "@/components/bullet.tsx"
import { type ApiTable, type ComponentDocs, requireSource } from "../item-docs.ts"
import { BulletAsTrigger } from "./bullet-as-trigger.tsx"
import { BulletSizes } from "./bullet-sizes.tsx"

export const bulletSources = import.meta.glob<string>("./*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

export const bulletDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import { Bullet, BulletLabel, BulletMedia } from "@/components/bullet"`,
    code: `<Bullet size="lg" render={<a href={workspace.url} />}>
  <BulletMedia>
    <FolderIcon />
  </BulletMedia>
  <BulletLabel>Legal</BulletLabel>
  <BulletMedia label=", restricted">
    <LockIcon />
  </BulletMedia>
</Bullet>`,
    description:
      "Write the parts in the order they are drawn. Label an icon that adds meaning. Render the bullet as a trigger or link to open something; one that opens nothing looks the same.",
  },
  composition: {
    name: "Bullet",
    item: null,
    children: [
      { name: "BulletMedia", item: null, children: [] },
      { name: "AvatarGroup", item: "avatar", children: [] },
      { name: "BulletLabel", item: null, children: [] },
    ],
  },
  examples: [
    {
      name: "bullet-sizes",
      title: "Sizes",
      description: "Default under a title; lg in a details list, with an icon after the label.",
      Preview: BulletSizes,
      source: requireSource(bulletSources, "./bullet-sizes.tsx"),
    },
    {
      name: "bullet-as-trigger",
      title: "Trigger",
      description: "A bullet rendered as a menu trigger opens a picker that ticks the value.",
      Preview: BulletAsTrigger,
      source: requireSource(bulletSources, "./bullet-as-trigger.tsx"),
    },
  ],
  api: [
    {
      kind: "part",
      name: "Bullet",
      description:
        "One fact on one line, at least 24px high. A button or link tints on hover and while its popup is open; a hover card trigger does not.",
      spreads: { label: "<span>", href: null },
      props: {
        size: {
          type: '"default" | "lg"',
          required: false,
          default: '"default"',
          description: "Default: 12px label, 14px icons, 20px avatars. lg: 14px, 16px and 24px.",
        },
        render: {
          type: "ReactElement | ((props, state) => ReactElement)",
          required: false,
          default: null,
          description: "The element to render, such as a Menu.Trigger or a link.",
        },
      } satisfies ApiTable<typeof Bullet, "span">,
    },
    {
      kind: "part",
      name: "BulletMedia",
      description: "One muted icon, before or after the label by where it is written.",
      spreads: { label: "<span>", href: null },
      props: {
        label: {
          type: "string",
          required: false,
          default: null,
          description: 'What the icon adds for screen readers, such as ", restricted".',
        },
      } satisfies ApiTable<typeof BulletMedia, "span">,
    },
    {
      kind: "part",
      name: "BulletLabel",
      description:
        "The fact in words. It truncates before any media does, and moves to screen readers only where a list, table or card abbreviates.",
      spreads: { label: "<span>", href: null },
      props: {} satisfies ApiTable<typeof BulletLabel, "span">,
    },
  ],
}
