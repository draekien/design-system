import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import { cn } from "cn"
import type * as React from "react"
import { Mark } from "../../mark.tsx"
import { focusRing } from "../../playground/playground-styles.ts"
import { componentItems } from "../../playground/registry-items.ts"

export const Route = createFileRoute("/playground")({
  component: PlaygroundLayout,
})

const navLink = cn(
  "flex min-h-8 shrink-0 items-center rounded-md px-2.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-muted data-[status=active]:font-medium data-[status=active]:text-foreground",
  focusRing
)

function PlaygroundLayout() {
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="flex flex-col border-b lg:sticky lg:top-0 lg:h-svh lg:border-r lg:border-b-0">
        <div className="flex h-14 items-center px-5">
          <Link
            to="/"
            className={cn("-m-1.5 flex items-center gap-2.5 rounded-md p-1.5", focusRing)}
          >
            <Mark className="h-3.5 w-auto text-primary" />
            <span className="font-medium text-sm tracking-tight" translate="no">
              <span aria-hidden="true" className="text-muted-foreground">
                {"{{"}
              </span>
              design-system
              <span aria-hidden="true" className="text-muted-foreground">
                {"}}"}
              </span>
            </span>
          </Link>
        </div>
        <nav
          aria-label="Playground"
          className="flex gap-x-6 overflow-x-auto px-3 pb-3 lg:flex-col lg:gap-y-6 lg:px-3 lg:pt-4"
        >
          <div className="flex shrink-0 items-center gap-1 lg:flex-col lg:items-stretch">
            <Link to="/playground" activeOptions={{ exact: true }} className={navLink}>
              Overview
            </Link>
            <Link to="/playground/rules" className={navLink}>
              Rules
            </Link>
          </div>
          <NavGroup label="Lockups">
            <Link to="/playground/record-list" className={navLink}>
              Record list
            </Link>
          </NavGroup>
          <NavGroup label="Components">
            {componentItems.map((item) => (
              <Link
                key={item.name}
                to="/playground/$component"
                params={{ component: item.name }}
                className={navLink}
              >
                {item.title}
              </Link>
            ))}
          </NavGroup>
          <NavGroup label="Experiments">
            <Link to="/playground/experiments/record-table" className={navLink}>
              Record table
            </Link>
          </NavGroup>
          <NavGroup label="Settings">
            <Link to="/playground/theme" className={navLink}>
              Canvas theme
            </Link>
          </NavGroup>
        </nav>
      </aside>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  )
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex shrink-0 items-center gap-1 lg:flex-col lg:items-stretch">
      <p className="px-2.5 font-medium text-muted-foreground text-xs lg:mb-1">{label}</p>
      {children}
    </div>
  )
}
