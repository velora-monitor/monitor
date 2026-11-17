# Instruction system

This repository separates three kinds of guidance.

| Kind | Location | What it contains |
| --- | --- | --- |
| Rules | `.cursor/rules/*.mdc` | Short constraints Cursor can attach by scope |
| Skills | `.cursor/skills/<group>/<name>/SKILL.md` | Procedures an agent runs when the task matches |
| Reference | `docs/` | Explanations, token values, and checklists |

`.cursor/skills/` is the only project skill root. Cursor also discovers `.agents/skills/`. A second copy would register every skill twice, so that directory is intentionally absent.

Rules attach in one of three ways:

- `alwaysApply: true` loads in every session. Only architecture and the security baseline use this.
- `alwaysApply: false` plus `globs` loads when a matching file is in context.
- `alwaysApply: false` with a description and no `globs` loads when the agent decides the description matches the task.

Skills load from their `description`. Each `name` matches the directory that contains `SKILL.md`. Category folders (`design`, `engineering`, `security`, `release`) are organizational and are not part of the skill name.

A policy has one canonical document. Rules and skills point at it. They do not restate the long form.

## Stack the standards assume

The running application is the monorepo described in `docs/engineering/architecture.md`. Standards name Vue, Hono, Go, Supabase, Drizzle, Zod, Tailwind CSS 4, and shadcn-vue because those are present. They do not assume a marketing site, an organization tenant, billing, or an AI product surface.

## Discrepancies

These are unresolved on purpose. Do not "fix" them inside an unrelated change.

1. Brand tokens in `docs/design/tokens.css` are not applied. `apps/web/src/styles/globals.css` still uses the stock shadcn neutral palette, with a light `:root` and a dark `.dark` variant.
2. The product name in this system is Velora Monitor. The README, package name, and document title say Velora.
3. Persisted monitor vocabulary is `up` / `down` and `open` / `resolved`. The display vocabulary (Operational, Degraded, Unavailable, Unknown, Pending, Recovering) is specified for the interface and is not a schema enum. Recovering has no column.
4. Isolation is per authenticated user (`owner_id`). There is no organization or tenant table.
5. Billing, a public marketing site, and product AI features are absent. Their standards apply when those features are added.
6. `apps/worker/internal/checker/http.go` does not deny private or link-local destinations. `PROBE_MODE` defaults to `off`.
7. The same checker counts an unfollowed 3xx response as `up`. The redirect target was not measured. Revisit that before live probes are a product feature.
8. No production domain is configured. Canonical URLs wait for the owner.
9. SQL migrations and `apps/api/src/db/schema.ts` are two definitions of one schema and must stay aligned.
10. `.editorconfig` sets spaces for every file. gofmt uses tabs. Go files follow gofmt.
11. `index.html` has no favicon, and the repo has no `robots.txt`, `sitemap.xml`, `llms.txt`, or custom 404.

## Verification

Run:

```sh
node .cursor/scripts/verify-instruction-system.mjs
```

The script checks rule frontmatter, skill metadata, brand token anchors, and that referenced `docs/` paths exist. Cursor's Customize panel is still the runtime check: Rules should list each `.mdc` with its apply mode, and Skills should list each skill name. A new Agent chat should offer the skill behind `/`.
