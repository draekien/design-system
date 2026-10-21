import type { Rule } from "../playground/rule-notes.tsx"

export const bulletRules: ReadonlyArray<Rule> = [
  {
    rule: "A bullet is one rank 2 fact on one line: icons and a label, at least 24px high. The details panel names each fact's property beside its bullet.",
    source: "Design rules: Ranking information; Linear issue list (screenshots, 2026-10-08)",
  },
  {
    rule: "An icon sits before or after the label in the order its BulletMedia is written, so [icon] [label], [icon] [label] [icon] and [label] [icon] need no props. Every icon is 16px and muted.",
    source:
      "Geist Entity (lead with the identifier); order as position is this design system's own decision",
  },
  {
    rule: "A bullet comes in two sizes: default draws a 14px label, 16px icons and 24px stacked media; sm draws a 12px label, 14px icons and 20px stacked media, for a line of metadata such as the team and last update under the record's title. Both keep a hit area at least 24px high.",
    source:
      "The 14px body and 12px label sizes are DESIGN.md's type scale; the 24px floor is the Primer designer checklist",
  },
  {
    rule: "An icon after the label adds meaning, such as restricted or opens in a new tab, and carries that word for screen readers through its label. It is never a caret announcing a menu.",
    source: "Primer progressive disclosure (a caret is not a disclosure control)",
  },
  {
    rule: "An icon stack draws at most three 24px media overlapping, and the label beside it states the count, such as 3 reviewers.",
    source: "Geist Show More (state how many items there are)",
  },
  {
    rule: "A bullet opens a popup by rendering as its trigger: Menu.Trigger for Priority's picker, Popover.Trigger for Reviewers, PreviewCardTrigger rendered as the workspace link for Workspace, and a link for Policy. Due opens nothing and is drawn the same.",
    source: "Linear issue list (screenshots, 2026-10-08): pressing a property opens a picker",
  },
  {
    rule: "A bullet that is a button or link tints Ink at 4% on hover and 7% while its popup is open; a hover card trigger draws no tint. The tint and the focus outline extend 4px past each side, so its first icon lines up with a bullet that opens nothing.",
    source:
      "The 4% and 7% tints match the record row; the 4px extension is this design system's own decision",
  },
  {
    rule: "Priority's picker ticks the current value; choosing one closes the picker and the bullet shows it.",
    source: "Linear issue list (screenshots, 2026-10-08)",
  },
  {
    rule: "Reviewers opens on hover after 300ms and on press, Enter or Space, so a keyboard reaches the names the hover shows.",
    source: "Design rules: every hover card has a keyboard route",
  },
  {
    rule: "Workspace is a link to the workspace page: its hover card says who may open it, the lock's word, restricted, is in the link's accessible name, and the page is the keyboard and touch route to the card's text.",
    source:
      "Design rules: every hover card has a keyboard route; Linear issue list (screenshots, 2026-10-08)",
  },
  {
    rule: "A caller who cannot change priority sees it as a bullet that opens nothing, and a note names who can change it.",
    source: "This design system's own decision",
  },
  {
    rule: "When the reviewers fail to load, their bullet says Could not load and a Retry link follows it; the other facts stay readable.",
    source: "Design rules: an error states what went wrong, then how to fix it",
  },
  {
    rule: "Every interactive bullet's hit area is at least 24×24px, and 44px high on a coarse pointer.",
    source: "Primer designer checklist; 44px is this design system's own decision",
  },
]
