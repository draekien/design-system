export const tableSurface = "overflow-hidden rounded-card border bg-card text-card-foreground"

export const controlCell = "w-0 px-1 first:pl-2"

export function firstColumnInset(isSelectable: boolean): string {
  return isSelectable ? "pl-19 pointer-coarse:pl-29" : "pl-11 pointer-coarse:pl-16"
}
