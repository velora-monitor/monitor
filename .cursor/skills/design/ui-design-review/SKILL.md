---
name: ui-design-review
description: Audits Velora Monitor Vue screens against the charcoal, violet, and lime design system, typography, and visual exclusions. Use when reviewing a UI change, a new view, visual polish, or when the user asks for a design review.
icon: book-open
color: purple
---

# UI design review

## When to use

A Vue view, feature component, or stylesheet changed, or the user asked whether a screen matches the design system.

## Workflow

1. Read `docs/design/design-system.md`, `docs/design/color-system.md`, and `docs/design/typography.md`.
2. Read the changed Vue and CSS files. Note whether `apps/web/src/styles/globals.css` still uses the stock shadcn neutrals. If it does, review components for local hex and for consistency with the live tokens. Do not demand brand colors in one component while the theme is still neutral.
3. Check each changed screen:
   - Semantic token classes, no new hex or ad-hoc `oklch()`
   - Violet is not small text on charcoal
   - Lime appears only as a success or uptime mark
   - One page title, no trailing period, no negative tracking, no all-caps subtitle
   - Metrics use `tabular-nums`
   - No decorative pills, eyebrows, gradient page backgrounds, or borders on every region
   - Spacing uses the Tailwind scale. Radius stays on the existing `--radius`
4. Compare the screen with a neighboring view so the new work does not invent a second visual language.

## Report

```markdown
# UI design review
## Scope
## Findings
- Severity: blocker | required | note
- Evidence: path
- Change: what to edit
## Matches
## Theme gap
```

`blocker` means contrast failure, illegible type, or a brand anchor that was altered. `required` means a visual exclusion or a token violation. `note` means a judgment call.

## Verification

Re-read the diff after fixes. A finding is closed only when the cited file matches the cited token or exclusion. State when the brand theme is not applied yet.

## References

- `docs/design/tokens.css`
- `docs/design/design-system.md`
- `docs/design/color-system.md`
- `docs/design/typography.md`
