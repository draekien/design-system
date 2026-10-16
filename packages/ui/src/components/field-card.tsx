import { PreviewCard } from "@base-ui/react/preview-card"
import { cn } from "cn"
import type * as React from "react"

/**
 * Rank 4: more about one entity or property already on screen, such as a person or a stage, in a
 * hover card on that value. Opens 300ms after the pointer enters its trigger and closes as soon as
 * it leaves. Every field in it must also appear in peek and on the item's page.
 */
export function FieldCard(props: PreviewCard.Root.Props): React.ReactElement {
  return <PreviewCard.Root {...props} />
}

/**
 * The value that opens its `FieldCard` on hover. It is not focusable; peek and the item's page are
 * the keyboard and touch routes to the same fields.
 */
export function FieldCardTrigger({
  className,
  ...props
}: PreviewCard.Trigger.Props): React.ReactElement {
  return (
    <PreviewCard.Trigger
      data-slot="field-card-trigger"
      delay={300}
      closeDelay={0}
      render={<span />}
      className={cn(
        "inline-flex min-h-6 min-w-6 max-w-full items-center justify-center",
        className
      )}
      {...props}
    />
  )
}

/** Props for {@link FieldCardContent}. */
export type FieldCardContentProps = PreviewCard.Popup.Props &
  Pick<PreviewCard.Positioner.Props, "align" | "side" | "sideOffset" | "collisionAvoidance"> &
  Pick<PreviewCard.Portal.Props, "container">

/**
 * The card drawn below its trigger. It may hold links. It renders into `<body>` unless `container`
 * names another element, such as a scaled or panned canvas the card must move with. A click inside
 * it does not reach the trigger's ancestors, so it never activates the row link around the trigger.
 */
export function FieldCardContent({
  align = "start",
  side = "bottom",
  sideOffset = 6,
  collisionAvoidance,
  container,
  className,
  onClick,
  ...props
}: FieldCardContentProps): React.ReactElement {
  return (
    <PreviewCard.Portal container={container}>
      <PreviewCard.Positioner
        align={align}
        side={side}
        sideOffset={sideOffset}
        collisionAvoidance={collisionAvoidance}
        className="z-50"
      >
        <PreviewCard.Popup
          data-slot="field-card-content"
          className={cn(
            "w-60 origin-(--transform-origin) rounded-lg border bg-popover p-3 text-popover-foreground text-xs shadow-[0_1px_2px_rgb(0_0_0/0.05),0_10px_28px_-8px_rgb(0_0_0/0.18)] transition-[opacity,scale] duration-150 ease-out data-ending-style:opacity-0 data-ending-style:duration-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0 motion-reduce:transition-none",
            className
          )}
          onClick={(event) => {
            event.stopPropagation()
            onClick?.(event)
          }}
          {...props}
        />
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  )
}
