import type { FixtureState } from "@workspace/fixtures/state.ts"
import { componentModule } from "./component-module.ts"
import type { Dataset, Hidden, RowState } from "./datasets.tsx"
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

function rowCode<TItem>(
  dataset: Dataset<TItem>,
  hidden: Hidden,
  key: boolean,
  state: RowState
): RowCode {
  const item = dataset.item
  const facts = dataset.facts.filter((fact) => !hidden.has(fact.part))
  const media =
    dataset.media !== undefined && !hidden.has(dataset.media.part) ? dataset.media : undefined
  const missing = (fact: (typeof facts)[number]) => fact.missing?.[state]
  const withCard = (fact: (typeof facts)[number]) =>
    fact.card !== undefined && isPartShown(hidden, fact.card, fact.part)

  const parts = [
    "RecordRow",
    "RecordRowSubject",
    "RecordRowLink",
    "RecordRowName",
    ...(hidden.has("select") ? [] : ["RecordRowSelect"]),
    ...(hidden.has("key") ? [] : ["RecordRowId"]),
    ...(hidden.has("description") ? [] : ["RecordRowDescription"]),
    ...(media === undefined ? [] : ["RecordRowMedia"]),
    ...(facts.length > 0 ? ["RecordRowFact"] : []),
  ]

  const contentModules = new Map<string, Array<string>>()
  const shown = facts.filter((fact) => missing(fact) === undefined)
  for (const fact of media === undefined ? shown : [media, ...shown]) {
    for (const name of fact.components(withCard(fact))) {
      const module = componentModule[name]
      if (module === undefined) {
        throw new Error(`No registry item exports ${name}; add it to componentModule.`)
      }
      contentModules.set(module, [...(contentModules.get(module) ?? []), name])
    }
  }

  const keyLine = hidden.has("key")
    ? []
    : [`  <RecordRowId narrow="${dataset.keyNarrow}">{${item}.id}</RecordRowId>`]

  const mediaLines =
    media === undefined
      ? []
      : ["<RecordRowMedia>", ...indent(media.code(withCard(media)), 1), "</RecordRowMedia>"]

  const factLines = facts.flatMap((fact) => {
    const factMissing = missing(fact)
    return factMissing === undefined
      ? [
          `<RecordRowFact narrow="${fact.narrow}">`,
          ...indent(fact.code(withCard(fact)), 1),
          "</RecordRowFact>",
        ]
      : [`<RecordRowFact narrow="${fact.narrow}" missing="${factMissing}" />`]
  })

  const row = [
    key ? `<RecordRow key={${item}.id} value={${item}.id}>` : `<RecordRow value={${item}.id}>`,
    ...(hidden.has("select") ? [] : ["  <RecordRowSelect />"]),
    `  <RecordRowLink render={<Link to="/${dataset.noun}/$id" params={{ id: ${item}.id }} />}>`,
    "    <RecordRowSubject>",
    ...indent(keyLine, 2),
    ...indent(mediaLines, 3),
    `      <RecordRowName>{${item}.${dataset.nameField}}</RecordRowName>`,
    ...(hidden.has("description")
      ? []
      : [`      <RecordRowDescription>{${item}.${dataset.summaryField}}</RecordRowDescription>`]),
    "    </RecordRowSubject>",
    ...indent(factLines, 2),
    "  </RecordRowLink>",
    "</RecordRow>",
  ]

  const loadingRow = [
    "<RecordRowLoading>",
    ...(hidden.has("select") ? [] : ["  <RecordRowSelect />"]),
    "  <RecordRowLink>",
    "    <RecordRowSubject>",
    ...(hidden.has("key") ? [] : [`      <RecordRowId narrow="${dataset.keyNarrow}" />`]),
    ...(media === undefined ? [] : ["      <RecordRowMedia />"]),
    "      <RecordRowName />",
    ...(hidden.has("description") ? [] : ["      <RecordRowDescription />"]),
    "    </RecordRowSubject>",
    ...facts.map((fact) => `    <RecordRowFact narrow="${fact.narrow}" />`),
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
  const { parts, contentModules, row } = rowCode(dataset, hidden, true, "loaded")
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
  const { parts, contentModules, row, loadingRow } = rowCode(
    dataset,
    hidden,
    false,
    state === "loading" || state === "error" ? "loaded" : state
  )
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
