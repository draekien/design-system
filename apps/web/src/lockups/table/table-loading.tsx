import type * as React from "react"
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
  TableRowLoading,
} from "@/components/table.tsx"

const controlCell = "w-0 px-1 first:pl-2"

export function TableLoading(): React.ReactElement {
  return (
    <div className="w-full overflow-hidden rounded-card border bg-card text-card-foreground">
      <Table aria-busy="true">
        <TableCaption className="sr-only">Invoices, loading</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className={controlCell}>
              <span className="sr-only">Group</span>
            </TableHead>
            <TableHead>Customer</TableHead>
            <TableHead align="end">Amount</TableHead>
            <TableHead narrow="hide" className="pr-3">
              Due
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {["first", "second", "third"].map((key) => (
            <TableRowLoading key={key}>
              <TableCell className={controlCell}>
                <TableRowExpand />
              </TableCell>
              <TableHead>
                <TableRowLink>Customer</TableRowLink>
              </TableHead>
              <TableCell align="end">Amount</TableCell>
              <TableCell narrow="hide" className="pr-3">
                Due
              </TableCell>
            </TableRowLoading>
          ))}
        </TableBody>
      </Table>
      <p role="status" className="px-3 py-2 text-muted-foreground text-xs">
        Loading invoices…
      </p>
    </div>
  )
}
