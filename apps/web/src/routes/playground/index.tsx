import { createFileRoute } from "@tanstack/react-router"
import { PlaygroundIndex } from "../../playground/playground-index.tsx"

export const Route = createFileRoute("/playground/")({
  head: () => ({
    meta: [
      { title: "Playground · design-system" },
      {
        name: "description",
        content:
          "Try each registry component in every state, at phone to desktop widths and in your own theme, then copy the install command.",
      },
    ],
  }),
  component: PlaygroundIndex,
})
