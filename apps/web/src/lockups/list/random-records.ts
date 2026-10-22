import { base, en, Faker } from "@faker-js/faker"
import type {
  InvoiceStatus,
  SampleInvoice,
  SampleInvoiceLine,
} from "@workspace/fixtures/invoices.ts"
import { fixtureNow, type RecordStatus, type SampleRecord } from "@workspace/fixtures/records.ts"

const referenceTime = Date.parse(fixtureNow)

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
    updatedIso: new Date(referenceTime - minutes * 60_000).toISOString(),
    summary: `${sentenceCase(faker.company.catchPhrase())}.`,
  }))
}

const invoiceStatuses: ReadonlyArray<InvoiceStatus> = ["draft", "sent", "paid"]

const dueDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

function paidShare(status: InvoiceStatus, share: number) {
  switch (status) {
    case "draft":
      return 0
    case "sent":
      return share
    case "paid":
      return 1
  }
}

export function randomInvoices(seed: number, count: number): ReadonlyArray<SampleInvoice> {
  const faker = new Faker({ locale: [en, base], seed })
  const dayOffsets = Array.from({ length: count }, () =>
    faker.number.int({ min: -20, max: 40 })
  ).sort((a, b) => a - b)

  return dayOffsets.map((days, index) => {
    const status = faker.helpers.arrayElement(invoiceStatuses)
    const due = referenceTime + (status === "draft" ? Math.abs(days) : days) * 24 * 60 * 60_000
    return {
      id: `INV-${3000 + count - index}`,
      customer: faker.company.name(),
      status,
      amount: faker.number.float({ min: 400, max: 90_000, fractionDigits: 2 }),
      paid: paidShare(status, faker.number.int({ min: 1, max: 9 }) / 10),
      contact: faker.person.fullName(),
      dueIso: new Date(due).toISOString(),
      dueAt: dueDate.format(due),
      summary: `${sentenceCase(faker.commerce.productDescription())}`,
    }
  })
}

const lineFaker = new Faker({ locale: [en, base] })

export function randomInvoiceLines(invoice: SampleInvoice): ReadonlyArray<SampleInvoiceLine> {
  lineFaker.seed(Number(invoice.id.replace(/\D/g, "")))
  const weights = Array.from({ length: lineFaker.number.int({ min: 0, max: 4 }) }, () =>
    lineFaker.number.int({ min: 1, max: 9 })
  )
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  const cents = Math.round(invoice.amount * 100)
  const shares = weights.map((weight) => Math.floor((cents * weight) / total))
  const remainder = cents - shares.reduce((sum, share) => sum + share, 0)

  return shares.map((share, index) => ({
    id: `${invoice.id}-L${index + 1}`,
    invoiceId: invoice.id,
    description: sentenceCase(lineFaker.commerce.productName()),
    amount: (share + (index === 0 ? remainder : 0)) / 100,
  }))
}
