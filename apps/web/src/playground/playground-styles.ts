import { cn } from "cn"

export const focusRing =
  "outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"

export const segmentItem = cn(
  "inline-flex min-h-7 items-center justify-center gap-1.5 rounded-md px-2.5 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground aria-[current=true]:bg-background aria-[current=true]:text-foreground aria-[current=true]:shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_var(--border)] aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_var(--border)]",
  focusRing
)
