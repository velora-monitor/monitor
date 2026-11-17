# Pre-launch checklist

Mark an item only after checking the behavior. A file on disk is not a pass. Items that need the owner or counsel are marked `owner`, not `pass`.

Run `node .cursor/skills/release/prelaunch-audit/scripts/inventory.mjs` first and paste its gaps into the report. Then verify the rest by hand or with the test gate in `docs/engineering/testing-standards.md`.

## Legal and privacy

| Item | Evidence required |
| --- | --- |
| Privacy policy | Published page, reviewed by the owner |
| Terms of service | Published page, reviewed by the owner |
| Cookie consent | Implemented only if the owner says the deployment needs it |
| Marketing consent | Stored opt-in before marketing mail exists |
| Unsubscribe | Works on a real message before marketing mail exists |
| AI disclosure | Present only if AI text is shown to users |

## Website

| Item | Evidence required |
| --- | --- |
| Primary call to action | Visible on the public entry, and the control works |
| FAQs | Present only if the public site has them. Do not invent answers |
| Custom 404 | Unknown public URL renders the designed page |
| Favicon | Requested by the document and returns an image |
| Copyright year | Matches the current year |
| Navigation | Every visible item reaches a real screen, including on a phone |
| Footer links | Each href resolves |
| Mobile layout | Checked at 320px and 768px |
| Internal links | Crawl of public pages has no broken route |

## SEO

| Item | Evidence required |
| --- | --- |
| `robots.txt` | Served, and private routes are disallowed |
| `sitemap.xml` | Lists public URLs on the confirmed origin |
| `llms.txt` | Describes the public product and links to real pages |
| Titles and descriptions | Unique per public URL |
| Canonical URLs | Confirmed origin, one per URL |
| Social metadata | Tags and an image that loads |
| Structured data | Validates and matches the page |
| Alt text | Informative images have it |

## Security

| Item | Evidence required |
| --- | --- |
| Authentication | Bad and missing tokens receive 401 |
| Authorization | A second user cannot read the first user's monitor |
| Tenant isolation | Cases in `docs/security/tenant-isolation.md` |
| API key protection | Privileged secrets absent from the web bundle |
| Secret scanning | `scan-secrets.mjs` reports no findings |
| Rate limiting | The limiter returns 429 with `Retry-After` |
| Input validation | Invalid bodies return 400 |
| Payment integrity | No payment surface, or provider signatures verified |
| Dependency security | Dependabot and CodeQL are enabled. Review open alerts |

## Quality

| Item | Evidence required |
| --- | --- |
| Analytics | Configured only as the owner requested, after consent if required |
| Forms | Submit success and validation failure both checked |
| Broken links | Public links checked |
| Performance | Build reviewed against `docs/engineering/performance.md` |
| Accessibility | Keyboard and contrast checked per `docs/quality/accessibility.md` |
| Mobile | Layout checked per `docs/quality/responsive-design.md` |
| Console | No errors in the exercised flow |
| Production build | `pnpm build` succeeds. Source maps are not publicly served |

## Release block

Shipping to a public origin also requires a confirmed domain, `PROBE_MODE` left off until the private-network deny policy exists, and an authentication rate limit that is stronger than the process-local API limiter. Those three are launch constraints, not checklist trivia.
