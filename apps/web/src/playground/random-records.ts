import { base, en, Faker } from "@faker-js/faker"
import type { RecordStatus, SampleRecord } from "@workspace/fixtures/records.ts"

const referenceTime = Date.UTC(2026, 9, 15, 9, 30)

const statuses: ReadonlyArray<RecordStatus> = ["draft", "in-review", "approved"]

const absoluteTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
})

function plural(amount: number, unit: string) {
  return amount === 1 ? `1 ${unit}` : `${amount} ${unit}s`
}

function relativeTime(minutesAgo: number) {
  if (minutesAgo < 60) {
    return `${plural(minutesAgo, "minute")} ago`
  }
  const hours = Math.floor(minutesAgo / 60)
  if (hours < 24) {
    return `${plural(hours, "hour")} ago`
  }
  const days = Math.floor(hours / 24)
  return days < 7 ? `${plural(days, "day")} ago` : `${plural(Math.floor(days / 7), "week")} ago`
}

function duration(days: number) {
  return days < 7 ? plural(days, "day") : plural(Math.floor(days / 7), "week")
}

function sentenceCase(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function randomRecords(seed: number, count: number): ReadonlyArray<SampleRecord> {
  const faker = new Faker({ locale: [en, base], seed })
  const minutesAgo = Array.from({ length: count }, () =>
    faker.number.int({ min: 1, max: 60 * 24 * 60 })
  ).sort((a, b) => a - b)

  return minutesAgo.map((minutes, index) => ({
    id: `REC-${1000 + count - index}`,
    title: sentenceCase(faker.company.buzzPhrase()),
    status: faker.helpers.arrayElement(statuses),
    statusAge: duration(faker.number.int({ min: 1, max: 40 })),
    owner: faker.person.fullName(),
    team: faker.commerce.department(),
    updated: relativeTime(minutes),
    updatedAt: absoluteTime.format(referenceTime - minutes * 60_000),
    summary: `${sentenceCase(faker.company.catchPhrase())}.`,
  }))
}
