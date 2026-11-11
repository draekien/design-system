import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import type * as React from "react"
// biome-ignore lint/correctness/useImportExtensions: shadcn add copies this import into consumer projects, which may not allow .ts extensions
import { cn } from "@/lib/cn"

const bulletClass = cn(
  "relative isolate inline-flex min-h-hit-min min-w-0 max-w-full items-center justify-start gap-related text-left text-xs outline-hidden data-[size=lg]:text-sm data-[size=lg]:**:data-[slot=avatar]:[--avatar-size:--spacing(6)] data-[size=lg]:**:data-[slot=bullet-media]:size-4",
  "before:absolute before:inset-y-0 before:-inset-x-1 before:-z-10 before:rounded-floor",
  "[&:is(button,a):not([data-slot=preview-card-trigger])]:hover:before:bg-foreground/4 [&:is(button,a):not([data-slot=preview-card-trigger])]:data-popup-open:before:bg-foreground/7",
  "focus-visible:before:outline-2 focus-visible:before:outline-foreground focus-visible:before:outline-solid",
  "[&:is(button,a)]:pointer-coarse:min-h-hit-coarse"
)

/** Props for {@link Bullet}. */
export type BulletProps = useRender.ComponentProps<"span"> & {
  /**
   * `"default"` draws a 12px label, 14px icons and 20px avatars; `"lg"` draws a 14px label,
   * 16px icons and 24px avatars. Both keep a hit area at least 24px high, and 44px on a coarse
   * pointer when the bullet is a button or link.
   */
  size?: "default" | "lg"
}

/**
 * One fact on one line: `BulletMedia`, an `Avatar` or an `AvatarGroup`, and a `BulletLabel`, drawn
 * in the order they are written. Render it as a trigger, such as `render={<Menu.Trigger />}`, or as
 * a link to open something; a button or link tints on hover and while its popup is open, except a
 * hover card trigger, which draws no tint.
 */
export function Bullet({
  render,
  size = "default",
  className,
  ...props
}: BulletProps): React.ReactElement {
  return useRender({
    defaultTagName: "span",
    render,
    state: { size },
    props: mergeProps<"span">({ className: cn(bulletClass, className) }, props),
  })
}

/** Props for {@link BulletMedia}. */
export type BulletMediaProps = React.ComponentProps<"span"> & {
  /** What the icon adds for screen readers, such as ", restricted"; omit it for an icon that repeats the label. */
  label?: string
}

/** One muted icon, 14px or 16px by the bullet's size, before or after the label. */
export function BulletMedia({
  label,
  className,
  children,
  ...props
}: BulletMediaProps): React.ReactElement {
  return (
    <span
      data-slot="bullet-media"
      className={cn(
        "flex size-3.5 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-full",
        className
      )}
      {...props}
    >
      <span aria-hidden="true" className="contents">
        {children}
      </span>
      {label === undefined ? null : <span className="sr-only">{label}</span>}
    </span>
  )
}

/**
 * The fact in words, such as "High"; it truncates before any media does. In a list, table or card
 * part that abbreviates when narrow, it moves to screen readers only and the media stays.
 */
export function BulletLabel({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement {
  return (
    <span
      data-slot="bullet-label"
      data-abbreviation="long"
      className={cn("min-w-0 truncate", className)}
      {...props}
    />
  )
}
