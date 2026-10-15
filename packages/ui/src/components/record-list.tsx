import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "cn"
import * as React from "react"

type RecordListContextValue = {
  activeValue: string | null
  peekValue: string | null
  selectedValues: ReadonlyArray<string>
  onLinkFocus: (value: string) => void
  onLinkKeyDown: (event: React.KeyboardEvent<HTMLElement>, value: string) => void
  onToggleSelected: (value: string) => void
}

const RecordListContext = React.createContext<RecordListContextValue | null>(null)

const linkSelector = '[data-slot="record-row-link"]'

/** Props for {@link RecordList}. */
export type RecordListProps = Omit<useRender.ComponentProps<"ul">, "defaultValue"> & {
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
  /** Called when Space toggles peek, Esc closes it, or peek follows focus to another row. */
  onPeekValueChange?: (value: string | null) => void
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

function rowLinks(root: HTMLElement | null): ReadonlyArray<HTMLElement> {
  return root === null ? [] : Array.from(root.querySelectorAll<HTMLElement>(linkSelector))
}

/**
 * A list of records, one `RecordRow` per record. Owns the row keyboard model: the list is one
 * tab stop; ↑ ↓ Home End move focus between rows; Space toggles peek on the focused row and an
 * open peek follows focus; X toggles selection; Esc closes peek, then clears the selection.
 * Peek renders nothing itself: read `peekValue` and render the record's detail beside the list.
 */
export function RecordList({
  selectedValues: selectedValuesProp,
  defaultSelectedValues = [],
  onSelectedValuesChange,
  peekValue: peekValueProp,
  defaultPeekValue = null,
  onPeekValueChange,
  render,
  className,
  ref,
  ...props
}: RecordListProps): React.ReactElement {
  const rootRef = React.useRef<HTMLUListElement>(null)
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

  React.useEffect(() => {
    const links = rowLinks(rootRef.current)
    const first = links[0]?.dataset.value
    if (first === undefined) {
      return
    }
    if (!links.some((link) => link.dataset.value === activeValue)) {
      setActiveValue(first)
    }
  })

  function toggleSelected(value: string) {
    setSelectedValues(
      selectedValues.includes(value)
        ? selectedValues.filter((selected) => selected !== value)
        : [...selectedValues, value]
    )
  }

  function focusLink(link: HTMLElement | undefined) {
    const value = link?.dataset.value
    if (link === undefined || value === undefined) {
      return
    }
    link.focus()
    if (peekValue !== null && peekValue !== value) {
      setPeekValue(value)
    }
  }

  function handleLinkKeyDown(event: React.KeyboardEvent<HTMLElement>, value: string) {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return
    }
    const links = rowLinks(rootRef.current)
    const index = links.indexOf(event.currentTarget)
    switch (event.key) {
      case " ":
        event.preventDefault()
        setPeekValue(peekValue === value ? null : value)
        return
      case "x":
      case "X":
        event.preventDefault()
        toggleSelected(value)
        return
      case "ArrowDown":
        event.preventDefault()
        focusLink(links[index + 1])
        return
      case "ArrowUp":
        event.preventDefault()
        focusLink(links[index - 1])
        return
      case "Home":
        event.preventDefault()
        focusLink(links[0])
        return
      case "End":
        event.preventDefault()
        focusLink(links.at(-1))
        return
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

  const context: RecordListContextValue = {
    activeValue,
    peekValue,
    selectedValues,
    onLinkFocus: setActiveValue,
    onLinkKeyDown: handleLinkKeyDown,
    onToggleSelected: toggleSelected,
  }

  const element = useRender({
    defaultTagName: "ul",
    render,
    ref: ref === undefined ? rootRef : [ref, rootRef],
    state: { slot: "record-list" },
    props: mergeProps<"ul">({ className: cn("@container flex flex-col", className) }, props),
  })

  return <RecordListContext.Provider value={context}>{element}</RecordListContext.Provider>
}

/** Reads the enclosing `RecordList`'s state. Throws when called outside a `RecordList`. */
// biome-ignore lint/style/useComponentExportOnlyModules: record-row reads the list state through this hook
export function useRecordList(): RecordListContextValue {
  const context = React.useContext(RecordListContext)
  if (context === null) {
    throw new Error("RecordRow must be rendered inside a RecordList.")
  }
  return context
}
