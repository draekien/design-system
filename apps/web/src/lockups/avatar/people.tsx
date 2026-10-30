import { Popover } from "@base-ui/react/popover"
import type { SamplePerson } from "@workspace/fixtures/record-details.ts"
import type * as React from "react"
import { Avatar, AvatarFallback, AvatarGroup, type AvatarProps } from "@/components/avatar.tsx"
import { Entity, EntityDescription, EntityMedia, EntityName } from "@/components/entity.tsx"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"
import { cn } from "@/lib/cn.ts"
import { popupSurface } from "./people-styles.ts"

function shapeOf(person: SamplePerson): AvatarProps["shape"] {
  return person.kind === "team" ? "square" : "circle"
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
    <Avatar size={size} shape={shapeOf(person)}>
      <AvatarFallback>{person.initials}</AvatarFallback>
    </Avatar>
  )
}

/** The person's avatar and name. */
export function PersonEntity({ person }: { person: SamplePerson }): React.ReactElement {
  return (
    <Entity>
      <EntityMedia shape={shapeOf(person)}>{person.initials}</EntityMedia>
      <EntityName>{person.name}</EntityName>
    </Entity>
  )
}

/** One person's name and the line about them, as their hover card shows it. */
export function PersonCard({ person }: { person: SamplePerson }): React.ReactElement {
  return (
    <>
      <p className="font-semibold text-sm">{person.name}</p>
      <p className="mt-1 text-muted-foreground">{person.summary}</p>
    </>
  )
}

/** The person's avatar and name, a link to their profile with a hover card naming them. */
export function PersonLink({ person }: { person: SamplePerson }): React.ReactElement {
  return (
    <PreviewCard>
      <PreviewCardTrigger
        render={<a href={person.profileUrl} />}
        className="focus-ring justify-start rounded-floor pointer-coarse:min-h-11 [&:hover_[data-slot=entity-name]]:underline"
      >
        <PersonEntity person={person} />
      </PreviewCardTrigger>
      <PreviewCardContent>
        <PersonCard person={person} />
      </PreviewCardContent>
    </PreviewCard>
  )
}

/** The people's avatars in a group; it draws three and counts the rest. */
export function PeopleGroup({
  people,
  ...props
}: Omit<React.ComponentProps<typeof AvatarGroup>, "children"> & {
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

/** Each person as a link to their profile: avatar, name, and one line about them. */
export function PeopleList({
  people,
}: {
  people: ReadonlyArray<SamplePerson>
}): React.ReactElement {
  return (
    <ul className="flex flex-col gap-run">
      {people.map((person) => (
        <li key={person.name} className="flex">
          <a
            href={person.profileUrl}
            className="focus-ring flex min-h-7 min-w-0 grow items-center rounded-floor [&:hover_[data-slot=entity-name]]:underline pointer-coarse:min-h-11"
          >
            <Entity className="min-w-0 grow">
              <EntityMedia shape={shapeOf(person)}>{person.initials}</EntityMedia>
              <EntityName>{person.name}</EntityName>
              <EntityDescription>{person.summary}</EntityDescription>
            </Entity>
          </a>
        </li>
      ))}
    </ul>
  )
}

/** The popup's contents: `title` with the count, then everyone as links to their profiles. */
export function PeoplePopupBody({
  title,
  people,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  title: string
  people: ReadonlyArray<SamplePerson>
}): React.ReactElement {
  return (
    <div className={cn(popupSurface, "flex flex-col gap-related", className)} {...props}>
      <p className="font-semibold text-sm">
        {title} · {people.length}
      </p>
      <PeopleList people={people} />
    </div>
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
        <Popover.Popup
          aria-label={title}
          render={
            <PeoplePopupBody
              title={title}
              people={people}
              className="max-h-(--available-height) overflow-y-auto"
            />
          }
        />
      </Popover.Positioner>
    </Popover.Portal>
  )
}
