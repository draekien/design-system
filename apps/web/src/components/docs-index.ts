import { cnDocs } from "./cn/cn.docs.ts"
import { entityDocs } from "./entity/entity.docs.ts"
import { figureDocs } from "./figure/figure.docs.ts"
import type { ItemDocs } from "./item-docs.ts"
import { meterDocs } from "./meter/meter.docs.ts"
import { previewCardDocs } from "./preview-card/preview-card.docs.ts"
import { recordListDocs } from "./record-list/record-list.docs.ts"
import { relativeTimeDocs } from "./relative-time/relative-time.docs.ts"
import { statusDocs } from "./status/status.docs.ts"

export const itemDocs: Readonly<Record<string, ItemDocs>> = {
  cn: cnDocs,
  entity: entityDocs,
  figure: figureDocs,
  meter: meterDocs,
  "preview-card": previewCardDocs,
  "record-list": recordListDocs,
  "relative-time": relativeTimeDocs,
  status: statusDocs,
}
export function requireItemDocs(name: string): ItemDocs {
  const docs = itemDocs[name]
  if (docs === undefined) {
    throw new Error(`No docs for ${name}; add them to itemDocs in components/docs-index.ts.`)
  }
  return docs
}
