import type { Rule } from "../playground/rule-notes.tsx"

export const avatarRules: ReadonlyArray<Rule> = [
  {
    rule: "An avatar draws one person or team as their picture, or their initials while there is none: 20px by default, 24px at lg, and the size of the bullet it sits in.",
    source:
      "Geist Avatar (20–24px beside a 14px label; fall back to initials when the image is missing)",
  },
  {
    rule: "A person is round; a team or organisation is a square with the floor radius.",
    source: "Primer Avatar (square avatars represent non-human entities)",
  },
  {
    rule: "An avatar is hidden from screen readers: the name beside it, or the control around it, names who it is.",
    source:
      "Primer Avatar (alt text only without a name beside it); this design system's own decision",
  },
  {
    rule: "An avatar drawn alone, such as the assignee, is a link to the person's page with their name as its accessible name, and a hover card shows the name after 300ms.",
    source: "Design rules: media drawn alone, and every hover card has a keyboard route",
  },
  {
    rule: "A group draws at most three avatars overlapping by half their width, then a +N avatar for the rest, never +1: four people draw as four avatars. It is always a trigger: its popover lists everyone, on hover after 300ms or on press.",
    source: "Primer AvatarStack (2 to 4 avatars); Geist Avatar (a group gets one accessible label)",
  },
  {
    rule: "A group spreads its avatars 4px apart while it, or the button or link around it, is hovered, keyboard-focused or open, so every face shows whole. Each avatar moves by the gaps before it, so they fan out from the first.",
    source:
      "Primer AvatarStack (avatars spread out on hover); spreading on focus and open is this design system's own decision",
  },
  {
    rule: "The spread animates margin-inline-start over 150ms with ease-out, so the label beside the group moves with it; under reduced motion the group spreads at once.",
    source:
      "impeccable animate (150–300ms for a routine state change); this design system's own decision",
  },
  {
    rule: "A caller who may not see the watchers sees their count only, and a note names who can see them.",
    source: "This design system's own decision",
  },
  {
    rule: "When the watchers fail to load, the panel says Could not load with a Retry link; the other people stay readable.",
    source: "Design rules: an error states what went wrong, then how to fix it",
  },
  {
    rule: "Every interactive avatar or group has a hit area at least 24px high, and 44px on a coarse pointer.",
    source: "Primer designer checklist; 44px is this design system's own decision",
  },
]
