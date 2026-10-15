Source: prior research by the repository owner, from the sites linked in each table
Captured: 2026-10-06 (interaction patterns), 2026-10-08 (disclosure and actions) and 2026-10-16 (row anatomy)

# UX references

Follow Linear first; consult the rest only where Linear has no answer.

## Interaction patterns

| Reference | Consult it for |
| --- | --- |
| [Linear](https://linear.app/docs) | any interaction pattern, first |
| [Primer](https://primer.style/) (GitHub) | permission-dependent controls, role ladders, rows with inline actions |
| [Carbon](https://carbondesignsystem.com/) (IBM) | data tables, dense dashboards, status and notification patterns |
| [Geist](https://vercel.com/geist/introduction) (Vercel) | environment chrome, monochrome plus one accent colour |
| [Stripe Apps design](https://docs.stripe.com/stripe-apps/design) | details page vs list page, a side panel beside the main content |
| [Saga](https://grafana.com/developers/saga/) (Grafana Labs) | health, incident and time-series views |

## Disclosure and actions

This section is the evidence behind the design system's disclosure and action rules, kept so the sources need not be read again. A row marked unverified was not confirmed on a fetched page.

```
✗ every action in a group shown as a button, a filled Add on every queue row
✓ two actions shown, the rest in a ⋯ menu; one filled button on the surface, none in a row
```

### Ranking and disclosing information

| Source | Rule | Quote |
| --- | --- | --- |
| [Linear Display options](https://linear.app/docs/display-options) | The caller chooses which properties a row shows; groups and sub-groups are display, and empty groups are hidden unless asked for | "Choose what issue properties are displayed on individual issues on lists or the board." |
| [Linear Peek](https://linear.app/docs/peek) | A row's detail previews in place without opening the record, by keyboard only; arrow keys move the preview to the next item | "Tap Space to toggle peek on or off" |
| [Linear sub-issues](https://linear.app/docs/parent-and-sub-issues) | Completed children can be hidden by default from the parent's `...` menu | "Always hide completed sub-issues" |
| Linear issue list (screenshots, 2026-10-08) | Every chip on a row has a hover card or a tooltip. A project chip's card: ID, name, a rule, then status, team, lead, priority and progress, each an icon beside its value. An assignee's card: avatar, name, handle, a rule, then presence, local time, teams and projects. A status icon's card: "Time in status" with the stage and its age, a rule, then "Change status" and its key `S` | Observed, not documented |
| Linear issue list (screenshots, 2026-10-08) | A property with nothing more to say takes a tooltip naming its action and key: "Set priority `P`", "Assign to `A`" | Observed, not documented |
| Linear Display options (screenshots, 2026-10-08) | The Display popover holds the view switch, Grouping, Sub-grouping, Ordering with a direction toggle, list toggles, and "Display properties": a toggle chip per row property, filled while shown | Observed, not documented |
| Linear | Collapsible sections on the issue page | Unverified: no fetched page or screenshot covers them |
| [Primer progressive disclosure](https://primer.style/product/ui-patterns/progressive-disclosure/) | Disclose only to truncate, never move the caller's point of focus, and pair the disclosure icon with text | "They should be used sparingly, only when it's necessary to truncate information." |
| Primer progressive disclosure | Chevron toggles collapsed content; kebab toggles a menu; an ellipsis toggles truncated inline text; a caret is not a disclosure control | "For toggling inline dropdowns and menus." (kebab) |
| [Primer designer checklist](https://primer.style/accessibility/tools-and-resources/checklists/designer-checklist/) | Hover content holds no control and no important information; every mouse interaction has a keyboard route; hit areas are at least 24×24px. This design system follows Linear instead for hover cards, which may hold links, and keeps the keyboard route | "Do not place interactive elements or important information in hover content." |
| [Primer tooltip](https://primer.style/product/components/tooltip/guidelines/) | A tooltip labels an icon-only button, never carries long or essential content, and never sits on a non-interactive element | "Reserve Tooltips to visually surface the label for IconButtons." |
| [Primer truncation](https://primer.style/accessibility/patterns/truncation/) | Prefer wrapping to truncating; truncated text must be reachable by mouse, keyboard and screen reader; a tooltip rarely is | "Tooltips are rarely appropriate in truncation use cases." |
| [Carbon accordion](https://carbondesignsystem.com/components/accordion/usage/) | Collapse content a caller does not need to read in full; do not collapse content they will read | "If a user is likely to read all of the content, then don't use an accordion as it adds the burden of an extra click" |
| [Carbon tooltip](https://carbondesignsystem.com/components/tooltip/usage/) | A tooltip opens on hover or focus, holds brief non-essential text, and no control | "Do not include interactive elements within a tooltip." |
| [Carbon toggletip](https://carbondesignsystem.com/components/toggletip/usage/) | Content holding a control opens on click; critical content goes in a modal instead | "A toggletip is used on click or enter when you must expose interactive elements." |
| [Carbon data table](https://carbondesignsystem.com/components/data-table/usage/) | An expanded row holds supplementary data or data that is slow to load | "Use the expanded section for supplementary information or data that needs additional query time." |
| [Geist Collapse](https://vercel.com/geist/collapse) | Collapse optional content most callers skip; never collapse what the page is about; sibling views take tabs | "Use Collapse for optional, advanced, or repetitive content that most users skip on most visits" |
| [Geist Tooltip](https://vercel.com/geist/tooltip) | A tooltip says why a thing exists, in one fragment, and never repeats the label | "Use a Tooltip to explain **why** something exists, not **what** it is." |
| [Geist Show More](https://vercel.com/geist/show-more) | Show 5 to 10 items before truncating a list, state how many are hidden, and do not alternate Show more and Show less | "Pair the trigger with the count of hidden items so the user knows the cost of expanding." |
| [Stripe Apps design](https://docs.stripe.com/stripe-apps/design) | Detail opens beside the content it qualifies by default; a full-focus view is for long uninterrupted work | "default to `ContextView`." |
| [Saga Interactive table](https://grafana.com/developers/saga/components/interactive-table) | An expanded row removes detail from the primary table | "The expanded row area should be used to declutter the primary presentation of data." |
| [Saga Tooltip](https://grafana.com/developers/saga/components/tooltip) | A tooltip carries nothing task-critical, does not repeat a label, and shows on keyboard focus | "Do not house information critical to a user's task completion in the tooltip." |
| [Primer DataTable](https://github.com/primer/design/blob/main/content/components/data-table.mdx) | On narrow screens drop the less important columns; wrap before truncating | "Remove less important columns" |
| [Primer DataTable](https://github.com/primer/design/blob/main/content/components/data-table.mdx) | Numbers align for comparison | "Right-align numeric values and use the `tabular-num` font variant" |
| [Saga Lists of objects](https://github.com/grafana/design-system/blob/main/docs/07-templates/lists-of-objects.mdx) | A list ranks its fields by typography and layout | "Lists allow you to use typography and layout to emphasize important fields and deemphasize supplemental data." |
| [Saga List page](https://github.com/grafana/design-system/blob/main/docs/07-templates/list-page.mdx) | Each list item links to its own detail page | "Each item is a link to a new page where either detail or create view can be displayed." |
| [Geist Entity](https://vercel.com/geist/entity) | A row leads with what identifies it, then its label, then metadata | "Lead with a scannable identifier, such as an Avatar or icon" |

### Ranking actions

| Source | Rule | Quote |
| --- | --- | --- |
| [Linear navigating](https://linear.app/enablement/guides/navigating-linear) | The command menu runs any action from the keyboard; `?` lists the shortcuts | "Use the command menu to open pages or run actions without leaving your keyboard." |
| Linear | Ranking of header actions and the number visible at once | Unverified: no fetched page states it |
| [Primer Button](https://primer.style/product/components/button/guidelines/) | One primary per page where possible, never two in a group; most buttons are the default variant; danger is sparing and confirmed | "Only use one primary Button on a page, whenever possible" |
| [Primer ActionMenu](https://primer.style/product/components/action-menu/guidelines/) | Rank inside a menu with dividers and section titles; no form controls in a menu; icons on every item or none | "By using dividers and section titles, a hierarchy can be established within the ActionMenu" |
| [Carbon Button](https://carbondesignsystem.com/components/button/usage/) | One primary per screen; a button group holds two or three actions; no icon-only danger button | "Each page should have only one primary button." |
| [Carbon menu buttons](https://carbondesignsystem.com/components/menu-buttons/usage/) | Overflow when space is short; an action shown outside the menu is not repeated inside it | "The shared action should not be repeated in the menu list." |
| [Geist Menu](https://vercel.com/geist/menu) | A menu acts on one resource, holds about 10 items, and puts destructive items last after a divider | "Group destructive items at the bottom, separated by a divider" |
| [Geist Context Menu](https://vercel.com/geist/context-menu) | A right-click menu is a shortcut and never the only route to an action | "ContextMenu must never be the only entry point for an action." |
| [Geist Button](https://vercel.com/geist/button) | Disable a button only when its action is impossible now; more than one related action in a row becomes a menu or split button | "Switch to a `Menu` or `Split Button` when more than one related action shares a row." |
| [Stripe Button](https://docs.stripe.com/stripe-apps/components/button) | At most one primary available at a time; secondary is the default; destructive only for destruction | "Avoid having more than one primary button available to the user at a given time." |
| [Saga Button](https://grafana.com/developers/saga/components/buttons/button/) | One primary per page, none if there is no main action; never a solid primary beside a solid destructive | "If there is no primary action, all Button components should be secondary." |

### Row actions

| Source | Rule | Quote |
| --- | --- | --- |
| [Linear select issues](https://linear.app/docs/select-issues) | The row's checkbox appears on hover near its left edge; a selection's actions show at the bottom and in its right-click menu | "hover near the left edge to reveal a checkbox" |
| Linear issue list (screenshots, 2026-10-08) | A hovered row adds only the selection checkbox, whose slot stays empty on every other row. Status, priority, assignee and project are drawn the same at rest and on hover; pressing status, priority or assignee opens a picker — a filter field named for the action ("Set priority to…") with its key at the right, the current value ticked, each option numbered with its key — and pressing the project chip opens the project | Observed, not documented |
| [Primer ActionList](https://primer.style/product/components/action-list/guidelines/) | A row's trailing action is secondary, may appear on hover, and is keyboard-focusable on its own | "may appear when an item is hovered, and can be keyboard focused individually" |
| [Carbon data table](https://carbondesignsystem.com/components/data-table/usage/) | Fewer than three row actions stay inline as icon buttons; the row's overflow menu is persistent by default and may show on hover and focus only; touch devices detect no hover; row actions disable in batch mode | "use the `overflowMenuOnHover` prop to only show the overflow menu on hover and focus" |
| [Geist Entity](https://vercel.com/geist/entity) | A row holds at most two controls, the rest in a dots menu; a row button names its object | "The right column holds at most one or two controls." |
| [Stripe Accordion](https://docs.stripe.com/stripe-apps/components/accordion) | An item shows two actions and overflows the rest | "If there are more than 2 actions, use an overflow menu to show the rest." |
| [Saga Interactive table](https://grafana.com/developers/saga/components/interactive-table) | Batch controls sit in the table's header and are not repeated in an expanded row | "Don't duplicate batch editing controls in the expanded row section." |

## Error-message copy

Every refusal answers two questions, in this order: what went wrong, and how the caller fixes it.

```
✗ That needs 3 more points; you have 2 left.
✓ That needs 3 more points and you have 2 left. Take points back from another initiative first.
```

| Source | Consult it for | A rule it states |
| --- | --- | --- |
| [Writing helpful error messages](https://developers.google.com/tech-writing/error-messages) (Google Developers) — primary | error copy for technical readers | Answer "What went wrong?" and "How does the user fix it?" |
| [Error-Message Guidelines](https://www.nngroup.com/articles/error-message-guidelines/) (Nielsen Norman Group) | where and how an error appears | "Display the error message close to the error's source" |
| [Error Messages](https://learn.microsoft.com/en-us/windows/win32/uxguide/mess-error) (Microsoft Windows UX guidelines) | the fullest set of patterns and examples | What happened and why, the result for the user, and what they can do |
| [User experience guidelines for errors](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-error-handling-guidelines) (Microsoft Business Central) | a business app's error structure | Title says what went wrong; body says why and how to fix it |
| [sorry](https://learn.microsoft.com/en-us/style-guide/a-z-word-list-term-collections/s/sorry) (Microsoft Style Guide) | apologies | Apologise only when the product itself failed |

[IBM's accessibility content guidance](https://www.ibm.com/able/toolkit/design/content), linked from Carbon for errors, could not be read when this was captured; its contents are unverified.
