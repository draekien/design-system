import type { ConstellationPart } from "../playground/constellation.tsx"

/** Clips a wireframe specimen to its constellation satellite instead of letting it spill past the edge. */
export function clipSpecimen(part: ConstellationPart): ConstellationPart {
  return part.specimen === undefined
    ? part
    : { ...part, specimen: <div className="overflow-hidden">{part.specimen}</div> }
}
