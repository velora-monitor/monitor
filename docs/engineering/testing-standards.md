# Testing standards

The required gate is the CI workflow in `.github/workflows/ci.yml`.

From the repository root:

```sh
pnpm exec turbo run lint typecheck test build
pnpm test:e2e
```

From `apps/worker`:

```sh
gofmt -l .
go vet ./...
go tool staticcheck ./...
go test ./...
```

Run the narrowest command while iterating, then the gate that the change can affect before finishing.

## What to test

Prioritize, in order:

1. Incident transitions in `incident.Apply` and `planCheck`.
2. Authorization. A missing token, a bad token, and a second owner.
3. Contract validation. A bad query fails with `invalid_request`.
4. Row ownership in store queries.
5. Health behavior when the database is configured and when it is not.
6. Web session routing and the API client's contract parse.

A test names the condition and the result, for example `down streak below threshold stays closed`. It builds its own fixture. It does not depend on another test's insert.

## Where tests live

- API unit tests sit next to the module and use Vitest.
- Web unit tests match `src/**/*.test.ts` and run in Vitest's Node environment.
- Browser smoke lives in `apps/web/e2e` and uses Playwright.
- Worker tests use `*_test.go` beside the package. The in-memory store covers behavior that does not need Postgres.

## What not to add

- A snapshot of markup with no assertion about behavior.
- A test that mocks the function it claims to verify.
- A coverage-only case that cannot fail for a user-visible reason.
- A live network probe in CI. Probe mode stays off in the default test environment.

## Security and domain cases

A change to queries, policies, or worker persistence includes a cross-owner denial. A change to check handling includes a case where the measurement fails and the stored status remains `down`. A change to incident opening includes the failure threshold and the single-open-incident rule.
