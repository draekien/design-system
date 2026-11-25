import { Checkbox } from "@base-ui/react/checkbox"
import { mergeProps } from "@base-ui/react/merge-props"
import { Popover } from "@base-ui/react/popover"
import { Tooltip } from "@base-ui/react/tooltip"
import { useRender } from "@base-ui/react/use-render"
import * as React from "react"
// biome-ignore lint/correctness/useImportExtensions: shadcn add copies this import into consumer projects, which may not allow .ts extensions
import { Card } from "@/components/card"
// biome-ignore lint/correctness/useImportExtensions: shadcn add copies this import into consumer projects, which may not allow .ts extensions
import { cn } from "@/lib/cn"

type ListContextValue = {
  activeValue: string | null
  peekValue: string | null
  selectedValues: ReadonlyArray<string>
  expandedValues: ReadonlyArray<string>
  onLinkFocus: (value: string) => void
  onLinkKeyDown: (event: React.KeyboardEvent<HTMLElement>, value: string) => void
  onGroupKeyDown: (
    event: React.KeyboardEvent<HTMLElement>,
    value: string,
    values: ReadonlyArray<string>
  ) => void
  onToggleSelected: (value: string) => void
  onToggleGroupSelected: (values: ReadonlyArray<string>) => void
  onToggleExpanded: (value: string) => void
  onTogglePeek: (value: string) => void
  onPeekValueChange: (value: string | null) => void
  rootRef: React.RefObject<HTMLUListElement | null>
  peekRef: React.RefObject<HTMLDivElement | null>
}

type ListTarget =
  | { kind: "record"; value: string }
  | { kind: "group"; value: string; values: ReadonlyArray<string> }

const ListContext = React.createContext<ListContextValue | null>(null)

const linkSelector = '[data-slot="list-row-link"]'

const triggerSelector = '[data-slot="list-group-trigger"]'

const focusSelector = `${linkSelector}, ${triggerSelector}`

const rowSelector = '[data-slot="list-row"]'

const headerSelector = '[data-slot="list-group-header"]'

const selectSelector = '[data-slot="list-row-select"]'

const addSelector = '[data-slot="list-group-add"]'

const peekFocusSelector = "a[href], button:not([disabled]), input:not([disabled]), [tabindex='0']"

/** Props for {@link List}. */
export type ListProps = Omit<useRender.ComponentProps<"ul">, "defaultValue"> & {
  /** The values of the selected rows. Pass with `onSelectedValuesChange` to control selection. */
  selectedValues?: ReadonlyArray<string>
  /** The values selected on first render when selection is uncontrolled. */
  defaultSelectedValues?: ReadonlyArray<string>
  /** Called with the next selection when X, the row checkbox or Esc changes it. */
  onSelectedValuesChange?: (values: ReadonlyArray<string>) => void
  /** The value of the peeked row, or `null` when peek is closed. Pass with `onPeekValueChange` to control peek. */
  peekValue?: string | null
  /** The row peeked on first render when peek is uncontrolled. */
  defaultPeekValue?: string | null
  /** Called when Space or a `ListRowPeek` toggles peek, Esc closes it, or peek follows focus to another row. */
  onPeekValueChange?: (value: string | null) => void
  /** The values of the expanded `ListGroup`s. Pass with `onExpandedValuesChange` to control expansion. */
  expandedValues?: ReadonlyArray<string>
  /** The groups expanded on first render when expansion is uncontrolled. */
  defaultExpandedValues?: ReadonlyArray<string>
  /** Called with the next expanded groups when → ← Enter Space or a `ListGroupTrigger` changes them. */
  onExpandedValuesChange?: (values: ReadonlyArray<string>) => void
}

function useControllable<TValue>(
  controlled: TValue | undefined,
  defaultValue: TValue,
  onChange: ((value: TValue) => void) | undefined
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : uncontrolled
  function setValue(next: TValue) {
    if (!isControlled) {
      setUncontrolled(next)
    }
    onChange?.(next)
  }
  return [value, setValue] as const
}

function groupOf(element: Element | null | undefined): Element | null {
  return element?.closest('[data-slot="list-group"]') ?? null
}

function focusTargets(
  root: HTMLElement | null,
  selector = focusSelector
): ReadonlyArray<HTMLElement> {
  return root === null ? [] : Array.from(root.querySelectorAll<HTMLElement>(selector))
}

/**
 * A list of records, one `ListRow` per record, optionally in `ListGroup`s. Owns the keyboard
 * model: the list is one tab stop; ↑ ↓ Home End move focus between rows and group headers; Space
 * toggles peek on the focused row and an open peek follows focus; X toggles selection on a row or
 * group that has a `ListRowSelect`; Esc closes peek, then clears the selection. On a group header,
 * Enter and Space toggle the group, → expands it and then moves to its first row, ← collapses it,
 * and Tab moves to its `ListGroupAdd`; ← on a row in a group moves to the group's header. A
 * `ListRowPeek` toggles peek by pointer. Render a `ListPeek` inside it to draw the peeked row's
 * preview in a floating card.
 * Each row lays out on its own: the checkbox, ID and media line up down the list, and the facts
 * sit at the row's end, each as wide as its value.
 */
export function List({
  selectedValues: selectedValuesProp,
  defaultSelectedValues = [],
  onSelectedValuesChange,
  peekValue: peekValueProp,
  defaultPeekValue = null,
  onPeekValueChange,
  expandedValues: expandedValuesProp,
  defaultExpandedValues = [],
  onExpandedValuesChange,
  render,
  className,
  ref,
  ...props
}: ListProps): React.ReactElement {
  const rootRef = React.useRef<HTMLUListElement>(null)
  const peekRef = React.useRef<HTMLDivElement>(null)
  const [activeValue, setActiveValue] = React.useState<string | null>(null)
  const [selectedValues, setSelectedValues] = useControllable(
    selectedValuesProp,
    defaultSelectedValues,
    onSelectedValuesChange
  )
  const [peekValue, setPeekValue] = useControllable(
    peekValueProp,
    defaultPeekValue,
    onPeekValueChange
  )
  const [expandedValues, setExpandedValues] = useControllable(
    expandedValuesProp,
    defaultExpandedValues,
    onExpandedValuesChange
  )

  React.useEffect(() => {
    const targets = focusTargets(rootRef.current)
    const first = targets[0]?.dataset.value
    if (first === undefined) {
      return
    }
    if (!targets.some((target) => target.dataset.value === activeValue)) {
      setActiveValue(first)
    }
  })

  function toggleSelected(values: ReadonlyArray<string>) {
    const isAllSelected = values.every((value) => selectedValues.includes(value))
    setSelectedValues(
      isAllSelected
        ? selectedValues.filter((selected) => !values.includes(selected))
        : [...selectedValues, ...values.filter((value) => !selectedValues.includes(value))]
    )
  }

  function setExpanded(value: string, isExpanded: boolean) {
    if (expandedValues.includes(value) === isExpanded) {
      return
    }
    if (!isExpanded) {
      const group = groupOf(
        rootRef.current?.querySelector(`${triggerSelector}[data-value="${CSS.escape(value)}"]`)
      )
      const holds = (rowValue: string | null) =>
        rowValue !== null &&
        group?.querySelector(`${linkSelector}[data-value="${CSS.escape(rowValue)}"]`) != null
      if (holds(peekValue)) {
        setPeekValue(null)
      }
      if (holds(activeValue)) {
        setActiveValue(value)
      }
    }
    setExpandedValues(
      isExpanded
        ? [...expandedValues, value]
        : expandedValues.filter((expanded) => expanded !== value)
    )
  }

  function focusTarget(target: Element | null | undefined) {
    if (!(target instanceof HTMLElement)) {
      return
    }
    target.focus()
    const value = target.dataset.value
    if (
      target.matches(linkSelector) &&
      value !== undefined &&
      peekValue !== null &&
      peekValue !== value
    ) {
      setPeekValue(value)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>, target: ListTarget) {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return
    }
    const targets = focusTargets(rootRef.current)
    const index = targets.indexOf(event.currentTarget)
    const line = event.currentTarget.closest(`${rowSelector}, ${headerSelector}`)
    const isExpanded = target.kind === "group" && expandedValues.includes(target.value)
    switch (event.key) {
      case " ":
        if (target.kind === "group") {
          return
        }
        event.preventDefault()
        setPeekValue(peekValue === target.value ? null : target.value)
        return
      case "x":
      case "X":
        if ((line?.querySelector(selectSelector) ?? null) === null) {
          return
        }
        event.preventDefault()
        toggleSelected(target.kind === "group" ? target.values : [target.value])
        return
      case "ArrowRight":
        if (target.kind === "record") {
          return
        }
        event.preventDefault()
        if (isExpanded) {
          const next = targets[index + 1]
          if (groupOf(next) === groupOf(event.currentTarget)) {
            focusTarget(next)
          }
        } else {
          setExpanded(target.value, true)
        }
        return
      case "ArrowLeft":
        event.preventDefault()
        if (target.kind === "group") {
          setExpanded(target.value, false)
        } else {
          focusTarget(groupOf(event.currentTarget)?.querySelector(triggerSelector))
        }
        return
      case "ArrowDown":
        event.preventDefault()
        focusTarget(targets[index + 1])
        return
      case "ArrowUp":
        event.preventDefault()
        focusTarget(targets[index - 1])
        return
      case "Home":
        event.preventDefault()
        focusTarget(targets[0])
        return
      case "End":
        event.preventDefault()
        focusTarget(targets.at(-1))
        return
      case "Tab": {
        const next = event.shiftKey
          ? null
          : target.kind === "group"
            ? line?.querySelector<HTMLElement>(addSelector)
            : peekRef.current?.querySelector<HTMLElement>(peekFocusSelector)
        if (next !== null && next !== undefined) {
          event.preventDefault()
          next.focus()
        }
        return
      }
      case "Escape":
        if (peekValue !== null) {
          setPeekValue(null)
        } else if (selectedValues.length > 0) {
          setSelectedValues([])
        }
        return
      default:
        return
    }
  }

  function togglePeek(value: string) {
    focusTargets(rootRef.current, linkSelector)
      .find((link) => link.dataset.value === value)
      ?.focus()
    setPeekValue(peekValue === value ? null : value)
  }

  const context: ListContextValue = {
    activeValue,
    peekValue,
    selectedValues,
    expandedValues,
    onLinkFocus: setActiveValue,
    onLinkKeyDown: (event, value) => handleKeyDown(event, { kind: "record", value }),
    onGroupKeyDown: (event, value, values) =>
      handleKeyDown(event, { kind: "group", value, values }),
    onToggleSelected: (value) => toggleSelected([value]),
    onToggleGroupSelected: toggleSelected,
    onToggleExpanded: (value) => setExpanded(value, !expandedValues.includes(value)),
    onTogglePeek: togglePeek,
    onPeekValueChange: setPeekValue,
    rootRef,
    peekRef,
  }

  const element = useRender({
    defaultTagName: "ul",
    render,
    ref: ref === undefined ? rootRef : [ref, rootRef],
    state: { slot: "list" },
    props: mergeProps<"ul">(
      {
        className: cn("@container flex flex-col", className),
      },
      props
    ),
  })

  return <ListContext.Provider value={context}>{element}</ListContext.Provider>
}

/** Reads the enclosing `List`'s state. Throws when called outside a `List`. */
// biome-ignore lint/style/useComponentExportOnlyModules: the ListRow parts and custom row parts read the list state through this hook
export function useList(): ListContextValue {
  const context = React.useContext(ListContext)
  if (context === null) {
    throw new Error("ListRow must be rendered inside a List.")
  }
  return context
}

type ListRowContextValue =
  | {
      kind: "record"
      value: string
      nameId: string
      isSelected: boolean
      isPeeked: boolean
    }
  | ({ kind: "group" } & ListGroupContextValue)
  | { kind: "loading" }

const ListRowContext = React.createContext<ListRowContextValue | null>(null)

function useListRow(part: string): ListRowContextValue {
  const context = React.useContext(ListRowContext)
  if (context === null) {
    throw new Error(`${part} must be rendered inside a ListRow or ListRowLoading.`)
  }
  return context
}

/**
 * How a part behaves when the list is narrow. `"keep"` always draws it in full. `"abbreviate"`
 * swaps it for its short form when the list is narrower than 768px. `"hide"` abbreviates it below
 * 768px and removes it below 640px; a hidden value must still appear in peek and on the item's page.
 */
export type ListRowNarrow = "keep" | "abbreviate" | "hide"

const narrowClass: Readonly<Record<ListRowNarrow, string>> = {
  keep: "",
  abbreviate:
    "@max-abbreviate:**:data-[abbreviation=long]:sr-only @max-abbreviate:**:data-[abbreviation=short]:inline",
  hide: "@max-abbreviate:**:data-[abbreviation=long]:sr-only @max-abbreviate:**:data-[abbreviation=short]:inline @max-hide:hidden",
}

const rowClass = "group/list-row flex min-h-11 items-center rounded-floor px-2"

function Bar({ className }: { className: string }) {
  return (
    <span className={cn("block h-2 rounded-full bg-muted motion-safe:animate-pulse", className)} />
  )
}

/** Props for {@link ListRow}. */
export type ListRowProps = useRender.ComponentProps<"li"> & {
  /** The item's unique value. `List` selection and peek refer to rows by this value. */
  value: string
}

/**
 * One item in a `List`. Its parts are named for the rank of the information they hold:
 * `ListRowSubject` (rank 1: what the row is about), one `ListRowFact` per fact the list exists
 * to compare (rank 2), and `ListRowLink` to the item's own page (rank 5). Peek, rendered from
 * `List`'s `peekValue`, previews part of that page read-only; rank 4 is a `preview-card` on a
 * rank 1 or 2 value.
 * Compose every row in a list with the same parts, so the checkbox, ID and media line up.
 */
export function ListRow({ value, render, className, ...props }: ListRowProps): React.ReactElement {
  const list = useList()
  const nameId = React.useId()
  const isSelected = list.selectedValues.includes(value)
  const isPeeked = list.peekValue === value

  const element = useRender({
    defaultTagName: "li",
    render,
    state: { slot: "list-row", selected: isSelected, peeked: isPeeked },
    props: mergeProps<"li">(
      {
        className: cn(
          rowClass,
          "hover:bg-foreground/4 data-[selected]:bg-foreground/4 data-[selected]:hover:bg-foreground/7 has-[[data-slot=list-row-link]:focus-visible]:bg-foreground/4 has-[[data-slot=list-row-link]:focus-visible]:inset-ring has-[[data-slot=list-row-link]:focus-visible]:inset-ring-ring/40 data-peeked:bg-foreground/4 data-peeked:inset-ring data-peeked:inset-ring-ring/40",
          className
        ),
      },
      props
    ),
  })

  return (
    <ListRowContext.Provider value={{ kind: "record", value, nameId, isSelected, isPeeked }}>
      {element}
    </ListRowContext.Provider>
  )
}

/**
 * A placeholder row shown while items load. Compose the same parts as `ListRow`; each part draws
 * a bar. `ListRowId`, `ListRowName` and `ListRowFact` size their bar to their children when given
 * sample values, so the columns keep their widths when the rows that replace it arrive.
 */
export function ListRowLoading({
  render,
  className,
  ...props
}: useRender.ComponentProps<"li">): React.ReactElement {
  const element = useRender({
    defaultTagName: "li",
    render,
    state: { slot: "list-row-loading" },
    props: mergeProps<"li">({ className: cn(rowClass, className), "aria-hidden": true }, props),
  })
  return <ListRowContext.Provider value={{ kind: "loading" }}>{element}</ListRowContext.Provider>
}

/** Props for {@link ListRowSelect}. */
export type ListRowSelectProps = Omit<
  Checkbox.Root.Props,
  "checked" | "defaultChecked" | "onCheckedChange" | "children"
>

const selectClass = "flex size-6 shrink-0 items-center justify-center pointer-coarse:size-11"

/**
 * The row's selection checkbox. In a `ListGroupHeader` it selects every row in the group and
 * shows mixed while only some are. It is 24×24px, 44×44px on a coarse pointer, and is drawn only
 * on a hovered, focused or selected row, and always on a coarse pointer. It is not a tab stop: X
 * on the focused row toggles it. Its accessible name is "Select" followed by the row's name.
 */
export function ListRowSelect({ className, ...props }: ListRowSelectProps): React.ReactElement {
  const row = useListRow("ListRowSelect")
  const list = useList()
  const labelId = React.useId()

  if (row.kind === "loading") {
    return <span data-slot="list-row-select" className={selectClass} />
  }

  const values = row.kind === "group" ? row.values : [row.value]
  const selectedCount = values.filter((value) => list.selectedValues.includes(value)).length
  const isMixed = selectedCount > 0 && selectedCount < values.length

  return (
    <Checkbox.Root
      data-slot="list-row-select"
      tabIndex={-1}
      checked={values.length > 0 && selectedCount === values.length}
      onCheckedChange={() =>
        row.kind === "group"
          ? list.onToggleGroupSelected(row.values)
          : list.onToggleSelected(row.value)
      }
      aria-labelledby={`${labelId} ${row.nameId}`}
      className={cn(
        selectClass,
        "group/select invisible cursor-pointer rounded-floor outline-none data-checked:visible data-indeterminate:visible pointer-coarse:visible group-hover/list-row:visible group-has-[[data-slot=list-row-link]:focus-visible]/list-row:visible group-has-[[data-slot=list-group-trigger]:focus-visible]/list-row:visible",
        className
      )}
      {...props}
      indeterminate={isMixed}
    >
      <span id={labelId} className="sr-only">
        Select
      </span>
      <span className="flex size-4 items-center justify-center rounded-checkbox border border-input bg-background text-primary-foreground shadow-xs transition-colors group-hover/select:border-muted-foreground group-data-checked/select:border-primary group-data-checked/select:bg-primary group-data-indeterminate/select:border-primary group-data-indeterminate/select:bg-primary">
        <Checkbox.Indicator>
          <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3">
            <path
              d={isMixed ? "M4 8h8" : "M3.5 8.5 6.5 11.5 12.5 4.5"}
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

const linkClass = "flex h-full min-h-11 min-w-0 flex-1 items-center gap-related pl-1"

const peekClass =
  "ml-1 flex size-6 shrink-0 items-center justify-center rounded-floor pointer-coarse:size-11"

/** Props for {@link ListRowPeek}. */
export type ListRowPeekProps = Omit<React.ComponentProps<"button">, "children" | "type">

/**
 * A button at the end of the row that toggles peek on it, so a pointer reaches peek while a click
 * on `ListRowLink` opens the item's page. It is 24×24px, 44×44px on a coarse pointer, and is
 * drawn only on a hovered, focused or peeked row, and always on a coarse pointer. Its tooltip
 * names it and its key. It is not a tab stop: Space on the focused row toggles peek. Its
 * accessible name is "Peek" followed by the row's name; pass `aria-controls` the id of the
 * element that renders peek.
 */
export function ListRowPeek({ className, ...props }: ListRowPeekProps): React.ReactElement {
  const row = useListRow("ListRowPeek")
  const list = useList()
  const labelId = React.useId()

  if (row.kind !== "record") {
    return <span data-slot="list-row-peek" className={peekClass} />
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        delay={300}
        render={
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
                  "invisible cursor-pointer text-muted-foreground outline-none transition-colors hover:bg-foreground/7 hover:text-foreground aria-expanded:visible aria-expanded:text-foreground pointer-coarse:visible group-hover/list-row:visible group-has-[[data-slot=list-row-link]:focus-visible]/list-row:visible",
                  className
                ),
              },
              props
            )}
            data-slot="list-row-peek"
          />
        }
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
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="top" sideOffset={4} className="z-popover">
          <Tooltip.Popup className="rounded-floor bg-foreground px-1.5 py-0.5 text-background text-xs">
            Peek · Space
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

/**
 * The link to the item's own page (rank 5), holding `ListRowSubject` and the `ListRowFact`s.
 * Pass your router's link through `render`. It is the row's one focus target and handles the
 * `List` keys.
 */
export function ListRowLink({
  render,
  className,
  children,
  ...props
}: useRender.ComponentProps<"a">): React.ReactElement {
  const row = useListRow("ListRowLink")
  const list = useList()
  const isRecord = row.kind === "record"

  return useRender({
    defaultTagName: "a",
    render: isRecord ? render : <span />,
    state: isRecord ? { slot: "list-row-link", value: row.value } : { slot: "list-row-link" },
    props: isRecord
      ? mergeProps<"a">(
          {
            className: cn(linkClass, "outline-none", className),
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
export type ListRowPartProps = useRender.ComponentProps<"span">

/** Props for a row part whose narrow behaviour the caller chooses. */
export type ListRowNarrowPartProps = ListRowPartProps & {
  /** How the part behaves when the list is narrow. Defaults to `"keep"`. */
  narrow?: ListRowNarrow
}

function SizedBar({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative flex min-w-0 items-center">
      <span className="invisible flex min-w-0 items-center">{children}</span>
      <Bar className="absolute inset-x-0" />
    </span>
  )
}

function usePart(
  part: string,
  slot: string,
  partClassName: string,
  placeholder: React.ReactNode,
  { render, className, children, ...props }: ListRowPartProps,
  sizeToChildren = false
) {
  const row = useListRow(part)
  const isRecord = row.kind === "record"
  const loadingChildren =
    sizeToChildren &&
    children !== undefined &&
    children !== null &&
    children !== false &&
    children !== "" ? (
      <SizedBar>{children}</SizedBar>
    ) : (
      placeholder
    )
  return useRender({
    defaultTagName: "span",
    render: isRecord ? render : <span />,
    state: { slot },
    props: mergeProps<"span">(
      { className: cn(partClassName, className) },
      isRecord ? { ...props, children } : { children: loadingChildren }
    ),
  })
}

/**
 * Rank 1: what the row is about. Holds an optional `ListRowId` and `ListRowMedia`, then one
 * `ListRowName` and an optional `ListRowDescription`, at the start of the row. It takes the width
 * the facts leave.
 */
export function ListRowSubject({ children, ...props }: ListRowPartProps): React.ReactElement {
  return usePart(
    "ListRowSubject",
    "list-row-subject",
    "flex min-w-0 flex-1 items-center",
    children,
    { ...props, children }
  )
}

/**
 * The item's ID, such as `REC-104`, in muted tabular figures. It is at least 4rem wide, so IDs of up
 * to 7 characters line up down the list, and truncates past 6rem.
 */
export function ListRowId({
  narrow = "keep",
  ...props
}: ListRowNarrowPartProps): React.ReactElement {
  return usePart(
    "ListRowId",
    "list-row-id",
    cn(
      "min-w-list-id-min max-w-list-id-max shrink-0 truncate pr-related text-muted-foreground text-xs tabular-nums",
      narrowClass[narrow]
    ),
    <Bar className="w-12" />,
    props,
    true
  )
}

const mediaVariantClass = {
  default: "*:flex *:size-full *:items-center *:justify-center **:data-[abbreviation=long]:sr-only",
  icon: "text-muted-foreground [&_svg]:size-4",
} as const

/** Props for {@link ListRowMedia}. */
export type ListRowMediaProps = ListRowNarrowPartProps &
  (
    | {
        /**
         * `"default"` holds a `status` or `entity` and draws only its media, with its name and
         * description read by screen readers only. `"icon"` holds one muted icon.
         * Defaults to `"default"`.
         */
        variant?: "default"
      }
    | {
        variant: "icon"
        /** What the icon stands for, such as "Invoice"; read by screen readers in place of the icon. */
        label: string
      }
  )

function mediaPartProps(props: ListRowMediaProps): ListRowPartProps {
  if (props.variant !== "icon") {
    const { variant: _variant, narrow: _narrow, ...rest } = props
    return rest
  }
  const { variant: _variant, narrow: _narrow, label, children, ...rest } = props
  return {
    ...rest,
    role: "img",
    "aria-label": label,
    children: <span aria-hidden="true">{children}</span>,
  }
}

/**
 * A 24×24px picture of the item drawn between the ID and the name, such as its status dot, its
 * owner's initials or an icon for its kind.
 */
export function ListRowMedia(props: ListRowMediaProps): React.ReactElement {
  return usePart(
    "ListRowMedia",
    "list-row-media",
    cn(
      "mr-related flex size-6 shrink-0 items-center justify-center",
      mediaVariantClass[props.variant ?? "default"],
      narrowClass[props.narrow ?? "keep"]
    ),
    props.variant === "icon" ? (
      <span className="size-4 rounded-floor bg-muted" />
    ) : (
      <span className="size-2.5 rounded-full bg-muted" />
    ),
    mediaPartProps(props)
  )
}

/**
 * The item's name. It takes the width it needs, up to 20rem, and truncates; when the row is too
 * narrow for it, it shrinks to 6rem after the description is gone. It is never hidden.
 */
export function ListRowName(props: ListRowPartProps): React.ReactElement {
  const row = useListRow("ListRowName")
  return usePart(
    "ListRowName",
    "list-row-name",
    "min-w-list-name-min max-w-list-name-max truncate font-medium text-sm",
    <Bar className="w-40 max-w-full" />,
    { ...props, id: row.kind === "record" ? row.nameId : undefined },
    true
  )
}

/**
 * One line after the name saying what the item is about, in muted text. It fills the width the
 * name and the facts leave, truncates before the name does, and is hidden when the list is narrower
 * than 640px.
 */
export function ListRowDescription(props: ListRowPartProps): React.ReactElement {
  return usePart(
    "ListRowDescription",
    "list-row-description",
    "min-w-0 flex-1 basis-0 truncate pl-related text-muted-foreground text-sm @max-hide:hidden",
    <Bar className="w-2/3" />,
    props
  )
}

const missingLabel = { unavailable: "Unavailable", hidden: "Hidden" } as const

/** Props for {@link ListRowFact}. */
export type ListRowFactProps =
  | (ListRowNarrowPartProps & { missing?: undefined })
  | (Omit<ListRowNarrowPartProps, "children" | "render"> & {
      /**
       * Why the fact cannot be shown: `"unavailable"` when it failed to load, `"hidden"` when the
       * viewer's role cannot see it. The fact then draws that word in muted text instead of a
       * value. State why, and how to get access, outside the list, once for every fact it replaces.
       */
      missing: keyof typeof missingLabel
    })

function missingFactProps({
  missing,
  className,
  ...props
}: Extract<ListRowFactProps, { missing: string }>): ListRowPartProps {
  return {
    ...props,
    className: cn("text-muted-foreground", className),
    children: <span className="truncate">{missingLabel[missing]}</span>,
  }
}

/**
 * Rank 2: one fact about the subject that the list exists to compare, such as a state or a figure.
 * Facts sit at the end of the row in the order given, each as wide as its value between 2rem and
 * 12rem, so they do not line up down the list; put the fact the caller looks for first last, where
 * it shares the row's right edge. The row holds at most eight. Hold one `status`,
 * `entity`, `figure`, `meter` or `relative-time` in it, or set `missing` when the value cannot be
 * shown.
 */
export function ListRowFact({ narrow = "keep", ...props }: ListRowFactProps): React.ReactElement {
  const factClass = cn(
    "flex min-w-list-fact-min max-w-list-fact-max items-center justify-end text-sm",
    narrowClass[narrow]
  )
  const partProps = props.missing === undefined ? props : missingFactProps(props)
  return usePart(
    "ListRowFact",
    "list-row-fact",
    factClass,
    <Bar className="w-16" />,
    partProps,
    true
  )
}

type ListGroupContextValue = {
  value: string
  values: ReadonlyArray<string>
  nameId: string
  isExpanded: boolean
}

const ListGroupContext = React.createContext<ListGroupContextValue | null>(null)

function useListGroup(part: string): ListGroupContextValue {
  const context = React.useContext(ListGroupContext)
  if (context === null) {
    throw new Error(`${part} must be rendered inside a ListGroup.`)
  }
  return context
}

/** Props for {@link ListGroup}. */
export type ListGroupProps = useRender.ComponentProps<"li"> & {
  /**
   * The group's unique value; it is expanded while this value is in the `List`'s `expandedValues`.
   * It must differ from every row's value.
   */
  value: string
  /** The values of the group's selectable rows, which its `ListRowSelect` selects together. */
  values?: ReadonlyArray<string>
}

/**
 * The rows that share one value, such as every record with one status: a `ListGroupHeader`, then
 * a `ListGroupRows` holding the rows. Render groups inside `List` in the order the list's story
 * needs, and hide a group with no rows. Groups do not nest.
 */
export function ListGroup({
  value,
  values = [],
  render,
  className,
  ...props
}: ListGroupProps): React.ReactElement {
  const list = useList()
  const nameId = React.useId()
  const isExpanded = list.expandedValues.includes(value)

  const element = useRender({
    defaultTagName: "li",
    render,
    state: { slot: "list-group", expanded: isExpanded },
    props: mergeProps<"li">({ className: cn("flex flex-col", className) }, props),
  })

  return (
    <ListGroupContext.Provider value={{ value, values, nameId, isExpanded }}>
      {element}
    </ListGroupContext.Provider>
  )
}

/**
 * The group's header row: a `ListRowSelect`, a `ListGroupTrigger` and a `ListGroupAdd`, in that
 * order, lined up with the rows' checkboxes. It stays pinned to the top of the scroll area while
 * its group's rows scroll under it, drawn on the page background; pass the surface's background
 * in `className` when the list sits on another surface.
 */
export function ListGroupHeader({
  render,
  className,
  ...props
}: useRender.ComponentProps<"div">): React.ReactElement {
  const group = useListGroup("ListGroupHeader")

  const element = useRender({
    defaultTagName: "div",
    render,
    state: { slot: "list-group-header" },
    props: mergeProps<"div">(
      {
        className: cn(
          rowClass,
          "sticky top-0 z-raised bg-background before:pointer-events-none before:absolute before:inset-0 before:rounded-floor hover:before:bg-foreground/4 has-[[data-slot=list-group-trigger]:focus-visible]:before:bg-foreground/4 has-[[data-slot=list-group-trigger]:focus-visible]:before:inset-ring has-[[data-slot=list-group-trigger]:focus-visible]:before:inset-ring-ring/40",
          className
        ),
      },
      props
    ),
  })

  return (
    <ListRowContext.Provider value={{ kind: "group", ...group }}>{element}</ListRowContext.Provider>
  )
}

/** Props for {@link ListGroupTrigger}. */
export type ListGroupTriggerProps = Omit<React.ComponentProps<"button">, "type">

/**
 * The button that shows or hides the group's rows. It draws a chevron, then holds the group's
 * `ListGroupName` and `ListGroupCount`. It fills the header, so a click anywhere on the header
 * toggles the group, and it is the header's one focus target and handles the `List` keys.
 */
export function ListGroupTrigger({
  className,
  children,
  ...props
}: ListGroupTriggerProps): React.ReactElement {
  const group = useListGroup("ListGroupTrigger")
  const list = useList()

  return (
    <button
      {...mergeProps<"button">(
        {
          type: "button",
          tabIndex: list.activeValue === group.value ? 0 : -1,
          "aria-expanded": group.isExpanded,
          "aria-keyshortcuts":
            "Enter Space X ArrowLeft ArrowRight ArrowUp ArrowDown Home End Escape",
          onFocus: () => list.onLinkFocus(group.value),
          onKeyDown: (event) => list.onGroupKeyDown(event, group.value, group.values),
          onClick: () => list.onToggleExpanded(group.value),
          className: cn(
            linkClass,
            "cursor-pointer text-start outline-none [&>svg]:text-muted-foreground",
            className
          ),
        },
        props
      )}
      data-slot="list-group-trigger"
      data-value={group.value}
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className={cn(
          "size-4 shrink-0 motion-safe:transition-transform",
          group.isExpanded && "rotate-90"
        )}
      >
        <path
          d="M6 3.5 10.5 8 6 12.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </button>
  )
}

/** The group's name, such as a `status` naming the value its rows share, in medium weight. */
export function ListGroupName({
  render,
  className,
  ...props
}: ListRowPartProps): React.ReactElement {
  const group = useListGroup("ListGroupName")
  return useRender({
    defaultTagName: "span",
    render,
    state: { slot: "list-group-name" },
    props: mergeProps<"span">(
      {
        id: group.nameId,
        className: cn("flex min-w-0 items-center font-medium text-sm", className),
      },
      props
    ),
  })
}

/** The number of rows in the group, in muted tabular figures; it stays while the group is collapsed. */
export function ListGroupCount({
  render,
  className,
  ...props
}: ListRowPartProps): React.ReactElement {
  useListGroup("ListGroupCount")
  return useRender({
    defaultTagName: "span",
    render,
    state: { slot: "list-group-count" },
    props: mergeProps<"span">(
      { className: cn("shrink-0 text-muted-foreground text-sm tabular-nums", className) },
      props
    ),
  })
}

/** Props for {@link ListGroupAdd}. */
export type ListGroupAddProps = Omit<React.ComponentProps<"button">, "children" | "type">

/**
 * A button at the end of the header that adds a row to the group; handle `onClick`. It is
 * 24×24px, 44×44px on a coarse pointer, and is drawn only on a hovered or focused header, and
 * always on a coarse pointer. It is not a tab stop: Tab on the focused header moves to it. Its
 * accessible name is "Add to" followed by the group's name, and its tooltip reads "Add".
 */
export function ListGroupAdd({ className, ...props }: ListGroupAddProps): React.ReactElement {
  const group = useListGroup("ListGroupAdd")
  const labelId = React.useId()

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        delay={300}
        render={
          <button
            {...mergeProps<"button">(
              {
                type: "button",
                tabIndex: -1,
                "aria-labelledby": `${labelId} ${group.nameId}`,
                className: cn(
                  peekClass,
                  "invisible cursor-pointer text-muted-foreground outline-none transition-colors hover:bg-foreground/7 hover:text-foreground focus-visible:visible focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:visible group-hover/list-row:visible group-has-[[data-slot=list-group-trigger]:focus-visible]/list-row:visible",
                  className
                ),
              },
              props
            )}
            data-slot="list-group-add"
          />
        }
      >
        <span id={labelId} className="sr-only">
          Add to
        </span>
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
          <path
            d="M8 3.5v9M3.5 8h9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="top" sideOffset={4} className="z-popover">
          <Tooltip.Popup className="rounded-floor bg-foreground px-1.5 py-0.5 text-background text-xs">
            Add
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

/** The group's rows, drawn only while the group is expanded. Hold one `ListRow` per row. */
export function ListGroupRows({
  render,
  className,
  ...props
}: useRender.ComponentProps<"ul">): React.ReactElement | null {
  const group = useListGroup("ListGroupRows")
  const element = useRender({
    defaultTagName: "ul",
    render,
    state: { slot: "list-group-rows" },
    props: mergeProps<"ul">(
      { "aria-labelledby": group.nameId, className: cn("flex flex-col", className) },
      props
    ),
  })
  return group.isExpanded ? element : null
}

/** Props for {@link ListPeek}. */
export type ListPeekProps = Omit<Popover.Popup.Props, "initialFocus" | "finalFocus" | "ref">

function rowOf(root: HTMLElement | null, value: string | null): Element | null {
  if (value === null) {
    return null
  }
  return (
    root
      ?.querySelector(`${linkSelector}[data-value="${CSS.escape(value)}"]`)
      ?.closest(rowSelector) ?? null
  )
}

/**
 * Peek: a floating card under the peeked row, aligned to its end, that previews part of the item's
 * page read-only. Render it inside `List` and put the preview of the row in `peekValue` in it; it
 * opens when peek opens and moves with it. Focus stays on the row, so ↑ ↓ move peek to the next
 * row; Space, Esc or a press outside the list closes it. Pass `aria-label`, and give it the `id`
 * that the rows' `aria-controls` names.
 */
export function ListPeek({ className, ...props }: ListPeekProps): React.ReactElement {
  const { rootRef, peekRef, peekValue, onPeekValueChange } = useList()
  const [anchor, setAnchor] = React.useState<Element | null>(null)

  React.useLayoutEffect(() => {
    const row = rowOf(rootRef.current, peekValue)
    setAnchor((previous) => (previous === row ? previous : row))
  })

  function handleOpenChange(open: boolean, details: Popover.Root.ChangeEventDetails) {
    const target = details.event.target
    const isInList = target instanceof Node && rootRef.current?.contains(target) === true
    if (open || isInList) {
      return
    }
    if (peekRef.current?.contains(document.activeElement) === true) {
      rootRef.current
        ?.querySelector<HTMLElement>(`${linkSelector}[data-value="${CSS.escape(peekValue ?? "")}"]`)
        ?.focus()
    }
    onPeekValueChange(null)
  }

  return (
    <Popover.Root open={peekValue !== null && anchor !== null} onOpenChange={handleOpenChange}>
      <Popover.Portal>
        <Popover.Positioner
          anchor={anchor}
          side="bottom"
          align="end"
          sideOffset={4}
          className="z-popover"
        >
          <Popover.Popup
            ref={peekRef}
            data-slot="list-peek"
            initialFocus={false}
            finalFocus={false}
            render={<Card />}
            className={cn(
              "max-h-(--available-height) w-peek max-w-(--available-width) origin-(--transform-origin) overflow-y-auto bg-popover text-popover-foreground shadow-popover transition-[opacity,scale] duration-quick ease-out data-ending-style:opacity-0 data-ending-style:duration-0 data-starting-style:scale-(--preview-card-enter-scale) data-starting-style:opacity-0 motion-reduce:transition-none",
              className
            )}
            {...props}
          />
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
