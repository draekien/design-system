# design-system

A personal, open-source, general-purpose design system distributed as a [shadcn](https://ui.shadcn.com/) registry from this repository. Its components encode the rules for data disclosure (what a surface shows, what it hides, how hidden data is revealed, how actions are ranked) and data composition (how parts assemble into rows and cards, and how loading, partial, permission and error states change what is shown). Every component is built on [Base UI](https://base-ui.com/).

Documentation and live examples: https://design-system.wpei.me/

## Install a component

```sh
pnpm dlx shadcn@latest add draekien/design-system/tokens draekien/design-system/<item>
```

Name `tokens` in the command with the item. shadcn replaces your existing colour and font variables only when a theme item is named in the command, so an item installed alone keeps your current colours and font.

| Item | Description |
| --- | --- |
| `record-list` | A list of record rows with one tab stop, arrow-key focus, keyboard peek and keyboard selection. |
| `record-row` | A 44px row whose parts are named for the rank of what they hold, so any data lines up, reads and narrows by rank. |
| `status-mark` | A state drawn as a shape-coded dot and its word, for a rank 2 Read. |
| `person-mark` | A person's initials in a 24px circle, then their name. |
| `figure` | A number the caller compares down a list, in tabular figures, with a compact short form. |
| `track` | A measurement within a known range, drawn as a bar and its value, on Base UI Meter. |
| `relative-time` | A moment stated relative to now, with a narrow short form. |
| `field-state` | Stands in for a value that failed to load or that the viewer's role cannot see. |
| `field-card` | Rank 4: a hover card on a rank 1 or 2 value with more about that entity or property. |

## Licence

[MIT](LICENSE)
