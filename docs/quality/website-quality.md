# Website quality

Use this list when a page is presented as part of the public product or when the document shell changes. Authenticated product screens still need working navigation, feedback, empty states, alt text, and a clean console.

The inventory script reports presence. Presence is not a pass. `node .cursor/skills/release/prelaunch-audit/scripts/inventory.mjs` is a starting point for the file-shaped items.

## Structure and links

- No horizontal scrolling on the page itself
- Internal links resolve, including the footer
- External links that are checked resolve, or the report says they were not requested
- Mobile navigation exists once there is more than one primary destination
- The logo navigates home
- Phone numbers use `tel:` and email addresses use `mailto:` when those contacts are shown
- A custom 404 exists for unknown public routes
- The visible copyright year is the current year
- Primary headings exist once. Empty states exist for lists
- There is no leftover placeholder copy and no navigation item that goes nowhere

## Metadata and media

- Favicon
- Unique titles and meta descriptions on public pages
- Canonical URLs, sitemap, `robots.txt`, and `llms.txt` as specified in `docs/quality/seo.md`
- Social images
- Image `alt` and reasonable dimensions
- Structured data only where the content is real

## Behavior

- Buttons perform the labeled action
- Success and error messages appear
- Forms can be submitted and can fail validation in a visible way
- The browser console is free of errors during the exercised flow
- The production build has no dev overlay, no framework watermark, and no public source map
- The JavaScript bundle for a route is no larger than the task requires. Record the build size when it changes materially

## Current gaps

`index.html` has no favicon link. The repo has no public 404 page, `robots.txt`, `sitemap.xml`, or `llms.txt`. The title is `Velora`. These are recorded in `docs/engineering/instruction-system.md` and are not invented during an unrelated task.
