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
  record-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "0 {spacing.row-inset}"
    height: "{spacing.row}"
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
  record-row-media-icon:
    backgroundColor: "{colors.quiet-grey}"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.floor}"
    size: "{spacing.hit-min}"
---

# Design System: design-system

## Overview

**Creative North Star: "Rules Between Components"**

The system is defined by the relationships between components, not by the components alone. It states how data is ranked, which parts fit into which slots, which components may render on which surface, which components may sit next to each other, how much space separates one component type from another, and how a nested radius follows from its container. Each component encodes the relationships it takes part in, so callers can assemble new surfaces freely and every assembly stays consistent with every other.

| Relationship | Example rule | Where it is encoded today |
| --- | --- | --- |
| Rank | Ranks 1 and 2 show for every record before rank 3 shows for any | `docs/contexts/design-rules.md` |
| Fit | A row holds one `RecordRowSubject` and at most eight `RecordRowFact` columns, each holding one status, entity, figure, meter or relative time | `RecordRow` parts |
| Placement | A record table where the caller compares down a column, a record list where they scan for one record | `docs/contexts/design-rules.md` |
| Nesting | Groups do not nest; records nest one level deep | `docs/contexts/design-rules.md`, `RecordList` |
| Adjacency | A selection bar holds at most two actions, then a ⋯ menu | `docs/contexts/design-rules.md` |
| Spacing between types | Row after row 0, a dot and its word 8px, two stacked lists 24px | `docs/contexts/design-rules.md`; the `--spacing-run`, `--spacing-related` and `--spacing-section` tokens, which no component uses yet |
| Nested radius | A container's radius is its content's radius plus its padding, from a 6px floor | `docs/contexts/design-rules.md`; the `--radius-floor`, `--radius-card` and `--radius-panel` tokens, which no component uses yet |

The palette is monochrome with a single orange that marks only what can be acted on. Density is high: 44px rows, 10–14px type, hairline borders and no decorative fills, so a list of hundreds of records stays scannable. Depth is flat; only layers that float above the page (hover cards, menus, peek panels) cast a shadow.

**Key Characteristics:**
- Components declare which components they contain, sit beside and sit inside.
- One accent, used only on actionable elements and the focus ring.
- 44px rows with 24×24px hit areas that grow to 44×44px on a coarse pointer.
- State shown by shape and word, never by colour alone.
- Flat surfaces separated by hairlines; shadows only on floating layers.
- Revealed controls appear on hover, focus and selection, and are always visible on a coarse pointer.

## Colors

Monochrome neutrals with a faint cool cast, plus one orange accent.

### Primary
- **Signal Orange** (`{colors.signal-orange}`): fills the primary button, the checked selection checkbox and text selection (at 25%). It marks what can be acted on and nothing else.
- **Signal Ring** (`{colors.signal-ring}`): the focus ring and the focus underline on a row link; dark mode uses Signal Orange.

### Neutral
- **Ink** (`{colors.ink}`): primary text, rank 1 and 2 values, and the text on Signal Orange.
- **Paper** (`{colors.paper}`): the page background.
- **Sheet** (`{colors.sheet}`): cards and popovers that sit above Paper.
- **Quiet Grey** (`{colors.quiet-grey}`): muted fills: skeletons, initials circles, secondary buttons.
- **Slate Ink** (`{colors.slate-ink}`): text on Quiet Grey.
- **Muted Ink** (`{colors.muted-ink}`): secondary text, column headers, timestamps and hints.
- **Hairline** (`{colors.hairline}`): borders, row dividers and input strokes.
- **Alert Red** (`{colors.alert-red}`): destructive actions and invalid inputs only.

### Named Rules
**The Act-Only Accent Rule.** Signal Orange appears only on something the caller can act on, or on the focus ring. A status, a count or a heading is never orange.

**The No-Colour-Alone Rule.** A state is carried by a shape and a word (the status mark's filled, half or hollow dot beside its label), so it reads in greyscale and to colour-blind callers.

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

The container sets the gap between its children by how the two neighbours relate: `{spacing.run}` between the same component in a run (row after row; the border separates them), `{spacing.related}` between parts of one record or control (a status dot and its word), `{spacing.section}` between separate sections (two stacked record lists). A component never sets margin on itself.

## Elevation & Depth

Surfaces are flat and separated by Hairline borders and Paper/Sheet contrast. Shadows appear only on layers that float above the page.

### Shadow Vocabulary
- **Popover** (`--shadow-popover`: `0 1px 2px rgb(0 0 0 / 0.05), 0 10px 28px -8px rgb(0 0 0 / 0.18)`): hover cards, menus and peek panels, which also sit on the `--z-index-popover` layer (50).

### Named Rules
**The Flat-At-Rest Rule.** Nothing on the page casts a shadow at rest; a shadow means the layer floats and will close.

## Shapes

A radius builds outward from a floor. A leaf control (button, input) takes the floor, `{rounded.floor}` (`--radius-floor`, 6px). The selection checkbox is the one exception: at 16px square it takes `{rounded.checkbox}` (`--radius-checkbox`, 5px). A container's radius is its content's radius plus its padding: a field card with 12px padding around a leaf control is `{rounded.card}` (18px), and a panel with 16px padding around a card is `{rounded.panel}` (34px). A container with no padding between it and its content, such as a row, is square.

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

### Record row
- **Shape:** square, 44px high, Hairline bottom border.
- **States:** hover tints the row with Ink at 4%; a focused or peeked row with Ink at 7%; the row name underlines in Signal Ring on keyboard focus.
- **Revealed controls:** the selection checkbox and peek button are invisible at rest and appear on row hover, focus or selection; on a coarse pointer they are always visible and 44×44px.

### Preview card (hover card)
- **Corner Style:** its content's radius plus its 12px padding (`{rounded.card}`).
- **Background:** Sheet with a Hairline border and the popover shadow.
- **Size:** 240px wide, 12px padding, 12px text.
- **Motion:** opens over `--transition-duration-quick` (150ms) with `--ease-out`, from `--preview-card-enter-scale` (97%), and fades out instantly; no motion under reduced motion.

### Record row media
- **Default:** a 24×24px slot that draws only the dot of a status or the circle of an entity; the name and description beside it are read by screen readers only.
- **Icon:** one 16px Muted Ink icon in a 24×24px Quiet Grey square at the floor radius (`{rounded.floor}`); its required `label` names it for screen readers.

### Status
- **Style:** a 10px dot with a `--status-media-ring` (1.5px) border, filled, half-filled or hollow by state, then the state's name, then an optional one-line description in Muted Ink that truncates before the name.

### Entity
- **Style:** initials or a picture in a 24px Quiet Grey circle, then the name, then an optional one-line description in Muted Ink; media alone at narrow widths.

### Missing fact
- **Style:** the word "Unavailable" or "Hidden" in Muted Ink in place of a rank 2 value; the reason is stated once outside the list.

## Do's and Don'ts

### Do:
- **Do** take every colour, radius, spacing, type, shadow, motion, layer and breakpoint value from a token; tokens are authored in `packages/tokens/src` and generated into `packages/ui/src/styles/tokens.gen.css` and `theme.gen.css`.
- **Do** derive a container's radius from its content's radius plus its padding.
- **Do** let the container set the gap between its children from `--spacing-run`, `--spacing-related` or `--spacing-section`.
- **Do** keep row actions hidden until hover, focus or selection, and always visible on a coarse pointer.
- **Do** give every hit area at least 24×24px, and 44×44px on a coarse pointer.
- **Do** use tabular figures for any number compared down a column.

### Don't:
- **Don't** use Signal Orange on anything the caller cannot act on.
- **Don't** show a state by colour alone; pair it with a shape and a word.
- **Don't** put a shadow on a surface that sits in the page flow.
- **Don't** add a second typeface; use Mona Sans weights and widths.
- **Don't** give a component margin or a hard-coded radius; both come from its container.
- **Don't** write an untokenised value such as `text-[0.625rem]`, `z-50` or `duration-150` in a published component; add a token instead.
