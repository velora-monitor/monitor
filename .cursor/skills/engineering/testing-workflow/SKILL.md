---
name: testing-workflow
description: Chooses and runs Velora Monitor unit, integration, worker, and Playwright tests for a change. Use when adding tests, verifying a fix, or preparing a change for CI.
icon: beaker
color: green
---

# Testing workflow

## When to use

The task needs tests, a regression check, or a CI-equivalent run.

## Workflow

1. Read `docs/engineering/testing-standards.md`.
2. Map the change to a layer:
   - Incident or check logic: Go test next to `incident`, `checker`, or `store`
   - HTTP or auth: Vitest next to the API module
   - Contract parse or session helper: Vitest under `apps/web/src`
   - A user flow in the browser: Playwright in `apps/web/e2e`
3. Write the failing case first when fixing a bug. Name the condition and the expected outcome.
4. Cover, when the change touches them: a failed measurement staying `down`, a second owner receiving nothing, invalid input, and the threshold that opens an incident.
5. Run the narrow command, then the gate the change can affect.

```sh
pnpm --filter @velora/api test
pnpm --filter @velora/web test
pnpm --filter @velora/web test:e2e
pnpm exec turbo run lint typecheck test build
```

Worker:

```sh
cd apps/worker && go test ./... && go vet ./... && go tool staticcheck ./...
```

## Constraints

- Web unit tests run in Node. Do not add a DOM-only assertion there unless the Vitest config grows a documented environment.
- CI does not probe live URLs. Leave `PROBE_MODE` off.
- Do not weaken an assertion to match a bug.
- Skip snapshot-only tests and tests that mock the function under test.

## Verification

The command output is the evidence. Paste the failing name and the final passing command. Say which CI jobs you did not run locally.

## References

- `docs/engineering/testing-standards.md`
- `.github/workflows/ci.yml`
- `apps/api/vitest.config.ts`
- `apps/web/playwright.config.ts`
