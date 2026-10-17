import { sampleInvoiceLines } from "@workspace/fixtures/invoices.ts"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import { cn } from "cn"
import * as React from "react"
import {
  Constellation,
  type ConstellationGroup,
  type ConstellationPart,
} from "../playground/constellation.tsx"
import { clipSpecimen } from "./clip-specimen.tsx"
import {
  Chevron,
  ColumnHeader,
  ContactCard,
  DivTable,
  DueText,
  ExpandButton,
  GroupHeaderRow,
  HeadRow,
  HoverCard,
  InvoiceRow,
  LineRow,
  LinesErrorRow,
  LoadingGroupRow,
  LoadingRow,
  PeekButton,
  PeekPanel,
  SelectBox,
  SelectionBarBody,
  SelectionMenuButtonDrawing,
  SelectionMenuDrawing,
  TableFooter,
} from "./record-table.tsx"
import {
  cardSurface,
  formatAmount,
  formatPaid,
  gridClass,
  groupSum,
  handleIgnore,
  linesOf,
  type RowState,
  rowClass,
  type Sort,
  type StatusGroup,
  seatClass,
  statusGroups,
  statusLabel,
} from "./record-table-model.ts"
import { ErrorMessage } from "./wireframe-parts.tsx"

const tableWidth = "w-[36rem]"

const drawingSort: Sort = { column: "amount", direction: "descending" }

type Drawing = {
  parts: ReadonlyArray<ConstellationPart>
  groups: ReadonlyArray<ConstellationGroup>
  readonly centre: React.ReactNode
}

/** The record table drawn as its constellation: the table at rest with its parts around it. */
export function RecordTableConstellation({ state }: { state: FixtureState }): React.ReactElement {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null)
  const peekId = React.useId()
  const drawing = tableDrawing(state, peekId)
  return (
    <DivTable>
      <Constellation
        key={state}
        label="Record table constellation"
        stage={stage}
        onStageChange={setStage}
        parts={drawing.parts.map(clipSpecimen)}
        groups={drawing.groups}
        centre={drawing.centre}
      />
    </DivTable>
  )
}

function tableDrawing(state: FixtureState, peekId: string): Drawing {
  switch (state) {
    case "error":
      return errorDrawing
    case "loading":
      return loadingDrawing(peekId)
    case "loaded":
    case "partial":
    case "no-permission":
      return rowDrawing(state, peekId)
  }
}

const errorDrawing: Drawing = {
  parts: [
    {
      n: 1,
      name: "ErrorMessage",
      depth: 0,
      note: "Replaces RecordTable and PeekPanel",
      specimen: (
        <div className={tableWidth}>
          <ErrorMessage subject="The invoices" />
        </div>
      ),
    },
  ],
  groups: [],
  centre: (
    <div data-anchor={1} className={tableWidth}>
      <ErrorMessage subject="The invoices" />
    </div>
  ),
}

function loadingDrawing(peekId: string): Drawing {
  const head = (
    <HeadRow sort={drawingSort} isSortable={false} onSort={handleIgnore} isSelectable={false} />
  )
  const footer = <TableFooter state="loading" hintId={null} sort={null} isSelectable={false} />
  return {
    parts: [
      {
        n: 1,
        name: "RecordTable",
        depth: 0,
        note: "The head row, a LoadingGroupRow and its LoadingRows per status, then TableFooter; PeekPanel beside it at lg",
        specimen: (
          <div className={cn(tableWidth, "rounded-md border")}>
            <div className={gridClass}>
              {head}
              <LoadingGroupRow />
              <LoadingRow />
            </div>
            {footer}
          </div>
        ),
      },
      {
        n: 2,
        name: "HeadRow",
        depth: 1,
        note: "Column names; sorting is off until the invoices load",
        specimen: <div className={cn(tableWidth, gridClass)}>{head}</div>,
      },
      {
        n: 3,
        name: "LoadingRow",
        depth: 1,
        note: "A 36px group bar, then 44px rows with a bar in each column at the width of its values",
        specimen: (
          <div className={cn(tableWidth, gridClass)}>
            <LoadingGroupRow />
            <LoadingRow />
          </div>
        ),
      },
      {
        n: 4,
        name: "TableFooter",
        depth: 1,
        note: "States how many invoices are loading",
        specimen: <div className={tableWidth}>{footer}</div>,
      },
      {
        n: 5,
        name: "PeekPanel",
        depth: 0,
        note: "Says peek is available once the invoices load",
        specimen: (
          <PeekPanel
            id={peekId}
            invoice={null}
            state="loading"
            className="block w-64"
            onClose={handleIgnore}
          />
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
        summary: "Bars hold each column at its loaded width, so rows do not shift",
        reveal: "always",
        links: [{ part: 3, anchor: 3 }],
      },
      {
        title: "Status",
        rank: null,
        summary: "The footer counts the invoices still loading",
        reveal: "always",
        links: [{ part: 4, anchor: 4 }],
      },
      {
        title: "Elsewhere",
        rank: 5,
        summary: "Peek says it waits until the invoices load",
        reveal: "revealed",
        gesture: "Space",
        links: [{ part: 5, anchor: 3 }],
      },
    ],
    centre: (
      <div data-anchor={1} className={cn(tableWidth, "rounded-md border")}>
        <div className={gridClass}>
          <div data-anchor={2} className="col-span-full grid grid-cols-subgrid">
            {head}
          </div>
          <div data-anchor={3} className="col-span-full grid grid-cols-subgrid">
            <LoadingGroupRow />
            <LoadingRow />
          </div>
        </div>
        <div data-anchor={4}>{footer}</div>
      </div>
    ),
  }
}

type PartKey =
  | "table"
  | "head"
  | "column"
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

type Wrap = (key: PartKey, className: string, node: React.ReactNode) => React.ReactNode

const drawingSubject = firstGroupAndInvoice()

function firstGroupAndInvoice(): { group: StatusGroup; invoice: StatusGroup["invoices"][number] } {
  const group = statusGroups(drawingSort).find((candidate) => candidate.status === "sent")
  const invoice = group?.invoices.find((candidate) => linesOf(candidate).length > 0)
  if (group === undefined || invoice === undefined) {
    throw new Error("The drawing needs a sent invoice with lines in the fixtures.")
  }
  return { group, invoice }
}

const rowLayout = "col-span-full grid grid-cols-subgrid"

/** The table at rest: head row, one group header and one collapsed invoice, each part wrapped. */
function DrawnTable({
  state,
  wrap,
  footer,
}: {
  state: RowState
  wrap: Wrap
  footer: React.ReactNode
}) {
  const { group, invoice } = drawingSubject
  const isSelectable = state !== "no-permission"
  return (
    <>
      <div className={gridClass}>
        {wrap(
          "head",
          rowLayout,
          <div className={cn(rowClass, "h-9 border-b text-muted-foreground text-xs")}>
            <div className={seatClass.select} />
            <div className={seatClass.expand} />
            <div className={seatClass.invoice}>
              <ColumnHeader column="invoice" sort={drawingSort} isSortable onSort={handleIgnore} />
            </div>
            <div className={seatClass.customer}>
              <ColumnHeader column="customer" sort={drawingSort} isSortable onSort={handleIgnore} />
            </div>
            {wrap(
              "column",
              seatClass.amount,
              <ColumnHeader column="amount" sort={drawingSort} isSortable onSort={handleIgnore} />
            )}
            <div className={seatClass.paid}>
              <ColumnHeader column="paid" sort={drawingSort} isSortable onSort={handleIgnore} />
            </div>
            <div className={seatClass.due}>
              <ColumnHeader column="due" sort={drawingSort} isSortable onSort={handleIgnore} />
            </div>
          </div>
        )}
        {wrap(
          "group",
          rowLayout,
          <div className={cn(rowClass, "group/row h-9 border-b bg-muted/40")}>
            {isSelectable ? (
              wrap(
                "groupSelect",
                cn(
                  seatClass.select,
                  "outline-1 outline-muted-foreground/60 outline-dashed -outline-offset-2"
                ),
                <SelectBox
                  label="Select every sent invoice"
                  checked="none"
                  isRevealed={false}
                  onChange={handleIgnore}
                />
              )
            ) : (
              <div className={seatClass.select} />
            )}
            {wrap(
              "groupToggle",
              seatClass.expand,
              <span className="flex size-6 items-center justify-center text-muted-foreground">
                <Chevron isExpanded />
              </span>
            )}
            {wrap(
              "groupName",
              "col-span-2 col-start-3 flex min-w-0 items-baseline gap-2",
              <>
                <span className="truncate font-medium text-sm">{statusLabel[group.status]}</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {group.invoices.length}
                </span>
              </>
            )}
            {wrap(
              "groupSum",
              cn(seatClass.amount, "text-sm tabular-nums"),
              formatAmount(groupSum(group))
            )}
          </div>
        )}
        {wrap(
          "invoice",
          rowLayout,
          <div className={cn(rowClass, "group/row h-11 border-b")}>
            {isSelectable ? (
              wrap(
                "rowSelect",
                cn(
                  seatClass.select,
                  "outline-1 outline-muted-foreground/60 outline-dashed -outline-offset-2"
                ),
                <SelectBox
                  label={`Select ${invoice.id}`}
                  checked="none"
                  isRevealed={false}
                  onChange={handleIgnore}
                />
              )
            ) : (
              <div className={seatClass.select} />
            )}
            {wrap(
              "expand",
              seatClass.expand,
              <ExpandButton
                count={linesOf(invoice).length}
                isExpanded={false}
                onClick={handleIgnore}
              />
            )}
            <div
              className={cn(
                seatClass.invoice,
                "items-center text-muted-foreground text-xs tabular-nums"
              )}
            >
              {invoice.id}
            </div>
            {wrap(
              "link",
              cn(seatClass.customer, "items-center"),
              <HoverCard
                trigger={
                  <span className="block truncate font-medium text-sm">{invoice.customer}</span>
                }
              >
                <ContactCard invoice={invoice} />
              </HoverCard>
            )}
            {wrap(
              "reads",
              cn(seatClass.amount, "items-center text-sm tabular-nums"),
              formatAmount(invoice.amount)
            )}
            <div className={cn(seatClass.paid, "items-center text-sm tabular-nums")}>
              {formatPaid(invoice.paid)}
            </div>
            <div className={cn(seatClass.due, "items-center")}>
              <DueText invoice={invoice} />
            </div>
            <div className={seatClass.peek}>
              <PeekButton isPeeked={false} isRevealed={false} onClick={handleIgnore} />
            </div>
          </div>
        )}
      </div>
      {wrap("footer", "", footer)}
    </>
  )
}

const partNotes = {
  line: {
    loaded: "36px high; the line's description under the customer and its amount; no checkbox",
    partial: "Replaces the lines when they fail: says what failed and offers Retry lines",
    "no-permission":
      "36px high; the line's description under the customer and its amount; no checkbox",
  },
  footer: {
    loaded: "Counts the invoices and names the sort; key hints, or tap hints on a coarse pointer",
    partial: "Counts the invoices and names the sort; key hints",
    "no-permission": "Names the Billing admin role and who grants it",
  },
} as const

function partSpecs(
  state: RowState,
  peekId: string,
  footer: React.ReactNode
): ReadonlyArray<PartSpec> {
  const { group, invoice } = drawingSubject
  const isSelectable = state !== "no-permission"
  const line = sampleInvoiceLines.find((candidate) => candidate.invoiceId === invoice.id)
  if (line === undefined) {
    throw new Error("The drawing needs a line on its invoice.")
  }
  const specs: ReadonlyArray<PartSpec> = [
    {
      key: "table",
      name: "RecordTable",
      depth: 0,
      note: "Treegrid: HeadRow, then a GroupHeaderRow per status with its InvoiceRows; then TableFooter",
      specimen: <SpecimenTable state={state} footer={footer} />,
    },
    {
      key: "head",
      name: "HeadRow",
      depth: 1,
      note: "36px high; one ColumnHeader per column",
      specimen: (
        <div className={cn(tableWidth, gridClass)}>
          <HeadRow
            sort={drawingSort}
            isSortable
            onSort={handleIgnore}
            isSelectable={isSelectable}
          />
        </div>
      ),
    },
    {
      key: "column",
      name: "ColumnHeader",
      depth: 2,
      note: "Sort button; the arrow shows on the sorted column, and on hover or focus",
      specimen: (
        <div className="flex text-muted-foreground text-xs">
          <ColumnHeader column="amount" sort={drawingSort} isSortable onSort={handleIgnore} />
        </div>
      ),
    },
    {
      key: "group",
      name: "GroupHeaderRow",
      depth: 1,
      note: "36px high; aria-level 1; kept with its count and sum when collapsed",
      specimen: (
        <div className={cn(tableWidth, gridClass)}>
          <GroupHeaderRow
            group={group}
            isExpanded
            selection={isSelectable ? "some" : null}
            onToggle={handleIgnore}
            onToggleSelected={handleIgnore}
            look="hover"
          />
        </div>
      ),
    },
    {
      key: "groupToggle",
      name: "GroupToggle",
      depth: 2,
      note: "Chevron; a click anywhere on the header, Enter, ← or → collapses and expands",
      specimen: (
        <span className="flex size-6 items-center justify-center text-muted-foreground">
          <Chevron isExpanded />
        </span>
      ),
    },
    {
      key: "groupSelect",
      name: "GroupSelect",
      depth: 2,
      note: "Selects every invoice in the group; mixed while only some are",
      specimen: (
        <span className="group/row flex">
          <SelectBox
            label="Select every sent invoice"
            checked="some"
            isRevealed
            onChange={handleIgnore}
          />
        </span>
      ),
    },
    {
      key: "groupName",
      name: "GroupName",
      depth: 2,
      note: "The status, then the invoice count",
      specimen: (
        <span className="flex items-baseline gap-2">
          <span className="font-medium text-sm">{statusLabel[group.status]}</span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {group.invoices.length}
          </span>
        </span>
      ),
    },
    {
      key: "groupSum",
      name: "GroupSum",
      depth: 2,
      note: "The group's amount total, under the Amount column",
      specimen: <span className="text-sm tabular-nums">{formatAmount(groupSum(group))}</span>,
    },
    {
      key: "invoice",
      name: "InvoiceRow",
      depth: 1,
      note: "44px high; aria-level 2; the focus target; a click opens the invoice page",
      specimen: (
        <div className={cn(tableWidth, gridClass)}>
          <InvoiceRow
            invoice={invoice}
            peekIds={peekId}
            isExpanded={false}
            isPeeked={false}
            isSelected={isSelectable ? true : null}
            linkRef={handleIgnore}
            onToggleExpanded={handleIgnore}
            onToggleSelected={handleIgnore}
            onTogglePeek={handleIgnore}
            look="focus"
          />
        </div>
      ),
    },
    {
      key: "rowSelect",
      name: "RowSelect",
      depth: 2,
      note: "24×24, 44×44 on a coarse pointer; drawn on hover, focus or selection; X or Shift+Space",
      specimen: (
        <span className="group/row flex">
          <SelectBox
            label={`Select ${invoice.id}`}
            checked="all"
            isRevealed
            onChange={handleIgnore}
          />
        </span>
      ),
    },
    {
      key: "expand",
      name: "ExpandButton",
      depth: 2,
      note: "Chevron and line count; drawn only on an invoice with lines",
      specimen: (
        <ExpandButton count={linesOf(invoice).length} isExpanded={false} onClick={handleIgnore} />
      ),
    },
    {
      key: "link",
      name: "InvoiceLink",
      depth: 2,
      note: "The customer, inside a link that covers the row; opens ContactCard on hover",
      specimen: <span className="font-medium text-sm">{invoice.customer}</span>,
    },
    {
      key: "contact",
      name: "ContactCard",
      depth: 3,
      note: "Hover card: the billing contact",
      specimen: (
        <span className={cardSurface}>
          <ContactCard invoice={invoice} />
        </span>
      ),
    },
    {
      key: "reads",
      name: "Reads",
      depth: 2,
      note: "Amount and Paid % right-aligned in tabular figures; Due says Overdue in medium weight. Paid % hides below md; below sm Due moves under the customer",
      specimen: (
        <span className="flex gap-4 text-sm tabular-nums">
          <span>{formatAmount(invoice.amount)}</span>
          <span>{formatPaid(invoice.paid)}</span>
          <DueText invoice={invoice} />
        </span>
      ),
    },
    {
      key: "line",
      name: state === "partial" ? "LinesErrorRow" : "LineRow",
      depth: 1,
      note: partNotes.line[state],
      specimen: (
        <div className={cn(tableWidth, gridClass)}>
          {state === "partial" ? (
            <LinesErrorRow invoice={invoice} linkRef={handleIgnore} />
          ) : (
            <LineRow line={line} />
          )}
        </div>
      ),
    },
    {
      key: "footer",
      name: "TableFooter",
      depth: 1,
      note: partNotes.footer[state],
      specimen: <div className={tableWidth}>{footer}</div>,
    },
    {
      key: "peek",
      name: "PeekPanel",
      depth: 0,
      note: "Beside the table at lg and wider; under the peeked row below lg",
      specimen: (
        <PeekPanel
          id={peekId}
          invoice={invoice}
          state={state}
          className="block w-64"
          onClose={handleIgnore}
        />
      ),
    },
    {
      key: "bar",
      name: "SelectionBar",
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
      name: "SelectionMenu",
      depth: 1,
      note: "Base UI Menu: arrow keys, typeahead, Esc returns focus. Void last after a divider, and asks to confirm",
      specimen: <SelectionMenuDrawing />,
    },
  ]
  return specs.filter((spec) => isSelectable || !selectionKeys.has(spec.key))
}

function SpecimenTable({ state, footer }: { state: RowState; footer: React.ReactNode }) {
  return (
    <div className={cn(tableWidth, "rounded-md border")}>
      <DrawnTable
        state={state}
        footer={footer}
        wrap={(_key, className, node) => <div className={className}>{node}</div>}
      />
    </div>
  )
}

function rowDrawing(state: RowState, peekId: string): Drawing {
  const footer = (
    <TableFooter
      state={state}
      hintId={null}
      sort={drawingSort}
      isSelectable={state !== "no-permission"}
    />
  )
  const specs = partSpecs(state, peekId, footer)
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

  const anchorWrap: Wrap = (key, className, node) => (
    <div data-anchor={n(key)} className={className}>
      {node}
    </div>
  )

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
      summary: "What each row is: the status of a group; the invoice and its customer",
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
        { part: n("column"), anchor: n("column") },
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
      gesture: "→ or click the count",
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

  const centre = (
    <div data-anchor={n("table")} className={cn(tableWidth, "rounded-md border")}>
      <DrawnTable state={state} footer={footer} wrap={anchorWrap} />
    </div>
  )

  return { parts, groups, centre }
}
