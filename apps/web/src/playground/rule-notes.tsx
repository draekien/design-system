import type * as React from "react"

export type Rule = { rule: string; source: string }

export function RuleNotes({ rules }: { rules: ReadonlyArray<Rule> }): React.ReactElement {
  return (
    <table className="w-full border-collapse text-left text-sm">
      <caption className="sr-only">Rules this component encodes and their sources</caption>
      <thead className="text-muted-foreground text-xs">
        <tr className="border-b">
          <th scope="col" className="py-2.5 pr-6 font-medium">
            Rule
          </th>
          <th scope="col" className="w-2/5 py-2.5 font-medium">
            Source
          </th>
        </tr>
      </thead>
      <tbody>
        {rules.map(({ rule, source }) => (
          <tr key={rule} className="border-b align-top last:border-b-0">
            <td className="max-w-prose py-3 pr-6 text-pretty leading-relaxed">{rule}</td>
            <td className="py-3 text-pretty text-muted-foreground leading-relaxed">{source}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
