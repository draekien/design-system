import { AlertDialog } from "@base-ui/react/alert-dialog"
import { Menu } from "@base-ui/react/menu"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import {
  type InvoiceStatus,
  type SampleInvoice,
  type SampleInvoiceLine,
  sampleInvoices,
} from "@workspace/fixtures/invoices.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@workspace/registry/components/preview-card.tsx"
import {
  Status,
  StatusMedia,
  type StatusMediaProps,
  StatusName,
} from "@workspace/registry/components/status.tsx"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableCellDetail,
  TableGroupRow,
  TableHead,
  TableHeader,
  TableRow,
  TableRowExpand,
  TableRowLink,
  TableRowLoading,
  TableRowSelect,
} from "@workspace/registry/components/table.tsx"
import * as React from "react"
import { flushSync } from "react-dom"
import { cn } from "@/lib/cn.ts"
import { Kbd } from "../kbd.tsx"
import { textLink } from "../lockup-styles.ts"
import {
  columnLabel,
  compareLines,
  formatAmount,
  formatPaid,
  groupLineCount,
  groupSum,
  groupValue,
  invoiceCount,
  isColumn,
  linesOf,
  type RowState,
  readDue,
  type Sort,
  type StatusGroup,
  shownColumns,
  sorted,
  statusGroups,
  statusLabel,
} from "./table-model.ts"
import type { TablePart } from "./table-parts.ts"
import { controlCell, tableSurface } from "./table-styles.ts"

const defaultSort: Sort = { column: "due", direction: "ascending" }

const HiddenPartsContext = React.createContext<ReadonlySet<TablePart>>(new Set())

/** Hides the given parts in every table row rendered inside it. */
export function TableParts({
  hidden,
  children,
}: {
  hidden: ReadonlySet<TablePart>
  children: React.ReactNode
}): React.ReactElement {
  return <HiddenPartsContext.Provider value={hidden}>{children}</HiddenPartsContext.Provider>
}

function useShown() {
  const hidden = React.useContext(HiddenPartsContext)
  return (part: TablePart) => !hidden.has(part)
}

function useColumnSpan(isSelectable: boolean) {
  const hidden = React.useContext(HiddenPartsContext)
  return shownColumns(hidden).length + (isSelectable ? 2 : 1)
}

/** The invoices table lockup in one fixture state. */
export function TableLockup({
  state,
  invoices = sampleInvoices,
}: {
  state: FixtureState
  invoices?: ReadonlyArray<SampleInvoice>
}): React.ReactElement {
  switch (state) {
    case "error":
      return <TableError />
    case "loading":
      return <LoadingInvoices invoices={invoices} />
    case "loaded":
    case "partial":
    case "no-permission":
      return <Invoices key={state} state={state} invoices={invoices} />
  }
}

function Invoices({
  state,
  invoices,
}: {
  state: RowState
  invoices: ReadonlyArray<SampleInvoice>
}) {
  const shown = useShown()
  const hidden = React.useContext(HiddenPartsContext)
  const [chosenSort, setSort] = React.useState<Sort>(defaultSort)
  const sort: Sort = shownColumns(hidden).includes(chosenSort.column)
    ? chosenSort
    : { column: "customer", direction: "ascending" }
  const [expandedValues, setExpandedValues] = React.useState<ReadonlyArray<string>>(() =>
    statusGroups(invoices, defaultSort).map((group) => groupValue(group.status))
  )
  const [selectedValues, setSelectedValues] = React.useState<ReadonlyArray<string>>([])
  const [peekValue, setPeekValue] = React.useState<string | null>(null)
  const [openValue, setOpenValue] = React.useState<string | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const tableRef = React.useRef<HTMLDivElement>(null)
  const sortId = React.useId()
  const hintId = React.useId()
  const inlinePeekId = React.useId()
  const panelPeekId = React.useId()
  const isSelectable = state !== "no-permission" && shown("select")
  const columnSpan = useColumnSpan(isSelectable)
  const groups = statusGroups(invoices, sort)
  const peeked = invoices.find((invoice) => invoice.id === peekValue) ?? null
  const opened = invoices.find((invoice) => invoice.id === openValue) ?? null

  function focusRow(value: string) {
    tableRef.current?.querySelector<HTMLElement>(`tr[data-value="${value}"]`)?.focus()
  }

  function handleBack(value: string) {
    flushSync(() => setOpenValue(null))
    focusRow(value)
  }

  function handleExpandedValuesChange(next: ReadonlyArray<string>) {
    const opening = next.find((value) => !expandedValues.includes(value))
    if (state === "partial" && opening !== undefined && !opening.startsWith("group:")) {
      const text = `Lines for ${opening} could not load`
      setAnnouncement((previous) => (previous === text ? `${text}.` : text))
    }
    setExpandedValues(next)
  }

  function handleSortChange(next: { column: string; direction: Sort["direction"] }) {
    if (isColumn(next.column)) {
      setSort({ column: next.column, direction: next.direction })
    }
  }

  function handlePeekValueChange(next: string | null) {
    if (next === null || invoices.some((invoice) => invoice.id === next)) {
      setPeekValue(next)
    }
  }

  function handleOpen(value: string) {
    setOpenValue(value)
  }

  function handleClosePeek() {
    if (peekValue !== null) {
      focusRow(peekValue)
    }
    setPeekValue(null)
  }

  function handleClearSelection() {
    setSelectedValues([])
    tableRef.current?.querySelector<HTMLElement>('tbody tr[tabindex="0"]')?.focus()
  }

  return (
    <>
      {opened !== null && (
        <InvoicePage invoice={opened} state={state} onBack={() => handleBack(opened.id)} />
      )}
      <div
        hidden={opened !== null}
        className={cn(
          "grid grid-cols-[minmax(0,1fr)] items-start gap-section",
          peeked !== null && "lg:grid-cols-[minmax(0,1fr)_20rem]"
        )}
      >
        <div ref={tableRef} className={tableSurface}>
          <Table
            aria-describedby={`${sortId} ${hintId}`}
            sort={sort}
            onSortChange={handleSortChange}
            expandedValues={expandedValues}
            onExpandedValuesChange={handleExpandedValuesChange}
            selectedValues={isSelectable ? selectedValues : undefined}
            onSelectedValuesChange={isSelectable ? setSelectedValues : undefined}
            peekValue={peekValue}
            onPeekValueChange={handlePeekValueChange}
          >
            <TableCaption className="sr-only">Invoices</TableCaption>
            <TableHeader>
              <InvoiceHeaderRow isSelectable={isSelectable} />
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <React.Fragment key={group.status}>
                  <InvoiceGroupRow group={group} isSelectable={isSelectable} />
                  {expandedValues.includes(groupValue(group.status))
                    ? group.invoices.map((invoice) => (
                        <React.Fragment key={invoice.id}>
                          <InvoiceRow
                            invoice={invoice}
                            isSelectable={isSelectable}
                            peekIds={
                              peekValue === invoice.id
                                ? `${inlinePeekId} ${panelPeekId}`
                                : undefined
                            }
                            onOpen={handleOpen}
                          />
                          {shown("child-rows") && expandedValues.includes(invoice.id) ? (
                            <InvoiceChildRows
                              invoice={invoice}
                              sort={sort}
                              state={state}
                              isSelectable={isSelectable}
                            />
                          ) : null}
                          {peekValue === invoice.id ? (
                            <tr className="lg:hidden">
                              <td
                                id={inlinePeekId}
                                colSpan={columnSpan}
                                className="bg-foreground/4 p-3 text-sm"
                              >
                                <PeekContent
                                  invoice={invoice}
                                  onOpen={handleOpen}
                                  onClose={handleClosePeek}
                                />
                              </td>
                            </tr>
                          ) : null}
                        </React.Fragment>
                      ))
                    : null}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          <InvoicesFooter
            state={state}
            count={invoices.length}
            sort={sort}
            sortId={sortId}
            hintId={hintId}
            isSelectable={isSelectable}
          />
          <p role="status" className="sr-only">
            {announcement}
          </p>
        </div>
        {peeked === null ? null : (
          <aside
            id={panelPeekId}
            aria-label="Peek"
            className="hidden rounded-card border bg-card p-3 text-card-foreground text-sm lg:sticky lg:top-section lg:block"
          >
            <PeekContent invoice={peeked} onOpen={handleOpen} onClose={handleClosePeek} />
          </aside>
        )}
      </div>
      {isSelectable && opened === null ? (
        <SelectionBar count={selectedValues.length} onClear={handleClearSelection} />
      ) : null}
    </>
  )
}

function LoadingInvoices({ invoices }: { invoices: ReadonlyArray<SampleInvoice> }) {
  const isSelectable = useShown()("select")
  return (
    <div className={tableSurface}>
      <Table aria-busy="true">
        <TableCaption className="sr-only">Invoices, loading</TableCaption>
        <TableHeader>
          <InvoiceHeaderRow isSelectable={isSelectable} />
        </TableHeader>
        <TableBody>
          {statusGroups(invoices, defaultSort).map((group) => (
            <React.Fragment key={group.status}>
              <LoadingGroupRow />
              {group.invoices.map((invoice) => (
                <LoadingInvoiceRow key={invoice.id} />
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      <p role="status" className="flex min-h-11 items-center px-3 text-muted-foreground text-xs">
        Loading {invoiceCount(invoices.length)}…
      </p>
    </div>
  )
}

/** The column header row: one sortable header per column. */
export function InvoiceHeaderRow({
  isSelectable,
  anchors,
}: {
  isSelectable: boolean
  anchors?: { column?: number }
}): React.ReactElement {
  const shown = useShown()
  return (
    <TableRow>
      {isSelectable ? (
        <TableHead className={controlCell}>
          <span className="sr-only">Selected</span>
        </TableHead>
      ) : null}
      <TableHead className={controlCell}>
        <span className="sr-only">Lines</span>
      </TableHead>
      {shown("invoice") ? (
        <TableHead column="invoice" narrow="hide">
          {columnLabel.invoice}
        </TableHead>
      ) : null}
      <TableHead column="customer" className="w-full">
        {columnLabel.customer}
      </TableHead>
      {shown("lines") ? (
        <TableHead column="lines" align="end" narrow="hide">
          {columnLabel.lines}
        </TableHead>
      ) : null}
      <TableHead column="amount" align="end" data-anchor={anchors?.column}>
        {columnLabel.amount}
      </TableHead>
      {shown("paid") ? (
        <TableHead column="paid" align="end" narrow="hide">
          {columnLabel.paid}
        </TableHead>
      ) : null}
      {shown("due") ? (
        <TableHead column="due" narrow="hide" className="pr-3">
          {columnLabel.due}
        </TableHead>
      ) : null}
    </TableRow>
  )
}

export type GroupAnchors = {
  row?: number
  select?: number
  toggle?: number
  name?: number
  sum?: number
}

const statusFill: Readonly<Record<InvoiceStatus, StatusMediaProps["fill"]>> = {
  draft: "none",
  sent: "half",
  paid: "full",
}

/** A status group's header row: its status and count, and its line and amount sums. */
export function InvoiceGroupRow({
  group,
  isSelectable,
  anchors,
  className,
}: {
  group: StatusGroup
  isSelectable: boolean
  anchors?: GroupAnchors
  className?: string
}): React.ReactElement {
  const shown = useShown()
  return (
    <TableGroupRow
      value={groupValue(group.status)}
      values={group.invoices.map((invoice) => invoice.id)}
      data-anchor={anchors?.row}
      className={className}
    >
      {isSelectable ? (
        <TableCell className={controlCell} data-anchor={anchors?.select}>
          <TableRowSelect />
        </TableCell>
      ) : null}
      <TableCell className={controlCell} data-anchor={anchors?.toggle}>
        <TableRowExpand />
      </TableCell>
      <TableHead data-anchor={anchors?.name} className="relative w-0">
        <span className="absolute inset-y-0 left-2 flex items-center gap-related whitespace-nowrap">
          <Status className="font-medium">
            <StatusMedia fill={statusFill[group.status]} />
            <StatusName>{statusLabel[group.status]}</StatusName>
          </Status>
          <span className="text-muted-foreground text-xs tabular-nums">
            <span aria-hidden="true">{group.invoices.length}</span>
            <span className="sr-only">{invoiceCount(group.invoices.length)}</span>
          </span>
        </span>
      </TableHead>
      {shown("invoice") ? <TableCell narrow="hide" /> : null}
      {shown("lines") ? (
        <TableCell align="end" narrow="hide">
          {groupLineCount(group)}
          <span className="sr-only"> lines</span>
        </TableCell>
      ) : null}
      <TableCell align="end" data-anchor={anchors?.sum}>
        <span className="sr-only">total </span>
        {formatAmount(groupSum(group))}
      </TableCell>
      {shown("paid") ? <TableCell narrow="hide" /> : null}
      {shown("due") ? <TableCell narrow="hide" /> : null}
    </TableGroupRow>
  )
}

export type InvoiceAnchors = {
  row?: number
  select?: number
  expand?: number
  link?: number
  reads?: number
}

/** One invoice: its ID, customer, line count, amount, paid share and due date. */
export function InvoiceRow({
  invoice,
  isSelectable,
  peekIds,
  cardOpen,
  cardContainer,
  anchors,
  className,
  onOpen,
}: {
  invoice: SampleInvoice
  isSelectable: boolean
  peekIds?: string
  cardOpen?: boolean
  cardContainer?: HTMLElement | null
  anchors?: InvoiceAnchors
  className?: string
  onOpen?: (value: string) => void
}): React.ReactElement {
  const shown = useShown()
  const lineCount = linesOf(invoice).length
  const customer = <span className="truncate">{invoice.customer}</span>
  return (
    <TableRow
      value={invoice.id}
      level={2}
      aria-controls={peekIds}
      data-anchor={anchors?.row}
      className={className}
    >
      {isSelectable ? (
        <TableCell className={controlCell} data-anchor={anchors?.select}>
          <TableRowSelect />
        </TableCell>
      ) : null}
      <TableCell className={controlCell} data-anchor={anchors?.expand}>
        {shown("child-rows") && lineCount > 0 ? <TableRowExpand /> : null}
      </TableCell>
      {shown("invoice") ? (
        <TableCell narrow="hide" className="text-muted-foreground text-xs tabular-nums">
          {invoice.id}
        </TableCell>
      ) : null}
      <TableHead data-anchor={anchors?.link}>
        <TableRowLink
          href={`#${invoice.id}`}
          onClick={(event) => {
            if (onOpen !== undefined) {
              event.preventDefault()
              onOpen(invoice.id)
            }
          }}
        >
          {shown("customer-card") ? (
            <PreviewCard open={cardOpen}>
              <PreviewCardTrigger className="justify-start">{customer}</PreviewCardTrigger>
              <PreviewCardContent container={cardContainer}>
                <ContactCard invoice={invoice} />
              </PreviewCardContent>
            </PreviewCard>
          ) : (
            customer
          )}
        </TableRowLink>
        {shown("due") ? <DueDetail invoice={invoice} /> : null}
      </TableHead>
      {shown("lines") ? (
        <TableCell align="end" narrow="hide" data-anchor={anchors?.reads}>
          {lineCount}
        </TableCell>
      ) : null}
      <TableCell align="end">{formatAmount(invoice.amount)}</TableCell>
      {shown("paid") ? (
        <TableCell align="end" narrow="hide">
          {formatPaid(invoice.paid)}
        </TableCell>
      ) : null}
      {shown("due") ? (
        <TableCell narrow="hide" className="pr-3">
          <DueText invoice={invoice} />
        </TableCell>
      ) : null}
    </TableRow>
  )
}

function InvoiceChildRows({
  invoice,
  sort,
  state,
  isSelectable,
}: {
  invoice: SampleInvoice
  sort: Sort
  state: RowState
  isSelectable: boolean
}) {
  return state === "partial" ? (
    <LinesErrorRow invoice={invoice} isSelectable={isSelectable} />
  ) : (
    sorted(linesOf(invoice), sort, compareLines).map((line) => (
      <LineRow key={line.id} line={line} isSelectable={isSelectable} />
    ))
  )
}

const childRowClass = "h-9 pointer-coarse:h-11"

/** One line of an invoice, drawn under it in the invoice's columns. */
export function LineRow({
  line,
  isSelectable,
  anchor,
}: {
  line: SampleInvoiceLine
  isSelectable: boolean
  anchor?: number
}): React.ReactElement {
  const shown = useShown()
  return (
    <TableRow value={line.id} level={3} data-anchor={anchor} className={childRowClass}>
      {isSelectable ? <TableCell className={controlCell} /> : null}
      <TableCell className={controlCell} />
      {shown("invoice") ? <TableCell narrow="hide" /> : null}
      <TableHead className="text-muted-foreground">
        <span className="block truncate">{line.description}</span>
      </TableHead>
      {shown("lines") ? <TableCell narrow="hide" /> : null}
      <TableCell align="end" className="text-muted-foreground">
        {formatAmount(line.amount)}
      </TableCell>
      {shown("paid") ? <TableCell narrow="hide" /> : null}
      {shown("due") ? <TableCell narrow="hide" /> : null}
    </TableRow>
  )
}

/** Drawn in place of an invoice's lines when they fail to load; its link retries them. */
export function LinesErrorRow({
  invoice,
  isSelectable,
  anchor,
}: {
  invoice: SampleInvoice
  isSelectable: boolean
  anchor?: number
}): React.ReactElement {
  const shown = useShown()
  return (
    <TableRow
      value={`${invoice.id}:lines-error`}
      level={3}
      data-anchor={anchor}
      className={childRowClass}
    >
      {isSelectable ? <TableCell className={controlCell} /> : null}
      <TableCell className={controlCell} />
      {shown("invoice") ? <TableCell narrow="hide" /> : null}
      <TableHead className="whitespace-normal py-1.5 text-muted-foreground text-xs">
        Lines for {invoice.id} could not load: the billing service did not respond.{" "}
        <TableRowLink
          render={<Link to="." search={(previous) => ({ ...previous, state: "loaded" })} />}
          className="inline font-medium text-foreground underline underline-offset-4"
        >
          Retry lines
        </TableRowLink>
      </TableHead>
      {shown("lines") ? <TableCell narrow="hide" /> : null}
      <TableCell align="end" />
      {shown("paid") ? <TableCell narrow="hide" /> : null}
      {shown("due") ? <TableCell narrow="hide" /> : null}
    </TableRow>
  )
}

/** A loading group header: a bar where the status and the sum will be. */
export function LoadingGroupRow(): React.ReactElement {
  const shown = useShown()
  return (
    <TableRowLoading className="h-9 *:first:before:bg-muted/40">
      {shown("select") ? (
        <TableCell className={controlCell}>
          <TableRowSelect />
        </TableCell>
      ) : null}
      <TableCell className={controlCell}>
        <TableRowExpand />
      </TableCell>
      {shown("invoice") ? <TableCell narrow="hide" /> : null}
      <TableHead>Status</TableHead>
      {shown("lines") ? <TableCell narrow="hide" /> : null}
      <TableCell align="end">Sum</TableCell>
      {shown("paid") ? <TableCell narrow="hide" /> : null}
      {shown("due") ? <TableCell narrow="hide" /> : null}
    </TableRowLoading>
  )
}

/** A loading invoice: a bar in each column at the width of its values. */
export function LoadingInvoiceRow(): React.ReactElement {
  const shown = useShown()
  return (
    <TableRowLoading>
      {shown("select") ? (
        <TableCell className={controlCell}>
          <TableRowSelect />
        </TableCell>
      ) : null}
      <TableCell className={controlCell}>
        <TableRowExpand />
      </TableCell>
      {shown("invoice") ? <TableCell narrow="hide">ID</TableCell> : null}
      <TableHead>Customer</TableHead>
      {shown("lines") ? (
        <TableCell align="end" narrow="hide">
          Lines
        </TableCell>
      ) : null}
      <TableCell align="end">Amount</TableCell>
      {shown("paid") ? (
        <TableCell align="end" narrow="hide">
          Paid
        </TableCell>
      ) : null}
      {shown("due") ? <TableCell narrow="hide">Due</TableCell> : null}
    </TableRowLoading>
  )
}

/** The due reading in the Due column: overdue in medium weight, settled muted. */
export function DueText({ invoice }: { invoice: SampleInvoice }): React.ReactElement {
  const due = readDue(invoice)
  return (
    <span
      className={cn(
        "whitespace-nowrap",
        due.kind === "overdue" && "font-medium",
        due.kind === "settled" && "text-muted-foreground"
      )}
    >
      {due.text}
    </span>
  )
}

function DueDetail({ invoice }: { invoice: SampleInvoice }) {
  const due = readDue(invoice)
  switch (due.kind) {
    case "settled":
      return null
    case "overdue":
      return <TableCellDetail className="font-medium text-foreground">{due.text}</TableCellDetail>
    case "upcoming":
      return <TableCellDetail>Due {due.text}</TableCellDetail>
  }
}

/** The customer's billing contact, shown in the customer's hover card. */
function ContactCard({ invoice }: { invoice: SampleInvoice }): React.ReactElement {
  return (
    <span className="flex flex-col gap-related">
      <span className="font-medium">{invoice.contact}</span>
      <span className="text-muted-foreground">Billing contact, {invoice.customer}</span>
    </span>
  )
}

/** The text under the table: the invoice count, the sort, and the key hints. */
export function InvoicesFooter({
  state,
  count,
  sort,
  sortId,
  hintId,
  isSelectable,
  anchor,
}: {
  state: RowState
  count: number
  sort: Sort
  sortId?: string
  hintId?: string
  isSelectable: boolean
  anchor?: number
}): React.ReactElement {
  return (
    <div
      data-anchor={anchor}
      className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1.5 px-3 text-muted-foreground text-xs"
    >
      <span>
        {invoiceCount(count)}
        {state === "no-permission"
          ? ". Selecting invoices needs the Billing admin role. Ask a workspace admin for it."
          : null}
      </span>
      <span id={sortId}>
        Sorted by {columnLabel[sort.column]}, {sort.direction}
      </span>
      <span id={hintId} className="ml-auto pointer-coarse:hidden">
        <Kbd>↑</Kbd> <Kbd>↓</Kbd> move · <Kbd>←</Kbd> <Kbd>→</Kbd> lines · <Kbd>Space</Kbd> peek ·{" "}
        {isSelectable ? (
          <>
            <Kbd>X</Kbd> select ·{" "}
          </>
        ) : null}
        <Kbd>Enter</Kbd> open
      </span>
    </div>
  )
}

/** A read-only preview of an invoice's page. */
export function PeekContent({
  invoice,
  onOpen,
  onClose,
}: {
  invoice: SampleInvoice
  onOpen: (value: string) => void
  onClose: () => void
}): React.ReactElement {
  return (
    <div className="flex flex-col items-start gap-section">
      <div className="flex w-full flex-col gap-related">
        <div className="flex items-center justify-between gap-related">
          <p className="text-muted-foreground text-xs tabular-nums">{invoice.id}</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-6 items-center rounded-floor text-muted-foreground text-xs hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:min-h-11"
          >
            Close<span className="sr-only"> peek</span>
          </button>
        </div>
        <h2 className="text-balance font-semibold">{invoice.customer}</h2>
        <p className="max-w-prose text-pretty text-sm leading-relaxed">{invoice.summary}</p>
      </div>
      <InvoiceFields invoice={invoice} />
      <a
        href={`#${invoice.id}`}
        onClick={(event) => {
          event.preventDefault()
          onOpen(invoice.id)
        }}
        className={cn(textLink, "text-xs")}
      >
        Open {invoice.id}
      </a>
    </div>
  )
}

function InvoiceFields({ invoice }: { invoice: SampleInvoice }) {
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-related text-xs">
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

function InvoicePage({
  invoice,
  state,
  onBack,
}: {
  invoice: SampleInvoice
  state: RowState
  onBack: () => void
}) {
  const headingRef = React.useRef<HTMLHeadingElement>(null)

  React.useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <article
      className={cn(tableSurface, "flex max-w-2xl flex-col items-start gap-section p-3 text-sm")}
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-6 items-center gap-related rounded-floor font-medium text-muted-foreground text-xs hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring pointer-coarse:min-h-11"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={1.75} aria-hidden="true" />
        Back to invoices
      </button>
      <div className="flex flex-col gap-related">
        <p className="text-muted-foreground text-xs tabular-nums">{invoice.id}</p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-balance font-semibold text-xl tracking-tight outline-none"
        >
          {invoice.customer}
        </h2>
        <p className="max-w-prose text-pretty text-sm leading-relaxed">{invoice.summary}</p>
      </div>
      <InvoiceFields invoice={invoice} />
      <InvoiceLines invoice={invoice} state={state} />
    </article>
  )
}

function InvoiceLines({ invoice, state }: { invoice: SampleInvoice; state: RowState }) {
  const lines = linesOf(invoice)
  if (state === "partial") {
    return (
      <p className="text-muted-foreground text-sm">
        Lines could not load: the billing service did not respond. Reload the page to retry.
      </p>
    )
  }
  if (lines.length === 0) {
    return <p className="text-muted-foreground text-sm">This invoice has no lines.</p>
  }
  return (
    <div className="w-full max-w-lg">
      <Table>
        <TableCaption>Lines</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead align="end">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => (
            <TableRow key={line.id} className="h-9">
              <TableCell>{line.description}</TableCell>
              <TableCell align="end">{formatAmount(line.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function TableError() {
  return (
    <section
      role="alert"
      className={cn(
        tableSurface,
        "flex min-h-56 flex-col items-center justify-center gap-related p-3 text-center"
      )}
    >
      <p className="font-medium">The invoices could not load.</p>
      <p className="max-w-sm text-pretty text-muted-foreground text-sm">
        The request timed out after 10 seconds. Retry, or check your connection and reload the page.
      </p>
      <Link
        to="."
        search={(previous) => ({ ...previous, state: "loaded" })}
        className="inline-flex min-h-9 items-center rounded-floor border bg-background px-4 font-medium text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 pointer-coarse:min-h-11"
      >
        Retry
      </Link>
    </section>
  )
}

function SelectionBar({ count, onClear }: { count: number; onClear: () => void }) {
  const [isVoidOpen, setIsVoidOpen] = React.useState(false)
  const [isVoided, setIsVoided] = React.useState(false)
  const isWide = useIsWide()
  return (
    <>
      <p role="status" className="sr-only">
        {count > 0 ? `${invoiceCount(count)} selected` : ""}
      </p>
      {count > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-section z-popover flex justify-center px-section">
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

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"

const barButton =
  "inline-flex min-h-8 shrink-0 cursor-pointer items-center gap-related rounded-floor px-2.5 font-medium text-sm hover:bg-muted pointer-coarse:min-h-11"

const moreButton = cn(barButton, "w-8 justify-center px-0 pointer-coarse:w-11")

/** The bar fixed to the bottom while invoices are selected: the count, the actions and Clear. */
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
      className="pointer-events-auto relative flex max-w-full items-center gap-run rounded-lg border bg-background p-1 shadow-popover"
    >
      <span className="shrink-0 px-2.5 text-sm tabular-nums">{count} selected</span>
      <span aria-hidden="true" className="mx-1 h-4 w-px shrink-0 bg-border" />
      <button type="button" className={cn(barButton, focusRing)}>
        Send reminder
      </button>
      {isWide ? (
        <button type="button" className={cn(barButton, focusRing)}>
          Export
        </button>
      ) : null}
      {menu}
      <span aria-hidden="true" className="mx-1 h-4 w-px shrink-0 bg-border" />
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
  const query = window.matchMedia(wideQuery)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
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

const menuSurface =
  "flex w-48 flex-col gap-run rounded-lg border bg-background p-1 shadow-popover outline-hidden"

const menuItem =
  "flex min-h-8 w-full cursor-default items-center rounded-floor px-2 text-left text-sm outline-hidden data-highlighted:bg-muted pointer-coarse:min-h-11"

const menuDivider = "-mx-1 my-1 h-px bg-border"

function SelectionMenu({ isWide, onVoid }: { isWide: boolean; onVoid: () => void }) {
  return (
    <Menu.Root>
      <Menu.Trigger aria-label="More actions" className={cn(moreButton, focusRing)}>
        <MoreIcon />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="top" align="end" sideOffset={8} className="z-popover">
          <Menu.Popup className={menuSurface}>
            {isWide ? null : <Menu.Item className={menuItem}>Export</Menu.Item>}
            <Menu.Item className={menuItem}>Mark as paid</Menu.Item>
            <Menu.Separator className={menuDivider} />
            <Menu.Item className={cn(menuItem, "text-destructive")} onClick={onVoid}>
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
      <div className={menuItem}>Mark as paid</div>
      <div className={menuDivider} />
      <div className={cn(menuItem, "text-destructive")}>Void invoices…</div>
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
        <AlertDialog.Backdrop className="fixed inset-0 z-popover bg-foreground/20" />
        <AlertDialog.Popup
          initialFocus={cancelRef}
          className="fixed top-1/2 left-1/2 z-popover flex w-80 max-w-full -translate-x-1/2 -translate-y-1/2 flex-col gap-related rounded-card border bg-background p-3 shadow-popover outline-hidden"
        >
          <AlertDialog.Title className="font-semibold text-sm">
            Void {invoiceCount(count)}?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-muted-foreground text-sm">
            A voided invoice can no longer be sent or paid. Voiding cannot be undone.
          </AlertDialog.Description>
          <div className="flex justify-end gap-related">
            <AlertDialog.Close ref={cancelRef} className={cn(barButton, "border", focusRing)}>
              Cancel
            </AlertDialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              className={cn(
                barButton,
                "border border-destructive text-destructive hover:bg-destructive/10",
                focusRing
              )}
            >
              Void
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
