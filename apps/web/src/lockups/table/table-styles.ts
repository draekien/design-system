export const tableSurface = "overflow-hidden rounded-card border bg-card text-card-foreground"

export const controlCell = "w-0 px-1 first:pl-2"

export function firstColumnInset(isSelectable: boolean): string {
  return isSelectable ? "pl-19 pointer-coarse:pl-29" : "pl-11 pointer-coarse:pl-16"
}

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"

export const menuSurface =
  "flex w-48 flex-col gap-run rounded-lg border bg-background p-1 shadow-popover outline-hidden"

export const menuItem =
  "flex min-h-8 w-full cursor-default items-center rounded-floor px-2 text-left text-sm outline-hidden data-highlighted:bg-muted pointer-coarse:min-h-11"

export const menuDivider = "-mx-1 my-1 h-px bg-border"
