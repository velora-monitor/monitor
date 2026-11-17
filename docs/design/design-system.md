# Design system

Velora Monitor looks technical, quiet, and precise. Charcoal carries the room, violet marks the action, and lime marks a positive monitoring state. Decoration does not substitute for hierarchy.

The canonical tokens are `docs/design/tokens.css`. They are a specification. `apps/web/src/styles/globals.css` still holds the stock shadcn neutral theme. Apply the specification only in a visual-system task, by copying semantic values into `globals.css` and appending the extra `@theme inline` color mappings. Leave the three brand `oklch()` arguments character-for-character intact.

## Composition

Charcoal is the large field: page background and primary regions. Violet is about the interactive layer: primary buttons, selected navigation, focus. Lime is the small accent: an uptime mark or a confirmed positive state. Those shares describe the product overall. A single component does not need to contain all three.

Surfaces step slightly above the background (`--surface`, then `--surface-elevated`). Cards sit on that step. They do not each grow a border to prove they are separate. Space and type do that work. Use `--border` on inputs and other controls that need a 3:1 edge.

## Theme

The specified theme is dark. The current stylesheet's light `:root` is the discrepancy recorded in `docs/engineering/instruction-system.md`. Do not invent a second light palette in a component.

## Components

Reuse `src/components/ui`. Variants stay in `class-variance-authority` definitions. A feature screen composes those primitives.

The `Badge` primitive exists. Use it when a status word needs a compact accessible treatment. Skip it as decoration on ordinary labels.

Radius stays on the existing scale, anchored at `0.625rem`. Corners stay modest. Superellipse and pill-shaped controls are out, except a round status dot that is functionally a dot.

## Exclusions

Skip decorative tags, eyebrows, pre-headings, numbered page sections, code-style breadcrumbs, all-caps subtitles, trailing periods on headings, negative letter-spacing, italic display type, serif display type, gradient page backgrounds, dithering, ASCII art, excessive dividers, arbitrary opacity, and monospace used as a costume. Monospace is for identifiers, tokens, and code.

Background texture is optional. Speckled graphite fits the charcoal field when a surface needs depth. Add a texture only when the layout already works without it. The inspiration list in the product brief (felt, fluted glass, grids, grain, contour lines, and the rest) is a palette of ideas, not a backlog.

## Implementation notes

- Semantic classes (`bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`) are the component API.
- A new color is added to `tokens.css` first, with a contrast check, and then to `globals.css` in the same visual task.
- Charts use `--chart-1` through `--chart-5`. Lime is the uptime series, not the default series.

Color, type, motion, and interaction each have their own document in this directory.
