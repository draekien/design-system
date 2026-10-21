import type * as React from "react"
// biome-ignore lint/correctness/useImportExtensions: shadcn add copies this import into consumer projects, which may not allow .ts extensions
import { cn } from "@/lib/cn"

/**
 * A person, team or organisation drawn as its initials or picture, then its name. Compose
 * `EntityMedia`, then `EntityName`, then an optional `EntityDescription`. In an abbreviated
 * `RecordRowFact` and in a `RecordRowMedia` only the media is drawn, and the name and description
 * are read by screen readers only.
 */
export function Entity({ className, ...props }: React.ComponentProps<"span">): React.ReactElement {
  return (
    <span
      data-slot="entity"
      className={cn("inline-flex min-w-0 items-center gap-2", className)}
      {...props}
    />
  )
}

/**
 * A 24×24px circle holding the entity's initials, such as "MO", or an `<img>` of it, which fills
 * the circle. Hidden from screen readers, so `EntityName` carries the name.
 */
export function EntityMedia({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement {
  return (
    <span
      data-slot="entity-media"
      aria-hidden="true"
      className={cn(
        "flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-micro text-muted-foreground uppercase [&_img]:size-full [&_img]:object-cover",
        className
      )}
      {...props}
    />
  )
}

/** The entity's name, such as "Mara Okafor". */
export function EntityName({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement {
  return (
    <span
      data-slot="entity-name"
      data-abbreviation="long"
      className={cn("truncate", className)}
      {...props}
    />
  )
}

/**
 * One line after the name saying more about the entity, such as their team, in muted text. It
 * truncates before the name does.
 */
export function EntityDescription({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement {
  return (
    <span
      data-slot="entity-description"
      data-abbreviation="long"
      className={cn("min-w-0 shrink-100 truncate text-muted-foreground", className)}
      {...props}
    />
  )
}
