import type { FixtureState } from "@workspace/fixtures/state.ts"
import { componentModule } from "./component-module.ts"
import type { Dataset, Hidden } from "./datasets.tsx"
import { capitalise, isPartShown } from "./datasets.tsx"

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

type RowCode = {
  parts: ReadonlyArray<string>
  contentModules: ReadonlyMap<string, ReadonlyArray<string>>
  row: ReadonlyArray<string>
  loadingRow: ReadonlyArray<string>
}

function rowCode<TItem>(dataset: Dataset<TItem>, hidden: Hidden, key: boolean): RowCode {
  const item = dataset.item
  const reads = dataset.reads.filter((read) => !hidden.has(read.part))
  const glyph =
    dataset.glyph !== undefined && !hidden.has(dataset.glyph.part) ? dataset.glyph : undefined
  const withCard = (read: (typeof reads)[number]) =>
    read.card !== undefined && isPartShown(hidden, read.card, read.part)

  const parts = [
    "RecordRow",
    "RecordRowIdentify",
    "RecordRowLink",
    "RecordRowName",
    ...(hidden.has("select") ? [] : ["RecordRowSelect"]),
    ...(hidden.has("key") ? [] : ["RecordRowKey"]),
    ...(hidden.has("description") ? [] : ["RecordRowDescription"]),
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
    key ? `<RecordRow key={${item}.id} value={${item}.id}>` : `<RecordRow value={${item}.id}>`,
    ...(hidden.has("select") ? [] : ["  <RecordRowSelect />"]),
    `  <RecordRowLink render={<Link to="/${dataset.noun}/$id" params={{ id: ${item}.id }} />}>`,
    "    <RecordRowIdentify>",
    ...indent(keyLine, 2),
    ...indent(glyphLines, 3),
    `      <RecordRowName>{${item}.${dataset.nameField}}</RecordRowName>`,
    ...(hidden.has("description")
      ? []
      : [`      <RecordRowDescription>{${item}.${dataset.summaryField}}</RecordRowDescription>`]),
    "    </RecordRowIdentify>",
    ...indent(readLines, 2),
    "  </RecordRowLink>",
    "</RecordRow>",
  ]

  const loadingRow = [
    "<RecordRowLoading>",
    ...(hidden.has("select") ? [] : ["  <RecordRowSelect />"]),
    "  <RecordRowLink>",
    "    <RecordRowIdentify>",
    ...(hidden.has("key") ? [] : [`      <RecordRowKey narrow="${dataset.keyNarrow}" />`]),
    ...(glyph === undefined ? [] : ["      <RecordRowGlyph />"]),
    "      <RecordRowName />",
    ...(hidden.has("description") ? [] : ["      <RecordRowDescription />"]),
    "    </RecordRowIdentify>",
    ...reads.map((read) => `    <RecordRowRead narrow="${read.narrow}" />`),
    "  </RecordRowLink>",
    "</RecordRowLoading>",
  ]

  return { parts, contentModules, row, loadingRow }
}

function contentImports(contentModules: RowCode["contentModules"]) {
  return [...contentModules.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([module, names]) => importLines(module, names))
}

export function recordListCode<TItem>(dataset: Dataset<TItem>, hidden: Hidden): string {
  const item = dataset.item
  const { parts, contentModules, row } = rowCode(dataset, hidden, true)
  const list = capitalise(dataset.noun)

  return [
    'import { Link } from "@tanstack/react-router"',
    'import * as React from "react"',
    ...contentImports(contentModules),
    ...importLines("record-list", ["RecordList", ...parts]),
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

const narrowWidths = [
  { label: "768px and wider", width: "w-[52rem]" },
  { label: "640–768px", width: "w-[44rem]" },
  { label: "narrower than 640px", width: "w-[34rem]" },
] as const

export function recordListStatesCode<TItem>(
  dataset: Dataset<TItem>,
  hidden: Hidden,
  state: FixtureState
): string {
  const { parts, contentModules, row, loadingRow } = rowCode(dataset, hidden, false)
  const noun = capitalise(dataset.noun)
  const item = dataset.item

  if (state === "loading") {
    return [
      ...importLines("record-list", [
        "RecordList",
        ...parts.filter((part) => part !== "RecordRow"),
        "RecordRowLoading",
      ]),
      "",
      `export function ${noun}Loading() {`,
      "  return (",
      `    <RecordList aria-label="${noun}, loading" aria-busy="true">`,
      ...indent(loadingRow, 3),
      "    </RecordList>",
      "  )",
      "}",
      "",
    ].join("\n")
  }

  const label = `${capitalise(item)} row`
  const list = (name: string, props: ReadonlyArray<string>) =>
    props.length === 0
      ? [`<RecordList aria-label="${label}, ${name}">{row}</RecordList>`]
      : [
          `<RecordList aria-label="${label}, ${name}" ${props.join(" ")}>`,
          "  {row}",
          "</RecordList>",
        ]

  return [
    'import { Link } from "@tanstack/react-router"',
    ...contentImports(contentModules),
    ...importLines("record-list", ["RecordList", ...parts]),
    "",
    `export function ${capitalise(item)}RowStates({ ${item}, now }: ${capitalise(item)}RowStatesProps) {`,
    "  const row = (",
    ...indent(row, 2),
    "  )",
    "",
    "  return (",
    "    <>",
    ...indent(
      [
        ...list("at rest", []),
        ...list("selected", [`defaultSelectedValues={[${item}.id]}`]),
        ...list("peeked", [`defaultPeekValue={${item}.id}`]),
        ...narrowWidths.flatMap((narrow) => [
          `<div className="${narrow.width}">`,
          ...indent(list(narrow.label, []), 1),
          "</div>",
        ]),
      ],
      3
    ),
    "    </>",
    "  )",
    "}",
    "",
  ].join("\n")
}
