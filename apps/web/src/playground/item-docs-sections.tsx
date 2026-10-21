import * as React from "react"
import {
  type ApiFunction,
  type ApiPart,
  type CompositionNode,
  consumerSource,
  type DocExample,
  type Usage,
} from "../components/item-docs.ts"
import { CodeBlock } from "./code-block.tsx"
import { ItemPageLink } from "./item-page-link.tsx"
import type { SectionTab } from "./playground-search.ts"
import { textLink } from "./playground-styles.ts"
import { PreviewFrame } from "./preview-frame.tsx"
import { requireRegistryItem } from "./registry-items.ts"

export function UsageContent({ usage }: { usage: Usage }): React.ReactElement {
  return (
    <div className="flex flex-col gap-3">
      {[
        { fileName: "imports.tsx", code: usage.imports },
        { fileName: "usage.tsx", code: usage.code },
      ].map((block) => (
        <div key={block.fileName} className="overflow-hidden rounded-xl border">
          <CodeBlock code={block.code} fileName={block.fileName} />
        </div>
      ))}
      {usage.description === null ? null : (
        <p className="max-w-2xl text-pretty text-sm leading-relaxed">{usage.description}</p>
      )}
    </div>
  )
}

function CompositionItem({ node }: { node: CompositionNode }): React.ReactElement {
  return (
    <li className="py-0.5">
      {node.item === null ? (
        node.name
      ) : (
        <ItemPageLink item={requireRegistryItem(node.item)} className={textLink}>
          {node.name}
        </ItemPageLink>
      )}
      {node.children.length === 0 ? null : (
        <ul className="ml-1.5 border-l pl-4">
          {node.children.map((child) => (
            <CompositionItem key={child.name} node={child} />
          ))}
        </ul>
      )}
    </li>
  )
}

export function CompositionTree({ root }: { root: CompositionNode }): React.ReactElement {
  return (
    <ul
      aria-label="Composition"
      className="overflow-x-auto rounded-xl border bg-card p-4 font-mono text-[0.8125rem] leading-relaxed"
    >
      <CompositionItem node={root} />
    </ul>
  )
}

function Example({ example }: { example: DocExample }): React.ReactElement {
  const [tab, setTab] = React.useState<SectionTab>("preview")
  const headingId = React.useId()
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <header>
        <h3 id={headingId} className="font-medium text-sm">
          {example.title}
        </h3>
        <p className="mt-0.5 max-w-2xl text-pretty text-muted-foreground text-sm">
          {example.description}
        </p>
      </header>
      <PreviewFrame
        label={`${example.title} example view`}
        tab={tab}
        onTabChange={setTab}
        code={consumerSource(example.source)}
        fileName={`${example.name}.tsx`}
        Preview={example.Preview}
        className="max-h-112 min-h-40"
      />
    </section>
  )
}

export function ExampleList({
  examples,
}: {
  examples: ReadonlyArray<DocExample>
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-8">
      {examples.map((example) => (
        <Example key={example.name} example={example} />
      ))}
    </div>
  )
}

function PartReference({ part }: { part: ApiPart }): React.ReactElement {
  const props = Object.entries(part.props)
  const headingId = React.useId()
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h3 id={headingId} className="font-medium font-mono text-sm">
        {part.name}
      </h3>
      <p className="max-w-2xl text-pretty text-sm">{part.description}</p>
      {props.length === 0 ? null : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-2xl text-left text-sm">
            <thead className="border-b text-muted-foreground text-xs">
              <tr>
                {["Prop", "Type", "Default", "Description"].map((heading) => (
                  <th key={heading} scope="col" className="px-3 py-2 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.map(([name, prop]) => (
                <tr key={name} className="border-b align-top last:border-b-0">
                  <th scope="row" className="px-3 py-2 font-medium font-mono text-[0.8125rem]">
                    {name}
                    {prop.required ? (
                      <span className="ml-1 font-sans font-normal text-muted-foreground text-xs">
                        required
                      </span>
                    ) : null}
                  </th>
                  <td className="px-3 py-2 font-mono text-[0.8125rem]">{prop.type}</td>
                  <td className="px-3 py-2 font-mono text-[0.8125rem]">
                    {prop.default ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="text-pretty px-3 py-2">{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-muted-foreground text-sm">
        {props.length === 0 ? "Takes" : "Also takes"} every prop of{" "}
        {part.spreads.href === null ? (
          <code className="font-mono text-[0.875em] text-foreground">{part.spreads.label}</code>
        ) : (
          <a href={part.spreads.href} className={textLink}>
            <code className="font-mono text-[0.875em]">{part.spreads.label}</code>
          </a>
        )}
        .
      </p>
    </section>
  )
}

function FunctionReference({ fn }: { fn: ApiFunction }): React.ReactElement {
  const headingId = React.useId()
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h3 id={headingId} className="font-medium font-mono text-sm">
        {fn.name}
      </h3>
      <pre className="overflow-x-auto rounded-xl border bg-card px-4 py-3 font-mono text-[0.8125rem]">
        {fn.signature}
      </pre>
      <p className="max-w-2xl text-pretty text-sm">{fn.description}</p>
    </section>
  )
}

export function ApiReference({
  entries,
}: {
  entries: ReadonlyArray<ApiPart | ApiFunction>
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-8">
      {entries.map((entry) =>
        entry.kind === "part" ? (
          <PartReference key={entry.name} part={entry} />
        ) : (
          <FunctionReference key={entry.name} fn={entry} />
        )
      )}
    </div>
  )
}
