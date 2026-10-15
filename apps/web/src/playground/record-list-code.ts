import type { RecordListPart } from "./playground-search.ts"

function indent(lines: ReadonlyArray<string>, depth: number) {
  return lines.map((line) => `${"  ".repeat(depth)}${line}`)
}

function statusLines(hidden: ReadonlySet<RecordListPart>) {
  if (hidden.has("status")) {
    return []
  }
  if (hidden.has("status-card")) {
    return [
      "<RecordRowStatus label={record.statusLabel}>",
      "  <StatusIcon status={record.status} />",
      "</RecordRowStatus>",
    ]
  }
  return [
    "<RecordRowStatus label={record.statusLabel}>",
    "  <RecordRowCard>",
    "    <RecordRowCardTrigger>",
    "      <StatusIcon status={record.status} />",
    "    </RecordRowCardTrigger>",
    "    <RecordRowCardContent>",
    "      {record.statusLabel} for {record.statusAge}",
    "    </RecordRowCardContent>",
    "  </RecordRowCard>",
    "</RecordRowStatus>",
  ]
}

function ownerLines(hidden: ReadonlySet<RecordListPart>) {
  if (hidden.has("owner")) {
    return []
  }
  if (hidden.has("owner-card")) {
    return ["<RecordRowOwner>", "  <RecordRowPerson name={record.owner} />", "</RecordRowOwner>"]
  }
  return [
    "<RecordRowOwner>",
    "  <RecordRowCard>",
    "    <RecordRowCardTrigger>",
    "      <RecordRowPerson name={record.owner} />",
    "    </RecordRowCardTrigger>",
    '    <RecordRowCardContent align="end">',
    "      {record.owner} · {record.team}",
    "    </RecordRowCardContent>",
    "  </RecordRowCard>",
    "</RecordRowOwner>",
  ]
}

function usedRowParts(hidden: ReadonlySet<RecordListPart>) {
  const parts = ["RecordRow", "RecordRowLink", "RecordRowTitle"]
  if (!hidden.has("select")) {
    parts.push("RecordRowSelect")
  }
  if (!hidden.has("id")) {
    parts.push("RecordRowId")
  }
  if (!hidden.has("status")) {
    parts.push("RecordRowStatus")
  }
  if (!hidden.has("owner")) {
    parts.push("RecordRowOwner", "RecordRowPerson")
  }
  if (!hidden.has("updated")) {
    parts.push("RecordRowUpdated")
  }
  const hasCard =
    (!hidden.has("status") && !hidden.has("status-card")) ||
    (!hidden.has("owner") && !hidden.has("owner-card"))
  if (hasCard) {
    parts.push("RecordRowCard", "RecordRowCardContent", "RecordRowCardTrigger")
  }
  return parts.sort()
}

export function recordListCode(hidden: ReadonlySet<RecordListPart>): string {
  const linkChildren = [
    ...(hidden.has("id") ? [] : ["<RecordRowId>{record.id}</RecordRowId>"]),
    ...statusLines(hidden),
    "<RecordRowTitle>{record.title}</RecordRowTitle>",
    ...ownerLines(hidden),
    ...(hidden.has("updated") ? [] : ["<RecordRowUpdated>{record.updated}</RecordRowUpdated>"]),
  ]
  const row = [
    "<RecordRow key={record.id} value={record.id}>",
    ...(hidden.has("select") ? [] : ["  <RecordRowSelect />"]),
    '  <RecordRowLink render={<Link to="/records/$id" params={{ id: record.id }} />}>',
    ...indent(linkChildren, 2),
    "  </RecordRowLink>",
    "</RecordRow>",
  ]

  return [
    'import { Link } from "@tanstack/react-router"',
    'import * as React from "react"',
    'import { RecordList } from "@/components/record-list"',
    "import {",
    ...indent(
      usedRowParts(hidden).map((part) => `${part},`),
      1
    ),
    '} from "@/components/record-row"',
    "",
    "export function Records({ records }: { records: ReadonlyArray<RecordSummary> }) {",
    "  const [peekValue, setPeekValue] = React.useState<string | null>(null)",
    "  const [selectedValues, setSelectedValues] = React.useState<ReadonlyArray<string>>([])",
    "",
    "  return (",
    "    <RecordList",
    '      aria-label="Records"',
    "      peekValue={peekValue}",
    "      onPeekValueChange={setPeekValue}",
    "      selectedValues={selectedValues}",
    "      onSelectedValuesChange={setSelectedValues}",
    "    >",
    "      {records.map((record) => (",
    ...indent(row, 4),
    "      ))}",
    "    </RecordList>",
    "  )",
    "}",
    "",
  ].join("\n")
}
