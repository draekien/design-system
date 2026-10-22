import { type SampleInvoice, sampleInvoiceLines } from "@workspace/fixtures/invoices.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableGroupRow,
  TableHeader,
  TableRow,
  TableRowExpand,
  TableRowSelect,
} from "@workspace/registry/components/table.tsx"
import * as React from "react"
import { cn } from "@/lib/cn.ts"
import { clipSpecimen } from "../experiments/clip-specimen.tsx"
import {
  DueText,
  type GroupAnchors,
  type InvoiceAnchors,
  InvoiceGroupRow,
  InvoiceHeaderRow,
  InvoiceRow,
  InvoicesFooter,
  LineRow,
  LinesErrorRow,
  LoadingGroupRow,
  LoadingInvoiceRow,
  PeekContent,
  SelectionBarBody,
  SelectionMenuButtonDrawing,
  SelectionMenuDrawing,
  TableLockup,
} from "../lockups/table/table-lockup.tsx"
import {
  formatAmount,
  formatPaid,
  groupSum,
  groupValue,
  linesOf,
  type RowState,
  type Sort,
  type StatusGroup,
  statusGroups,
  statusLabel,
} from "../lockups/table/table-model.ts"
import { controlCell, tableSurface } from "../lockups/table/table-styles.ts"
import { CardSpecimen } from "./card-specimen.tsx"
import {
  Constellation,
  type ConstellationGroup,
  type ConstellationPart,
  type Drawing,
} from "./constellation.tsx"
import type { CanvasOptions } from "./playground-search.ts"
import { StatesSection } from "./states-section.tsx"

function handleIgnore() {
  return undefined
}

const drawingSort: Sort = { column: "amount", direction: "descending" }

const drawingSubject = sentInvoiceWithLines()

function sentInvoiceWithLines(): { group: StatusGroup; invoice: SampleInvoice } {
  const group = statusGroups(drawingSort).find((candidate) => candidate.status === "sent")
  const invoice = group?.invoices.find((candidate) => linesOf(candidate).length > 0)
  if (group === undefined || invoice === undefined) {
    throw new Error("The table drawings need a sent invoice with lines in the fixtures.")
  }
  return { group, invoice }
}

const drawingWidth = "w-[48rem]"

/** The table lockup canvas: the lockup or its States view, in one fixture state. */
export function TableCanvas({ options }: { options: CanvasOptions }): React.ReactElement {
  return (
    <main className="p-4 sm:p-6">
      <h1 className="sr-only">Table</h1>
      {options.view === "states" ? (
        <StatesView state={options.state} />
      ) : (
        <TableLockup key={options.state} state={options.state} />
      )}
    </main>
  )
}

/**
 * A one-subject table for a drawing or a specimen: its rows get the state the table would give
 * them, with every change ignored.
 */
function SpecimenTable({
  label,
  isSelectable,
  selected = false,
  peeked = false,
  expanded = false,
  header = true,
  className,
  anchor,
  children,
}: {
  label: string
  isSelectable: boolean
  selected?: boolean
  peeked?: boolean
  expanded?: boolean
  header?: boolean
  className?: string
  anchor?: number
  children: React.ReactNode
}) {
  const { group, invoice } = drawingSubject
  return (
    <div data-anchor={anchor} className={cn(tableSurface, className)}>
      <Table
        sort={drawingSort}
        onSortChange={handleIgnore}
        expandedValues={[groupValue(group.status), ...(expanded ? [invoice.id] : [])]}
        onExpandedValuesChange={handleIgnore}
        selectedValues={isSelectable ? (selected ? [invoice.id] : []) : undefined}
        onSelectedValuesChange={isSelectable ? handleIgnore : undefined}
        peekValue={peeked ? invoice.id : null}
        onPeekValueChange={handleIgnore}
      >
        <TableCaption className="sr-only">{label}</TableCaption>
        {header ? (
          <TableHeader>
            <InvoiceHeaderRow isSelectable={isSelectable} />
          </TableHeader>
        ) : null}
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  )
}

const rowSpecimens: ReadonlyArray<{
  label: string
  className?: string
  selected?: boolean
  peeked?: boolean
  expanded?: boolean
}> = [
  { label: "At rest" },
  { label: "Hovered", className: "bg-foreground/4 [&_[data-slot=table-row-select]]:visible" },
  {
    label: "Focused",
    className:
      "bg-foreground/7 [&_[data-slot=table-row-link]]:underline [&_[data-slot=table-row-select]]:visible",
  },
  { label: "Selected", selected: true },
  { label: "Peeked", peeked: true },
  { label: "Expanded", expanded: true },
]

const narrowSpecimens = [
  { label: "640px and wider: every column", width: "w-[44rem]" },
  {
    label:
      "Narrower than 640px: Invoice, Lines, Paid % and Due drop out; Due moves under the customer",
    width: "w-[30rem]",
  },
] as const

function StatesView({ state }: { state: FixtureState }) {
  const { group, invoice } = drawingSubject
  switch (state) {
    case "error":
      return <TableLockup state="error" />
    case "loading":
      return (
        <StatesSection
          title="Loading"
          description="A TableRowLoading per expected row; each cell with children draws a bar"
        >
          <div className={tableSurface}>
            <Table aria-busy="true">
              <TableCaption className="sr-only">Invoices, loading</TableCaption>
              <TableHeader>
                <InvoiceHeaderRow isSelectable={true} />
              </TableHeader>
              <TableBody>
                <LoadingGroupRow />
                <LoadingInvoiceRow />
              </TableBody>
            </Table>
          </div>
        </StatesSection>
      )
    case "loaded":
    case "partial":
    case "no-permission": {
      const isSelectable = state !== "no-permission"
      return (
        <div className="flex flex-col gap-12">
          <StatesSection
            title="Row states"
            description="One invoice at rest and in each state the table draws on it"
          >
            <div className="grid gap-4">
              {rowSpecimens.map((specimen) => (
                <div key={specimen.label} className="flex flex-col gap-1.5">
                  <p className="text-muted-foreground text-xs">{specimen.label}</p>
                  <SpecimenTable
                    label={`Invoice row, ${specimen.label.toLowerCase()}`}
                    isSelectable={isSelectable}
                    selected={specimen.selected}
                    peeked={specimen.peeked}
                    expanded={specimen.expanded}
                    header={false}
                  >
                    <InvoiceRow
                      invoice={invoice}
                      isSelectable={isSelectable}
                      className={cn("border-b-0", specimen.className)}
                    />
                    {specimen.expanded ? (
                      <ChildRows invoice={invoice} state={state} isSelectable={isSelectable} />
                    ) : null}
                  </SpecimenTable>
                </div>
              ))}
            </div>
          </StatesSection>
          <StatesSection
            title="Narrow widths"
            description="Hidden columns drop out with their headers"
          >
            <div className="grid gap-4 overflow-x-auto pb-1">
              {narrowSpecimens.map((specimen) => (
                <div
                  key={specimen.label}
                  className={cn("flex shrink-0 flex-col gap-1.5", specimen.width)}
                >
                  <p className="text-muted-foreground text-xs">{specimen.label}</p>
                  <SpecimenTable label={`Invoices, ${specimen.label}`} isSelectable={isSelectable}>
                    <InvoiceGroupRow group={group} isSelectable={isSelectable} />
                    <InvoiceRow
                      invoice={invoice}
                      isSelectable={isSelectable}
                      className="border-b-0"
                    />
                  </SpecimenTable>
                </div>
              ))}
            </div>
          </StatesSection>
        </div>
      )
    }
  }
}

function ChildRows({
  invoice,
  state,
  isSelectable,
  anchor,
}: {
  invoice: SampleInvoice
  state: RowState
  isSelectable: boolean
  anchor?: number
}) {
  if (state === "partial") {
    return <LinesErrorRow invoice={invoice} isSelectable={isSelectable} anchor={anchor} />
  }
  const line = sampleInvoiceLines.find((candidate) => candidate.invoiceId === invoice.id)
  if (line === undefined) {
    throw new Error("The table drawings need a line on their invoice.")
  }
  return <LineRow line={line} isSelectable={isSelectable} anchor={anchor} />
}

/** The table drawn as its constellation: the table at rest with its parts around it. */
export function TableConstellation({ state }: { state: FixtureState }): React.ReactElement {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null)
  const drawing = tableDrawing(state)
  return (
    <Constellation
      key={state}
      label="Table constellation"
      stage={stage}
      onStageChange={setStage}
      parts={drawing.parts.map(clipSpecimen)}
      groups={drawing.groups}
      centre={drawing.centre}
    />
  )
}

function tableDrawing(state: FixtureState): Drawing {
  switch (state) {
    case "error":
      return {
        parts: [
          {
            n: 1,
            name: "Error message",
            depth: 0,
            note: "Replaces the table and peek; says what failed and offers Retry",
            specimen: (
              <div className={drawingWidth}>
                <TableLockup state="error" />
              </div>
            ),
          },
        ],
        groups: [],
        centre: (
          <div data-anchor={1} className={drawingWidth}>
            <TableLockup state="error" />
          </div>
        ),
      }
    case "loading":
      return loadingDrawing()
    case "loaded":
    case "partial":
    case "no-permission":
      return rowDrawing(state)
  }
}

function loadingDrawing(): Drawing {
  const table = (anchors: boolean) => (
    <div data-anchor={anchors ? 1 : undefined} className={cn(tableSurface, drawingWidth)}>
      <Table aria-busy="true">
        <TableCaption className="sr-only">Invoices, loading</TableCaption>
        <TableHeader data-anchor={anchors ? 2 : undefined}>
          <InvoiceHeaderRow isSelectable={true} />
        </TableHeader>
        <TableBody data-anchor={anchors ? 3 : undefined}>
          <LoadingGroupRow />
          <LoadingInvoiceRow />
        </TableBody>
      </Table>
    </div>
  )
  return {
    parts: [
      {
        n: 1,
        name: "Table",
        depth: 0,
        note: "TableHeader, then a loading group row and its loading rows per status",
        specimen: table(false),
      },
      {
        n: 2,
        name: "TableHeader",
        depth: 1,
        note: "Column names; sorting is off until the invoices load",
        specimen: (
          <div className={cn(tableSurface, drawingWidth)}>
            <Table>
              <TableCaption className="sr-only">Invoices header</TableCaption>
              <TableHeader>
                <InvoiceHeaderRow isSelectable={true} />
              </TableHeader>
            </Table>
          </div>
        ),
      },
      {
        n: 3,
        name: "TableRowLoading",
        depth: 1,
        note: "A 36px group bar, then 44px rows with a bar in each column",
        specimen: (
          <div className={cn(tableSurface, drawingWidth)}>
            <Table>
              <TableCaption className="sr-only">Loading rows</TableCaption>
              <TableBody>
                <LoadingGroupRow />
                <LoadingInvoiceRow />
              </TableBody>
            </Table>
          </div>
        ),
      },
    ],
    groups: [
      {
        title: "Order",
        rank: null,
        summary: "Column headers name each reading before any value arrives",
        reveal: "always",
        links: [{ part: 2, anchor: 2 }],
      },
      {
        title: "Placeholder",
        rank: null,
        summary: "Bars hold each column, so rows do not shift when the values arrive",
        reveal: "always",
        links: [{ part: 3, anchor: 3 }],
      },
    ],
    centre: table(true),
  }
}

type PartKey =
  | "table"
  | "head"
  | "group"
  | "groupToggle"
  | "groupSelect"
  | "groupName"
  | "groupSum"
  | "invoice"
  | "rowSelect"
  | "expand"
  | "link"
  | "contact"
  | "reads"
  | "line"
  | "footer"
  | "peek"
  | "bar"
  | "menu"

type PartSpec = Omit<ConstellationPart, "n"> & { key: PartKey }

const selectionKeys: ReadonlySet<PartKey> = new Set(["groupSelect", "rowSelect", "bar", "menu"])

function partSpecs(state: RowState): ReadonlyArray<PartSpec> {
  const { group, invoice } = drawingSubject
  const isSelectable = state !== "no-permission"
  const lineCount = linesOf(invoice).length
  const specs: ReadonlyArray<PartSpec> = [
    {
      key: "table",
      name: "Table",
      depth: 0,
      note: "Treegrid with one tab stop: TableHeader, then a TableGroupRow per status with its rows",
      specimen: <DrawnTable state={state} />,
    },
    {
      key: "head",
      name: "TableHead",
      depth: 1,
      note: "A column header; its sort button shows the arrow on the sorted column, and on hover or focus",
      specimen: (
        <SpecimenTable label="Header row" isSelectable={isSelectable} className={drawingWidth}>
          {null}
        </SpecimenTable>
      ),
    },
    {
      key: "group",
      name: "TableGroupRow",
      depth: 1,
      note: "36px high; aria-level 1; keeps its count and sums when collapsed",
      specimen: (
        <SpecimenTable
          label="Group row"
          isSelectable={isSelectable}
          header={false}
          className={drawingWidth}
        >
          <InvoiceGroupRow group={group} isSelectable={isSelectable} className="border-b-0" />
        </SpecimenTable>
      ),
    },
    {
      key: "groupToggle",
      name: "TableRowExpand",
      depth: 2,
      note: "The group's chevron; Enter, Space, ← and → collapse and expand it too",
      specimen: (
        <ControlSpecimen label="Group chevron" row="group">
          <TableRowExpand />
        </ControlSpecimen>
      ),
    },
    {
      key: "groupSelect",
      name: "TableRowSelect",
      depth: 2,
      note: "Selects every invoice in the group; mixed while only some are",
      specimen: (
        <ControlSpecimen label="Group checkbox" row="group">
          <TableRowSelect />
        </ControlSpecimen>
      ),
    },
    {
      key: "groupName",
      name: "TableHead",
      depth: 2,
      note: "The row header: the status, then the invoice count",
      specimen: (
        <span className="flex items-baseline gap-2 text-sm">
          <span className="font-medium">{statusLabel[group.status]}</span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {group.invoices.length}
          </span>
        </span>
      ),
    },
    {
      key: "groupSum",
      name: "TableCell",
      depth: 2,
      note: "The group's amount total, right-aligned under Amount",
      specimen: <span className="text-sm tabular-nums">{formatAmount(groupSum(group))}</span>,
    },
    {
      key: "invoice",
      name: "TableRow",
      depth: 1,
      note: "44px high; aria-level 2; the focus target; a click anywhere opens the invoice page",
      specimen: (
        <SpecimenTable
          label="Invoice row"
          isSelectable={isSelectable}
          selected={isSelectable}
          header={false}
          className={drawingWidth}
        >
          <InvoiceRow
            invoice={invoice}
            isSelectable={isSelectable}
            className="border-b-0 bg-foreground/7 [&_[data-slot=table-row-link]]:underline"
          />
        </SpecimenTable>
      ),
    },
    {
      key: "rowSelect",
      name: "TableRowSelect",
      depth: 2,
      note: "24×24, 44×44 on a coarse pointer; drawn on hover, focus or selection; X or Shift+Space",
      specimen: (
        <ControlSpecimen label="Invoice checkbox" row="invoice">
          <TableRowSelect />
        </ControlSpecimen>
      ),
    },
    {
      key: "expand",
      name: "TableRowExpand",
      depth: 2,
      note: `Shows or hides the ${lineCount} lines; drawn only on an invoice with lines`,
      specimen: (
        <ControlSpecimen label="Invoice chevron" row="invoice">
          <TableRowExpand />
        </ControlSpecimen>
      ),
    },
    {
      key: "link",
      name: "TableRowLink",
      depth: 2,
      note: "The customer, in a link that covers the row; TableCellDetail adds Due below 640px",
      specimen: <span className="font-medium text-sm">{invoice.customer}</span>,
    },
    {
      key: "contact",
      name: "PreviewCard",
      depth: 3,
      note: "Hover card: the billing contact",
      specimen: (
        <CardSpecimen>
          {(container) => (
            <SpecimenTable
              label="Invoice with its contact card"
              isSelectable={isSelectable}
              header={false}
              className={drawingWidth}
            >
              <InvoiceRow
                invoice={invoice}
                isSelectable={isSelectable}
                cardOpen={true}
                cardContainer={container}
                className="border-b-0"
              />
            </SpecimenTable>
          )}
        </CardSpecimen>
      ),
    },
    {
      key: "reads",
      name: "TableCell",
      depth: 2,
      note: "Lines, Amount and Paid % right-aligned in tabular figures; Due says Overdue in medium weight",
      specimen: (
        <span className="flex gap-4 text-sm tabular-nums">
          <span>{lineCount}</span>
          <span>{formatAmount(invoice.amount)}</span>
          <span>{formatPaid(invoice.paid)}</span>
          <DueText invoice={invoice} />
        </span>
      ),
    },
    {
      key: "line",
      name: "TableRow",
      depth: 1,
      note:
        state === "partial"
          ? "Level 3, in place of the lines when they fail: says what failed and offers Retry lines"
          : "Level 3, 36px high: the line's description under the customer and its amount; no checkbox",
      specimen: (
        <SpecimenTable
          label="Line row"
          isSelectable={isSelectable}
          expanded
          header={false}
          className={drawingWidth}
        >
          <ChildRows invoice={invoice} state={state} isSelectable={isSelectable} />
        </SpecimenTable>
      ),
    },
    {
      key: "footer",
      name: "Footer",
      depth: 1,
      note:
        state === "no-permission"
          ? "Counts the invoices, names the sort, and names the Billing admin role and who grants it"
          : "Counts the invoices, names the sort, and lists the keys",
      specimen: (
        <div className={drawingWidth}>
          <InvoicesFooter state={state} sort={drawingSort} isSelectable={isSelectable} />
        </div>
      ),
    },
    {
      key: "peek",
      name: "Peek",
      depth: 0,
      note: "Beside the table at lg and wider; under the peeked row below lg",
      specimen: (
        <div className="w-64 rounded-xl border bg-card p-4 text-card-foreground text-sm">
          <PeekContent invoice={invoice} onOpen={handleIgnore} onClose={handleIgnore} />
        </div>
      ),
    },
    {
      key: "bar",
      name: "Selection bar",
      depth: 0,
      note: "Fixed to the bottom while any invoice is selected; Esc clears",
      specimen: (
        <SelectionBarBody
          count={2}
          isWide
          menu={<SelectionMenuButtonDrawing />}
          onClear={handleIgnore}
        />
      ),
    },
    {
      key: "menu",
      name: "Selection menu",
      depth: 1,
      note: "Base UI Menu: arrow keys, typeahead, Esc returns focus. Void last after a divider, and asks to confirm",
      specimen: <SelectionMenuDrawing />,
    },
  ]
  return specs.filter((spec) => isSelectable || !selectionKeys.has(spec.key))
}

type Anchors = {
  table?: number
  column?: number
  group?: GroupAnchors
  invoice?: InvoiceAnchors
  footer?: number
}

/** One real row control in a one-cell row: the group's row is expanded with one of its invoices selected, the invoice's row collapsed and selected. */
function ControlSpecimen({
  label,
  row,
  children,
}: {
  label: string
  row: "group" | "invoice"
  children: React.ReactNode
}) {
  const { group, invoice } = drawingSubject
  const cell = <TableCell className={controlCell}>{children}</TableCell>
  return (
    <SpecimenTable
      label={label}
      isSelectable={true}
      selected={true}
      header={false}
      className="w-24"
    >
      {row === "group" ? (
        <TableGroupRow
          value={groupValue(group.status)}
          values={group.invoices.map((each) => each.id)}
          className="border-b-0"
        >
          {cell}
        </TableGroupRow>
      ) : (
        <TableRow value={invoice.id} className="border-b-0">
          {cell}
        </TableRow>
      )}
    </SpecimenTable>
  )
}

/** The table at rest: the header, one group and one collapsed invoice, then the footer. */
function DrawnTable({ state, anchors }: { state: RowState; anchors?: Anchors }) {
  const { group, invoice } = drawingSubject
  const isSelectable = state !== "no-permission"
  return (
    <div data-anchor={anchors?.table} className={cn(tableSurface, drawingWidth)}>
      <Table
        sort={drawingSort}
        onSortChange={handleIgnore}
        expandedValues={[groupValue(group.status)]}
        onExpandedValuesChange={handleIgnore}
        selectedValues={isSelectable ? [] : undefined}
        onSelectedValuesChange={isSelectable ? handleIgnore : undefined}
        peekValue={null}
        onPeekValueChange={handleIgnore}
      >
        <TableCaption className="sr-only">Invoices</TableCaption>
        <TableHeader>
          <InvoiceHeaderRow isSelectable={isSelectable} anchors={{ column: anchors?.column }} />
        </TableHeader>
        <TableBody>
          <InvoiceGroupRow group={group} isSelectable={isSelectable} anchors={anchors?.group} />
          <InvoiceRow
            invoice={invoice}
            isSelectable={isSelectable}
            anchors={anchors?.invoice}
            className="border-b-0"
          />
        </TableBody>
      </Table>
      <InvoicesFooter
        state={state}
        sort={drawingSort}
        isSelectable={isSelectable}
        anchor={anchors?.footer}
      />
    </div>
  )
}

function rowDrawing(state: RowState): Drawing {
  const specs = partSpecs(state)
  const numbers = new Map(specs.map((spec, index) => [spec.key, index + 1]))
  function n(key: PartKey): number {
    const value = numbers.get(key)
    if (value === undefined) {
      throw new Error(`The drawing has no ${key} part in the ${state} state.`)
    }
    return value
  }
  const has = (key: PartKey) => numbers.has(key)
  const parts: ReadonlyArray<ConstellationPart> = specs.map(({ key: _key, ...spec }, index) => ({
    ...spec,
    n: index + 1,
  }))

  const anchors: Anchors = {
    table: n("table"),
    column: n("head"),
    group: {
      row: n("group"),
      select: has("groupSelect") ? n("groupSelect") : undefined,
      toggle: n("groupToggle"),
      name: n("groupName"),
      sum: n("groupSum"),
    },
    invoice: {
      row: n("invoice"),
      select: has("rowSelect") ? n("rowSelect") : undefined,
      expand: n("expand"),
      link: n("link"),
      reads: n("reads"),
    },
    footer: n("footer"),
  }

  const actLinks = has("rowSelect")
    ? [
        { part: n("rowSelect"), anchor: n("rowSelect") },
        { part: n("groupSelect"), anchor: n("groupSelect") },
        { part: n("bar"), anchor: n("rowSelect") },
        { part: n("menu"), anchor: n("rowSelect") },
      ]
    : []

  const groups: ReadonlyArray<ConstellationGroup> = [
    {
      title: "Identify",
      rank: 1,
      summary: "What each row is: the status of a group; the invoice's customer",
      reveal: "always",
      links: [
        { part: n("groupName"), anchor: n("groupName") },
        { part: n("link"), anchor: n("link") },
      ],
    },
    {
      title: "Read",
      rank: 2,
      summary:
        "What the caller compares down a column: amount, paid and due, and each group's total",
      reveal: "always",
      links: [
        { part: n("reads"), anchor: n("reads") },
        { part: n("groupSum"), anchor: n("groupSum") },
      ],
    },
    {
      title: "Order",
      rank: null,
      summary: "Column headers name each reading and sort it; the footer counts the invoices",
      reveal: "always",
      links: [
        { part: n("head"), anchor: n("head") },
        { part: n("footer"), anchor: n("footer") },
      ],
    },
    {
      title: "Explain",
      rank: 3,
      summary:
        state === "partial"
          ? "An invoice's lines, which say they failed and offer Retry"
          : "An invoice's lines, collapsed until asked for; groups collapse to their header",
      reveal: "revealed",
      gesture: "→ or click the chevron",
      links: [
        { part: n("line"), anchor: n("expand") },
        { part: n("expand"), anchor: n("expand") },
        { part: n("groupToggle"), anchor: n("groupToggle") },
      ],
    },
    {
      title: "Enrich",
      rank: 4,
      summary: "The customer's billing contact",
      reveal: "revealed",
      gesture: "Hover 300ms",
      links: [{ part: n("contact"), anchor: n("link") }],
    },
    {
      title: "Elsewhere",
      rank: 5,
      summary: "The row opens the invoice page; peek previews it without leaving the table",
      reveal: "revealed",
      gesture: "Enter or click; Space peeks",
      links: [
        { part: n("invoice"), anchor: n("invoice") },
        { part: n("peek"), anchor: n("invoice") },
      ],
    },
    ...(actLinks.length > 0
      ? [
          {
            title: "Act",
            rank: null,
            summary: "Selection: the checkboxes, and the bar that acts on every selected invoice",
            reveal: "revealed" as const,
            gesture: "Hover, focus, X or Shift+Space",
            links: actLinks,
          },
        ]
      : []),
  ]

  return { parts, groups, centre: <DrawnTable state={state} anchors={anchors} /> }
}
