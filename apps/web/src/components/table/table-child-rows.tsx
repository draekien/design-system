import * as React from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowExpand,
  TableRowLink,
} from "@/components/table.tsx"

const invoices = [
  {
    id: "INV-2041",
    customer: "Harbour Print Co.",
    amount: "$3,600.00",
    lines: [
      { id: "LN-1", description: "Brand workshop", amount: "$1,800.00" },
      { id: "LN-2", description: "Logo refinements", amount: "$1,800.00" },
    ],
  },
  { id: "INV-2042", customer: "Northside Logistics", amount: "$3,215.00", lines: [] },
] as const

export function TableChildRows(): React.ReactElement {
  const [expanded, setExpanded] = React.useState<ReadonlyArray<string>>(["INV-2041"])

  return (
    <div className="w-full max-w-lg border bg-card text-card-foreground">
      <Table expandedValues={expanded} onExpandedValuesChange={setExpanded}>
        <TableCaption className="sr-only">Invoices</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-0 px-1 first:pl-2">
              <span className="sr-only">Lines</span>
            </TableHead>
            <TableHead>Customer</TableHead>
            <TableHead align="end">Lines</TableHead>
            <TableHead align="end" className="pr-3">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <React.Fragment key={invoice.id}>
              <TableRow value={invoice.id} className="last:border-b-0">
                <TableCell className="w-0 px-1 first:pl-2">
                  {invoice.lines.length > 0 ? <TableRowExpand /> : null}
                </TableCell>
                <TableHead>
                  <TableRowLink href={`#${invoice.id}`}>{invoice.customer}</TableRowLink>
                </TableHead>
                <TableCell align="end">{invoice.lines.length}</TableCell>
                <TableCell align="end" className="pr-3">
                  {invoice.amount}
                </TableCell>
              </TableRow>
              {expanded.includes(invoice.id)
                ? invoice.lines.map((line) => (
                    <TableRow key={line.id} value={line.id} level={2} className="h-9 border-dashed">
                      <TableCell className="w-0 px-1 first:pl-2" />
                      <TableHead className="text-muted-foreground">{line.description}</TableHead>
                      <TableCell />
                      <TableCell align="end" className="pr-3 text-muted-foreground">
                        {line.amount}
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
