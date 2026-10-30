import type { Rule } from "../../playground/rule-notes.tsx"

export const avatarRules: ReadonlyArray<Rule> = [
  {
    rule: "The people panel is the record's properties region for people: each row names a property, then its value, read down the names and across to one value without opening anything.",
    source: "Design rules: Goals (the properties summary is rank 2)",
  },
  {
    rule: "The rows run Assignee, Owner, Reviewers, Watchers: who is doing the work is the question most visits bring.",
    source: "Design rules: Goals; the order is this design system's own decision",
  },
  {
    rule: "An avatar draws one person or team as their picture, or their initials while there is none: 20px by default and 24px at lg. The panel draws every avatar at 24px.",
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
    rule: "The assignee and the owner show their avatar and name as a link to their profile; a hover card names them and their team after 300ms, and the link is its keyboard route.",
    source:
      "Design rules: Clear (a value names itself without a hover card), and every hover card has a keyboard route",
  },
  {
    rule: "A group draws at most three avatars overlapping by half their width, then a +N avatar for the rest, never +1: four people draw as four avatars. It is always a trigger: its popover lists everyone as links to their profiles, on hover after 300ms or on press, and scrolls when the list is taller than the space below.",
    source: "Primer AvatarStack (2 to 4 avatars); Geist Avatar (a group gets one accessible label)",
  },
  {
    rule: "A group spreads its avatars 4px apart while it is hovered, keyboard-focused or open, so every face shows whole. The spread animates margin-inline-start over 150ms with ease-out; under reduced motion the group spreads at once.",
    source:
      "Primer AvatarStack (avatars spread out on hover); spreading on focus and open, and the timing, are this design system's own decision",
  },
  {
    rule: "An empty property reads Unassigned or None in muted text, so an empty value is not mistaken for one that failed to load.",
    source: "This design system's own decision",
  },
  {
    rule: "A caller who may not see the watchers sees their count only, and a note below the panel names who can see them and how to get access.",
    source: "Design rules: an error or refusal states what went wrong, then how to fix it",
  },
  {
    rule: "When the watchers fail to load, their row says Could not load with a Retry link and the other rows stay readable; when the whole panel fails, the heading stays and the message says why and offers Retry.",
    source: "Design rules: an error states what went wrong, then how to fix it",
  },
  {
    rule: "The panel draws no border or fill of its own; it fills the rail it sits in, and names truncate before they wrap.",
    source: "Design rules: Quiet; a list draws no surface of its own",
  },
  {
    rule: "Every link and trigger has a hit area at least 24px high, and 44px on a coarse pointer.",
    source: "Primer designer checklist; 44px is this design system's own decision",
  },
]
