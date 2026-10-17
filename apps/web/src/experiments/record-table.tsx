import { AlertDialog } from "@base-ui/react/alert-dialog"
import { Menu } from "@base-ui/react/menu"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import {
  type InvoiceStatus,
  type SampleInvoice,
  type SampleInvoiceLine,
  sampleInvoices,
} from "@workspace/fixtures/invoices.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import { cn } from "cn"
import * as React from "react"
import {
  type Column,
  cardSurface,
  columnLabel,
  columns,
  compareLines,
  focusLook,
  focusRing,
  formatAmount,
  formatPaid,
  gridClass,
  groupSum,
  handleIgnore,
  linesOf,
  numericColumns,
  type RowState,
  readDue,
  rowClass,
  rowGroupClass,
  type Seat,
  type Sort,
  type StatusGroup,
  seatClass,
  sorted,
  statusGroups,
  statusLabel,
  type TableSearch,
  type TableState,
} from "./record-table-model.ts"
import { Bar, ErrorMessage, Kbd } from "./wireframe-parts.tsx"

type VisibleRow =
  | { kind: "group"; key: string; group: StatusGroup }
  | { kind: "invoice"; key: string; invoice: SampleInvoice; parentKey: string }
  | {
      kind: "line"
      key: string
      line: SampleInvoiceLine
      invoice: SampleInvoice
      parentKey: string
    }
  | { kind: "lines-error"; key: string; invoice: SampleInvoice; parentKey: string }

function groupKey(status: InvoiceStatus): string {
  return `group:${status}`
}

function visibleRows(
  groups: ReadonlyArray<StatusGroup>,
  state: RowState,
  sort: Sort,
  collapsedGroups: ReadonlySet<string>,
  expandedInvoices: ReadonlySet<string>
): ReadonlyArray<VisibleRow> {
  return groups.flatMap((group) => {
    const key = groupKey(group.status)
    const header: VisibleRow = { kind: "group", key, group }
    if (collapsedGroups.has(key)) {
      return [header]
    }
    return [
      header,
      ...group.invoices.flatMap((invoice): ReadonlyArray<VisibleRow> => {
        const row: VisibleRow = { kind: "invoice", key: invoice.id, invoice, parentKey: key }
        if (!expandedInvoices.has(invoice.id) || linesOf(invoice).length === 0) {
          return [row]
        }
        if (state === "partial") {
          return [
            row,
            { kind: "lines-error", key: `${invoice.id}:error`, invoice, parentKey: invoice.id },
          ]
        }
        return [
          row,
          ...sorted(linesOf(invoice), sort, compareLines).map(
            (line): VisibleRow => ({
              kind: "line",
              key: line.id,
              line,
              invoice,
              parentKey: invoice.id,
            })
          ),
        ]
      }),
    ]
  })
}

function hasChildren(row: VisibleRow): boolean {
  switch (row.kind) {
    case "group":
      return true
    case "invoice":
      return linesOf(row.invoice).length > 0
    case "line":
    case "lines-error":
      return false
  }
}

/** The record table wireframe's lockup: the composed table in one fixture state. */
export function RecordTableLockup({ state }: { state: FixtureState }): React.ReactElement {
  return state === "error" ? (
    <ErrorMessage subject="The invoices" />
  ) : (
    <InvoiceTable key={state} state={state} />
  )
}

function invoiceCount(count: number): string {
  return count === 1 ? "1 invoice" : `${count} invoices`
}

const defaultSort: Sort = { column: "due", direction: "ascending" }

function register(map: Map<string, HTMLElement>, key: string, element: HTMLElement | null) {
  if (element === null) {
    map.delete(key)
  } else {
    map.set(key, element)
  }
}

function toggled(set: ReadonlySet<string>, key: string): ReadonlySet<string> {
  const next = new Set(set)
  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }
  return next
}

function useInvoiceTable(state: RowState) {
  const search = useSearch({ from: "/canvas/experiments/record-table" })
  const navigate = useNavigate({ from: "/canvas/experiments/record-table" })
  const sort: Sort = { column: search.sort, direction: search.direction }
  const collapsedGroups: ReadonlySet<string> = new Set(search.collapsed)
  const expandedInvoices: ReadonlySet<string> = new Set(search.expanded)
  const [selectedIds, setSelectedIds] = React.useState<ReadonlySet<string>>(new Set())
  const [peekedId, setPeekedId] = React.useState<string | null>(null)
  const [activeKey, setActiveKey] = React.useState<string | null>(search.focus ?? null)
  const [announcement, setAnnouncement] = React.useState("")
  const rowRefs = React.useRef(new Map<string, HTMLElement>())
  const linkRefs = React.useRef(new Map<string, HTMLElement>())
  const returnFocusKey = React.useRef(search.focus)

  React.useEffect(() => {
    if (returnFocusKey.current === undefined) {
      return
    }
    rowRefs.current.get(returnFocusKey.current)?.focus()
    void navigate({
      search: (previous) => ({ ...previous, focus: undefined }),
      replace: true,
      resetScroll: false,
    })
  }, [navigate])

  const groups = statusGroups(sort)
  const rows = visibleRows(groups, state, sort, collapsedGroups, expandedInvoices)
  const isSelectable = state !== "no-permission"
  const focusKey = rows.some((row) => row.key === activeKey) ? activeKey : (rows[0]?.key ?? null)

  function updateSearch(patch: Partial<TableSearch>) {
    void navigate({
      search: (previous) => ({ ...previous, ...patch }),
      replace: true,
      resetScroll: false,
    })
  }

  function sortBy(column: Column) {
    const direction =
      sort.column === column && sort.direction === "ascending" ? "descending" : "ascending"
    updateSearch({ sort: column, direction })
    setAnnouncement(`Sorted by ${columnLabel[column]}, ${direction}`)
  }

  function isExpanded(row: VisibleRow): boolean {
    switch (row.kind) {
      case "group":
        return !collapsedGroups.has(row.key)
      case "invoice":
        return expandedInvoices.has(row.key)
      case "line":
      case "lines-error":
        return false
    }
  }

  function setExpanded(row: VisibleRow, expanded: boolean) {
    if (isExpanded(row) === expanded) {
      return
    }
    if (row.kind === "group") {
      updateSearch({ collapsed: [...toggled(collapsedGroups, row.key)] })
    } else if (row.kind === "invoice") {
      updateSearch({ expanded: [...toggled(expandedInvoices, row.key)] })
      if (expanded && state === "partial") {
        setAnnouncement(`Lines for ${row.invoice.id} could not load`)
      }
    }
  }

  function groupSelection(group: StatusGroup): "all" | "some" | "none" {
    const count = group.invoices.filter((invoice) => selectedIds.has(invoice.id)).length
    if (count === 0) {
      return "none"
    }
    return count === group.invoices.length ? "all" : "some"
  }

  function toggleSelected(row: VisibleRow) {
    if (!isSelectable) {
      return
    }
    if (row.kind === "invoice") {
      setSelectedIds((previous) => toggled(previous, row.invoice.id))
    } else if (row.kind === "group") {
      const ids = row.group.invoices.map((invoice) => invoice.id)
      const selectAll = groupSelection(row.group) !== "all"
      setSelectedIds((previous) => {
        const next = new Set(previous)
        for (const id of ids) {
          if (selectAll) {
            next.add(id)
          } else {
            next.delete(id)
          }
        }
        return next
      })
    }
  }

  function focusRow(row: VisibleRow | undefined) {
    if (row === undefined) {
      return
    }
    rowRefs.current.get(row.key)?.focus()
    if (peekedId !== null && row.kind === "invoice") {
      setPeekedId(row.invoice.id)
    }
  }

  function parentRow(row: VisibleRow): VisibleRow | undefined {
    return row.kind === "group" ? undefined : rows.find((other) => other.key === row.parentKey)
  }

  function peekTarget(row: VisibleRow): SampleInvoice | null {
    return row.kind === "group" ? null : row.invoice
  }

  function onRowKeyDown(event: React.KeyboardEvent<HTMLElement>, row: VisibleRow) {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return
    }
    const index = rows.findIndex((other) => other.key === row.key)
    switch (event.key) {
      case " ": {
        event.preventDefault()
        const target = peekTarget(row)
        if (event.shiftKey) {
          toggleSelected(row)
        } else if (row.kind === "group") {
          setExpanded(row, !isExpanded(row))
        } else if (target !== null) {
          setPeekedId((current) => (current === target.id ? null : target.id))
        }
        return
      }
      case "x":
      case "X":
        event.preventDefault()
        toggleSelected(row)
        return
      case "Enter":
        event.preventDefault()
        if (row.kind === "group") {
          setExpanded(row, !isExpanded(row))
        } else {
          linkRefs.current.get(row.kind === "line" ? row.parentKey : row.key)?.click()
        }
        return
      case "ArrowRight":
        event.preventDefault()
        if (!hasChildren(row)) {
          return
        }
        if (isExpanded(row)) {
          focusRow(rows[index + 1])
        } else {
          setExpanded(row, true)
        }
        return
      case "ArrowLeft":
        event.preventDefault()
        if (hasChildren(row) && isExpanded(row)) {
          setExpanded(row, false)
        } else {
          focusRow(parentRow(row))
        }
        return
      case "ArrowDown":
        event.preventDefault()
        focusRow(rows[index + 1])
        return
      case "ArrowUp":
        event.preventDefault()
        if (index === 0) {
          focusSortedHeader(event.currentTarget)
        } else {
          focusRow(rows[index - 1])
        }
        return
      case "Home":
        event.preventDefault()
        focusRow(rows[0])
        return
      case "End":
        event.preventDefault()
        focusRow(rows.at(-1))
        return
      case "Escape":
        if (peekedId !== null) {
          setPeekedId(null)
        } else {
          setSelectedIds(new Set())
        }
        return
      default:
        return
    }
  }

  function togglePeek(invoice: SampleInvoice) {
    rowRefs.current.get(invoice.id)?.focus()
    setPeekedId((current) => (current === invoice.id ? null : invoice.id))
  }

  function closePeek() {
    if (peekedId !== null) {
      rowRefs.current.get(peekedId)?.focus()
    }
    setPeekedId(null)
  }

  function clearSelection() {
    setSelectedIds(new Set())
    if (focusKey !== null) {
      rowRefs.current.get(focusKey)?.focus()
    }
  }

  return {
    sort,
    groups,
    rows,
    focusKey,
    selectedIds,
    peekedId,
    isSelectable,
    announcement,
    sortBy,
    isExpanded,
    setExpanded,
    groupSelection,
    toggleSelected,
    togglePeek,
    closePeek,
    clearSelection,
    onRowFocus: setActiveKey,
    onRowKeyDown,
    registerRow: (key: string, element: HTMLElement | null) =>
      register(rowRefs.current, key, element),
    registerLink: (key: string, element: HTMLElement | null) =>
      register(linkRefs.current, key, element),
  }
}

type Table = ReturnType<typeof useInvoiceTable>

function visibleButtons(element: HTMLElement): ReadonlyArray<HTMLButtonElement> {
  const head = element.closest("table")?.tHead
  if (head === null || head === undefined) {
    return []
  }
  return [...head.querySelectorAll("button")].filter((button) => button.checkVisibility())
}

function focusSortedHeader(element: HTMLElement) {
  const buttons = visibleButtons(element)
  const sorted = buttons.find((button) => button.closest("[aria-sort]") !== null)
  ;(sorted ?? buttons[0])?.focus()
}

function onHeaderKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
  const buttons = visibleButtons(event.currentTarget)
  const index = buttons.indexOf(event.currentTarget)
  switch (event.key) {
    case "ArrowRight":
      event.preventDefault()
      buttons[index + 1]?.focus()
      return
    case "ArrowLeft":
      event.preventDefault()
      buttons[index - 1]?.focus()
      return
    case "ArrowDown":
      event.preventDefault()
      event.currentTarget
        .closest("table")
        ?.querySelector<HTMLElement>("tbody [role=row][tabindex='0'], tbody tr[tabindex='0']")
        ?.focus()
      return
    default:
      return
  }
}

function InvoiceTable({ state }: { state: TableState }) {
  return state === "loading" ? <LoadingTable /> : <LoadedTable state={state} />
}

type ElementProps = React.HTMLAttributes<HTMLElement> & {
  ref?: (element: HTMLElement | null) => void
  colSpan?: number
}

const TableTagContext = React.createContext<"table" | "div">("table")

/** Draws the table's rows and cells as `div`s, for drawings that wrap rows in other elements. */
export function DivTable({ children }: { children: React.ReactNode }): React.ReactElement {
  return <TableTagContext value="div">{children}</TableTagContext>
}

function RowElement(props: ElementProps) {
  return React.useContext(TableTagContext) === "table" ? (
    // biome-ignore lint/a11y/noRedundantRoles: WebKit drops the implicit row role from a tr displayed as grid
    <tr role="row" {...props} />
  ) : (
    <div {...props} />
  )
}

function CellElement(props: ElementProps) {
  return React.useContext(TableTagContext) === "table" ? (
    // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: WebKit drops the implicit gridcell role from a td displayed as flex
    // biome-ignore lint/a11y/useFocusableInteractive: the row holds focus in a treegrid; its cells are not tab stops
    <td role="gridcell" {...props} />
  ) : (
    <div {...props} />
  )
}

function HeadCellElement(props: ElementProps) {
  return React.useContext(TableTagContext) === "table" ? (
    <th scope="col" {...props} />
  ) : (
    <div {...props} />
  )
}

const tableLayout =
  "grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]"

function LoadingTable() {
  const panelPeekId = React.useId()
  return (
    <div className={tableLayout}>
      <div className="rounded-md border">
        <table
          // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: WAI-ARIA APG builds a treegrid on a table whose rows expand
          role="treegrid"
          aria-label="Invoices, loading"
          aria-busy="true"
          className={gridClass}
        >
          <thead className={rowGroupClass}>
            <HeadRow
              sort={defaultSort}
              isSortable={false}
              onSort={handleIgnore}
              isSelectable={false}
            />
          </thead>
          <tbody className={rowGroupClass}>
            {statusGroups(defaultSort).map((group) => (
              <React.Fragment key={group.status}>
                <LoadingGroupRow />
                {group.invoices.map((invoice) => (
                  <LoadingRow key={invoice.id} />
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <TableFooter state="loading" hintId={null} sort={null} isSelectable={false} />
      </div>
      <PeekPanel
        id={panelPeekId}
        invoice={null}
        state="loading"
        className="hidden lg:block"
        onClose={handleIgnore}
      />
    </div>
  )
}

function LoadedTable({ state }: { state: RowState }) {
  const table = useInvoiceTable(state)
  const hintId = React.useId()
  const inlinePeekId = React.useId()
  const panelPeekId = React.useId()
  const peeked =
    table.groups
      .flatMap((group) => group.invoices)
      .find((invoice) => invoice.id === table.peekedId) ?? null
  const peekAfterKey = table.rows
    .filter(
      (row) =>
        row.key === table.peekedId || (row.kind !== "group" && row.parentKey === table.peekedId)
    )
    .at(-1)?.key

  return (
    <>
      <div className={tableLayout}>
        <div className="rounded-md border">
          <table
            // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: WAI-ARIA APG builds a treegrid on a table whose rows expand
            role="treegrid"
            aria-label="Invoices"
            aria-describedby={hintId}
            aria-multiselectable={table.isSelectable ? true : undefined}
            className={gridClass}
          >
            <thead className={rowGroupClass}>
              <HeadRow
                sort={table.sort}
                isSortable
                onSort={table.sortBy}
                isSelectable={table.isSelectable}
              />
            </thead>
            <tbody className={rowGroupClass}>
              {table.rows.map((row) => (
                <React.Fragment key={row.key}>
                  <TableRow row={row} table={table} peekIds={`${inlinePeekId} ${panelPeekId}`} />
                  {peeked !== null && row.key === peekAfterKey ? (
                    <tr className="col-span-full border-b bg-muted/40 lg:hidden">
                      <td id={inlinePeekId} colSpan={8} className="block px-4 py-3 text-sm">
                        <PeekContent invoice={peeked} state={state} onClose={table.closePeek} />
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <TableFooter
            state={state}
            hintId={hintId}
            sort={table.sort}
            isSelectable={table.isSelectable}
          />
          <p role="status" className="sr-only">
            {table.announcement}
          </p>
        </div>
        <PeekPanel
          id={panelPeekId}
          invoice={peeked}
          state={state}
          className="hidden lg:block"
          onClose={table.closePeek}
        />
      </div>
      {table.isSelectable ? (
        <SelectionBar count={table.selectedIds.size} onClear={table.clearSelection} />
      ) : null}
    </>
  )
}

export function HeadRow({
  sort,
  isSortable,
  onSort,
  isSelectable,
}: {
  sort: Sort
  isSortable: boolean
  onSort: (column: Column) => void
  isSelectable: boolean
}): React.ReactElement {
  return (
    <RowElement className={cn(rowClass, "h-9 border-b text-left text-muted-foreground text-xs")}>
      <HeadCellElement className={seatClass.select}>
        <span className="sr-only">{isSelectable ? "Selected" : "Row"}</span>
      </HeadCellElement>
      <HeadCellElement className={seatClass.expand}>
        <span className="sr-only">Lines</span>
      </HeadCellElement>
      {columns.map((column) => (
        <ColumnHeader
          key={column}
          column={column}
          sort={sort}
          isSortable={isSortable}
          onSort={onSort}
        />
      ))}
      <HeadCellElement className={seatClass.peek}>
        <span className="sr-only">Peek</span>
      </HeadCellElement>
    </RowElement>
  )
}

export function ColumnHeader({
  column,
  sort,
  isSortable,
  onSort,
}: {
  column: Column
  sort: Sort
  isSortable: boolean
  onSort: (column: Column) => void
}): React.ReactElement {
  const direction = sort.column === column ? sort.direction : null
  return (
    <HeadCellElement
      aria-sort={direction ?? undefined}
      className={cn(seatClass[column], "items-center font-normal")}
    >
      <button
        type="button"
        tabIndex={-1}
        disabled={!isSortable}
        onClick={() => onSort(column)}
        onKeyDown={onHeaderKeyDown}
        className={cn(
          "group/sort -mx-1 inline-flex min-h-6 items-center gap-1 rounded-sm px-1 font-medium hover:text-foreground disabled:cursor-default disabled:hover:text-muted-foreground",
          numericColumns.has(column) && "flex-row-reverse",
          direction !== null && "text-foreground",
          focusRing
        )}
      >
        {columnLabel[column]}
        <SortArrow direction={direction} />
      </button>
    </HeadCellElement>
  )
}

function SortArrow({ direction }: { direction: Sort["direction"] | null }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn(
        "size-3.5 shrink-0",
        direction === null && "invisible group-hover/sort:visible group-focus-visible/sort:visible",
        direction === "descending" && "rotate-180"
      )}
    >
      <path
        d="M8 12.5v-9M4.5 7 8 3.5 11.5 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TableRow({ row, table, peekIds }: { row: VisibleRow; table: Table; peekIds: string }) {
  const focusProps: FocusableRowProps = {
    ref: (element) => table.registerRow(row.key, element),
    tabIndex: table.focusKey === row.key ? 0 : -1,
    onFocus: (event) => {
      if (event.target === event.currentTarget) {
        table.onRowFocus(row.key)
      }
    },
    onKeyDown: (event) => {
      if (event.target === event.currentTarget) {
        table.onRowKeyDown(event, row)
      }
    },
    onClick: (event) => event.currentTarget.focus(),
  }
  switch (row.kind) {
    case "group":
      return (
        <GroupHeaderRow
          {...focusProps}
          group={row.group}
          isExpanded={table.isExpanded(row)}
          selection={table.isSelectable ? table.groupSelection(row.group) : null}
          onToggle={() => table.setExpanded(row, !table.isExpanded(row))}
          onToggleSelected={() => table.toggleSelected(row)}
        />
      )
    case "invoice":
      return (
        <InvoiceRow
          {...focusProps}
          invoice={row.invoice}
          peekIds={peekIds}
          isExpanded={table.isExpanded(row)}
          isPeeked={table.peekedId === row.invoice.id}
          isSelected={table.isSelectable ? table.selectedIds.has(row.invoice.id) : null}
          linkRef={(element) => table.registerLink(row.key, element)}
          onToggleExpanded={() => table.setExpanded(row, !table.isExpanded(row))}
          onToggleSelected={() => table.toggleSelected(row)}
          onTogglePeek={() => table.togglePeek(row.invoice)}
        />
      )
    case "line":
      return <LineRow {...focusProps} line={row.line} />
    case "lines-error":
      return (
        <LinesErrorRow
          {...focusProps}
          invoice={row.invoice}
          linkRef={(element) => table.registerLink(row.key, element)}
        />
      )
  }
}

type FocusableRowProps = {
  ref?: (element: HTMLElement | null) => void
  tabIndex?: number
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}

const rowKeyShortcuts =
  "Space Shift+Space X Enter ArrowUp ArrowDown ArrowLeft ArrowRight Home End Escape"

type Selection = "all" | "some" | "none"

function EmptyCells({ seats }: { seats: ReadonlyArray<Seat> }) {
  return seats.map((seat) => <CellElement key={seat} className={seatClass[seat]} />)
}

export function GroupHeaderRow({
  group,
  isExpanded,
  selection,
  onToggle,
  onToggleSelected,
  look = "rest",
  ...focusProps
}: FocusableRowProps & {
  group: StatusGroup
  isExpanded: boolean
  selection: Selection | null
  onToggle: () => void
  onToggleSelected: () => void
  look?: RowLook
}): React.ReactElement {
  const nameId = React.useId()
  const countId = React.useId()
  const sumId = React.useId()
  return (
    <RowElement
      aria-level={1}
      aria-expanded={isExpanded}
      aria-selected={selection === null ? undefined : selection === "all"}
      aria-labelledby={`${nameId} ${countId} ${sumId}`}
      aria-keyshortcuts={rowKeyShortcuts}
      className={cn(
        rowClass,
        "group/row relative h-9 border-b bg-muted/40 hover:bg-muted/70 pointer-coarse:h-11",
        look !== "rest" && "bg-muted/70",
        look === "focus" && focusLook,
        focusRing
      )}
      {...focusProps}
    >
      <CellElement className={seatClass.select}>
        {selection === null ? null : (
          <SelectBox
            label={`Select every ${statusLabel[group.status].toLowerCase()} invoice`}
            checked={selection}
            isRevealed={look !== "rest"}
            onChange={onToggleSelected}
          />
        )}
      </CellElement>
      <CellElement className={seatClass.expand}>
        <button
          type="button"
          tabIndex={-1}
          aria-label={isExpanded ? "Collapse" : "Expand"}
          aria-describedby={nameId}
          onClick={onToggle}
          className="flex min-h-6 min-w-6 items-center rounded-sm text-muted-foreground after:absolute after:inset-0 hover:text-foreground"
        >
          <Chevron isExpanded={isExpanded} />
        </button>
      </CellElement>
      <CellElement colSpan={2} className="col-span-2 col-start-3 flex min-w-0 items-baseline gap-2">
        <span id={nameId} className="truncate font-medium text-sm">
          {statusLabel[group.status]}
        </span>
        <span id={countId} className="text-muted-foreground text-xs tabular-nums">
          <span aria-hidden="true">{group.invoices.length}</span>
          <span className="sr-only">{invoiceCount(group.invoices.length)}</span>
        </span>
      </CellElement>
      <CellElement className={cn(seatClass.amount, "items-center text-sm tabular-nums")}>
        <span id={sumId}>
          <span className="sr-only">total </span>
          {formatAmount(groupSum(group))}
        </span>
      </CellElement>
      <EmptyCells seats={["paid", "due", "peek"]} />
    </RowElement>
  )
}

type RowLook = "rest" | "hover" | "focus"

export function InvoiceRow({
  invoice,
  peekIds,
  isExpanded,
  isPeeked,
  isSelected,
  linkRef,
  onToggleExpanded,
  onToggleSelected,
  onTogglePeek,
  look = "rest",
  ...focusProps
}: FocusableRowProps & {
  invoice: SampleInvoice
  peekIds: string
  isExpanded: boolean
  isPeeked: boolean
  isSelected: boolean | null
  linkRef: (element: HTMLAnchorElement | null) => void
  onToggleExpanded: () => void
  onToggleSelected: () => void
  onTogglePeek: () => void
  look?: RowLook
}): React.ReactElement {
  const nameId = React.useId()
  const lineCount = linesOf(invoice).length
  return (
    <RowElement
      aria-level={2}
      aria-expanded={lineCount > 0 ? isExpanded : undefined}
      aria-selected={isSelected ?? undefined}
      aria-labelledby={nameId}
      aria-keyshortcuts={rowKeyShortcuts}
      className={cn(
        rowClass,
        "group/row relative h-11 border-b hover:bg-muted/60",
        look !== "rest" && "bg-muted/60",
        look === "focus" && focusLook,
        isPeeked && "bg-muted hover:bg-muted",
        focusRing
      )}
      {...focusProps}
    >
      <CellElement className={seatClass.select}>
        {isSelected === null ? null : (
          <SelectBox
            label={`Select ${invoice.id}`}
            checked={isSelected ? "all" : "none"}
            isRevealed={look !== "rest"}
            onChange={onToggleSelected}
          />
        )}
      </CellElement>
      <CellElement className={seatClass.expand}>
        {lineCount > 0 ? (
          <ExpandButton
            count={lineCount}
            isExpanded={isExpanded}
            describedBy={nameId}
            onClick={onToggleExpanded}
          />
        ) : null}
      </CellElement>
      <CellElement
        className={cn(seatClass.invoice, "items-center text-muted-foreground text-xs tabular-nums")}
      >
        {invoice.id}
      </CellElement>
      <CellElement className={cn(seatClass.customer, "items-center")}>
        <Link
          from="/canvas/experiments/record-table"
          to="/canvas/experiments/invoices/$invoiceId"
          params={{ invoiceId: invoice.id }}
          search={(previous) => ({ ...previous, focus: invoice.id })}
          ref={linkRef}
          tabIndex={-1}
          className="min-w-0 after:absolute after:inset-0"
        >
          <HoverCard trigger={<CustomerName id={nameId} invoice={invoice} />}>
            <ContactCard invoice={invoice} />
          </HoverCard>
          <DueLine invoice={invoice} />
        </Link>
      </CellElement>
      <CellElement className={cn(seatClass.amount, "items-center text-sm tabular-nums")}>
        {formatAmount(invoice.amount)}
      </CellElement>
      <CellElement className={cn(seatClass.paid, "items-center text-sm tabular-nums")}>
        {formatPaid(invoice.paid)}
      </CellElement>
      <CellElement className={cn(seatClass.due, "items-center")}>
        <DueText invoice={invoice} />
      </CellElement>
      <CellElement className={seatClass.peek}>
        <PeekButton
          controls={isPeeked ? peekIds : undefined}
          describedBy={nameId}
          isPeeked={isPeeked}
          isRevealed={look !== "rest"}
          onClick={onTogglePeek}
        />
      </CellElement>
    </RowElement>
  )
}

function CustomerName({ id, invoice }: { id: string; invoice: SampleInvoice }) {
  return (
    <span id={id} className="block truncate font-medium text-sm">
      {invoice.customer}
    </span>
  )
}

/** The due reading drawn in the Due column: overdue in medium weight, settled muted. */
export function DueText({ invoice }: { invoice: SampleInvoice }): React.ReactElement {
  const due = readDue(invoice)
  return (
    <span
      className={cn(
        "whitespace-nowrap text-sm",
        due.kind === "overdue" && "font-medium",
        due.kind === "settled" && "text-muted-foreground"
      )}
    >
      {due.text}
    </span>
  )
}

function DueLine({ invoice }: { invoice: SampleInvoice }) {
  const due = readDue(invoice)
  switch (due.kind) {
    case "settled":
      return null
    case "overdue":
      return <span className="block font-medium text-xs sm:hidden">{due.text}</span>
    case "upcoming":
      return <span className="block text-muted-foreground text-xs sm:hidden">Due {due.text}</span>
  }
}

export function ContactCard({ invoice }: { invoice: SampleInvoice }): React.ReactElement {
  return (
    <>
      <span className="block font-medium">{invoice.contact}</span>
      <span className="mt-1 block text-muted-foreground">Billing contact, {invoice.customer}</span>
    </>
  )
}

export function LineRow({
  line,
  ...focusProps
}: FocusableRowProps & { line: SampleInvoiceLine }): React.ReactElement {
  return (
    <RowElement
      aria-level={3}
      aria-keyshortcuts="Space Enter ArrowUp ArrowDown ArrowLeft Home End"
      className={cn(
        rowClass,
        "h-9 border-b border-dashed hover:bg-muted/40 pointer-coarse:h-11",
        focusRing
      )}
      {...focusProps}
    >
      <EmptyCells seats={["select", "expand", "invoice"]} />
      <CellElement className={cn(seatClass.customer, "items-center pl-4")}>
        <span className="truncate text-muted-foreground text-sm">{line.description}</span>
      </CellElement>
      <CellElement
        className={cn(seatClass.amount, "items-center text-muted-foreground text-sm tabular-nums")}
      >
        {formatAmount(line.amount)}
      </CellElement>
      <EmptyCells seats={["paid", "due", "peek"]} />
    </RowElement>
  )
}

export function LinesErrorRow({
  invoice,
  linkRef,
  ...focusProps
}: FocusableRowProps & {
  invoice: SampleInvoice
  linkRef: (element: HTMLAnchorElement | null) => void
}): React.ReactElement {
  return (
    <RowElement
      aria-level={3}
      aria-keyshortcuts="Enter ArrowUp ArrowDown ArrowLeft Home End"
      className={cn(rowClass, "min-h-9 border-b border-dashed py-1.5", focusRing)}
      {...focusProps}
    >
      <EmptyCells seats={["select", "expand", "invoice"]} />
      <CellElement
        colSpan={5}
        className="col-span-full col-start-4 flex flex-wrap items-center gap-x-3 pl-4 text-muted-foreground text-xs"
      >
        Lines for {invoice.id} could not load: the billing service did not respond.
        <Link
          to="."
          search={(previous) => ({ ...previous, state: "loaded" })}
          ref={linkRef}
          tabIndex={-1}
          className="inline-flex min-h-6 items-center font-medium text-foreground underline underline-offset-4"
        >
          Retry lines
        </Link>
      </CellElement>
    </RowElement>
  )
}

export function LoadingGroupRow(): React.ReactElement {
  return (
    <RowElement aria-hidden="true" className={cn(rowClass, "h-9 border-b bg-muted/40")}>
      <EmptyCells seats={["select", "expand"]} />
      <CellElement colSpan={2} className="col-span-2 col-start-3 flex items-center">
        <Bar className="w-16 bg-foreground/10" />
      </CellElement>
      <CellElement className={cn(seatClass.amount, "items-center")}>
        <Bar className="w-16 bg-foreground/10" />
      </CellElement>
      <EmptyCells seats={["paid", "due", "peek"]} />
    </RowElement>
  )
}

export function LoadingRow(): React.ReactElement {
  return (
    <RowElement aria-hidden="true" className={cn(rowClass, "h-11 border-b")}>
      <EmptyCells seats={["select", "expand"]} />
      <CellElement className={cn(seatClass.invoice, "items-center")}>
        <Bar className="w-14" />
      </CellElement>
      <CellElement className={cn(seatClass.customer, "items-center")}>
        <Bar className="w-36 max-w-full" />
      </CellElement>
      <CellElement className={cn(seatClass.amount, "items-center")}>
        <Bar className="w-16" />
      </CellElement>
      <CellElement className={cn(seatClass.paid, "items-center")}>
        <Bar className="w-10" />
      </CellElement>
      <CellElement className={cn(seatClass.due, "items-center")}>
        <Bar className="w-24" />
      </CellElement>
      <EmptyCells seats={["peek"]} />
    </RowElement>
  )
}

export function Chevron({ isExpanded }: { isExpanded: boolean }): React.ReactElement {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn("size-4 transition-transform", isExpanded && "rotate-90")}
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
  )
}

export function ExpandButton({
  count,
  isExpanded,
  describedBy,
  onClick,
}: {
  count: number
  isExpanded: boolean
  describedBy?: string
  onClick: () => void
}): React.ReactElement {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={`${isExpanded ? "Hide" : "Show"} ${count} lines`}
      aria-describedby={describedBy}
      onClick={onClick}
      className="relative z-10 flex min-h-6 min-w-6 items-center gap-0.5 rounded-sm pr-1.5 text-muted-foreground text-xs tabular-nums hover:bg-muted hover:text-foreground pointer-coarse:min-h-11"
    >
      <Chevron isExpanded={isExpanded} />
      {count}
    </button>
  )
}

const revealOnRow =
  "opacity-0 group-hover/row:opacity-100 group-focus-visible/row:opacity-100 pointer-coarse:opacity-100"

export function SelectBox({
  label,
  checked,
  isRevealed,
  onChange,
}: {
  label: string
  checked: Selection
  isRevealed: boolean
  onChange: () => void
}): React.ReactElement {
  return (
    <label className="relative z-10 flex size-6 cursor-pointer items-center justify-center pointer-coarse:size-11">
      <input
        type="checkbox"
        tabIndex={-1}
        aria-label={label}
        checked={checked === "all"}
        ref={(element) => {
          if (element !== null) {
            element.indeterminate = checked === "some"
          }
        }}
        onChange={onChange}
        className={cn(
          "size-4 accent-foreground",
          revealOnRow,
          (checked !== "none" || isRevealed) && "opacity-100"
        )}
      />
    </label>
  )
}

export function PeekButton({
  controls,
  describedBy,
  isPeeked,
  isRevealed,
  onClick,
}: {
  controls?: string
  describedBy?: string
  isPeeked: boolean
  isRevealed: boolean
  onClick: () => void
}): React.ReactElement {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label="Peek"
      aria-describedby={describedBy}
      aria-controls={controls}
      aria-expanded={isPeeked}
      onClick={onClick}
      className={cn(
        "relative z-10 flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground pointer-coarse:size-11",
        revealOnRow,
        (isPeeked || isRevealed) && "opacity-100",
        isPeeked && "text-foreground"
      )}
    >
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

export function HoverCard({
  trigger,
  children,
}: {
  trigger: React.ReactNode
  children: React.ReactNode
}): React.ReactElement {
  return (
    <span className="group/card relative z-10 block min-w-0">
      {trigger}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-full left-0 z-20 block pt-1 opacity-0 transition-opacity duration-0 group-hover/card:pointer-events-auto group-hover/card:opacity-100 group-hover/card:delay-300"
      >
        <span className={cardSurface}>{children}</span>
      </span>
    </span>
  )
}

export function TableFooter({
  state,
  hintId,
  sort,
  isSelectable,
}: {
  state: TableState
  hintId: string | null
  sort: Sort | null
  isSelectable: boolean
}): React.ReactElement {
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-muted-foreground text-xs">
      <FooterMessage state={state} />
      {sort === null ? null : (
        <span>
          Sorted by {columnLabel[sort.column]}, {sort.direction}
        </span>
      )}
      {state === "loading" ? null : (
        <span className="ml-auto">
          <span id={hintId ?? undefined} className="pointer-coarse:hidden">
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> move · <Kbd>←</Kbd> <Kbd>→</Kbd> lines · <Kbd>Space</Kbd> peek
            ·{" "}
            {isSelectable ? (
              <>
                <Kbd>X</Kbd> select ·{" "}
              </>
            ) : null}
            <Kbd>Enter</Kbd> open · <Kbd>Esc</Kbd> close
          </span>
          <span className="hidden pointer-coarse:inline">
            Tap a row to open it; tap the eye to peek
            {isSelectable ? "; tap a checkbox to select" : ""}.
          </span>
        </span>
      )}
    </div>
  )
}

function FooterMessage({ state }: { state: TableState }) {
  const count = invoiceCount(sampleInvoices.length)
  switch (state) {
    case "loaded":
    case "partial":
      return <span>{count}</span>
    case "loading":
      return <span>Loading {count}…</span>
    case "no-permission":
      return (
        <span>
          {count}. Selecting invoices needs the Billing admin role. Ask a workspace admin for it.
        </span>
      )
  }
}

function SelectionBar({
  count,
  onClear,
}: {
  count: number
  onClear: () => void
}): React.ReactElement {
  const [isVoidOpen, setIsVoidOpen] = React.useState(false)
  const [isVoided, setIsVoided] = React.useState(false)
  const isWide = useIsWide()
  return (
    <>
      <p role="status" className="sr-only">
        {count > 0 ? `${invoiceCount(count)} selected` : ""}
      </p>
      {count > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
          <SelectionBarBody
            count={count}
            isWide={isWide}
            menu={<SelectionMenu isWide={isWide} onVoid={() => setIsVoidOpen(true)} />}
            onClear={onClear}
          />
        </div>
      )}
      <VoidDialog
        count={count}
        isOpen={isVoidOpen}
        onOpenChange={setIsVoidOpen}
        onConfirm={() => {
          setIsVoided(true)
          setIsVoidOpen(false)
        }}
        onClosed={() => {
          if (isVoided) {
            setIsVoided(false)
            onClear()
          }
        }}
      />
    </>
  )
}

const barButton =
  "inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 font-medium text-sm hover:bg-muted pointer-coarse:min-h-11"

const moreButton = cn(barButton, "w-8 justify-center px-0 pointer-coarse:w-11")

export function SelectionBarBody({
  count,
  isWide,
  menu,
  onClear,
}: {
  count: number
  isWide: boolean
  menu: React.ReactNode
  onClear: () => void
}): React.ReactElement {
  return (
    <section
      aria-label="Selected invoices"
      onKeyDown={(event) => {
        if (
          event.key === "Escape" &&
          event.target instanceof Node &&
          event.currentTarget.contains(event.target)
        ) {
          onClear()
        }
      }}
      className="pointer-events-auto relative flex max-w-full items-center gap-1 rounded-lg border bg-background p-1 shadow-md"
    >
      <span className="shrink-0 px-2 text-sm tabular-nums">{count} selected</span>
      <span aria-hidden="true" className="h-5 w-px shrink-0 bg-border" />
      <button type="button" className={cn(barButton, focusRing)}>
        Send reminder
      </button>
      {isWide ? (
        <button type="button" className={cn(barButton, focusRing)}>
          Export
        </button>
      ) : null}
      {menu}
      <span aria-hidden="true" className="h-5 w-px shrink-0 bg-border" />
      <button
        type="button"
        onClick={onClear}
        className={cn(barButton, "text-muted-foreground hover:text-foreground", focusRing)}
      >
        Clear
        <span className="pointer-coarse:hidden">
          <Kbd>Esc</Kbd>
        </span>
      </button>
    </section>
  )
}

const wideQuery = "(min-width: 40rem)"

function subscribeWide(onChange: () => void) {
  const list = window.matchMedia(wideQuery)
  list.addEventListener("change", onChange)
  return () => list.removeEventListener("change", onChange)
}

function useIsWide(): boolean {
  return React.useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(wideQuery).matches,
    () => true
  )
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
      <circle cx="3.5" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="12.5" cy="8" r="1.25" fill="currentColor" />
    </svg>
  )
}

const menuSurface = "w-48 rounded-md border bg-background p-1 shadow-md outline-hidden"

const menuItem =
  "flex min-h-8 w-full cursor-default items-center rounded-sm px-2 text-left text-sm outline-hidden data-highlighted:bg-muted pointer-coarse:min-h-11"

const menuDivider = "-mx-1 my-1 h-px bg-border"

function SelectionMenu({ isWide, onVoid }: { isWide: boolean; onVoid: () => void }) {
  return (
    <Menu.Root>
      <Menu.Trigger aria-label="More actions" className={cn(moreButton, focusRing)}>
        <MoreIcon />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="top" align="end" sideOffset={8} className="z-40">
          <Menu.Popup className={menuSurface}>
            {isWide ? null : <Menu.Item className={menuItem}>Export</Menu.Item>}
            <Menu.Item className={menuItem}>Mark as paid</Menu.Item>
            <Menu.Separator className={menuDivider} />
            <Menu.Item className={menuItem} onClick={onVoid}>
              Void invoices…
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

/** The More actions button as drawn in a constellation, without a menu attached. */
export function SelectionMenuButtonDrawing(): React.ReactElement {
  return (
    <span aria-hidden="true" className={moreButton}>
      <MoreIcon />
    </span>
  )
}

/** The More actions menu drawn open, for a constellation. */
export function SelectionMenuDrawing(): React.ReactElement {
  return (
    <div aria-hidden="true" className={menuSurface}>
      <div className={cn(menuItem, "sm:hidden")}>Export</div>
      <div className={menuItem}>Mark as paid</div>
      <div className={menuDivider} />
      <div className={menuItem}>Void invoices…</div>
    </div>
  )
}

function VoidDialog({
  count,
  isOpen,
  onOpenChange,
  onConfirm,
  onClosed,
}: {
  count: number
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onClosed: () => void
}) {
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  return (
    <AlertDialog.Root
      open={isOpen}
      onOpenChange={(open) => onOpenChange(open)}
      onOpenChangeComplete={(open) => {
        if (!open) {
          onClosed()
        }
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-foreground/20" />
        <AlertDialog.Popup
          initialFocus={cancelRef}
          className="fixed top-1/2 left-1/2 z-50 w-80 max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-4 shadow-md outline-hidden"
        >
          <AlertDialog.Title className="font-semibold text-sm">
            Void {invoiceCount(count)}?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-1 text-muted-foreground text-sm">
            A voided invoice can no longer be sent or paid. Voiding cannot be undone.
          </AlertDialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <AlertDialog.Close ref={cancelRef} className={cn(barButton, "border", focusRing)}>
              Cancel
            </AlertDialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              className={cn(
                barButton,
                "bg-foreground text-background hover:bg-foreground/85",
                focusRing
              )}
            >
              Void {invoiceCount(count)}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export function PeekPanel({
  id,
  invoice,
  state,
  className,
  onClose,
}: {
  id: string
  invoice: SampleInvoice | null
  state: TableState
  className: string
  onClose: () => void
}): React.ReactElement {
  return (
    <aside id={id} aria-label="Peek" className={cn("rounded-md border p-4 text-sm", className)}>
      <PeekPanelBody invoice={invoice} state={state} onClose={onClose} />
    </aside>
  )
}

function PeekPanelBody({
  invoice,
  state,
  onClose,
}: {
  invoice: SampleInvoice | null
  state: TableState
  onClose: () => void
}) {
  if (state === "loading") {
    return <p className="text-muted-foreground">Peek is available once the invoices load.</p>
  }
  if (invoice === null) {
    return (
      <p className="text-muted-foreground">
        <span className="pointer-coarse:hidden">
          Focus an invoice and press <Kbd>Space</Kbd> to peek at it here.
        </span>
        <span className="hidden pointer-coarse:inline">Tap the eye on a row to peek at it.</span>
      </p>
    )
  }
  return <PeekContent invoice={invoice} state={state} onClose={onClose} />
}

export function PeekContent({
  invoice,
  state,
  onClose,
}: {
  invoice: SampleInvoice
  state: RowState
  onClose: () => void
}): React.ReactElement {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-muted-foreground text-xs tabular-nums">{invoice.id}</p>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "-mt-1 -mr-1 inline-flex min-h-6 items-center rounded-sm px-1 text-muted-foreground text-xs hover:text-foreground pointer-coarse:min-h-11",
            focusRing
          )}
        >
          Close<span className="sr-only"> peek</span>
        </button>
      </div>
      <h3 className="mt-1 font-semibold">{invoice.customer}</h3>
      <p className="mt-2 max-w-prose text-pretty text-sm">{invoice.summary}</p>
      <InvoiceFields invoice={invoice} />
      <Link
        from="/canvas/experiments/record-table"
        to="/canvas/experiments/invoices/$invoiceId"
        params={{ invoiceId: invoice.id }}
        search={(previous) => ({ ...previous, state, focus: invoice.id })}
        className="mt-3 inline-flex min-h-6 items-center font-medium text-xs underline underline-offset-4"
      >
        Open {invoice.id}
      </Link>
    </>
  )
}

function InvoiceFields({ invoice }: { invoice: SampleInvoice }) {
  return (
    <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-xs">
      <dt className="text-muted-foreground">Status</dt>
      <dd>{statusLabel[invoice.status]}</dd>
      <dt className="text-muted-foreground">Amount</dt>
      <dd className="tabular-nums">{formatAmount(invoice.amount)} AUD</dd>
      <dt className="text-muted-foreground">Paid</dt>
      <dd className="tabular-nums">{formatPaid(invoice.paid)}</dd>
      <dt className="text-muted-foreground">Due</dt>
      <dd>
        {readDue(invoice).text} ({invoice.dueAt})
      </dd>
      <dt className="text-muted-foreground">Contact</dt>
      <dd>{invoice.contact}</dd>
    </dl>
  )
}

/** The invoice page that an invoice row links to. */
export function InvoicePage({
  invoice,
  state,
}: {
  invoice: SampleInvoice
  state: FixtureState
}): React.ReactElement {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <Link
        from="/canvas/experiments/invoices/$invoiceId"
        to="/canvas/experiments/record-table"
        search={(previous) => previous}
        className="inline-flex min-h-6 items-center self-start text-muted-foreground text-sm underline underline-offset-4"
      >
        Back to invoices
      </Link>
      <InvoicePageBody invoice={invoice} state={state} />
    </main>
  )
}

function InvoicePageBody({ invoice, state }: { invoice: SampleInvoice; state: FixtureState }) {
  switch (state) {
    case "error":
      return <ErrorMessage subject={invoice.id} />
    case "loading":
      return (
        <p aria-busy="true" className="text-muted-foreground text-sm">
          Loading {invoice.id}…
        </p>
      )
    case "loaded":
    case "partial":
    case "no-permission":
      return (
        <article>
          <p className="text-muted-foreground text-xs tabular-nums">{invoice.id}</p>
          <h1 className="mt-1 font-semibold text-xl">{invoice.customer}</h1>
          <p className="mt-3 max-w-prose text-pretty">{invoice.summary}</p>
          <InvoiceFields invoice={invoice} />
          <InvoiceLines invoice={invoice} state={state} />
        </article>
      )
  }
}

function InvoiceLines({ invoice, state }: { invoice: SampleInvoice; state: RowState }) {
  const lines = linesOf(invoice)
  if (state === "partial") {
    return (
      <p className="mt-6 text-muted-foreground text-sm">
        Lines could not load: the billing service did not respond. Reload the page to retry.
      </p>
    )
  }
  if (lines.length === 0) {
    return <p className="mt-6 text-muted-foreground text-sm">This invoice has no lines.</p>
  }
  return (
    <table className="mt-6 w-full max-w-lg text-sm">
      <caption className="mb-2 text-left font-medium">Lines</caption>
      <thead className="text-muted-foreground text-xs">
        <tr className="border-b">
          <th scope="col" className="py-2 pr-4 text-left font-medium">
            Description
          </th>
          <th scope="col" className="py-2 text-right font-medium">
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => (
          <tr key={line.id} className="border-b">
            <td className="py-2 pr-4">{line.description}</td>
            <td className="py-2 text-right tabular-nums">{formatAmount(line.amount)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" className="py-2 pr-4 text-left font-medium">
            Total
          </th>
          <td className="py-2 text-right font-medium tabular-nums">
            {formatAmount(invoice.amount)}
          </td>
        </tr>
      </tfoot>
    </table>
  )
}
