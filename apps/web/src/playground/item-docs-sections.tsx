import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/registry/components/table.tsx"
import * as React from "react"
import { cn } from "@/lib/cn.ts"
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

const propCell = "whitespace-normal py-2.5 align-top"

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
        <div className="overflow-hidden rounded-card border bg-card text-card-foreground">
          <Table className="min-w-2xl text-sm">
            <TableCaption className="sr-only">{part.name} props</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-0">Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-0">Default</TableHead>
                <TableHead className="w-1/2">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.map(([name, prop]) => (
                <TableRow key={name}>
                  <TableHead
                    className={cn(
                      propCell,
                      "w-auto max-w-none whitespace-nowrap font-medium font-mono text-[0.8125rem]"
                    )}
                  >
                    {name}
                    {prop.required ? (
                      <span className="ml-1 font-normal font-sans text-muted-foreground text-xs">
                        required
                      </span>
                    ) : null}
                  </TableHead>
                  <TableCell className={cn(propCell, "font-mono text-[0.8125rem]")}>
                    {prop.type}
                  </TableCell>
                  <TableCell className={cn(propCell, "font-mono text-[0.8125rem]")}>
                    {prop.default ?? <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className={cn(propCell, "text-pretty")}>{prop.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
