import * as React from "react"
import { Status, StatusMedia, StatusName } from "@/components/status.tsx"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableGroupRow,
  TableHead,
  TableHeader,
  TableRow,
  TableRowExpand,
  TableRowLink,
  TableRowSelect,
} from "@/components/table.tsx"

const groups = [
  {
    status: "Sent",
    fill: "half",
    total: "$16,055.50",
    invoices: [
      { id: "INV-2041", customer: "Harbour Print Co.", amount: "$12,840.50" },
      { id: "INV-2042", customer: "Northside Logistics", amount: "$3,215.00" },
    ],
  },
  {
    status: "Paid",
    fill: "full",
    total: "$7,402.25",
    invoices: [{ id: "INV-2043", customer: "Alder & Finch", amount: "$7,402.25" }],
  },
] as const

export function TableGroups(): React.ReactElement {
  const [expanded, setExpanded] = React.useState<ReadonlyArray<string>>(["Sent", "Paid"])

  return (
    <div className="w-full max-w-lg border bg-card text-card-foreground">
      <Table
        expandedValues={expanded}
        onExpandedValuesChange={setExpanded}
        defaultSelectedValues={["INV-2042"]}
      >
        <TableCaption className="sr-only">Invoices by status</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-0 px-1 first:pl-2">
              <span className="sr-only">Selected</span>
            </TableHead>
            <TableHead className="w-0 px-1">
              <span className="sr-only">Group</span>
            </TableHead>
            <TableHead>Customer</TableHead>
            <TableHead align="end" className="pr-3">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <React.Fragment key={group.status}>
              <TableGroupRow
                value={group.status}
                values={group.invoices.map((invoice) => invoice.id)}
              >
                <TableCell className="w-0 px-1 first:pl-2">
                  <TableRowSelect />
                </TableCell>
                <TableCell className="w-0 px-1">
                  <TableRowExpand />
                </TableCell>
                <TableHead className="font-medium">
                  <Status>
                    <StatusMedia fill={group.fill} />
                    <StatusName>{group.status}</StatusName>
                  </Status>
                </TableHead>
                <TableCell align="end" className="pr-3">
                  {group.total}
                </TableCell>
              </TableGroupRow>
              {expanded.includes(group.status)
                ? group.invoices.map((invoice) => (
                    <TableRow key={invoice.id} value={invoice.id} level={2}>
                      <TableCell className="w-0 px-1 first:pl-2">
                        <TableRowSelect />
                      </TableCell>
                      <TableCell className="w-0 px-1" />
                      <TableHead>
                        <TableRowLink href={`#${invoice.id}`}>{invoice.customer}</TableRowLink>
                      </TableHead>
                      <TableCell align="end" className="pr-3">
                        {invoice.amount}
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
