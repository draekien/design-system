import type { FixtureState } from "@workspace/fixtures/state.ts"

type RuleSource =
  | { kind: "cited"; label: string; href: string; quote: string | null }
  | { kind: "own-decision" }

type StateRule = {
  label: string
  title: string
  body: string
  source: RuleSource
}

export const stateRules: Readonly<Record<FixtureState, StateRule>> = {
  loaded: {
    label: "Loaded",
    title: "A row previews in place, by keyboard",
    body: "Focus a row and press Space to peek at its detail without opening the record. The arrow keys move to the next row.",
    source: {
      kind: "cited",
      label: "Linear, Peek",
      href: "https://linear.app/docs/peek",
      quote: "Tap Space to toggle peek on or off",
    },
  },
  loading: {
    label: "Loading",
    title: "Rows hold their size while they load",
    body: "Each row keeps the height and column widths of the record it is waiting for, so nothing moves when the data arrives.",
    source: { kind: "own-decision" },
  },
  partial: {
    label: "Partial",
    title: "A field that fails does not hide its row",
    body: "The owner column could not load. It says so in each cell, and every other field in the row stays readable.",
    source: { kind: "own-decision" },
  },
  error: {
    label: "Error",
    title: "Say what went wrong, then how to fix it",
    body: "The table names the failure and the recovery in one message, with Retry beside it.",
    source: {
      kind: "cited",
      label: "Google Developers, Writing helpful error messages",
      href: "https://developers.google.com/tech-writing/error-messages",
      quote: null,
    },
  },
  "no-permission": {
    label: "No permission",
    title: "Name what is hidden and who can see it",
    body: "The owner column is withheld from this caller. Each cell says so, and the footer names the role that can see it.",
    source: { kind: "own-decision" },
  },
}
