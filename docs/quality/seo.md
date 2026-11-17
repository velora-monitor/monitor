# SEO

The authenticated application is private. The public site, which does not exist yet, is what search engines and answer engines should see.

## Private routes

`/dashboard`, `/monitors`, `/incidents`, `/sign-in`, and `/v1/*` are not indexable. When a public origin exists, those routes send `noindex` and stay out of the sitemap. The API is not a document site.

## Public pages

Each indexable URL has:

- A unique title, ending in the product name once the owner confirms the public name
- A unique meta description
- A canonical URL on the confirmed production origin
- Open Graph title, description, and image
- A Twitter card using the same title, description, and image
- One `h1`
- Descriptive `alt` text on informative images
- Structured data that matches visible content. No fabricated reviews, ratings, or organization details

## Crawl files

The public origin will serve:

- `robots.txt`, allowing the public paths and disallowing the private app and API
- `sitemap.xml`, listing canonical public URLs only
- `llms.txt`, summarizing the public product in plain text and linking to the public docs

None of these files exist in the repo today. Creating them is a public-site task. It waits on the production domain. Do not point them at a guessed host.

## Internal links

Public pages link to the other public pages a visitor needs. Breadcrumbs appear when the public information architecture has more than one level. The app shell's navigation is not a breadcrumb substitute for marketing pages.

## Current document shell

`apps/web/index.html` sets `lang="en"`, a viewport, and the title `Velora`. It has no description, canonical, or social metadata. That is accurate for a private SPA shell and incomplete for a public homepage.
