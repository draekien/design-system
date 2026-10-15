import { GithubIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import type { FixtureState } from "@workspace/fixtures/state.ts"
import { Mark } from "./mark.tsx"
import { RecordDemo } from "./record-demo.tsx"
import { stateRules } from "./state-rules.ts"
import { StateSwap } from "./state-swap.tsx"

const repositoryUrl = "https://github.com/draekien/design-system"

export function Home({ state }: { state: FixtureState }) {
  return (
    <div className="mx-auto flex min-h-svh max-w-7xl flex-col px-5 sm:px-10 lg:px-16">
      <header className="flex h-20 items-center">
        <a
          href="https://wpei.me"
          className="-m-2 inline-flex items-center gap-3 rounded-md p-2 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Mark className="h-5 w-auto text-primary" />
          <span className="sr-only">William Pei</span>
        </a>
        <Wordmark />
      </header>

      <main className="grid flex-1 items-start gap-14 py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-16">
        <div className="max-w-xl">
          <h1 className="text-balance font-semibold text-[2.75rem] leading-[1.04] tracking-[-0.035em] [font-stretch:108%] sm:text-6xl">
            Rule-driven components for data-dense interfaces.
          </h1>
          <p className="mt-6 text-pretty text-lg text-muted-foreground leading-relaxed">
            Components that decide what a data surface shows, what it hides and how hidden data is
            revealed. Built on Base UI, installed from a shadcn registry, and every rule cites the
            design system it came from.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-4">
            <a
              href={repositoryUrl}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-foreground shadow-[0_1px_0_rgb(255_255_255/0.25)_inset,0_6px_16px_-6px_rgb(242_111_33/0.6)] transition-[background-color,box-shadow] hover:bg-[#e4621a] focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-3"
            >
              <HugeiconsIcon icon={GithubIcon} size={18} strokeWidth={1.75} aria-hidden="true" />
              Watch on GitHub
            </a>
            <Link
              to="/playground/record-list"
              className="inline-flex min-h-11 items-center rounded-lg border bg-background px-5 font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-3"
            >
              Try the record list
            </Link>
            <p className="flex items-center gap-2.5 text-muted-foreground text-sm">
              <span
                aria-hidden="true"
                className="size-2 rounded-full border-[1.5px] border-muted-foreground border-dashed"
              />
              Docs coming soon
            </p>
          </div>
        </div>

        <section aria-label="Live rule demo" className="min-w-0">
          <RecordDemo state={state} />
          <RuleCard state={state} />
        </section>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t py-6 text-muted-foreground text-xs">
        <p>A personal project by William Pei.</p>
        <p>Base UI primitives only. Records on this page are sample data.</p>
      </footer>
    </div>
  )
}

function Wordmark() {
  return (
    <p className="ml-3 font-medium text-[0.9375rem] tracking-tight" translate="no">
      <span aria-hidden="true" className="text-muted-foreground">
        {"{{"}
      </span>
      design-system
      <span aria-hidden="true" className="text-muted-foreground">
        {"}}"}
      </span>
    </p>
  )
}

function RuleCard({ state }: { state: FixtureState }) {
  const rule = stateRules[state]

  return (
    <article className="relative mt-5 rounded-xl border bg-card p-5 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-8px_rgb(0_0_0/0.08)] sm:ml-[18%] sm:p-6">
      <p aria-live="polite" className="sr-only">
        {rule.label} state: {rule.title}
      </p>
      <StateSwap
        state={state}
        renderState={(option) => <RuleContent state={option} />}
        className="flex flex-col"
      />
    </article>
  )
}

function RuleContent({ state }: { state: FixtureState }) {
  const rule = stateRules[state]

  return (
    <>
      <h2 className="text-balance font-semibold text-base">{rule.title}</h2>
      <p className="mt-2 text-pretty text-muted-foreground text-sm leading-relaxed">{rule.body}</p>
      <div className="mt-auto">
        <RuleSourceLine state={state} />
      </div>
    </>
  )
}

function RuleSourceLine({ state }: { state: FixtureState }) {
  const { source } = stateRules[state]

  if (source.kind === "own-decision") {
    return (
      <p className="mt-4 border-t pt-4 text-muted-foreground text-xs">
        No cited source: this is the design system's own decision.
      </p>
    )
  }

  return (
    <div className="mt-4 border-t pt-4 text-sm">
      {source.quote !== null && (
        <blockquote className="mb-2 text-muted-foreground italic">“{source.quote}”</blockquote>
      )}
      <a
        href={source.href}
        className="font-medium underline decoration-2 decoration-primary underline-offset-4 hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        {source.label}
      </a>
    </div>
  )
}
