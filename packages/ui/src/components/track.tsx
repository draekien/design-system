import { Meter } from "@base-ui/react/meter"
import { cn } from "cn"
import type * as React from "react"

/** Props for {@link Track}. */
export type TrackProps = Omit<Meter.Root.Props, "children" | "locale"> & {
  /** The locale to format the value in. Defaults to `"en"` so server and browser render the same text. */
  locale?: Intl.LocalesArgument
}

/**
 * A measurement within a known range, drawn as a 64px bar and its value, such as how much of an
 * invoice is paid. Name it with `aria-label`. In an abbreviated `RecordRowRead` the bar is dropped
 * and the value stays.
 */
export function Track({ locale = "en", className, ...props }: TrackProps): React.ReactElement {
  return (
    <Meter.Root
      data-slot="track"
      locale={locale}
      className={cn("inline-flex items-center gap-related", className)}
      {...props}
    >
      <Meter.Track
        data-abbreviation="long"
        className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-muted"
      >
        <Meter.Indicator className="h-full rounded-full bg-foreground/70" />
      </Meter.Track>
      <Meter.Value className="min-w-[4ch] text-end text-xs tabular-nums" />
    </Meter.Root>
  )
}
