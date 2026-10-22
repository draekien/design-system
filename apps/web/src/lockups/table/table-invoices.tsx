import * as React from "react"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"
import { Status, StatusMedia, StatusName } from "@/components/status.tsx"
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
  TableRowSelect,
  type TableSort,
} from "@/components/table.tsx"

const groups = [
  {
    status: "Draft",
    fill: "none",
    invoices: [
      {
        id: "INV-2043",
        customer: "Lumen Studio",
        contact: "Mia Chen",
        amount: 8_400,
        due: "8 Oct",
      },
    ],
  },
  {
    status: "Sent",
    fill: "half",
    invoices: [
      {
        id: "INV-2041",
        customer: "Harbour Print Co.",
        contact: "Sam Okafor",
        amount: 12_840.5,
        due: "29 Oct",
      },
      {
        id: "INV-2044",
        customer: "Alder & Finch",
        contact: "Priya Nair",
        amount: 2_150,
        due: "3 Nov",
      },
    ],
  },
] as const

const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" })

const controlCell = "w-0 px-1 first:pl-2"

export function TableInvoices(): React.ReactElement {
  const hintId = React.useId()
  const [sort, setSort] = React.useState<TableSort>({ column: "amount", direction: "descending" })
  const [expanded, setExpanded] = React.useState<ReadonlyArray<string>>(["Draft", "Sent"])
  const sign = sort.direction === "ascending" ? 1 : -1

  return (
    <div className="w-full border bg-card text-card-foreground">
      <Table
        sort={sort}
        onSortChange={setSort}
        expandedValues={expanded}
        onExpandedValuesChange={setExpanded}
        defaultSelectedValues={[]}
        aria-describedby={hintId}
      >
        <TableCaption className="sr-only">Invoices by status</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className={controlCell}>
              <span className="sr-only">Selected</span>
            </TableHead>
            <TableHead className={controlCell}>
              <span className="sr-only">Group</span>
            </TableHead>
            <TableHead column="customer">Customer</TableHead>
            <TableHead column="amount" align="end">
              Amount
            </TableHead>
            <TableHead narrow="hide" className="pr-3">
              Due
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => {
            const invoices = [...group.invoices].sort((a, b) =>
              sort.column === "customer"
                ? sign * a.customer.localeCompare(b.customer)
                : sign * (a.amount - b.amount)
            )
            return (
              <React.Fragment key={group.status}>
                <TableGroupRow value={group.status} values={invoices.map((invoice) => invoice.id)}>
                  <TableCell className={controlCell}>
                    <TableRowSelect />
                  </TableCell>
                  <TableCell className={controlCell}>
                    <TableRowExpand />
                  </TableCell>
                  <TableHead className="font-medium">
                    <Status>
                      <StatusMedia fill={group.fill} />
                      <StatusName>
                        {group.status} · {invoices.length}
                      </StatusName>
                    </Status>
                  </TableHead>
                  <TableCell align="end">
                    {aud.format(invoices.reduce((sum, invoice) => sum + invoice.amount, 0))}
                  </TableCell>
                  <TableCell narrow="hide" className="pr-3" />
                </TableGroupRow>
                {expanded.includes(group.status)
                  ? invoices.map((invoice) => (
                      <TableRow key={invoice.id} value={invoice.id} level={2}>
                        <TableCell className={controlCell}>
                          <TableRowSelect />
                        </TableCell>
                        <TableCell className={controlCell} />
                        <TableHead>
                          <TableRowLink href={`#${invoice.id}`}>
                            <PreviewCard>
                              <PreviewCardTrigger className="justify-start">
                                <span className="truncate">{invoice.customer}</span>
                              </PreviewCardTrigger>
                              <PreviewCardContent>
                                <p className="font-medium">{invoice.contact}</p>
                                <p className="text-muted-foreground">
                                  Billing contact, {invoice.customer}
                                </p>
                              </PreviewCardContent>
                            </PreviewCard>
                          </TableRowLink>
                          <TableCellDetail>Due {invoice.due}</TableCellDetail>
                        </TableHead>
                        <TableCell align="end">{aud.format(invoice.amount)}</TableCell>
                        <TableCell narrow="hide" className="pr-3">
                          {invoice.due}
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
      <p id={hintId} className="border-t px-3 py-2 text-muted-foreground text-xs">
        ↑ ↓ move between rows · → ← expand and collapse · X selects the focused row
      </p>
    </div>
  )
}
