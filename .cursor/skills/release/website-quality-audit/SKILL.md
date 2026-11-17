---
name: website-quality-audit
description: Inspects Velora Monitor pages for broken links, navigation, favicon, 404s, feedback states, console errors, and production-build hygiene. Use when reviewing a public page, the document shell, or release readiness of the website.
icon: book-open
color: green
---

# Website quality audit

## When to use

A public page, the app shell, `index.html`, or the production web build changed, or the user asked for a website quality pass.

## Workflow

1. Read `docs/quality/website-quality.md`.
2. Run the inventory from the repository root:

```sh
node .cursor/skills/release/prelaunch-audit/scripts/inventory.mjs
```

3. Treat each `absent` or `gap` line as an open item. Do not mark it passed because a different file exists.
4. Click through the navigation that exists, including the logo. Check footer and in-page links. For external URLs, check them when the user asked for a live check, and otherwise list them as not requested.
5. Exercise one success path and one error path on each changed form. Confirm empty states on monitor and incident lists.
6. Open the browser console during that flow when a browser is available.
7. Run `pnpm --filter @velora/web build` when the shell or bundle changed. Confirm the config does not enable a public source map. Dev-only overlays belong to the dev server, not the production output.
8. Check the copyright year wherever a year is rendered.

## Report

Use the section order in `docs/quality/website-quality.md`. Each item is `pass`, `gap`, or `not checked`, with the evidence.

## Verification

A link is `pass` only after it resolved. A console item is `pass` only after the flow was loaded. Static review is `not checked` for runtime items.

## References

- `docs/quality/website-quality.md`
- `docs/quality/seo.md`
- `apps/web/index.html`
- `apps/web/vite.config.ts`
