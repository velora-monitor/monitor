---
name: design-system-maintenance
description: Updates Velora Monitor color tokens, typography, radius, and component conventions without drifting the brand anchors. Use when changing globals.css, tokens.css, shadcn-vue primitives, or the design documentation.
icon: code
color: purple
---

# Design system maintenance

## When to use

The task changes `docs/design/tokens.css`, `apps/web/src/styles/globals.css`, a file under `apps/web/src/components/ui/`, or the design documents.

## Workflow

1. Read `docs/design/tokens.css` and `docs/design/color-system.md`.
2. Keep these strings exact if they already appear, and introduce them unchanged when applying the brand:
   - `oklch(21.08% 0.00782 285.71)`
   - `oklch(54.43% 0.25945 287.45)`
   - `oklch(89.60% 0.22671 125.54)`
3. Put a new color in `tokens.css` first. Derive it in OKLCH. Check contrast against charcoal and against the elevated surface using the method in the color document. Body text needs 4.5:1. Control edges and focus need 3:1.
4. When the task is to apply the theme, copy semantic values into `globals.css` and add the extra `@theme inline` mappings from the bottom of `tokens.css`. Do not import `tokens.css` twice on top of the old neutral `:root`.
5. Update `docs/design/color-system.md` when a derived token changes. Leave the brand rows stable.
6. Component primitives keep variants in `class-variance-authority`. A new variant uses semantic colors already on the theme.
7. Do not add a webfont, a second radius system, or a decorative background in a token change.

## Verification

- Search `apps/web/src` for `#` hex outside `globals.css` after the change.
- Confirm the three brand `oklch()` arguments still match the table above.
- Confirm `--primary-foreground` on violet still meets 4.5:1 if those values moved.
- Run `pnpm --filter @velora/web typecheck` when Vue or CSS module types change. Tailwind classes do not have a typecheck of their own, so re-read the `@theme` names against the utilities you used.

## References

- `docs/design/tokens.css`
- `docs/design/design-system.md`
- `docs/design/color-system.md`
- `docs/design/typography.md`
- `apps/web/components.json`
