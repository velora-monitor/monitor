---
name: accessibility-audit
description: Reviews Velora Monitor UI for semantic HTML, keyboard access, focus, labels, contrast, and screen-reader text. Use when adding a screen, a dialog, a form, a chart, or when the user requests an accessibility pass.
icon: book-open
color: green
---

# Accessibility audit

## When to use

The change adds or alters controls, focus, dialogs, forms, status, or charts, or the user asked for an accessibility review.

## Workflow

1. Read `docs/quality/accessibility.md` and `docs/design/color-system.md`.
2. Walk the changed template:
   - The element matches the behavior (`button`, `a`, `label`, heading).
   - The accessible name exists without relying on placeholder text.
   - Tab order follows the visual order. Focus is visible.
   - A dialog returns focus to its trigger.
   - Errors are text and associated with the field.
   - Status includes the display word, not color alone.
   - Charts have a text or table equivalent.
3. Compare color pairs actually used with the contrast table. Violet on charcoal is not body text.
4. Check `prefers-reduced-motion` for any new animation.
5. Exercise the keyboard path. Use Playwright assertions for role and name when an e2e spec covers the flow. Use a screen reader when one is available, and say so when it is not.

## Report

```markdown
# Accessibility audit
## Scope
## Findings
- Severity: blocker | required | note
- Barrier: what a keyboard or screen-reader user cannot do
- Evidence: path
- Change: element or style to fix
## Checks not run
```

A `blocker` stops a person from completing the action. A `required` item fails contrast, naming, or focus visibility.

## Verification

Re-test the keyboard path after the fix. Recompute contrast if a color changed. `pnpm --filter @velora/web test:e2e` when a spec was added or updated.

## References

- `docs/quality/accessibility.md`
- `docs/design/color-system.md`
- `docs/design/motion-guidelines.md`
