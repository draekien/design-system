---
version: 1
slug: "apps-web-src-routes-index-tsx"
primary_target: "apps/web/src/routes/index.tsx"
related_targets: ["apps/web/src/home.tsx"]
---

## Scope

`apps/web` route `/`, the coming-soon page for `https://design-system.wpei.me/`. Mode: Persuade. It sets the visual world the docs and `/playground` inherit.

## Audience and job

Developers building data-dense interfaces, and their coding agents, arriving from the GitHub repository or a shared link. They learn what the system is, operate one rule, and watch the repository.

## Decisions

- Name is the template token `{{design-system}}` until naming is decided; the page plays as a template being filled in.
- Mark: the portfolio mark (`draekien/portfolio` `public/mark.svg`), in the accent, linking to `https://wpei.me`.
- Accent is the portfolio orange `#f26f21`, used only on actions; text on it is ink.
- No nav until docs exist. "Docs and first components coming soon" is status text, not a link.
- No eyebrow above the headline; "shadcn registry" moves into the purpose line.

## Direction contract

THESIS: The page proves a rule instead of describing one: a working record table switches between loaded, loading, partial, error and no-permission, and the rule that governs each state sits beside it with its source quoted. It refuses the centred badge-headline-button-cards launch page.

OWN-WORLD: Near-white `#fafafa` ground, white panels, `#e6e6e8` hairlines, ink `#0a0a0a`, secondary `#62626a`; one orange `#f26f21` for actions only; status as monochrome dot shapes, never coloured pills; Mona Sans throughout, tabular numerals for IDs; soft offset shadows with blur.

STORY: The visitor reads what the system decides (what shows, what hides, how it is revealed), switches the demo to partial or no-permission and sees the table keep its shape while the rule card cites Linear, Primer, Carbon, Geist or Stripe Apps, then watches the repository.

FIRST VIEWPORT: Top-left the orange mark and `{{design-system}}` wordmark; left column the headline at about 64px, the purpose line, the orange "Watch on GitHub" button and the coming-soon status; right column the state switcher over the record table and the rule card offset beneath it. At 390px the demo stacks under the copy.

FORM: Rule specimen (light), the user's own reference row 1, chosen from the safer register; seed key acc481d6. Signature interaction: switching state updates table and rule card together, written to `?state=`; Space peeks the focused row.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
