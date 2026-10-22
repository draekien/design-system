import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableColumn,
  TableColumnGroup,
  TableFooter,
  TableGroupRow,
  TableHead,
  TableHeader,
  TableRow,
  TableRowExpand,
  TableRowLink,
  TableRowLoading,
  TableRowSelect,
  type TableSort,
} from "@/components/table.tsx"

const invoices = [
  { id: "INV-104", customer: "Acme Pty Ltd", amount: "$4,200.00", lines: ["Design", "Build"] },
  { id: "INV-105", customer: "Birch & Co", amount: "$1,300.00", lines: [] },
]

function InvoiceTable({
  onOpen = vi.fn(),
  onPeekValueChange,
  onSelectedValuesChange,
  onSortChange,
}: {
  onOpen?: (id: string) => void
  onPeekValueChange?: (value: string | null) => void
  onSelectedValuesChange?: (values: ReadonlyArray<string>) => void
  onSortChange?: (sort: TableSort) => void
}) {
  const [expandedValues, setExpandedValues] = React.useState<ReadonlyArray<string>>(["sent"])
  return (
    <Table
      defaultSort={{ column: "amount", direction: "descending" }}
      onSortChange={onSortChange}
      expandedValues={expandedValues}
      onExpandedValuesChange={setExpandedValues}
      onSelectedValuesChange={onSelectedValuesChange}
      onPeekValueChange={onPeekValueChange}
    >
      <TableCaption>Invoices</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>
            <span className="sr-only">Select</span>
          </TableHead>
          <TableHead column="customer">Customer</TableHead>
          <TableHead column="amount" align="end">
            Amount
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableGroupRow value="sent" values={invoices.map((invoice) => invoice.id)}>
          <TableCell>
            <TableRowSelect />
          </TableCell>
          <TableHead>
            <TableRowExpand />
            Sent
          </TableHead>
          <TableCell align="end">$5,500.00</TableCell>
        </TableGroupRow>
        {expandedValues.includes("sent")
          ? invoices.map((invoice) => (
              <React.Fragment key={invoice.id}>
                <TableRow value={invoice.id} level={2}>
                  <TableCell>
                    <TableRowSelect />
                  </TableCell>
                  <TableHead>
                    {invoice.lines.length > 0 ? <TableRowExpand /> : null}
                    <TableRowLink
                      href={`/invoices/${invoice.id}`}
                      onClick={(event) => {
                        event.preventDefault()
                        onOpen(invoice.id)
                      }}
                    >
                      {invoice.customer}
                    </TableRowLink>
                  </TableHead>
                  <TableCell align="end">{invoice.amount}</TableCell>
                </TableRow>
                {expandedValues.includes(invoice.id)
                  ? invoice.lines.map((line) => (
                      <TableRow key={line} value={`${invoice.id}:${line}`} level={3}>
                        <TableCell />
                        <TableHead>{line}</TableHead>
                        <TableCell align="end" />
                      </TableRow>
                    ))
                  : null}
              </React.Fragment>
            ))
          : null}
      </TableBody>
    </Table>
  )
}

function row(name: string) {
  return screen.getByRole("row", { name: new RegExp(name) })
}

describe("Table", () => {
  it("renders a static table with every table element when it sets no state", () => {
    render(
      <Table>
        <TableCaption>Plans</TableCaption>
        <TableColumnGroup>
          <TableColumn span={2} />
        </TableColumnGroup>
        <TableHeader>
          <TableRow>
            <TableHead>Plan</TableHead>
            <TableHead align="end">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableCell align="end">$20</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableHead>Total</TableHead>
            <TableCell align="end">$20</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )

    const table = screen.getByRole("table", { name: "Plans" })
    expect(screen.queryByRole("treegrid")).toBeNull()
    expect(screen.getByRole("columnheader", { name: "Price" }).getAttribute("scope")).toBe("col")
    expect(screen.getByRole("rowheader", { name: "Team" }).getAttribute("scope")).toBe("row")
    expect(screen.getByRole("rowheader", { name: "Total" }).closest("tfoot")).not.toBeNull()
    expect(
      within(table)
        .getAllByRole("row")
        .every((tr) => tr.tabIndex === -1)
    ).toBe(true)
  })

  it("becomes a treegrid named by its caption with one tab stop on its rows", async () => {
    const user = userEvent.setup()
    render(<InvoiceTable />)

    expect(screen.getByRole("treegrid", { name: "Invoices" })).toBeDefined()
    await user.tab()
    expect(document.activeElement).toBe(row("Sent"))
    expect(row("Sent").getAttribute("aria-level")).toBe("1")
    expect(row("Acme").getAttribute("aria-level")).toBe("2")
    await user.keyboard("{ArrowDown}")
    expect(document.activeElement).toBe(row("Acme"))
    expect(row("Sent").tabIndex).toBe(-1)
    expect(row("Acme").tabIndex).toBe(0)
  })

  it("expands with → and moves into the children, and collapses with ← then moves to the parent", async () => {
    const user = userEvent.setup()
    render(<InvoiceTable />)

    await user.tab()
    await user.keyboard("{ArrowDown}")
    expect(row("Acme").getAttribute("aria-expanded")).toBe("false")
    expect(row("Birch").hasAttribute("aria-expanded")).toBe(false)
    await user.keyboard("{ArrowRight}")
    expect(row("Acme").getAttribute("aria-expanded")).toBe("true")
    await user.keyboard("{ArrowRight}")
    expect(document.activeElement).toBe(row("Design"))
    await user.keyboard("{ArrowLeft}")
    expect(document.activeElement).toBe(row("Acme"))
    await user.keyboard("{ArrowLeft}")
    expect(screen.queryByRole("row", { name: /Design/ })).toBeNull()
    await user.keyboard("{ArrowLeft}")
    expect(document.activeElement).toBe(row("Sent"))
    await user.keyboard("{Enter}")
    expect(screen.queryByRole("row", { name: /Acme/ })).toBeNull()
  })

  it("opens the row's link with Enter, and its parent's link from a child row", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(<InvoiceTable onOpen={onOpen} />)

    await user.tab()
    await user.keyboard("{ArrowDown}{Enter}")
    expect(onOpen).toHaveBeenLastCalledWith("INV-104")
    await user.keyboard("{ArrowRight}{ArrowDown}{Enter}")
    expect(onOpen).toHaveBeenCalledTimes(2)
    expect(onOpen).toHaveBeenLastCalledWith("INV-104")
  })

  it("opens the row's link from a click anywhere on the row except its checkbox", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(<InvoiceTable onOpen={onOpen} />)

    await user.click(within(row("Acme")).getByText("$4,200.00"))
    expect(onOpen).toHaveBeenLastCalledWith("INV-104")
    await user.click(within(row("Acme")).getByRole("checkbox"))
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it("peeks with Space, follows focus while peek is open, and closes peek before clearing selection on Esc", async () => {
    const user = userEvent.setup()
    const onPeekValueChange = vi.fn()
    const onSelectedValuesChange = vi.fn()
    render(
      <InvoiceTable
        onPeekValueChange={onPeekValueChange}
        onSelectedValuesChange={onSelectedValuesChange}
      />
    )

    await user.tab()
    await user.keyboard("{ArrowDown} ")
    expect(onPeekValueChange).toHaveBeenLastCalledWith("INV-104")
    await user.keyboard("{ArrowDown}")
    expect(onPeekValueChange).toHaveBeenLastCalledWith("INV-105")
    await user.keyboard("x")
    expect(onSelectedValuesChange).toHaveBeenLastCalledWith(["INV-105"])
    await user.keyboard("{Escape}")
    expect(onPeekValueChange).toHaveBeenLastCalledWith(null)
    await user.keyboard("{Escape}")
    expect(onSelectedValuesChange).toHaveBeenLastCalledWith([])
  })

  it("selects a row with X or Shift+Space, every row in a group from its header, and never a row without a checkbox", async () => {
    const user = userEvent.setup()
    const onSelectedValuesChange = vi.fn()
    render(<InvoiceTable onSelectedValuesChange={onSelectedValuesChange} />)

    expect(screen.getByRole("treegrid").getAttribute("aria-multiselectable")).toBe("true")
    expect(row("Acme").getAttribute("aria-selected")).toBe("false")
    await user.tab()
    await user.keyboard("{ArrowDown}x")
    expect(row("Acme").getAttribute("aria-selected")).toBe("true")
    expect(within(row("Sent")).getByRole("checkbox").getAttribute("aria-checked")).toBe("mixed")
    await user.keyboard("{ArrowUp}{Shift>} {/Shift}")
    expect(onSelectedValuesChange).toHaveBeenLastCalledWith(["INV-104", "INV-105"])
    await user.keyboard("{ArrowDown}{ArrowRight}{ArrowDown}x")
    expect(onSelectedValuesChange).toHaveBeenCalledTimes(2)
    expect(row("Design").hasAttribute("aria-selected")).toBe(false)
  })

  it("sorts from a header button, and moves between the rows and the headers by keyboard", async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    render(<InvoiceTable onSortChange={onSortChange} />)

    const amount = screen.getByRole("columnheader", { name: "Amount" })
    expect(amount.getAttribute("aria-sort")).toBe("descending")
    expect(screen.getByRole("columnheader", { name: "Customer" }).hasAttribute("aria-sort")).toBe(
      false
    )
    await user.tab()
    await user.keyboard("{ArrowUp}")
    expect(document.activeElement).toBe(within(amount).getByRole("button"))
    await user.keyboard("{Enter}")
    expect(onSortChange).toHaveBeenLastCalledWith({ column: "amount", direction: "ascending" })
    expect(amount.getAttribute("aria-sort")).toBe("ascending")
    await user.keyboard("{ArrowLeft}")
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Customer" }))
    await user.keyboard("{ArrowDown}")
    expect(document.activeElement).toBe(row("Sent"))
  })

  it("makes each sortable header a tab stop while the body has no row to focus", async () => {
    const user = userEvent.setup()
    render(
      <Table defaultSort={{ column: "amount", direction: "ascending" }}>
        <TableCaption>Invoices</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead column="customer">Customer</TableHead>
            <TableHead column="amount">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>
    )

    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Customer" }))
    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Amount" }))
  })

  it("moves the tab stop to the headers when every row is removed, and ignores Space without peek", async () => {
    const user = userEvent.setup()
    function Invoices({ rows }: { rows: ReadonlyArray<string> }) {
      return (
        <Table defaultSort={{ column: "customer", direction: "ascending" }}>
          <TableCaption>Invoices</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead column="customer">Customer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((customer) => (
              <TableRow key={customer} value={customer}>
                <TableHead>{customer}</TableHead>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }
    const { rerender } = render(<Invoices rows={["Acme"]} />)

    await user.tab()
    await user.keyboard(" ")
    expect(row("Acme").hasAttribute("data-peeked")).toBe(false)
    rerender(<Invoices rows={[]} />)
    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Customer" }))
  })

  it("hides a loading row from screen readers and draws no values in it", () => {
    render(
      <Table defaultSelectedValues={[]}>
        <TableBody>
          <TableRowLoading>
            <TableCell>
              <TableRowSelect />
            </TableCell>
            <TableHead>
              <TableRowLink href="/invoices">Customer</TableRowLink>
            </TableHead>
            <TableCell align="end">Amount</TableCell>
          </TableRowLoading>
        </TableBody>
      </Table>
    )

    expect(screen.queryByRole("row")).toBeNull()
    expect(screen.queryByText("Customer")).toBeNull()
    expect(screen.queryByText("Amount")).toBeNull()
  })
})
