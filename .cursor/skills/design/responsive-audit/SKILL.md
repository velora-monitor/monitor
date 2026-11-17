---
name: responsive-audit
description: Inspects Velora Monitor layouts at phone, tablet, and desktop widths and fixes overflow, navigation, and touch gaps. Use when building or reviewing a page, a shell, a table, a chart, or a dialog.
icon: code
color: cyan
---

# Responsive audit

## When to use

A view, the app shell, a table, a chart, or a dialog changed, or the user asked for a mobile or tablet check.

## Workflow

1. Read `docs/quality/responsive-design.md` and the changed components.
2. Identify the width constraints: fixed widths, `whitespace-nowrap` on a page-level flex row, `min-width` larger than 320px, and hover-only actions.
3. Check the shell. If the change adds a primary destination, include a small-screen path in the same change.
4. Check data regions. Wide content scrolls inside the region. The page does not.
5. Check fixed bars for safe-area padding.
6. Verify at 320px, 768px, and a desktop width. Use the browser tools when the dev server is available. Otherwise state that the review was static and list the classes that control wrapping.

## Fixes

- Replace a page-level horizontal stack with a wrap or a column below `md`.
- Give charts a container with a bounded aspect ratio.
- Repeat hover-only information in a visible label.
- Keep the primary action on screen at 320px.

## Report

List each width, what was exercised, and any remaining overflow. A screenshot alone is not the result. Name the element that overflowed or the element that is now constrained.

## Verification

After a fix, re-check the same three widths on every view that shares the shell or the component. Run `pnpm --filter @velora/web typecheck` if the template changed.

## References

- `docs/quality/responsive-design.md`
- `apps/web/src/components/app-shell.vue`
