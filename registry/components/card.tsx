import { Collapsible } from "@base-ui/react/collapsible"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as React from "react"
// biome-ignore lint/correctness/useImportExtensions: shadcn add copies this import into consumer projects, which may not allow .ts extensions
import { cn } from "@/lib/cn"

const cardClass = cn(
  "group/card @container relative isolate grid min-w-0 grid-cols-1 content-start gap-related rounded-card bg-card p-3 inset-ring inset-ring-border text-card-foreground text-sm",
  "*:col-span-full has-data-[slot=card-aside]:grid-cols-[minmax(50%,1fr)_auto]",
  "*:data-[slot=card-aside]:col-[2] *:data-[slot=card-aside]:row-[1]",
  "has-data-[slot=card-media]:*:data-[slot=card-aside]:mt-(--card-media-height) has-data-[slot=card-media]:*:data-[slot=card-aside]:pt-related",
  "has-data-[slot=card-aside]:*:not-data-[slot=card-aside]:first:col-[1] [&>[data-slot=card-aside]:first-child+*]:col-[1]",
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-card",
  "has-data-[slot=card-link]:hover:before:bg-foreground/4",
  "has-[[data-slot=card-link]:focus-visible]:before:bg-foreground/4 has-[[data-slot=card-link]:focus-visible]:inset-ring has-[[data-slot=card-link]:focus-visible]:inset-ring-ring/40"
)

/**
 * One record or one figure in a container: 12px padding, the card radius, a hairline border and no
 * shadow. Its parts take ranks: `CardSubject` (rank 1), `CardFacts` (rank 2), `CardExplain` (rank 3),
 * and `CardLink` to the record's page (rank 5). A `CardAside` placed anywhere among the children takes
 * the top right; without one, every part spans the card.
 */
export function Card({
  render,
  className,
  ...props
}: useRender.ComponentProps<"div">): React.ReactElement {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: cn(cardClass, className) }, props),
  })
}

/**
 * Rank 1: an optional `CardMedia`, then `CardId`, `CardName` and `CardDescription`, in that order, at
 * the top of the card.
 */
export function CardSubject({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      data-slot="card-subject"
      className={cn("flex min-w-0 flex-col *:data-[slot=card-media]:mb-related", className)}
      {...props}
    />
  )
}

const actionsGap = "gap-run pointer-coarse:gap-hit-coarse-gap"

const revealedActions =
  "grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity] duration-quick ease-out group-hover/card:grid-cols-[1fr] group-hover/card:opacity-100 group-focus-within/card:grid-cols-[1fr] group-focus-within/card:opacity-100 has-data-popup-open:grid-cols-[1fr] has-data-popup-open:opacity-100 pointer-coarse:grid-cols-[1fr] pointer-coarse:opacity-100 motion-reduce:transition-none"

/** Props for {@link CardAside}. */
export type CardAsideProps = React.ComponentProps<"div"> & {
  /**
   * At most two `CardAction`s, then a ⋮ menu holding the rest. They show while the pointer is over
   * the card, focus is inside it or its menu is open, and always on a touch screen. They mount
   * twice: a hidden, inert copy reserves their width, so each menu or tooltip root exists twice.
   */
  actions?: React.ReactNode
}

/**
 * The top right of the card, beside its first other part, or beside the ID under a `CardMedia`.
 * `children` always show: a change, a status word or an icon, at most a third of the card's width. As
 * `actions` appear, `children` slide toward the card's middle; they slide back as `actions` hide. The
 * slot reserves the width of both, so the part beside it never reflows.
 */
export function CardAside({
  actions,
  className,
  children,
  ...props
}: CardAsideProps): React.ReactElement {
  const hasChildren = children !== undefined && children !== null && children !== false
  const gap = hasChildren ? "ps-related" : null
  const shown = !hasChildren ? null : (
    <div className="flex min-h-hit-min min-w-0 max-w-(--card-aside-max) items-center justify-end">
      {children}
    </div>
  )
  const hasActions = actions !== undefined && actions !== null && actions !== false
  return (
    <div
      data-slot="card-aside"
      className={cn(
        "pointer-events-none relative z-raised grid min-h-hit-min min-w-0 text-end",
        className
      )}
      {...props}
    >
      {hasActions ? (
        <div
          aria-hidden="true"
          inert
          className="invisible col-start-1 row-start-1 flex min-w-0 items-start"
        >
          {shown}
          <div className={cn("flex shrink-0", actionsGap, gap)}>{actions}</div>
        </div>
      ) : null}
      <div className="col-start-1 row-start-1 flex min-w-0 items-start justify-end *:pointer-events-auto">
        {shown}
        {hasActions ? (
          <div className={revealedActions}>
            <div
              className={cn(
                "flex min-w-0 overflow-clip pointer-coarse:overflow-visible",
                actionsGap,
                gap
              )}
            >
              {actions}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/**
 * A 24px button in `CardAside`: one icon, named by `aria-label` and a tooltip, or one short word. On a
 * touch screen its hit area grows to 44px around it without moving it. Pass it as a Base UI trigger's
 * `render` to open a menu or a tooltip.
 */
export function CardAction({
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button">): React.ReactElement {
  return (
    <button
      data-slot="card-action"
      type={type}
      className={cn(
        "relative inline-flex h-hit-min min-w-hit-min shrink-0 cursor-pointer items-center justify-center rounded-floor px-1.5 font-medium text-muted-foreground text-xs hover:bg-foreground/7 hover:text-foreground has-[>svg:only-child]:px-0 [&>svg]:size-4",
        "focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2",
        "pointer-coarse:after:absolute pointer-coarse:after:-inset-hit-outset",
        className
      )}
      {...props}
    />
  )
}

const iconSlot = "inline-flex size-4 shrink-0 items-center justify-center *:size-4"

function ImageIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="10" rx="2" />
      <circle cx="6" cy="6.5" r="1" />
      <path d="m2.5 11.5 3.5-3.5 2.5 2.5 2-2 3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 3.5 10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const mediaClass = "aspect-video w-(--card-media-width) max-w-none shrink-0 rounded-floor bg-muted"

/** Props for {@link CardMedia}. */
export type CardMediaProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  /** Replaces the image icon in the empty box; any icon library's 16px icon. */
  icon?: React.ReactNode
} & (
    | {
        kind: "picture"
        src: string
        /** Empty by default, because the name below the picture names the record. */
        alt?: string
      }
    | {
        kind: "missing"
        /** `"No picture"` when the record has none; `"Hidden"` when the caller may not see it. */
        reason: "No picture" | "Hidden"
      }
  )

function MediaBox({
  reason,
  icon,
  className,
  attrs,
}: {
  reason: "No picture" | "Hidden" | "Unavailable"
  icon: React.ReactNode
  className: string | undefined
  attrs: React.HTMLAttributes<HTMLElement>
}) {
  return (
    <div
      {...attrs}
      data-slot="card-media"
      className={cn(
        mediaClass,
        "flex flex-col items-center justify-center gap-1 text-muted-foreground text-xs",
        className
      )}
    >
      <span className={iconSlot}>{icon ?? <ImageIcon />}</span>
      <CardMissing>{reason}</CardMissing>
    </div>
  )
}

/**
 * The picture a caller recognises the record by, first in `CardSubject`: the card's full width at
 * 16:9, cropped to fill, with the floor radius. A record with no picture, a picture the caller may not
 * see and a picture that fails to load each draw an empty 16:9 box naming why, so every card in a run
 * starts its ID at the same height.
 */
export function CardMedia(props: CardMediaProps): React.ReactElement {
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null)
  if (props.kind === "missing") {
    const { kind, reason, icon, className, ...attrs } = props
    return <MediaBox reason={reason} icon={icon} className={className} attrs={attrs} />
  }
  const { kind, src, alt = "", icon, className, ...attrs } = props
  if (failedSrc === src) {
    return <MediaBox reason="Unavailable" icon={icon} className={className} attrs={attrs} />
  }
  return (
    <img
      {...attrs}
      data-slot="card-media"
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      ref={(node) => {
        if (node?.complete && node.naturalWidth === 0) setFailedSrc(src)
      }}
      onError={() => setFailedSrc(src)}
      className={cn(mediaClass, "object-cover", className)}
    />
  )
}

/** The record's ID in muted tabular figures. */
export function CardId({ className, ...props }: React.ComponentProps<"span">): React.ReactElement {
  return (
    <span
      data-slot="card-id"
      className={cn("text-muted-foreground text-xs tabular-nums", className)}
      {...props}
    />
  )
}

/** The record's name, at most two lines; it holds the `CardLink`. */
export function CardName({ className, ...props }: React.ComponentProps<"h3">): React.ReactElement {
  return (
    <h3
      data-slot="card-name"
      dir="auto"
      className={cn("line-clamp-2 wrap-break-word font-medium text-sm", className)}
      {...props}
    />
  )
}

/** One line after the name; it truncates. */
export function CardDescription({
  className,
  ...props
}: React.ComponentProps<"p">): React.ReactElement {
  return (
    <p
      data-slot="card-description"
      dir="auto"
      className={cn("truncate text-muted-foreground text-xs", className)}
      {...props}
    />
  )
}

/**
 * Rank 5: the link to the record's own page, inside `CardName`. Its hit area covers the card, so a
 * click anywhere on the card except a control follows it.
 */
export function CardLink({ className, ...props }: React.ComponentProps<"a">): React.ReactElement {
  return (
    <a
      data-slot="card-link"
      className={cn(
        "outline-hidden after:absolute after:inset-0 after:rounded-card hover:underline hover:underline-offset-2",
        className
      )}
      {...props}
    />
  )
}

const FactsLayoutContext = React.createContext<"row" | "labelled">("row")

/** Props for {@link CardFacts}. */
export type CardFactsProps = React.ComponentProps<"dl"> & {
  /**
   * `"row"` draws the facts on one line in the same order on every card, with each property's name
   * read by screen readers only; `"labelled"` draws one per 24px line after its property's name.
   */
  layout?: "row" | "labelled"
}

/** Rank 2: the facts the surface compares, as `CardFact`s. */
export function CardFacts({
  layout = "row",
  className,
  ...props
}: CardFactsProps): React.ReactElement {
  return (
    <FactsLayoutContext.Provider value={layout}>
      <dl
        data-slot="card-facts"
        className={cn(
          layout === "row"
            ? "flex min-w-0 items-center gap-x-3 text-xs"
            : "grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-1",
          className
        )}
        {...props}
      />
    </FactsLayoutContext.Provider>
  )
}

const abbreviateClass =
  "min-w-0 @max-card-abbreviate:**:data-[abbreviation=long]:sr-only @max-card-abbreviate:**:data-[abbreviation=short]:inline"

const narrowClass = {
  keep: "shrink-0",
  abbreviate: abbreviateClass,
  hide: `${abbreviateClass} shrink-0 @max-card-hide:hidden`,
} as const

/** Props for {@link CardFact}. */
export type CardFactProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The property's name. */
  label: string
  /**
   * In a row, a card whose content is narrower than 16rem abbreviates a fact marked `"abbreviate"` or `"hide"`, and a
   * card whose content is narrower than 13rem drops one marked `"hide"`; the record's page still shows it.
   */
  narrow?: keyof typeof narrowClass
  /** One status, entity, figure or relative time, or text, which truncates to one line. */
  children: React.ReactNode
}

/** One fact about the subject, named by `label`. */
export function CardFact({
  label,
  narrow = "keep",
  className,
  children,
  ...props
}: CardFactProps): React.ReactElement {
  const layout = React.use(FactsLayoutContext)
  const value =
    typeof children === "string" ? <span className="truncate">{children}</span> : children
  return (
    <div
      data-slot="card-fact"
      className={cn(
        layout === "row"
          ? cn("flex min-h-hit-min items-center", narrowClass[narrow])
          : "col-span-2 grid h-hit-min grid-cols-subgrid items-center *:last:overflow-clip *:last:whitespace-nowrap",
        className
      )}
      {...props}
    >
      <dt className={layout === "row" ? "sr-only" : "text-muted-foreground text-xs"}>{label}</dt>
      <dd className="flex min-w-0">{value}</dd>
    </div>
  )
}

/** Props for {@link CardExplain}. */
export type CardExplainProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Names the content, such as "Summary"; it stays on screen at rest. */
  trigger: string
  /** Replaces the chevron; any icon library's 16px icon pointing to the inline end. */
  icon?: React.ReactNode
  children: React.ReactNode
}

/** Rank 3: content read on some visits, one click away behind `trigger`. */
export function CardExplain({
  trigger,
  icon,
  className,
  children,
  ...props
}: CardExplainProps): React.ReactElement {
  return (
    <Collapsible.Root
      data-slot="card-explain"
      className={cn("flex flex-col items-start", className)}
      {...props}
    >
      <Collapsible.Trigger className="group/explain relative z-raised -ms-1 inline-flex min-h-hit-min cursor-pointer items-center gap-1 rounded-floor px-1 text-muted-foreground text-xs hover:bg-foreground/7 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:min-h-hit-coarse">
        <span
          aria-hidden="true"
          className={cn(
            iconSlot,
            "group-data-panel-open/explain:rotate-90 motion-safe:transition-transform rtl:-scale-x-100 rtl:group-data-panel-open/explain:-rotate-90"
          )}
        >
          {icon ?? <ChevronIcon />}
        </span>
        {trigger}
      </Collapsible.Trigger>
      <Collapsible.Panel
        dir="auto"
        hiddenUntilFound
        className="relative z-raised wrap-break-word pt-1 text-muted-foreground text-xs"
      >
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
  )
}

/** A rank 2 value the caller cannot see, in its slot: "Unavailable" or "Hidden". */
export function CardMissing({ children }: { children: string }): React.ReactElement {
  return <span className="text-muted-foreground">{children}</span>
}
