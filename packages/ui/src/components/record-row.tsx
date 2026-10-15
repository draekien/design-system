import { Checkbox } from "@base-ui/react/checkbox"
import { mergeProps } from "@base-ui/react/merge-props"
import { PreviewCard } from "@base-ui/react/preview-card"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "cn"
import * as React from "react"
// biome-ignore lint/correctness/useImportExtensions: shadcn add copies this import into consumer projects, which may not allow .tsx extensions
import { useRecordList } from "@/components/record-list"

type RecordRowContextValue =
  | {
      kind: "record"
      value: string
      titleId: string
      isSelected: boolean
      isPeeked: boolean
    }
  | { kind: "loading" }

const RecordRowContext = React.createContext<RecordRowContextValue | null>(null)

function useRecordRow(part: string): RecordRowContextValue {
  const context = React.useContext(RecordRowContext)
  if (context === null) {
    throw new Error(`${part} must be rendered inside a RecordRow or RecordRowLoading.`)
  }
  return context
}

const rowClass = "group/record-row flex h-11 items-center gap-1 border-b px-2"

const slotClass = {
  select: "flex size-6 shrink-0 items-center justify-center pointer-coarse:size-11",
  link: "flex h-full min-w-0 flex-1 items-center gap-3 px-1",
  id: "hidden w-16 shrink-0 truncate text-muted-foreground text-xs tabular-nums @min-[40rem]:block",
  status: "flex size-6 shrink-0 items-center justify-center",
  title:
    "min-w-0 flex-1 truncate font-medium text-sm decoration-2 decoration-ring underline-offset-3 group-focus-visible/record-row-link:underline",
  owner:
    "flex w-6 shrink-0 items-center text-sm has-data-[slot=record-row-field-status]:w-20 @min-[40rem]:w-36 @min-[40rem]:has-data-[slot=record-row-field-status]:w-36",
  updated:
    "hidden w-20 shrink-0 justify-end text-muted-foreground text-xs tabular-nums @min-[48rem]:flex",
}

function Bar({ className }: { className: string }) {
  return (
    <span className={cn("block h-2 rounded-full bg-muted motion-safe:animate-pulse", className)} />
  )
}

/** Props for {@link RecordRow}. */
export type RecordRowProps = useRender.ComponentProps<"li"> & {
  /** The record's unique value. `RecordList` selection and peek refer to rows by this value. */
  value: string
}

/**
 * One record in a `RecordList`. Compose its slots in this order: `RecordRowSelect`, then
 * `RecordRowLink` holding `RecordRowId`, `RecordRowStatus`, `RecordRowTitle`, `RecordRowOwner`
 * and `RecordRowUpdated`. Each slot has a fixed width so columns align down the list.
 */
export function RecordRow({
  value,
  render,
  className,
  ...props
}: RecordRowProps): React.ReactElement {
  const list = useRecordList()
  const titleId = React.useId()
  const isSelected = list.selectedValues.includes(value)
  const isPeeked = list.peekValue === value

  const element = useRender({
    defaultTagName: "li",
    render,
    state: { slot: "record-row", selected: isSelected, peeked: isPeeked },
    props: mergeProps<"li">(
      {
        className: cn(
          rowClass,
          "hover:bg-foreground/4 has-[[data-slot=record-row-link]:focus-visible]:bg-foreground/7 data-peeked:bg-foreground/7 data-peeked:hover:bg-foreground/7",
          className
        ),
      },
      props
    ),
  })

  return (
    <RecordRowContext.Provider value={{ kind: "record", value, titleId, isSelected, isPeeked }}>
      {element}
    </RecordRowContext.Provider>
  )
}

/**
 * A placeholder row shown while records load. Compose the same slots as `RecordRow`; each slot
 * draws a bar at its own width and ignores its children, so the loading row matches the rows
 * that replace it.
 */
export function RecordRowLoading({
  render,
  className,
  ...props
}: useRender.ComponentProps<"li">): React.ReactElement {
  const element = useRender({
    defaultTagName: "li",
    render,
    state: { slot: "record-row-loading" },
    props: mergeProps<"li">({ className: cn(rowClass, className), "aria-hidden": true }, props),
  })
  return (
    <RecordRowContext.Provider value={{ kind: "loading" }}>{element}</RecordRowContext.Provider>
  )
}

/** Props for {@link RecordRowSelect}. */
export type RecordRowSelectProps = Omit<
  Checkbox.Root.Props,
  "checked" | "defaultChecked" | "onCheckedChange" | "children"
>

/**
 * The row's selection checkbox. It is 24×24px, 44×44px on a coarse pointer, and is drawn only on
 * a hovered, focused or selected row, and always on a coarse pointer. It is not a tab stop: X on
 * the focused row toggles it. Its accessible name is "Select" followed by the row's title.
 */
export function RecordRowSelect({ className, ...props }: RecordRowSelectProps): React.ReactElement {
  const row = useRecordRow("RecordRowSelect")
  const list = useRecordList()
  const labelId = React.useId()

  if (row.kind === "loading") {
    return <span data-slot="record-row-select" className={slotClass.select} />
  }

  return (
    <Checkbox.Root
      data-slot="record-row-select"
      tabIndex={-1}
      checked={row.isSelected}
      onCheckedChange={() => list.onToggleSelected(row.value)}
      aria-labelledby={`${labelId} ${row.titleId}`}
      className={cn(
        slotClass.select,
        "group/select invisible cursor-pointer rounded-md outline-none data-checked:visible pointer-coarse:visible group-hover/record-row:visible group-has-[[data-slot=record-row-link]:focus-visible]/record-row:visible",
        className
      )}
      {...props}
    >
      <span id={labelId} className="sr-only">
        Select
      </span>
      <span className="flex size-4 items-center justify-center rounded-[0.3125rem] border border-input bg-background text-primary-foreground shadow-xs transition-colors group-hover/select:border-muted-foreground group-data-checked/select:border-primary group-data-checked/select:bg-primary">
        <Checkbox.Indicator>
          <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3">
            <path
              d="M3.5 8.5 6.5 11.5 12.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Checkbox.Indicator>
      </span>
    </Checkbox.Root>
  )
}

/**
 * The link to the record's page, holding every slot after `RecordRowSelect`. Pass your router's
 * link through `render`. It is the row's one focus target and handles the `RecordList` keys.
 */
export function RecordRowLink({
  render,
  className,
  children,
  ...props
}: useRender.ComponentProps<"a">): React.ReactElement {
  const row = useRecordRow("RecordRowLink")
  const list = useRecordList()
  const isRecord = row.kind === "record"

  return useRender({
    defaultTagName: "a",
    render: isRecord ? render : <span />,
    state: isRecord ? { slot: "record-row-link", value: row.value } : { slot: "record-row-link" },
    props: isRecord
      ? mergeProps<"a">(
          {
            className: cn(slotClass.link, "group/record-row-link outline-none", className),
            tabIndex: list.activeValue === row.value ? 0 : -1,
            "aria-expanded": row.isPeeked,
            "aria-keyshortcuts": "Space X ArrowUp ArrowDown Home End Escape",
            onFocus: () => list.onLinkFocus(row.value),
            onKeyDown: (event) => list.onLinkKeyDown(event, row.value),
            children: (
              <>
                {children}
                {row.isSelected ? <span className="sr-only">, selected</span> : null}
              </>
            ),
          },
          props
        )
      : { className: cn(slotClass.link, className), children },
  })
}

type SlotPartProps = useRender.ComponentProps<"span">

function useSlotPart(
  part: string,
  slot: string,
  slotClassName: string,
  placeholder: React.ReactNode,
  { render, className, children, ...props }: SlotPartProps
) {
  const row = useRecordRow(part)
  const isRecord = row.kind === "record"
  return useRender({
    defaultTagName: "span",
    render: isRecord ? render : <span />,
    state: { slot },
    props: mergeProps<"span">(
      { className: cn(slotClassName, className) },
      isRecord ? { ...props, children } : { children: placeholder }
    ),
  })
}

/** The record's identifier, 64px wide, in muted tabular figures. Hidden when the list is narrower than 640px. */
export function RecordRowId(props: SlotPartProps): React.ReactElement {
  return useSlotPart(
    "RecordRowId",
    "record-row-id",
    slotClass.id,
    <Bar className="w-full" />,
    props
  )
}

/** Props for {@link RecordRowStatus}. */
export type RecordRowStatusProps = SlotPartProps & {
  /** The status read by screen readers, for example `"In review"`. The children are drawn and hidden from screen readers. */
  label: string
}

/** A 24×24px status glyph. Wrap the glyph in a `RecordRowCard` to show more about the status on hover. */
export function RecordRowStatus({
  label,
  children,
  ...props
}: RecordRowStatusProps): React.ReactElement {
  return useSlotPart(
    "RecordRowStatus",
    "record-row-status",
    slotClass.status,
    <span className="size-2.5 rounded-full bg-muted" />,
    {
      ...props,
      children: (
        <>
          <span aria-hidden="true" className="contents">
            {children}
          </span>
          <span className="sr-only">{label}</span>
        </>
      ),
    }
  )
}

/** The record's title. Fills the width left over by the other slots and truncates. */
export function RecordRowTitle(props: SlotPartProps): React.ReactElement {
  const row = useRecordRow("RecordRowTitle")
  const id = row.kind === "record" ? row.titleId : undefined
  return useSlotPart(
    "RecordRowTitle",
    "record-row-title",
    slotClass.title,
    <Bar className="w-2/3" />,
    {
      ...props,
      id,
    }
  )
}

/**
 * The record's owner, 24px wide (initials only) when the list is narrower than 640px and 144px
 * from 640px. Holds a `RecordRowPerson`, or a `RecordRowFieldStatus` when the owner failed to
 * load or is withheld.
 */
export function RecordRowOwner(props: SlotPartProps): React.ReactElement {
  return useSlotPart(
    "RecordRowOwner",
    "record-row-owner",
    slotClass.owner,
    <Bar className="w-full" />,
    props
  )
}

/** When the record was last updated, 80px wide and right-aligned. Hidden when the list is narrower than 768px. */
export function RecordRowUpdated(props: SlotPartProps): React.ReactElement {
  return useSlotPart(
    "RecordRowUpdated",
    "record-row-updated",
    slotClass.updated,
    <Bar className="w-full" />,
    props
  )
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""
  return `${first}${last}`.toUpperCase()
}

/** A person's initials in a 24×24px circle, then their name when the list is 640px or wider. */
export function RecordRowPerson({
  name,
  className,
  ...props
}: React.ComponentProps<"span"> & { name: string }): React.ReactElement {
  return (
    <span
      data-slot="record-row-person"
      className={cn("flex min-w-0 items-center gap-2", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-[0.625rem] text-muted-foreground"
      >
        {initialsOf(name)}
      </span>
      <span className="sr-only truncate @min-[40rem]:not-sr-only">{name}</span>
    </span>
  )
}

const fieldStatusLabel = { unavailable: "Unavailable", hidden: "Hidden" } as const

/**
 * Stands in for a field value the row cannot show. `"unavailable"` when the field failed to load;
 * `"hidden"` when the viewer's role cannot see it. State why, and how to get access, outside the row.
 */
export function RecordRowFieldStatus({
  status,
  className,
  ...props
}: React.ComponentProps<"span"> & { status: keyof typeof fieldStatusLabel }): React.ReactElement {
  return (
    <span
      data-slot="record-row-field-status"
      className={cn("truncate text-muted-foreground text-xs @min-[40rem]:text-sm", className)}
      {...props}
    >
      {fieldStatusLabel[status]}
    </span>
  )
}

/** A hover card on a row slot. Opens 300ms after the pointer enters its trigger and closes as soon as it leaves. */
export function RecordRowCard(props: PreviewCard.Root.Props): React.ReactElement {
  return <PreviewCard.Root {...props} />
}

/**
 * The part of a slot that opens its `RecordRowCard` on hover. It is not focusable; peek and the
 * record page are the keyboard and touch routes to the same fields.
 */
export function RecordRowCardTrigger({
  className,
  ...props
}: PreviewCard.Trigger.Props): React.ReactElement {
  return (
    <PreviewCard.Trigger
      data-slot="record-row-card-trigger"
      delay={300}
      closeDelay={0}
      render={<span />}
      className={cn("flex min-h-6 min-w-6 max-w-full items-center justify-center gap-2", className)}
      {...props}
    />
  )
}

/** Props for {@link RecordRowCardContent}. */
export type RecordRowCardContentProps = PreviewCard.Popup.Props &
  Pick<PreviewCard.Positioner.Props, "align" | "side" | "sideOffset">

/** The card drawn below its trigger. Keep it to fields the row does not show; it may hold links. */
export function RecordRowCardContent({
  align = "start",
  side = "bottom",
  sideOffset = 6,
  className,
  ...props
}: RecordRowCardContentProps): React.ReactElement {
  return (
    <PreviewCard.Portal>
      <PreviewCard.Positioner align={align} side={side} sideOffset={sideOffset} className="z-50">
        <PreviewCard.Popup
          data-slot="record-row-card-content"
          className={cn(
            "w-60 origin-(--transform-origin) rounded-lg border bg-popover p-3 text-popover-foreground text-xs shadow-[0_1px_2px_rgb(0_0_0/0.05),0_10px_28px_-8px_rgb(0_0_0/0.18)] transition-[opacity,scale] duration-150 ease-out data-ending-style:opacity-0 data-ending-style:duration-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0 motion-reduce:transition-none",
            className
          )}
          {...props}
        />
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  )
}
