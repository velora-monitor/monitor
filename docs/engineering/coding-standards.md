# Coding standards

Language and layout conventions sit on top of the architecture in `docs/engineering/architecture.md`.

## General

- Match the surrounding module. A new API route follows `v1.ts`. A new Vue primitive follows `src/components/ui/button/`.
- Production TypeScript and Go ship without comments. Tests may use a name instead of a comment.
- EditorConfig sets UTF-8, LF, two-space indentation, a final newline, and trimmed whitespace. Go is the exception: gofmt owns indentation and uses tabs.
- Shared TypeScript compiler flags live in `packages/config/typescript/base.json`. Keep strict null checks, unchecked index access, and exact optional properties.
- Oxlint denies warnings and enables type-aware lint, including floating promises. Oxfmt formats TypeScript and Vue.
- Add a dependency only when an existing library cannot express the change. Shared versions belong in the pnpm catalog.

## TypeScript

- Use ESM `import` and `export`. Inside `apps/api` and `packages/contracts`, relative imports end in `.js`.
- Define a shared payload once, in `@velora/contracts`, and infer the type with `z.infer`.
- Prefer a narrow union (`"up" | "down"`) over a stringly status.
- At a boundary, accept `unknown` and parse it. Do not annotate a boundary value as `any`.

## Vue

- Script setup and TypeScript. Props are typed. Classes go through `cn`.
- Feature UI stays out of `components/ui/`. Those files are the design primitives.
- Server state lives in TanStack Query. Session and small UI flags live in Pinia.
- A view composes components. It does not reimplement the API client.

## Go

- Packages stay small: `checker`, `incident`, `schedule`, `store`, `pool`, `config`.
- Return errors. The incident package uses sentinel errors for an invalid threshold and an invalid status.
- Table tests already cover the transition function. Extend those tables when the transition rules change.
- `go tool staticcheck` is a module tool. Run it from `apps/worker`.

## API shape

Errors use `{ error, message, status }` from `apiErrorSchema`. Status codes in the helper are `400`, `401`, `404`, `429`, and `500`. A new code is added to that union and to the contract together.

Lists return arrays parsed by the contract. They do not return an envelope unless a new contract says so.
