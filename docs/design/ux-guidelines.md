# UX guidelines

The interface favors a short path, a clear state, and a predictable control. These principles decide conflicts. They are not a feature list.

- Fitts's Law: the frequent action is large and close. Primary actions in a view share one region.
- Hick's Law: a view offers the decision the task needs. Secondary actions stay in a menu.
- Miller's Law: a status summary shows a few figures, then the detail. A dashboard is not a wall of equal cards.
- Doherty Threshold: show a response inside a fraction of a second. A skeleton counts. A frozen control does not.
- Postel's Law: accept flexible input (trimmed URLs, either casing where the domain is case-insensitive) and store a canonical value.
- Jakob's Law: sign-in, navigation, dialogs, and destructive confirmation behave the way the rest of the web behaves.
- Frequency: monitor status and incident history are the high-frequency surfaces. Settings and account recovery are not.

## Feedback

Every action that changes data ends in success text, an error message, or a still-running indicator. Empty lists use the `Empty` primitives and name the next action.

Loading uses a skeleton that matches the loaded layout. Charts reserve their box.

Destructive monitor deletion, once it exists, asks for confirmation. Undo is appropriate for a reversible local dismissal. Undo is the wrong tool for a security or billing change.

## Optimistic updates

A view may show a reversible UI preference immediately. It waits for the server before showing success for:

- Sign-in, sign-out, and account recovery
- Creating, deleting, or transferring a monitor
- Incident open or resolve
- Any future payment, plan, or entitlement change

## Patterns to select from

Use a pattern when the interaction needs it.

- Skeleton loaders for lists and charts
- Command menu when destinations no longer fit the nav
- Shortcut hints when a shortcut exists
- Stale-while-revalidate for monitor lists once a cache policy is chosen
- BlurHash or a reserved box for remote images
- View transitions for shared elements between a list and a detail
- Swipe-to-dismiss only for a sheet that already has a close control
- Interruptible animation, from the motion guide
- Safe-area padding on fixed mobile bars
- OTP autofill attributes if an OTP field is added
- Idempotency keys on any future mutation that charges or notifies
- Tabular numbers on metrics

Amazon's safe triangle is a reminder about attention: the pointer's likely next target stays easy to hit, and a menu does not close while the pointer travels toward it. It is not a component to build by name.

## State language

User-visible monitor status uses the display names in `docs/product/observability-domain.md`. Persisted values stay in the API and the database.
