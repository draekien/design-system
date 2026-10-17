import type { Rule } from "../playground/rule-notes.tsx"

/** One frozen iteration of an experiment: when it was made, what changed from the previous one, and its rules. */
export type ExperimentIteration = {
  n: number
  date: string
  summary: string
  ruleSections: ReadonlyArray<{ title: string; rules: ReadonlyArray<Rule> }>
}

/** An experiment's iterations, oldest first; never empty. */
export type Iterations = readonly [ExperimentIteration, ...ReadonlyArray<ExperimentIteration>]

/** The iteration numbered `n`, or the latest when `n` is undefined or unknown. */
export function iterationOf(iterations: Iterations, n: number | undefined): ExperimentIteration {
  return (
    iterations.find((iteration) => iteration.n === n) ??
    iterations.reduce((_previous, iteration) => iteration)
  )
}
