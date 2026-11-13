import type { Rule } from "../playground/rule-notes.tsx"

export const popoverCardRules: ReadonlyArray<Rule> = [
  {
    rule: "A popover card opens when its trigger is pressed, or on Enter or Space, and never on hover; a preview card is the hover-only card, and it holds no control but a link.",
    source: "This design system's own decision",
  },
  {
    rule: "A popover card is a Card with the popover shadow, 4px below its trigger and aligned to its start edge, and holds any Card part: CardAside actions, a CardMenu, facts, CardExplain and CardFooter.",
    source:
      "Design rules: menus and hover cards open 4px below their trigger; Card's ranks and spacing",
  },
  {
    rule: "A CardMenu in a popover card replaces the card's parts with its items under a back button naming the menu, and never opens a second popup over the first.",
    source: "This design system's own decision",
  },
  {
    rule: "In the menu, Esc goes back to the card and returns focus to the ⋮ button; a second Esc closes the card. Choosing an item runs it and closes the card.",
    source: "Design rules: every mouse interaction has a keyboard route",
  },
  {
    rule: "Opening the menu moves focus to its first item. Destructive items go last, after a divider.",
    source: "Design rules: destructive actions go last in the menu, after a divider",
  },
  {
    rule: "The same CardMenu on a card in the page opens a menu 4px below its ⋮ button.",
    source: "Design rules: menus open 4px below their trigger",
  },
  {
    rule: "At most two actions show in CardAside, then the ⋮ menu.",
    source: "Design rules: CardAside holds at most two actions",
  },
  {
    rule: "The person's name links to their profile, and CardFooter says only when they were last active; the card's actions are in CardAside.",
    source: "Design rules: a card's actions go in CardAside, never in CardFooter",
  },
  {
    rule: "A caller who cannot manage people sees no ⋮ menu, and the footer names who can.",
    source: "This design system's own decision",
  },
  {
    rule: "When a fact fails to load, its slot says Unavailable and the footer says what did not load; the rest of the card stays usable.",
    source: "Design rules: an error states what went wrong, then how to fix it",
  },
]
