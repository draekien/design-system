import type { Dataset, Hidden } from "./datasets.tsx"
import { isPartShown } from "./datasets.tsx"

const componentModule: Readonly<Record<string, string>> = {
  FieldCard: "field-card",
  FieldCardContent: "field-card",
  FieldCardTrigger: "field-card",
  FieldState: "field-state",
  Figure: "figure",
  PersonMark: "person-mark",
  RelativeTime: "relative-time",
  StatusMark: "status-mark",
  StatusMarkDot: "status-mark",
  StatusMarkLabel: "status-mark",
  Track: "track",
}

function indent(lines: ReadonlyArray<string>, depth: number) {
  return lines.map((line) => `${"  ".repeat(depth)}${line}`)
}

function importLines(module: string, names: ReadonlyArray<string>) {
  const sorted = [...new Set(names)].sort()
  const single = `import { ${sorted.join(", ")} } from "@/components/${module}"`
  return single.length <= 100
    ? [single]
    : [
        "import {",
        ...indent(
          sorted.map((name) => `${name},`),
          1
        ),
        `} from "@/components/${module}"`,
      ]
}

export function recordListCode<TItem>(dataset: Dataset<TItem>, hidden: Hidden): string {
  const item = dataset.item
  const reads = dataset.reads.filter((read) => !hidden.has(read.part))
  const glyph =
    dataset.glyph !== undefined && !hidden.has(dataset.glyph.part) ? dataset.glyph : undefined
  const withCard = (read: (typeof reads)[number]) =>
    read.card !== undefined && isPartShown(hidden, read.card, read.part)

  const rowParts = [
    "RecordRow",
    "RecordRowIdentify",
    "RecordRowLink",
    "RecordRowName",
    ...(hidden.has("select") ? [] : ["RecordRowSelect"]),
    ...(hidden.has("key") ? [] : ["RecordRowKey"]),
    ...(glyph === undefined ? [] : ["RecordRowGlyph"]),
    ...(reads.length > 0 ? ["RecordRowRead"] : []),
  ]

  const contentModules = new Map<string, Array<string>>()
  for (const read of glyph === undefined ? reads : [glyph, ...reads]) {
    for (const name of read.components(withCard(read))) {
      const module = componentModule[name]
      if (module === undefined) {
        throw new Error(`No registry item exports ${name}; add it to componentModule.`)
      }
      contentModules.set(module, [...(contentModules.get(module) ?? []), name])
    }
  }

  const keyLine = hidden.has("key")
    ? []
    : [`  <RecordRowKey narrow="${dataset.keyNarrow}">{${item}.id}</RecordRowKey>`]

  const glyphLines =
    glyph === undefined
      ? []
      : ["<RecordRowGlyph>", ...indent(glyph.code(withCard(glyph)), 1), "</RecordRowGlyph>"]

  const readLines = reads.flatMap((read) => [
    `<RecordRowRead narrow="${read.narrow}">`,
    ...indent(read.code(withCard(read)), 1),
    "</RecordRowRead>",
  ])

  const row = [
    `<RecordRow key={${item}.id} value={${item}.id}>`,
    ...(hidden.has("select") ? [] : ["  <RecordRowSelect />"]),
    `  <RecordRowLink render={<Link to="/${dataset.noun}/$id" params={{ id: ${item}.id }} />}>`,
    "    <RecordRowIdentify>",
    ...indent(keyLine, 2),
    ...indent(glyphLines, 3),
    `      <RecordRowName>{${item}.${dataset.nameField}}</RecordRowName>`,
    "    </RecordRowIdentify>",
    ...indent(readLines, 2),
    "  </RecordRowLink>",
    "</RecordRow>",
  ]

  const list = `${dataset.noun.charAt(0).toUpperCase()}${dataset.noun.slice(1)}`

  return [
    'import { Link } from "@tanstack/react-router"',
    'import * as React from "react"',
    ...[...contentModules.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([module, names]) => importLines(module, names)),
    'import { RecordList } from "@/components/record-list"',
    ...importLines("record-row", rowParts),
    "",
    `export function ${list}({ ${dataset.noun}, now }: ${list}Props) {`,
    "  const [peekValue, setPeekValue] = React.useState<string | null>(null)",
    "  const [selectedValues, setSelectedValues] = React.useState<ReadonlyArray<string>>([])",
    "",
    "  return (",
    "    <RecordList",
    `      aria-label="${list}"`,
    "      peekValue={peekValue}",
    "      onPeekValueChange={setPeekValue}",
    "      selectedValues={selectedValues}",
    "      onSelectedValuesChange={setSelectedValues}",
    "    >",
    `      {${dataset.noun}.map((${item}) => (`,
    ...indent(row, 4),
    "      ))}",
    "    </RecordList>",
    "  )",
    "}",
    "",
  ].join("\n")
}
