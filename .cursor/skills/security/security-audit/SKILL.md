---
name: security-audit
description: Reviews Velora Monitor changes for injection, authentication, authorization, secrets, SSRF, rate limits, and payment integrity. Use when changing auth, queries, the worker HTTP client, environment variables, webhooks, or before a release.
icon: shield
color: red
---

# Security audit

## When to use

The diff touches auth, SQL, the HTTP checker, env vars, headers, webhooks, file paths, or a public endpoint. Also use it before a launch review.

## Workflow

1. Read `docs/security/security-standards.md` and the layer document that matches the diff.
2. Read the changed code. Prefer the code over the description of the change.
3. Walk the layers in `references/layers.md` that the diff actually touches. Skip a layer only by saying it is absent, as with billing today.
4. Run the secret scan from the repository root:

```sh
node .cursor/skills/security/security-audit/scripts/scan-secrets.mjs
```

5. For an ownership change, continue with the `tenant-isolation-audit` skill instead of duplicating its cases here.
6. Write the report. A finding cites the file and the missing control. Do not include exploit payloads or a working bypass.

## Report

```markdown
# Security audit
## Scope
## Findings
- Severity: blocker | required | note
- Evidence: path
- Missing control:
## Scan
## Layers not in the diff
## Owner decisions
```

`blocker` means a cross-owner read, a privileged key in the client, unsanitized HTML execution, or a query built by string concatenation. The known private-network gap in the HTTP checker is a `required` finding only when the change enables `PROBE_MODE=http` or presents the checker as production-ready. It is a standing gap otherwise, recorded in `docs/engineering/instruction-system.md`.

## Verification

Re-read the fixed lines. Re-run the secret scan after a secret-handling change. Run the API or worker tests that cover the control.

## References

- [Layer checklist](references/layers.md)
- `docs/security/security-standards.md`
- `docs/security/api-security.md`
- `docs/security/authentication-authorization.md`
- `docs/security/tenant-isolation.md`
