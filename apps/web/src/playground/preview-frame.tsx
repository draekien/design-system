import { CodeIcon, ViewIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type * as React from "react"
import { cn } from "@/lib/cn.ts"
import { CodeBlock } from "./code-block.tsx"
import { Segmented } from "./playground-controls.tsx"
import type { SectionTab } from "./playground-search.ts"
import { frameSurface, segmentItem } from "./playground-styles.ts"

export function PreviewFrame({
  label,
  tab,
  onTabChange,
  code,
  fileName,
  Preview,
  className,
}: {
  label: string
  tab: SectionTab
  onTabChange: (tab: SectionTab) => void
  code: string
  fileName: string
  Preview: React.ComponentType
  className: string
}): React.ReactElement {
  return (
    <div className={frameSurface}>
      <div
        role="toolbar"
        aria-label={label}
        className="flex min-h-[3.0625rem] items-center justify-end border-b bg-background/60 px-3 py-2"
      >
        <Segmented label="View">
          <button
            type="button"
            aria-pressed={tab === "preview"}
            onClick={() => onTabChange("preview")}
            className={segmentItem}
          >
            <HugeiconsIcon icon={ViewIcon} size={14} strokeWidth={1.75} aria-hidden="true" />
            Preview
          </button>
          <button
            type="button"
            aria-pressed={tab === "code"}
            onClick={() => onTabChange("code")}
            className={segmentItem}
          >
            <HugeiconsIcon icon={CodeIcon} size={14} strokeWidth={1.75} aria-hidden="true" />
            Code
          </button>
        </Segmented>
      </div>
      {tab === "code" ? (
        <CodeBlock code={code} fileName={fileName} className={className} />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center overflow-auto bg-muted/50 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[16px_16px] p-6",
            className
          )}
        >
          <Preview />
        </div>
      )}
    </div>
  )
}
