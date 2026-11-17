# Privacy

This document is an engineering checklist. It is not a privacy policy, and it does not claim that Velora Monitor meets a regulation. Counsel or the owner decides which duties apply.

## What exists today

- Accounts use Supabase email and password. The web app handles the email address and the access token.
- Monitor definitions store a name and a URL. Check results store status, HTTP status, latency, an error string, and a timestamp.
- Server logs store method, path, status, and duration.
- Sentry and Resend are optional and activate only with their secrets.
- No analytics script, marketing list, cookie banner, terms page, or privacy page is in the repository.

## When a feature collects personal data

Record what is collected, why, where it is stored, and how long it is kept. Monitor URLs can embed user identifiers or tokens. Treat stored URLs as sensitive. Strip credentials from URLs before persistence when a URL parser is added.

Do not log access tokens, passwords, or provider secrets. The request logger's field list stays small.

## Marketing and cookies

Marketing email needs a stored opt-in and a working unsubscribe before the first send. Transactional mail about an incident, if added through Resend, is separate and still includes a way to reach the account owner.

Non-essential analytics and tracking pixels load after the consent decision the owner requires. Essential session cookies, if Supabase uses them, are documented rather than bundled with advertising tags.

## AI, biometrics, and age

None of these are product features. If one is added:

- Disclose generated text where a reader could treat it as a measurement or an official incident report.
- Biometric unlock requires a platform API and an explicit consent step. Do not roll a custom biometric store.
- Age gates and children's data rules are a legal question. Flag them. Do not invent an age policy in code comments.

## DMCA and public content

The product does not host user-published media. A DMCA agent is a legal registration, not a footer string to fabricate. Raise it only if the product starts hosting content the public can post.

## Account deletion

A deletion path, when added, removes the Supabase user and relies on `on delete cascade` from `auth.users` to monitors, then from monitors to checks and incidents. Confirm that cascade in a test before calling deletion complete.
