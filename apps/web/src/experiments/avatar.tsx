import { Avatar as BaseAvatar } from "@base-ui/react/avatar"
import { mergeProps } from "@base-ui/react/merge-props"
import { Popover } from "@base-ui/react/popover"
import { useRender } from "@base-ui/react/use-render"
import type { SamplePerson } from "@workspace/fixtures/record-details.ts"
import * as React from "react"
import { cn } from "@/lib/cn.ts"
import { cardSurface } from "./bullet-styles.ts"

/** Props for {@link Avatar}. */
export type AvatarProps = BaseAvatar.Root.Props & {
  /** `"default"` is 20px and `"lg"` 24px. Inside a `Bullet`, the bullet's size sets it instead. */
  size?: "default" | "lg"
  /** `"circle"` for one person; `"square"` for a team or organisation. */
  shape?: "circle" | "square"
}

/**
 * One person or team drawn as their picture, or their initials when there is none. It is hidden
 * from screen readers: the name beside it, or the control around it, names who it is.
 */
export function Avatar({
  size = "default",
  shape = "circle",
  className,
  ...props
}: AvatarProps): React.ReactElement {
  return (
    <BaseAvatar.Root
      data-slot="avatar"
      aria-hidden="true"
      className={cn(
        "relative inline-flex size-(--avatar-size) shrink-0 select-none items-center justify-center overflow-hidden bg-muted font-medium text-micro text-muted-foreground uppercase",
        size === "lg" ? "[--avatar-size:--spacing(6)]" : "[--avatar-size:--spacing(5)]",
        shape === "square" ? "rounded-floor" : "rounded-full",
        className
      )}
      {...props}
    />
  )
}

/** The person's picture; it fills the avatar, and `AvatarFallback` shows until it loads. */
export function AvatarImage({ className, ...props }: BaseAvatar.Image.Props): React.ReactElement {
  return (
    <BaseAvatar.Image
      data-slot="avatar-image"
      className={cn("size-full object-cover", className)}
      {...props}
    />
  )
}

/** The initials shown when there is no picture, such as "MO". */
export function AvatarFallback(props: BaseAvatar.Fallback.Props): React.ReactElement {
  return <BaseAvatar.Fallback data-slot="avatar-fallback" {...props} />
}

const spreadClass = cn(
  "*:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:transition-[margin-inline-start] *:data-[slot=avatar]:duration-quick *:data-[slot=avatar]:ease-out motion-reduce:*:data-[slot=avatar]:transition-none",
  "*:data-[slot=avatar]:not-first:-ms-[calc(var(--avatar-size)/2)]",
  "[&:is(:hover,:focus-visible,[data-popup-open],[data-spread])>[data-slot=avatar]:not(:first-child)]:ms-1",
  "[:is(a,button):is(:hover,:focus-visible,[data-popup-open])_&>[data-slot=avatar]:not(:first-child)]:ms-1"
)

/** Props for {@link AvatarGroup}. */
export type AvatarGroupProps = useRender.ComponentProps<"span"> & {
  /** How many avatars to draw before a "+N" avatar counts the rest. Defaults to 3; one more is drawn instead of "+1". */
  max?: number
  /** Sets every avatar in the group: `"default"` 20px, `"lg"` 24px. */
  size?: "default" | "lg"
  /** Names the group for screen readers, such as "6 watchers"; omit it when a label beside it does. */
  label?: string
}

/**
 * Several `Avatar`s overlapping by half their width. They spread apart while the group, or the
 * button or link around it, is hovered, focused or open. Render it as a trigger, such as
 * `render={<Popover.Trigger />}`, so the names it hides can be reached.
 */
export function AvatarGroup({
  max = 3,
  size = "default",
  label,
  render,
  className,
  children,
  ...props
}: AvatarGroupProps): React.ReactElement {
  const items = React.Children.toArray(children)
  const shown = items.length > max + 1 ? max : items.length
  const rest = items.length - shown
  return useRender({
    defaultTagName: "span",
    render,
    state: { size },
    props: mergeProps<"span">(
      {
        className: cn(
          "data-[size=lg]:*:[--avatar-size:--spacing(6)] inline-flex min-h-6 shrink-0 items-center outline-hidden [&:is(button,a)]:rounded-floor [&:is(button,a)]:focus-ring [&:is(button,a)]:pointer-coarse:min-h-11",
          spreadClass,
          className
        ),
        children: (
          <>
            {items.slice(0, shown)}
            {rest > 0 ? <Avatar>+{rest}</Avatar> : null}
            {label === undefined ? null : <span className="sr-only">{label}</span>}
          </>
        ),
      },
      props
    ),
  })
}

/** One person's avatar, square for a team. */
export function PersonAvatar({
  person,
  size,
}: {
  person: SamplePerson
  size?: AvatarProps["size"]
}): React.ReactElement {
  return (
    <Avatar size={size} shape={person.kind === "team" ? "square" : "circle"}>
      <AvatarFallback>{person.initials}</AvatarFallback>
    </Avatar>
  )
}

/** The people's avatars in a group; it draws three and counts the rest. */
export function PeopleGroup({
  people,
  ...props
}: Omit<AvatarGroupProps, "children"> & {
  people: ReadonlyArray<SamplePerson>
}): React.ReactElement {
  return (
    <AvatarGroup {...props}>
      {people.map((person) => (
        <PersonAvatar key={person.name} person={person} />
      ))}
    </AvatarGroup>
  )
}

/** Each person's name and one line about them, as a popover lists them. */
export function PeopleList({
  people,
}: {
  people: ReadonlyArray<SamplePerson>
}): React.ReactElement {
  return (
    <ul className="flex flex-col gap-2">
      {people.map((person) => (
        <li key={person.name} className="flex items-center gap-related">
          <PersonAvatar person={person} />
          <span className="min-w-0">
            <span className="block truncate font-medium">{person.name}</span>
            <span className="block truncate text-muted-foreground">{person.summary}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/** One person's name and the line about them, as their hover card shows it. */
export function PersonCard({ person }: { person: SamplePerson }): React.ReactElement {
  return (
    <>
      <p className="font-medium">{person.name}</p>
      <p className="mt-1 text-muted-foreground">{person.summary}</p>
    </>
  )
}

/** A popover's popup listing `people` under `title`, below its trigger. */
export function PeoplePopup({
  title,
  people,
}: {
  title: string
  people: ReadonlyArray<SamplePerson>
}): React.ReactElement {
  return (
    <Popover.Portal>
      <Popover.Positioner side="bottom" align="start" sideOffset={6} className="z-popover">
        <Popover.Popup className={cardSurface}>
          <Popover.Title className="mb-2 font-medium">{title}</Popover.Title>
          <PeopleList people={people} />
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  )
}
