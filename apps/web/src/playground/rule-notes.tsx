import type * as React from "react"

export type Story = {
  who: string
  situation: string
  goals: ReadonlyArray<{ goal: string; visits: "most" | "some" | "few"; basis: string }>
  primaryAction: { action: string; basis: string }
  neverNeeds: ReadonlyArray<string>
}

export type StoryGoal<TStory extends Story> =
  | TStory["goals"][number]["goal"]
  | TStory["primaryAction"]["action"]

export type Rule<TServes extends string> = {
  rule: string
  source: string
  serves: TServes | "all"
}

export function RuleNotes({ rules }: { rules: ReadonlyArray<Rule<string>> }): React.ReactElement {
  return (
    <table className="w-full border-collapse text-left text-sm">
      <caption className="sr-only">
        Rules this component encodes, their sources and the goals they serve
      </caption>
      <thead className="text-muted-foreground text-xs">
        <tr className="border-b">
          <th scope="col" className="py-2.5 pr-6 font-medium">
            Rule
          </th>
          <th scope="col" className="w-1/4 py-2.5 pr-6 font-medium">
            Source
          </th>
          <th scope="col" className="w-1/5 py-2.5 font-medium">
            Serves
          </th>
        </tr>
      </thead>
      <tbody>
        {rules.map(({ rule, source, serves }) => (
          <tr key={rule} className="border-b align-top last:border-b-0">
            <td className="max-w-prose py-3 pr-6 text-pretty leading-relaxed">{rule}</td>
            <td className="py-3 pr-6 text-pretty text-muted-foreground leading-relaxed">
              {source}
            </td>
            <td className="py-3 text-pretty text-muted-foreground leading-relaxed">
              {servesLabel(serves)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function servesLabel(serves: string): string {
  return serves === "all" ? "Every goal" : serves
}

const visitsLabel = { most: "Most visits", some: "Some visits", few: "Few visits" } as const

export function StoryNotes({ story }: { story: Story }): React.ReactElement {
  return (
    <div className="flex flex-col gap-6 text-sm">
      <dl className="grid max-w-prose grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 leading-relaxed">
        <dt className="text-muted-foreground">Who</dt>
        <dd className="text-pretty">{story.who}</dd>
        <dt className="text-muted-foreground">Situation</dt>
        <dd className="text-pretty">{story.situation}</dd>
        <dt className="text-muted-foreground">Primary action</dt>
        <dd className="text-pretty">{story.primaryAction.action}</dd>
        <dt className="text-muted-foreground">Never needs</dt>
        <dd className="text-pretty">{story.neverNeeds.join("; ")}</dd>
      </dl>
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">The user's goals and how many visits bring each</caption>
        <thead className="text-muted-foreground text-xs">
          <tr className="border-b">
            <th scope="col" className="py-2.5 pr-6 font-medium">
              Goal
            </th>
            <th scope="col" className="w-1/6 py-2.5 pr-6 font-medium">
              Brought by
            </th>
            <th scope="col" className="w-2/5 py-2.5 font-medium">
              Basis
            </th>
          </tr>
        </thead>
        <tbody>
          {story.goals.map(({ goal, visits, basis }) => (
            <tr key={goal} className="border-b align-top last:border-b-0">
              <td className="max-w-prose py-3 pr-6 text-pretty leading-relaxed">{goal}</td>
              <td className="py-3 pr-6 text-muted-foreground leading-relaxed">
                {visitsLabel[visits]}
              </td>
              <td className="py-3 text-pretty text-muted-foreground leading-relaxed">{basis}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
