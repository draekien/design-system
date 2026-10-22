import type * as React from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableColumn,
  TableColumnGroup,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table.tsx"

const lines = [
  { id: "LN-1", description: "Brand workshop", hours: 6, amount: "$1,800.00" },
  { id: "LN-2", description: "Logo refinements", hours: 4, amount: "$1,200.00" },
  { id: "LN-3", description: "Print proofs", hours: 2, amount: "$600.00" },
] as const

export function TableTotals(): React.ReactElement {
  return (
    <div className="w-full max-w-lg">
      <Table>
        <TableCaption>INV-2041 lines</TableCaption>
        <TableColumnGroup>
          <TableColumn />
          <TableColumn span={2} className="w-24" />
        </TableColumnGroup>
        <TableHeader>
          <TableRow>
            <TableHead className="w-full">Description</TableHead>
            <TableHead align="end">Hours</TableHead>
            <TableHead align="end">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => (
            <TableRow key={line.id} className="h-9">
              <TableHead>{line.description}</TableHead>
              <TableCell align="end">{line.hours}</TableCell>
              <TableCell align="end">{line.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="h-9">
            <TableHead>Total</TableHead>
            <TableCell align="end">12</TableCell>
            <TableCell align="end">$3,600.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
