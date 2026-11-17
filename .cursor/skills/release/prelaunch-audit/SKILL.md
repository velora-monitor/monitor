---
name: prelaunch-audit
description: Executes the Velora Monitor pre-launch checklist across privacy, website, SEO, security, and quality, and separates verified items from owner decisions. Use when preparing a public launch or when the user asks for a release audit.
icon: rocket
color: purple
---

# Pre-launch audit

## When to use

The user asks for a launch review, a release checklist, or a go-live audit.

## Workflow

1. Read `docs/quality/prelaunch-checklist.md`. Copy its items into the report. Start every item as `not checked`.
2. Run:

```sh
node .cursor/skills/release/prelaunch-audit/scripts/inventory.mjs
node .cursor/skills/security/security-audit/scripts/scan-secrets.mjs
```

3. Run the engineering gate you can run locally from `docs/engineering/testing-standards.md`. Record commands and results.
4. For security items, follow `security-audit` and `tenant-isolation-audit`. Do not mark tenant isolation passed without a second-owner result.
5. For SEO and website items, follow `seo-audit` and `website-quality-audit`. A missing `robots.txt` stays `gap`.
6. Mark legal, consent, analytics, and domain items as `owner` until a person confirms them. Do not draft a policy and call it approved.
7. Apply the release block in the checklist: confirmed domain, private-network deny policy before `PROBE_MODE=http`, and an authentication rate limit. Any open block means the launch recommendation is no.

## Report

```markdown
# Pre-launch audit
## Recommendation
## Release block
## Checklist
- Item — pass | gap | owner | not checked — evidence
## Commands
## Not run
```

## Verification

Every `pass` has evidence: a command, a file plus the behavior you observed, or a test name. File existence without behavior stays `gap` when the checklist asks for behavior.

## References

- `docs/quality/prelaunch-checklist.md`
- `docs/engineering/instruction-system.md`
- `docs/security/security-standards.md`
- `docs/quality/seo.md`
