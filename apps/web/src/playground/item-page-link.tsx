import { Link } from "@tanstack/react-router"
import type * as React from "react"
import type { RegistryItem } from "./registry-items.ts"

type LinkProps = { className?: string; children?: React.ReactNode }

export function ItemPageLink({
  item,
  className,
  children,
}: {
  item: RegistryItem
} & LinkProps): React.ReactElement {
  const props = { className, children }
  if (item.type === "registry:theme") {
    return <Link to="/playground/tokens" {...props} />
  }
  if (item.type === "registry:lib") {
    return <Link to="/playground/lib/$item" params={{ item: item.name }} {...props} />
  }
  return (
    <Link to="/playground/components/$component" params={{ component: item.name }} {...props} />
  )
}
