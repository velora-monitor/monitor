---
name: seo-audit
description: Reviews Velora Monitor public metadata, canonical URLs, sitemaps, robots rules, and structured data, and keeps the private app out of indexes. Use when editing index.html, public pages, or crawl files.
icon: book-open
color: blue
---

# SEO audit

## When to use

The task changes the document head, a public page, `robots.txt`, `sitemap.xml`, `llms.txt`, or structured data. Also use it before a public launch.

## Workflow

1. Read `docs/quality/seo.md`.
2. List indexable URLs. The dashboard, monitors, incidents, sign-in, and `/v1` are private. They are `noindex` and absent from the sitemap once a public origin exists.
3. For each public URL, check title, meta description, canonical, Open Graph, and Twitter card. Titles and descriptions are unique.
4. Confirm the canonical host is one the owner has named. If no domain is configured, report the gap and do not invent one.
5. Check structured data against the visible page. Remove a block that claims reviews, ratings, or an organization detail the page does not show.
6. Check `robots.txt`, `sitemap.xml`, and `llms.txt` against the same origin. They are absent today. Absence on a private SPA is an open launch item, not a reason to add a file with a placeholder domain.
7. Check the heading outline and internal links on public pages.

## Report

```markdown
# SEO audit
## Indexable URLs
## Private URLs
## Findings
## Domain
## Files
```

Domain is `confirmed: <origin>` or `unconfirmed`. Files are `absent`, `present and checked`, or `present with gaps`.

## Verification

A metadata finding is closed when the head tag is in the serving template or the server response, not when a note says to add it later.

## References

- `docs/quality/seo.md`
- `apps/web/index.html`
- `docs/quality/prelaunch-checklist.md`
