import { Link } from "@tanstack/react-router"
import { sampleRecords } from "@workspace/fixtures/records.ts"
import { RecordList } from "@workspace/ui/components/record-list.tsx"
import {
  RecordRow,
  RecordRowGlyph,
  RecordRowIdentify,
  RecordRowKey,
  RecordRowLink,
  RecordRowName,
  RecordRowRead,
} from "@workspace/ui/components/record-row.tsx"
import * as React from "react"
import { cn } from "@/lib/cn.ts"
import { recordsDataset } from "./datasets.tsx"
import { generalRules, rankingRules, ranks, sourceRules } from "./design-rules.ts"
import { focusRing } from "./playground-styles.ts"
import { recordListRules } from "./record-list-rules.ts"
import { RuleNotes } from "./rule-notes.tsx"

const exampleRecord = sampleRecords[0]

const textLink = cn(
  "rounded-sm font-medium text-foreground underline decoration-border underline-offset-3 hover:decoration-foreground",
  focusRing
)

export function RulesPage(): React.ReactElement {
  const rankingId = React.useId()
  const scopeId = React.useId()
  const sourcesId = React.useId()
  const generalId = React.useId()
  const recordListId = React.useId()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-16 px-5 py-8 sm:px-8 lg:py-10">
      <header className="max-w-2xl">
        <h1 className="font-semibold text-3xl tracking-[-0.03em] [font-stretch:108%]">Rules</h1>
        <p className="mt-2 text-pretty text-muted-foreground leading-relaxed">
          The rules every component in this design system follows: how information is ranked, what a
          surface shows and hides, and how hidden information is reached. Each component encodes
          them in its parts, so a layout that breaks a rule cannot be composed.
        </p>
      </header>

      <section aria-labelledby={rankingId} className="flex flex-col gap-6">
        <div className="max-w-2xl">
          <h2 id={rankingId} className="font-semibold text-xl tracking-[-0.02em]">
            How information is ranked
          </h2>
          <p className="mt-2 text-pretty text-muted-foreground leading-relaxed">
            Every value takes one of five ranks. The rank decides where the value appears, how
            heavily it is set, and how the caller reaches it. A component places any value by its
            rank, so records, invoices or any other data land in the same slots.
          </p>
        </div>

        <RankedRow />

        <ol className="divide-y rounded-xl border bg-card">
          {ranks.map((rank) => (
            <li
              key={rank.rank}
              className="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:p-5"
            >
              <h3 className="flex items-baseline gap-2.5">
                <span className="font-semibold text-2xl text-muted-foreground tabular-nums leading-none">
                  {rank.rank}
                </span>
                <span className="font-semibold">{rank.name}</span>
              </h3>
              <dl className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[7rem_minmax(0,1fr)]">
                <dt className="text-muted-foreground">Holds</dt>
                <dd className="text-pretty">{rank.holds}</dd>
                <dt className="text-muted-foreground">Shows</dt>
                <dd className="text-pretty">{rank.shows}</dd>
                <dt className="text-muted-foreground">Drawn as</dt>
                <dd className="text-pretty">{rank.drawnAs}</dd>
              </dl>
            </li>
          ))}
        </ol>

        <RuleList rules={rankingRules} />
      </section>

      <section aria-labelledby={scopeId} className="flex max-w-2xl flex-col gap-3">
        <h2 id={scopeId} className="font-semibold text-xl tracking-[-0.02em]">
          What the rules cover
        </h2>
        <dl className="flex flex-col gap-3 text-pretty leading-relaxed">
          <div>
            <dt className="font-medium">Disclosure</dt>
            <dd className="text-muted-foreground">
              What a surface shows, what it hides, how hidden information is revealed, and how
              actions are ranked.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Composition</dt>
            <dd className="text-muted-foreground">
              How records assemble into rows, cards, hover cards and rails; how list, detail and
              side-panel surfaces lay out; how information is grouped and ordered; and how
              permission, loading, partial and error states change what is shown.
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby={sourcesId} className="flex max-w-2xl flex-col gap-3">
        <h2 id={sourcesId} className="font-semibold text-xl tracking-[-0.02em]">
          Where the rules come from
        </h2>
        <RuleList rules={sourceRules} />
      </section>

      <section aria-labelledby={generalId} className="flex max-w-2xl flex-col gap-3">
        <h2 id={generalId} className="font-semibold text-xl tracking-[-0.02em]">
          Rules for every surface
        </h2>
        <RuleList rules={generalRules} />
      </section>

      <section aria-labelledby={recordListId} className="flex flex-col gap-3">
        <div className="max-w-2xl">
          <h2 id={recordListId} className="font-semibold text-xl tracking-[-0.02em]">
            Record list
          </h2>
          <p className="mt-2 text-pretty text-muted-foreground leading-relaxed">
            The rules the record list and record row encode, with their sources.{" "}
            <Link to="/playground/record-list" className={textLink}>
              Try them in the playground
            </Link>
          </p>
        </div>
        <RuleNotes rules={recordListRules} />
      </section>
    </div>
  )
}

function RuleList({ rules }: { rules: ReadonlyArray<string> }) {
  return (
    <ul className="flex max-w-2xl list-disc flex-col gap-2 pl-5 text-pretty leading-relaxed marker:text-muted-foreground">
      {rules.map((rule) => (
        <li key={rule}>{rule}</li>
      ))}
    </ul>
  )
}

function RankedRow() {
  if (exampleRecord === undefined) {
    return null
  }
  const context = { state: "loaded", withCard: true } as const
  const [owner, updated] = recordsDataset.reads

  return (
    <figure className="flex flex-col gap-3 rounded-xl border bg-muted/50 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[16px_16px] p-4 sm:p-6">
      <div className="overflow-hidden rounded-lg border bg-card">
        <RecordList aria-label="Example record, labelled by rank">
          <li
            aria-hidden="true"
            className="col-span-full grid grid-cols-subgrid border-b bg-muted/40 px-2 font-medium text-muted-foreground text-xs"
          >
            <span className="col-[2/6] py-1.5 pl-1">1 Identify</span>
            <span className="col-[6/-1] py-1.5 pl-1">2 Read</span>
          </li>
          <RecordRow value={exampleRecord.id}>
            <RecordRowLink href="#rank-5" onClick={(event) => event.preventDefault()}>
              <RecordRowIdentify>
                <RecordRowKey narrow={recordsDataset.keyNarrow}>
                  {recordsDataset.key(exampleRecord)}
                </RecordRowKey>
                {recordsDataset.glyph === undefined ? null : (
                  <RecordRowGlyph>
                    {recordsDataset.glyph.render(exampleRecord, context)}
                  </RecordRowGlyph>
                )}
                <RecordRowName>{recordsDataset.name(exampleRecord)}</RecordRowName>
              </RecordRowIdentify>
              {[owner, updated].map((read) =>
                read === undefined ? null : (
                  <RecordRowRead key={read.part} narrow={read.narrow}>
                    {read.render(exampleRecord, context)}
                  </RecordRowRead>
                )
              )}
            </RecordRowLink>
          </RecordRow>
        </RecordList>
      </div>
      <figcaption className="grid gap-x-6 gap-y-1 text-pretty text-muted-foreground text-sm sm:grid-cols-3">
        <p>
          <span className="font-medium text-foreground">1 Identify</span> ends in a one-line
          description that truncates before the name.
        </p>
        <p>
          <span className="font-medium text-foreground">4 Enrich</span> opens in a hover card on the
          owner and on the status glyph.
        </p>
        <p>
          <span className="font-medium text-foreground">5 Elsewhere</span> is the record's own page,
          which the row links to and peek previews.
        </p>
      </figcaption>
    </figure>
  )
}
