import * as React from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowLink,
  TableRowSelect,
  type TableSort,
} from "@/components/table.tsx"

const invoices = [
  { id: "INV-2041", customer: "Harbour Print Co.", amount: 12_840.5 },
  { id: "INV-2042", customer: "Northside Logistics", amount: 3_215 },
  { id: "INV-2043", customer: "Alder & Finch", amount: 7_402.25 },
] as const

const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" })

export function TableSortable(): React.ReactElement {
  const [sort, setSort] = React.useState<TableSort>({ column: "amount", direction: "descending" })
  const sign = sort.direction === "ascending" ? 1 : -1
  const rows = [...invoices].sort((a, b) =>
    sort.column === "customer"
      ? sign * a.customer.localeCompare(b.customer)
      : sign * (a.amount - b.amount)
  )

  return (
    <div className="w-full max-w-lg border bg-card text-card-foreground">
      <Table sort={sort} onSortChange={setSort} defaultSelectedValues={[]}>
        <TableCaption className="sr-only">Invoices</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-0 px-1 first:pl-2">
              <span className="sr-only">Selected</span>
            </TableHead>
            <TableHead column="customer">Customer</TableHead>
            <TableHead column="amount" align="end" className="pr-3">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((invoice) => (
            <TableRow key={invoice.id} value={invoice.id} className="last:border-b-0">
              <TableCell className="w-0 px-1 first:pl-2">
                <TableRowSelect />
              </TableCell>
              <TableHead>
                <TableRowLink href={`#${invoice.id}`}>{invoice.customer}</TableRowLink>
              </TableHead>
              <TableCell align="end" className="pr-3">
                {aud.format(invoice.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
