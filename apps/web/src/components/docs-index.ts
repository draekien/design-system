import { avatarDocs } from "./avatar/avatar.docs.ts"
import { cnDocs } from "./cn/cn.docs.ts"
import { entityDocs } from "./entity/entity.docs.ts"
import { figureDocs } from "./figure/figure.docs.ts"
import type { ItemDocs } from "./item-docs.ts"
import { listDocs } from "./list/list.docs.ts"
import { meterDocs } from "./meter/meter.docs.ts"
import { previewCardDocs } from "./preview-card/preview-card.docs.ts"
import { relativeTimeDocs } from "./relative-time/relative-time.docs.ts"
import { statusDocs } from "./status/status.docs.ts"
import { tableDocs } from "./table/table.docs.ts"

export const itemDocs: Readonly<Record<string, ItemDocs>> = {
  avatar: avatarDocs,
  cn: cnDocs,
  entity: entityDocs,
  figure: figureDocs,
  meter: meterDocs,
  "preview-card": previewCardDocs,
  list: listDocs,
  "relative-time": relativeTimeDocs,
  status: statusDocs,
  table: tableDocs,
}
export function requireItemDocs(name: string): ItemDocs {
  const docs = itemDocs[name]
  if (docs === undefined) {
    throw new Error(`No docs for ${name}; add them to itemDocs in components/docs-index.ts.`)
  }
  return docs
}
