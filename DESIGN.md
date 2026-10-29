---
name: design-system
description: Ranked, data-dense record components on Base UI, distributed as a shadcn registry.
colors:
  signal-orange: "oklch(0.6895 0.181 45.98)"
  signal-ring: "oklch(0.64 0.2 40)"
  alert-red: "oklch(0.577 0.245 27.325)"
  ink: "oklch(0.145 0 0)"
  paper: "oklch(0.985 0 0)"
  sheet: "oklch(1 0 0)"
  quiet-grey: "oklch(0.967 0.001 286.375)"
  slate-ink: "oklch(0.21 0.006 285.885)"
  muted-ink: "oklch(0.49 0.012 286)"
  hairline: "oklch(0.925 0.003 286)"
typography:
  title:
    fontFamily: "Mona Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.43
  body:
    fontFamily: "Mona Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Mona Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
  micro:
    fontFamily: "Mona Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  checkbox: "5px"
  floor: "6px"
  lg: "10px"
  card: "18px"
  panel: "34px"
  full: "9999px"
spacing:
  run: "0px"
  related: "8px"
  section: "24px"
  hit-min: "24px"
  hit-coarse: "44px"
  row: "44px"
  row-inset: "8px"
components:
  button-primary:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.floor}"
    padding: "0 8px"
    height: "28px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.floor}"
    padding: "0 8px"
    height: "28px"
  list-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.floor}"
    padding: "0 {spacing.row-inset}"
    height: "{spacing.row}"
  table-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    height: "{spacing.row}"
  table-group-row:
    backgroundColor: "{colors.quiet-grey}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    height: "36px"
  table-head:
    backgroundColor: "{colors.quiet-grey}"
    rounded: "{rounded.floor}"
    textColor: "{colors.muted-ink}"
    typography: "{typography.label}"
    height: "36px"
  preview-card:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "12px"
    width: "240px"
  entity-media:
    backgroundColor: "{colors.quiet-grey}"
    textColor: "{colors.muted-ink}"
    typography: "{typography.micro}"
    rounded: "{rounded.full}"
    size: "24px"
  list-row-media-icon:
    textColor: "{colors.muted-ink}"
    size: "{spacing.hit-min}"
---

# Design System: design-system

## Overview

**Creative North Star: "Rules Between Components"**

The system is defined by the relationships between components, not by the components alone. It states how data is ranked, which parts fit into which slots, which components may render on which surface, which components may sit next to each other, how much space separates one component type from another, and how a nested radius follows from its container. Each component encodes the relationships it takes part in, so callers can assemble new surfaces freely and every assembly stays consistent with every other.

| Relationship | Example rule | Where it is encoded today |
| --- | --- | --- |
| Rank | Ranks 1 and 2 show for every record before rank 3 shows for any | `docs/contexts/design-rules.md` |
| Fit | A row holds one `ListRowSubject` and at most eight `ListRowFact` columns, each holding one status, entity, figure, meter or relative time | `ListRow` parts |
| Placement | A table where the caller compares down a column, a list where they scan for one record | `docs/contexts/design-rules.md` |
| Nesting | Groups do not nest; records nest one level deep | `docs/contexts/design-rules.md`, `List` |
| Adjacency | A selection bar holds at most two actions, then a ⋯ menu | `docs/contexts/design-rules.md` |
| Spacing between types | Row after row 0, a dot and its word 8px, two stacked lists 24px | `docs/contexts/design-rules.md`; the `--spacing-run`, `--spacing-related` and `--spacing-section` tokens |
| Nested radius | A container's radius is its content's radius plus its padding, from a 6px floor | `docs/contexts/design-rules.md`; the `--radius-floor`, `--radius-lg`, `--radius-card` and `--radius-panel` tokens; list rows, table header and footer fills, and the card around a table use the floor and card radii |

Four principles decide any case no rule covers, in this order:

| Principle | Rule | Test |
| --- | --- | --- |
| Quiet | Nothing draws at rest that the caller does not need at rest; what they need only sometimes is revealed on hover, focus or selection | Remove the element at rest: if the caller loses nothing, it stays removed or becomes revealed |
| Clear | Every value carries its meaning: a figure names its unit, a state shows its word, a control names its action | A first-time reader names the value and its unit or state without a hover card |
| Precise | Every part sits in the column and on the edge it belongs to | The part shares a left edge or a baseline with the part above or below it |
| Sleek | A container is no thicker than its contents need: 4px of padding around controls, 12px around content | Its padding and radius match one row of the container table in Shapes |

Clear overrules Quiet: a unit, a state's word or an action's name is never hidden to draw less.

The palette is monochrome with a single orange that marks only what can be acted on. Density is high: 44px rows, 10–14px type, no line between rows and no decorative fills, so a list of hundreds of records stays scannable. Depth is flat; only layers that float above the page (hover cards, menus, peek panels) cast a shadow.

**Key Characteristics:**
- Quiet, Clear, Precise and Sleek, in that order, decide what the rules do not.
- Components declare which components they contain, sit beside and sit inside.
- One accent, used only on actionable elements and the focus ring.
- 44px rows with 24×24px hit areas that grow to 44×44px on a coarse pointer.
- State shown by shape and word, never by colour alone; a shape drawn alone discloses its word.
- Rows separated by nothing; a hover, focus or peek tint marks a row. A list and a table draw no surface of their own; shadows only on floating layers.
- Revealed controls appear on hover, focus and selection, and are always visible on a coarse pointer.
- Chrome is thin: a bar or menu adds 4px around its controls, so a bar of 32px buttons is 42px high.

## Colors

Monochrome neutrals with a faint cool cast, plus one orange accent.

### Primary
- **Signal Orange** (`{colors.signal-orange}`): fills the primary button, the checked selection checkbox and text selection (at 25%). It marks what can be acted on and nothing else.
- **Signal Ring** (`{colors.signal-ring}`): the focus ring, and the 1px ring at 40% around a focused or peeked row; dark mode uses Signal Orange.

### Neutral
- **Ink** (`{colors.ink}`): primary text, rank 1 and 2 values, and the text on Signal Orange.
- **Paper** (`{colors.paper}`): the page background.
- **Sheet** (`{colors.sheet}`): cards and popovers that sit above Paper.
- **Quiet Grey** (`{colors.quiet-grey}`): muted fills: skeletons, initials circles, secondary buttons.
- **Slate Ink** (`{colors.slate-ink}`): text on Quiet Grey.
- **Muted Ink** (`{colors.muted-ink}`): secondary text, column headers, timestamps and hints.
- **Hairline** (`{colors.hairline}`): card and popover borders and input strokes; never a line between rows.
- **Alert Red** (`{colors.alert-red}`): destructive actions and invalid inputs only.

### Named Rules
**The Act-Only Accent Rule.** Signal Orange appears only on something the caller can act on, or on the focus ring. A status, a count or a heading is never orange.

**The No-Colour-Alone Rule.** A state is carried by a shape and a word (the status's filled, half or hollow dot and its name), so it reads in greyscale and to colour-blind callers. The word is drawn beside the shape or disclosed by it: a dot drawn alone keeps its word in the accessible name, shows it in a preview card on hover, and peek or the record's page reaches it by keyboard.

## Typography

**Body Font:** Mona Sans Variable (with ui-sans-serif, system-ui)

**Character:** one variable sans for everything; hierarchy comes from weight, size and the width axis, not from a second family.

### Hierarchy
- **Title** (600, 0.875rem): section headings and hover card titles.
- **Body** (400–500, 0.875rem): row values; a row's name is 500.
- **Label** (500, 0.75rem): buttons, column headers, footers and key hints.
- **Micro** (500, 0.625rem): initials inside a person mark and the smallest button's label; never running text.

### Named Rules
**The Tabular Figures Rule.** Every number compared down a column (amounts, percentages, counts, widths) uses tabular figures, so digits align.

## Layout

Lists are CSS grids whose rows are subgrids, so every row's columns align with the header without fixed widths. A row is 44px high with an 8px inset. Columns respond to the list's width, not the viewport's: below the `abbreviate` container width (48rem) a column shows its short form, and below the `hide` container width (40rem) a column marked to hide disappears. Columns that hold rank 3 values hide first; the record's name truncates before it wraps. Interactive targets are at least 24×24px, and 44×44px on a coarse pointer.

The container sets the gap between its children by how the two neighbours relate: `{spacing.run}` between the same component in a run (row after row, with no line between them), `{spacing.related}` between parts of one record or control (a status dot and its word), `{spacing.section}` between separate sections (two stacked lists). A component never sets margin on itself.

## Elevation & Depth

Surfaces are flat and separated by Hairline borders and Paper/Sheet contrast. Shadows appear only on layers that float above the page.

### Shadow Vocabulary
- **Popover** (`--shadow-popover`: `0 1px 2px rgb(0 0 0 / 0.05), 0 10px 28px -8px rgb(0 0 0 / 0.18)`): hover cards, menus and peek panels, which also sit on the `--z-index-popover` layer (50).

### Named Rules
**The Flat-At-Rest Rule.** Nothing on the page casts a shadow at rest; a shadow means the layer floats and will close.

## Shapes

A radius builds outward from a floor. A leaf control (button, input) takes the floor, `{rounded.floor}` (`--radius-floor`, 6px). The selection checkbox is the one exception: at 16px square it takes `{rounded.checkbox}` (`--radius-checkbox`, 5px). A container's radius is its content's radius plus its padding:

| Container holds | Padding | Radius |
| --- | --- | --- |
| only controls: a selection bar, a menu | 4px | `{rounded.lg}` (10px) |
| content: a peek panel, a hover card, a dialog | 12px | `{rounded.card}` (18px) |
| cards | 16px | `{rounded.panel}` (34px) |

A divider between controls in a bar is 16px tall with 4px on each side; a divider in a menu runs its full width with 4px above and below. A list row's tint is a leaf shape and takes the floor. A table row is square; the header fill's top corners and the footer fill's bottom corners take the floor. A card that holds a table has no padding, takes `{rounded.card}` and clips the header and footer fills to its corners.

Every radius derives from `--radius`, so `--radius: 0` makes every radius 0 and turns off nesting. Circles are reserved for status dots and initials.

### Named Rules
**The Outward Radius Rule.** A container's radius is its content's radius plus its padding, so a container never picks a radius on its own.

**Not yet in code.** The default, sm, lg and icon buttons are still `rounded-md` (8px), the preview card `rounded-lg` (10px), and the selection checkbox casts a `shadow-xs` at rest; moving them to the floor and the outward rule is a follow-up lockup change.

## Components

### Buttons
- **Shape:** the floor radius (`{rounded.floor}`) at the xs sizes; the other sizes are still `rounded-md` (see Shapes). 28px high by default; 20, 24 and 32px sizes exist.
- **Primary:** Signal Orange fill with Ink text, 12px medium label.
- **Ghost / Outline:** transparent with Ink text; outline adds a Hairline border.
- **Hover / Focus:** primary fades to 80%; focus draws a 2px Signal Ring at 30% and a ring-coloured border. Pressed buttons move down 1px.

### List row
- **Shape:** 44px high with no line under it; its tint takes the floor radius (`{rounded.floor}`).
- **States:** hover and selection tint the row with Ink at 4%, a selected row under the pointer at 7%; a row with keyboard focus or open peek takes Ink at 4% and a 1px inset Signal Ring at 40%.
- **Revealed controls:** the selection checkbox and peek button are invisible at rest and appear on row hover, focus or selection; on a coarse pointer they are always visible and 44×44px.

### Table
- **Shape:** no line under the header or between rows, and no surface of its own. A body row's tint is square; the header row draws a Quiet Grey fill rounded at its top corners with the floor radius (`{rounded.floor}`), and the footer row one rounded at its bottom corners. Each fill is drawn on the row's first cell's `::before` across the row, below the cell content, so it draws in every engine and when the last column hides. The table fills its container, which scrolls sideways when the columns do not fit.
- **Record row:** 44px high, hover and selection tint it with Ink at 4%, a selected row under the pointer at 7%, a row with keyboard focus or open peek takes Ink at 4% and a 1px inset Signal Ring at 40%. A click anywhere on the row follows its `TableRowLink`, except on its checkbox, chevron or other controls and while text is selected; Enter on the focused row does too.
- **Group row:** 36px high on Quiet Grey at 40%, square, 44px on a coarse pointer; hover deepens the fill to 70%, and keyboard focus draws a 1px inset Signal Ring at 40%. Its name starts in the first data column, not under a column it does not belong to, and its sums stay in their columns.
- **Row header:** a row header that holds the row's `TableRowLink` is the record's name: it takes the spare width and truncates. Any other row header, such as a label or a prop name, fits its content.
- **Column header:** 36px high, 12px medium Muted Ink; a sortable header is a button with an arrow, drawn on hover and focus until the column is sorted, then always, turned over when descending, and the sorted header takes Ink; the sorted column carries `aria-sort`. The button is 24px high, 44px on a coarse pointer.
- **Caption:** above the table, 14px medium; it names the table for screen readers and may be hidden when a heading beside the table does.
- **Footer:** Quiet Grey fill, its bottom corners at the floor radius, medium weight, no line above it.
- **Revealed controls:** the selection checkbox and the expand chevron are 24×24px, 44×44px on a coarse pointer; the checkbox is invisible at rest and shows on row hover, focus or selection, and is always visible on a coarse pointer.
- **Narrow:** below the `abbreviate` container width (48rem) a column marked `abbreviate` or `hide` shows its short form; below the `hide` container width (40rem) a column marked `hide` disappears and the `TableCellDetail` line, 12px Muted Ink, appears under the cell's value to carry it.
- **Loading:** a loading row is 44px and draws a pulsing Quiet Grey bar in place of each cell's content; no pulse under reduced motion.

### List and table surface
- **List:** no surface; its rows sit on the page.
- **Table in a card:** Sheet with one Hairline border, no padding and `{rounded.card}` (18px), clipping the header and footer fills to its corners; no shadow.

### Selection bar
- **Shape:** Sheet with one Hairline border, 4px padding around its controls and `{rounded.lg}` (10px); the popover shadow, since it floats.
- **Size:** 32px controls, so the bar is 42px high; 44px controls on a coarse pointer.
- **Contents:** the count, at most two actions, a ⋯ menu, then Clear with its Esc key, with a 16px divider after the count and before Clear.
- **Menu:** the ⋯ menu takes the same 4px padding and `{rounded.lg}`; its items are 32px high with the floor radius.

### Preview card (hover card)
- **Corner Style:** its content's radius plus its 12px padding (`{rounded.card}`).
- **Background:** Sheet with a Hairline border and the popover shadow.
- **Size:** 240px wide, 12px padding, 12px text.
- **Motion:** opens over `--transition-duration-quick` (150ms) with `--ease-out`, from `--preview-card-enter-scale` (97%), and fades out instantly; no motion under reduced motion.

### List row media
- **Default:** a 24×24px slot that draws only the dot of a status or the circle of an entity; the name and description beside it are read by screen readers only.
- **Icon:** one 16px Muted Ink icon centred in the 24×24px slot, with no fill behind it; its required `label` names it for screen readers.

### Status
- **Style:** a 10px dot with a `--status-media-ring` (1.5px) border, filled, half-filled or hollow by state, then the state's name, then an optional one-line description in Muted Ink that truncates before the name.

### Entity
- **Style:** initials or a picture in a 24px Quiet Grey circle, then the name, then an optional one-line description in Muted Ink that truncates before the name; media alone at narrow widths.

### Missing fact
- **Style:** the word "Unavailable" or "Hidden" in Muted Ink in place of a rank 2 value; the reason is stated once outside the list.

## Do's and Don'ts

### Do:
- **Do** take every colour, radius, spacing, type, shadow, motion, layer and breakpoint value from a token; tokens are authored in `registry/tokens` and generated into `registry/styles/tokens.gen.css` and `theme.gen.css`.
- **Do** derive a container's radius from its content's radius plus its padding.
- **Do** pad a container of controls by 4px with `{rounded.lg}`, and a container of content by 12px with `{rounded.card}`.
- **Do** name a figure's unit in its column header, such as Amount (AUD).
- **Do** let the container set the gap between its children from `--spacing-run`, `--spacing-related` or `--spacing-section`.
- **Do** keep row actions hidden until hover, focus or selection, and always visible on a coarse pointer.
- **Do** give every hit area at least 24×24px, and 44×44px on a coarse pointer.
- **Do** use tabular figures for any number compared down a column.

### Don't:
- **Don't** draw a line, border, fill or hint at rest that the caller does not need at rest.
- **Don't** use Signal Orange on anything the caller cannot act on.
- **Don't** show a state by colour alone, or draw a shape alone that does not disclose its word.
- **Don't** put a shadow on a surface that sits in the page flow.
- **Don't** add a second typeface; use Mona Sans weights and widths.
- **Don't** give a component margin or a hard-coded radius; both come from its container.
- **Don't** write an untokenised value such as `text-[0.625rem]`, `z-50` or `duration-150` in a published component; add a token instead.
