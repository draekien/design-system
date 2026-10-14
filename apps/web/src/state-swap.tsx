import { type FixtureState, fixtureStates } from "@workspace/fixtures/state.ts"
import { cn } from "cn"
import type * as React from "react"

export function StateSwap({
  state,
  renderState,
  className,
}: {
  state: FixtureState
  renderState: (state: FixtureState) => React.ReactNode
  className: string
}) {
  return (
    <div className="grid">
      {fixtureStates.map((option) => (
        <div
          key={option}
          aria-hidden={option === state ? undefined : true}
          inert={option !== state}
          className={cn(
            "col-start-1 row-start-1 transition-[opacity,translate,visibility] duration-300 ease-out motion-reduce:transition-none",
            option === state
              ? "visible translate-y-0 opacity-100"
              : "invisible translate-y-1 opacity-0",
            className
          )}
        >
          {renderState(option)}
        </div>
      ))}
    </div>
  )
}
