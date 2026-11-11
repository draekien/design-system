import type { FixtureState } from "@workspace/fixtures/state.ts"
import type * as React from "react"
import {
  Card,
  CardAside,
  CardDescription,
  CardFact,
  CardFacts,
  CardMissing,
  CardName,
  CardSubject,
} from "@/components/card.tsx"
import { Figure } from "@/components/figure.tsx"
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "@/components/preview-card.tsx"
import { cn } from "@/lib/cn.ts"
import { Bar, ErrorMessage, RetryLink } from "../../experiments/wireframe-parts.tsx"
import { belowTrigger, retryClass } from "../record-card/card-styles.ts"
import { Note } from "../record-card/record-card.tsx"
import { type Metric, metrics, outstandingMetric, worstMetrics } from "./metrics.ts"

/** The centre parts of a metric card that a constellation connector ends on, by part number. */
type MetricCardAnchors = Readonly<{
  card: number
  figure: number
  aside: number
  change: number
  subject: number
  name: number
  description: number
}>

const aud = { style: "currency", currency: "AUD" } as const

const audFormat = new Intl.NumberFormat("en", aud)

const fullFigureMaxLength = 12

const compactClass = "*:data-[abbreviation=long]:sr-only *:data-[abbreviation=short]:inline"

const change = {
  style: "percent",
  signDisplay: "exceptZero",
  maximumFractionDigits: 1,
} as const

/** One figure at the top left and its change against the previous month at the top right, then the metric's name and unit. */
export function MetricCard({
  state,
  metric = outstandingMetric,
  anchors,
}: {
  state: FixtureState
  metric?: Metric
  anchors?: MetricCardAnchors
}): React.ReactElement {
  const { amount, previous } = metric
  if (state === "error") {
    return <ErrorMessage subject={metric.name} />
  }
  const loading = state === "loading"
  const changeFigure =
    previous === 0 ? (
      <>
        <span aria-hidden="true" className="font-medium text-muted-foreground text-sm">
          —
        </span>
        <span className="sr-only">No percentage: September was A$0.00</span>
      </>
    ) : (
      <>
        <Figure
          value={(amount - previous) / previous}
          format={change}
          className="ms-0 font-medium text-sm"
        />
        <span className="sr-only"> vs September</span>
      </>
    )
  return (
    <Card
      data-anchor={anchors?.card}
      render={<section aria-busy={loading} aria-label={metric.name} />}
    >
      <CardFacts data-anchor={anchors?.figure}>
        <CardFact label="Amount">
          {loading ? (
            <Bar className="my-2 w-28" />
          ) : state === "no-permission" ? (
            <CardMissing>Amount hidden</CardMissing>
          ) : (
            <Figure
              value={amount}
              format={aud}
              className={cn(
                "ms-0 text-display",
                audFormat.format(amount).length > fullFigureMaxLength && compactClass
              )}
            />
          )}
        </CardFact>
      </CardFacts>
      <CardAside data-anchor={anchors?.aside}>
        <CardFacts>
          <CardFact label="Change" className="min-w-0 shrink">
            {loading ? (
              <Bar className="w-16" />
            ) : state !== "loaded" ? (
              <CardMissing>
                {state === "partial" ? "Change unavailable" : "Change hidden"}
              </CardMissing>
            ) : anchors !== undefined ? (
              <span data-anchor={anchors.change} className="flex">
                {changeFigure}
              </span>
            ) : (
              <PreviewCard>
                <PreviewCardTrigger>{changeFigure}</PreviewCardTrigger>
                <PreviewCardContent {...belowTrigger}>
                  <p className="font-medium">
                    {previous === 0 ? "No percentage to show" : "Change against September"}
                  </p>
                  <dl className="mt-1 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 text-muted-foreground">
                    <dt>October</dt>
                    <dd className="flex">
                      <Figure value={amount} format={aud} className="text-foreground" />
                    </dd>
                    <dt>September</dt>
                    <dd className="flex">
                      <Figure value={previous} format={aud} className="text-foreground" />
                    </dd>
                  </dl>
                  {previous === 0 ? (
                    <p className="mt-1 text-muted-foreground">
                      A change from A$0.00 has no percentage.
                    </p>
                  ) : null}
                </PreviewCardContent>
              </PreviewCard>
            )}
          </CardFact>
        </CardFacts>
      </CardAside>
      <CardSubject data-anchor={anchors?.subject}>
        <CardName data-anchor={anchors?.name}>{metric.name}</CardName>
        <CardDescription data-anchor={anchors?.description}>{metric.description}</CardDescription>
      </CardSubject>
    </Card>
  )
}

const rowClass =
  "grid grid-cols-[repeat(auto-fill,minmax(min(14rem,100%),1fr))] items-start gap-related"

function MetricNote({ state }: { state: FixtureState }) {
  switch (state) {
    case "partial":
      return (
        <Note>
          September's totals could not load. <RetryLink className={retryClass} />
        </Note>
      )
    case "no-permission":
      return <Note>Amounts are hidden: only the Finance team can see them.</Note>
    case "loaded":
    case "loading":
    case "error":
      return null
  }
}

/** Metric cards in a row, with the reason for a missing figure stated once above them. */
function MetricRow({
  state,
  label,
  children,
}: {
  state: FixtureState
  label: string
  children: React.ReactNode
}) {
  if (state === "error") {
    return <ErrorMessage subject="The invoice metrics" />
  }
  return (
    <div className="flex flex-col gap-related">
      <MetricNote state={state} />
      <ul aria-label={label} className={cn(rowClass, "max-w-3xl")}>
        {children}
      </ul>
    </div>
  )
}

/** The metric card lockup: outstanding, overdue and paid this month in a row. */
export function MetricCardLockup({ state }: { state: FixtureState }): React.ReactElement {
  return (
    <MetricRow state={state} label="Invoice metrics">
      {metrics.map((metric) => (
        <li key={metric.name} className="grid">
          <MetricCard state={state} metric={metric} />
        </li>
      ))}
    </MetricRow>
  )
}

const worstCells = [
  { caption: "Compact figure", metric: { ...outstandingMetric, ...worstMetrics[0] }, width: "" },
  { caption: "Zero base", metric: { ...outstandingMetric, ...worstMetrics[1] }, width: "" },
  { caption: "224px: the narrowest cell in the row", metric: outstandingMetric, width: "w-56" },
] as const

/** The States view: a figure that switches to compact notation, a zero base and the narrowest cell in the row, in the given state. */
export function MetricCardStates({ state }: { state: FixtureState }): React.ReactElement {
  return (
    <section className="flex flex-col gap-related">
      <h2 className="font-medium text-sm">Worst case</h2>
      <MetricRow state={state} label="Worst-case metrics">
        {worstCells.map((cell) => (
          <li key={cell.caption} className={cn("grid content-start gap-related", cell.width)}>
            <p className="text-muted-foreground text-xs">{cell.caption}</p>
            <MetricCard state={state} metric={cell.metric} />
          </li>
        ))}
      </MetricRow>
    </section>
  )
}
