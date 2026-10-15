import type * as React from "react"

/** A rule a wireframe encodes and the evidence row it came from. */
export type Rule = { rule: string; source: string }

/** The rules table shown under a wireframe's canvas. */
export function RuleNotes({ rules }: { rules: ReadonlyArray<Rule> }): React.ReactElement {
  return (
    <section aria-label="Rules this wireframe encodes" className="text-sm">
      <h2 className="font-semibold">Rules this wireframe encodes</h2>
      <table className="mt-2 w-full border-collapse text-left">
        <thead className="text-muted-foreground text-xs">
          <tr className="border-b">
            <th scope="col" className="py-2 pr-4 font-medium">
              Rule
            </th>
            <th scope="col" className="w-2/5 py-2 font-medium">
              Source (docs/references/ux-references.md)
            </th>
          </tr>
        </thead>
        <tbody>
          {rules.map(({ rule, source }) => (
            <tr key={rule} className="border-b align-top">
              <td className="py-2 pr-4">{rule}</td>
              <td className="py-2 text-muted-foreground">{source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
