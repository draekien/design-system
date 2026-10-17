import { Checkbox } from "@base-ui/react/checkbox"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "cn"
import * as React from "react"
// biome-ignore lint/correctness/useImportExtensions: shadcn add copies this import into consumer projects, which may not allow .tsx extensions
import { useRecordList } from "@/components/record-list"

type RecordRowContextValue =
  | {
      kind: "record"
      value: string
      nameId: string
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

/**
 * How a part behaves when the list is narrow. `"keep"` always draws it in full. `"abbreviate"`
 * swaps it for its short form when the list is narrower than 768px. `"hide"` abbreviates it below
 * 768px and removes it below 640px; a hidden value must still appear in peek and on the item's page.
 */
export type RecordRowNarrow = "keep" | "abbreviate" | "hide"

const narrowClass: Readonly<Record<RecordRowNarrow, string>> = {
  keep: "",
  abbreviate:
    "@max-[48rem]:**:data-[abbreviation=long]:sr-only @max-[48rem]:**:data-[abbreviation=short]:inline",
  hide: "@max-[48rem]:**:data-[abbreviation=long]:sr-only @max-[48rem]:**:data-[abbreviation=short]:inline @max-[40rem]:hidden",
}

const rowClass =
  "group/record-row col-span-full grid min-h-11 grid-cols-subgrid items-center border-b px-2"

function Bar({ className }: { className: string }) {
  return (
    <span className={cn("block h-2 rounded-full bg-muted motion-safe:animate-pulse", className)} />
  )
}

/** Props for {@link RecordRow}. */
export type RecordRowProps = useRender.ComponentProps<"li"> & {
  /** The item's unique value. `RecordList` selection and peek refer to rows by this value. */
  value: string
}

/**
 * One item in a `RecordList`. Its parts are named for the rank of the information they hold:
 * `RecordRowIdentify` (rank 1: what the item is), one `RecordRowRead` per reading the list exists
 * for (rank 2), and `RecordRowLink` to the item's own page (rank 5). Peek, rendered from
 * `RecordList`'s `peekValue`, previews part of that page read-only; rank 4 is a `field-card` on a
 * rank 1 or 2 value.
 * Columns line up down the list whatever the values are.
 */
export function RecordRow({
  value,
  render,
  className,
  ...props
}: RecordRowProps): React.ReactElement {
  const list = useRecordList()
  const nameId = React.useId()
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
    <RecordRowContext.Provider value={{ kind: "record", value, nameId, isSelected, isPeeked }}>
      {element}
    </RecordRowContext.Provider>
  )
}

/**
 * A placeholder row shown while items load. Compose the same parts as `RecordRow`; each part draws
 * a bar and ignores its children, so the loading row has the columns of the rows that replace it.
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

const selectClass =
  "col-start-1 flex size-6 shrink-0 items-center justify-center pointer-coarse:size-11"

/**
 * The row's selection checkbox. It is 24×24px, 44×44px on a coarse pointer, and is drawn only on
 * a hovered, focused or selected row, and always on a coarse pointer. It is not a tab stop: X on
 * the focused row toggles it. Its accessible name is "Select" followed by the row's name.
 */
export function RecordRowSelect({ className, ...props }: RecordRowSelectProps): React.ReactElement {
  const row = useRecordRow("RecordRowSelect")
  const list = useRecordList()
  const labelId = React.useId()

  if (row.kind === "loading") {
    return <span data-slot="record-row-select" className={selectClass} />
  }

  return (
    <Checkbox.Root
      data-slot="record-row-select"
      tabIndex={-1}
      checked={row.isSelected}
      onCheckedChange={() => list.onToggleSelected(row.value)}
      aria-labelledby={`${labelId} ${row.nameId}`}
      className={cn(
        selectClass,
        "group/select invisible cursor-pointer outline-none data-checked:visible pointer-coarse:visible group-hover/record-row:visible group-has-[[data-slot=record-row-link]:focus-visible]/record-row:visible",
        className
      )}
      {...props}
    >
      <span id={labelId} className="sr-only">
        Select
      </span>
      <span className="flex size-4 items-center justify-center rounded-sm border border-input bg-background text-primary-foreground shadow-xs transition-colors group-hover/select:border-muted-foreground group-data-checked/select:border-primary group-data-checked/select:bg-primary">
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

const linkClass = "col-[2/-2] grid h-full min-h-11 grid-cols-subgrid items-center pl-1"

const peekClass =
  "col-[-2/-1] ml-1 flex size-6 shrink-0 items-center justify-center rounded-sm pointer-coarse:size-11"

/** Props for {@link RecordRowPeek}. */
export type RecordRowPeekProps = Omit<React.ComponentProps<"button">, "children" | "type">

/**
 * A button at the end of the row that toggles peek on it, so a pointer reaches peek while a click
 * on `RecordRowLink` opens the item's page. It is 24×24px, 44×44px on a coarse pointer, and is
 * drawn only on a hovered, focused or peeked row, and always on a coarse pointer. It is not a tab
 * stop: Space on the focused row toggles peek. Its accessible name is "Peek" followed by the row's
 * name; pass `aria-controls` the id of the element that renders peek.
 */
export function RecordRowPeek({ className, ...props }: RecordRowPeekProps): React.ReactElement {
  const row = useRecordRow("RecordRowPeek")
  const list = useRecordList()
  const labelId = React.useId()

  if (row.kind === "loading") {
    return <span data-slot="record-row-peek" className={peekClass} />
  }

  return (
    <button
      {...mergeProps<"button">(
        {
          type: "button",
          tabIndex: -1,
          "aria-expanded": row.isPeeked,
          "aria-labelledby": `${labelId} ${row.nameId}`,
          onClick: () => list.onTogglePeek(row.value),
          className: cn(
            peekClass,
            "invisible cursor-pointer text-muted-foreground outline-none transition-colors hover:bg-foreground/7 hover:text-foreground aria-expanded:visible aria-expanded:text-foreground pointer-coarse:visible group-hover/record-row:visible group-has-[[data-slot=record-row-link]:focus-visible]/record-row:visible",
            className
          ),
        },
        props
      )}
      data-slot="record-row-peek"
    >
      <span id={labelId} className="sr-only">
        Peek
      </span>
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
        <path
          d="M1.75 8S4 3.75 8 3.75 14.25 8 14.25 8 12 12.25 8 12.25 1.75 8 1.75 8Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  )
}

/**
 * The link to the item's own page (rank 5), holding `RecordRowIdentify` and the `RecordRowRead`s.
 * Pass your router's link through `render`. It is the row's one focus target and handles the
 * `RecordList` keys.
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
            className: cn(linkClass, "group/record-row-link outline-none", className),
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
      : { className: cn(linkClass, className), children },
  })
}

/** Props for a row part. */
export type RecordRowPartProps = useRender.ComponentProps<"span">

/** Props for a row part whose narrow behaviour the caller chooses. */
export type RecordRowNarrowPartProps = RecordRowPartProps & {
  /** How the part behaves when the list is narrow. Defaults to `"keep"`. */
  narrow?: RecordRowNarrow
}

function usePart(
  part: string,
  slot: string,
  partClassName: string,
  placeholder: React.ReactNode,
  { render, className, children, ...props }: RecordRowPartProps
) {
  const row = useRecordRow(part)
  const isRecord = row.kind === "record"
  return useRender({
    defaultTagName: "span",
    render: isRecord ? render : <span />,
    state: { slot },
    props: mergeProps<"span">(
      { className: cn(partClassName, className) },
      isRecord ? { ...props, children } : { children: placeholder }
    ),
  })
}

/**
 * Rank 1: what the item is. Holds an optional `RecordRowKey` and `RecordRowGlyph`, then one
 * `RecordRowName` and an optional `RecordRowDescription`, at the start of the row.
 */
export function RecordRowIdentify({ children, ...props }: RecordRowPartProps): React.ReactElement {
  return usePart(
    "RecordRowIdentify",
    "record-row-identify",
    "col-[1/5] grid min-w-0 grid-cols-subgrid items-center",
    children,
    { ...props, children }
  )
}

/** The item's key, such as `REC-104`, in muted tabular figures. */
export function RecordRowKey({
  narrow = "keep",
  ...props
}: RecordRowNarrowPartProps): React.ReactElement {
  return usePart(
    "RecordRowKey",
    "record-row-key",
    cn("col-start-1 truncate pr-3 text-muted-foreground text-xs tabular-nums", narrowClass[narrow]),
    <Bar className="w-12" />,
    props
  )
}

/**
 * A 24×24px glyph drawn between the key and the name, such as a status dot or the item's kind.
 * Only the glyph is drawn: a word inside it, such as a `StatusMarkLabel`, is read by screen
 * readers only, so pair every glyph with its word.
 */
export function RecordRowGlyph({
  narrow = "keep",
  ...props
}: RecordRowNarrowPartProps): React.ReactElement {
  return usePart(
    "RecordRowGlyph",
    "record-row-glyph",
    cn(
      "col-start-2 mr-2 flex size-6 items-center justify-center **:data-[abbreviation=long]:sr-only",
      narrowClass[narrow]
    ),
    <span className="size-2.5 rounded-full bg-muted" />,
    props
  )
}

/**
 * The item's name. It takes the width it needs from what the other columns leave and truncates;
 * it is never hidden.
 * The row's focus underline is drawn under it.
 */
export function RecordRowName(props: RecordRowPartProps): React.ReactElement {
  const row = useRecordRow("RecordRowName")
  return usePart(
    "RecordRowName",
    "record-row-name",
    "col-start-3 min-w-0 truncate font-medium text-sm decoration-2 decoration-ring underline-offset-3 group-focus-visible/record-row-link:underline",
    <Bar className="w-40 max-w-full" />,
    { ...props, id: row.kind === "record" ? row.nameId : undefined }
  )
}

/**
 * One line after the name saying what the item is about, in muted text. It fills the width the
 * other columns leave, truncates before the name does, and is hidden when the list is narrower
 * than 640px.
 */
export function RecordRowDescription(props: RecordRowPartProps): React.ReactElement {
  return usePart(
    "RecordRowDescription",
    "record-row-description",
    "col-start-4 min-w-0 truncate pl-3 text-muted-foreground text-sm @max-[40rem]:hidden",
    <Bar className="w-2/3" />,
    props
  )
}

/**
 * Rank 2: one reading the list exists for, such as a state or a figure the caller compares. Each
 * `RecordRowRead` is its own column, and the row holds at most eight. Hold one content item in it:
 * a `person-mark`, `figure`, `track`, `relative-time`, `status-mark` or `field-state`.
 */
export function RecordRowRead({
  narrow = "keep",
  ...props
}: RecordRowNarrowPartProps): React.ReactElement {
  return usePart(
    "RecordRowRead",
    "record-row-read",
    cn("flex min-w-0 items-center pl-4 text-sm", narrowClass[narrow]),
    <Bar className="w-16" />,
    props
  )
}
