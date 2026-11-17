# Typography

Velora Monitor uses a modern sans for every interface role. The specified stack is `ui-sans-serif, system-ui, sans-serif`, stored as `--font-sans`. No webfont is installed. Adding one requires an owner decision about license, loading, and the privacy of the font host.

Monospace is `ui-monospace, monospace`, stored as `--font-mono`. Use it for a monitor URL, an identifier, or a code sample. Headings, navigation, and paragraphs stay in the sans stack.

## Scale

Use the Tailwind scale that already matches the UI primitives. Do not add a second size system.

| Role | Classes | Notes |
| --- | --- | --- |
| Page title | `text-2xl font-semibold` | One per view |
| Section title | `text-lg font-semibold` | Groups a region |
| Body | `text-sm leading-6` | Default reading size in the app |
| Label | `text-sm font-medium` | Forms and axes |
| Meta | `text-sm text-muted-foreground` | Timestamps and hints |
| Metric | `text-2xl font-semibold tabular-nums` | Uptime, latency, counts |

Weights in normal use are 400, 500, and 600. A screen does not run through every weight.

## Rules

- Letter-spacing stays at `tracking-normal`. `tracking-tight` and `tracking-tighter` are negative and are excluded.
- Headings and titles have no trailing period.
- Subtitles are sentence case or title case. They are not set in all capitals.
- Italics are for a citation or a required foreign phrase, not for eyebrows or labels.
- Numbers that a person compares, including latency and percentages, use `tabular-nums`.
- Line length for a paragraph stays near 60–75 characters. Dashboard regions can be narrower when the content is a metric.

## Hierarchy

One `h1` names the view. Section titles step down from there. A card title is not visually louder than the page title. Status is a word plus a semantic color, set in the body size, so it can be read without the color.
