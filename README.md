# design-system

A personal, open-source, general-purpose design system distributed as a [shadcn](https://ui.shadcn.com/) registry from this repository. Its components encode the rules for data disclosure (what a surface shows, what it hides, how hidden data is revealed, how actions are ranked) and data composition (how parts assemble into rows and cards, and how loading, partial, permission and error states change what is shown). Every component is built on [Base UI](https://base-ui.com/).

Documentation and live examples: https://design-system.wpei.me/

## Install a component

Install `tokens` once, before your first component:

```sh
pnpm dlx shadcn@latest add draekien/design-system/tokens
```

Then install each component:

```sh
pnpm dlx shadcn@latest add draekien/design-system/<item>
```

shadcn replaces the CSS variables you already have only when a theme item is named in the command. A component pulls in `tokens` as a dependency, but that only adds the variables you are missing, so without the first step your current colours and font stay. Running the first command again later replaces any `tokens` variables you have edited.

| Item | Description |
| --- | --- |
| `list` | A list of 44px rows, each part named for the rank of what it holds, with one tab stop, arrow-key focus, keyboard peek and keyboard selection. |
| `status` | A state drawn as a shape-coded dot and its name, with an optional description. |
| `entity` | A person, team or organisation drawn as its initials or picture in a 24px circle, then its name. |
| `figure` | A number the caller compares down a list, in tabular figures, with a compact short form. |
| `meter` | A measurement within a known range, drawn as a bar and its value, on Base UI Meter. |
| `relative-time` | A moment stated relative to now, with a narrow short form. |
| `preview-card` | Rank 4: a hover card on a rank 1 or 2 value with more about that entity or property. |

## Licence

[MIT](LICENSE)
