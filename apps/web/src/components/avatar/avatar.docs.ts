import type { Avatar as BaseAvatar } from "@base-ui/react/avatar"
import type { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/avatar.tsx"
import { type ApiTable, type ComponentDocs, requireSource } from "../item-docs.ts"
import { AvatarGroupPopover } from "./avatar-group-popover.tsx"
import { AvatarPicture } from "./avatar-picture.tsx"

export const avatarSources = import.meta.glob<string>("./*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

const reference = "https://base-ui.com/react/components/avatar#api-reference"

const size = {
  type: '"default" | "lg"',
  required: false,
  default: '"default"',
  description: "20px by default, 24px at lg.",
} as const

export const avatarDocs: ComponentDocs = {
  kind: "component",
  usage: {
    imports: `import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar"`,
    code: `<Avatar size="lg">
  <AvatarImage src={person.pictureUrl} alt="" />
  <AvatarFallback>MO</AvatarFallback>
</Avatar>`,
    description:
      "The avatar is hidden from screen readers: draw the name beside it, or name the control around it. To draw a name, use entity.",
  },
  composition: {
    name: "AvatarGroup",
    item: null,
    children: [
      {
        name: "Avatar",
        item: null,
        children: [
          { name: "AvatarImage", item: null, children: [] },
          { name: "AvatarFallback", item: null, children: [] },
        ],
      },
    ],
  },
  examples: [
    {
      name: "avatar-picture",
      title: "Picture and initials",
      description: "A picture, initials while there is none, and a square for a team.",
      Preview: AvatarPicture,
      source: requireSource(avatarSources, "./avatar-picture.tsx"),
    },
    {
      name: "avatar-group-popover",
      title: "Group",
      description: "Three avatars, then +N; the popover lists everyone.",
      Preview: AvatarGroupPopover,
      source: requireSource(avatarSources, "./avatar-group-popover.tsx"),
    },
  ],
  api: [
    {
      kind: "part",
      name: "Avatar",
      description: "One person or team. Hidden from screen readers.",
      spreads: { label: "Base UI Avatar.Root", href: reference },
      props: {
        size,
        shape: {
          type: '"circle" | "square"',
          required: false,
          default: '"circle"',
          description: "A circle for a person, a square for a team or organisation.",
        },
      } satisfies ApiTable<typeof Avatar, typeof BaseAvatar.Root>,
    },
    {
      kind: "part",
      name: "AvatarImage",
      description: "The picture. It fills the avatar once it loads.",
      spreads: { label: "Base UI Avatar.Image", href: reference },
      props: {} satisfies ApiTable<typeof AvatarImage, typeof BaseAvatar.Image>,
    },
    {
      kind: "part",
      name: "AvatarFallback",
      description: "The initials, shown until the picture loads or when there is none.",
      spreads: { label: "Base UI Avatar.Fallback", href: reference },
      props: {} satisfies ApiTable<typeof AvatarFallback, typeof BaseAvatar.Fallback>,
    },
    {
      kind: "part",
      name: "AvatarGroup",
      description:
        "Avatars overlapping by half, spreading 4px apart on hover, focus or open. Render it as a trigger.",
      spreads: { label: "<span>", href: null },
      props: {
        max: {
          type: "number",
          required: false,
          default: "3",
          description: 'Avatars drawn before "+N" counts the rest; never "+1".',
        },
        size: { ...size, description: "Sets every avatar in the group." },
        label: {
          type: "string",
          required: false,
          default: null,
          description:
            "Names the group for screen readers, such as 6 watchers. Required on a trigger.",
        },
        render: {
          type: "ReactElement | ((props, state) => ReactElement)",
          required: false,
          default: null,
          description: "The element to render, such as a Popover.Trigger.",
        },
      } satisfies ApiTable<typeof AvatarGroup, "span">,
    },
  ],
}
