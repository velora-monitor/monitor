# Responsive design

Layouts are designed for a 320px-wide phone, a 768px tablet, and a desktop window. The desktop picture is not the specification.

## Page

- The document does not scroll horizontally. A data table or a chart may scroll inside its region.
- Padding accounts for `env(safe-area-inset-*)` on fixed headers, sheets, and bottom actions.
- The shell navigation remains usable when it no longer fits. Add a compact menu when a new destination would overflow. The current shell is minimal. A new primary destination includes that compact path in the same change.
- Content is not clipped by a fixed `overflow: hidden` ancestor.

## Interaction

- Hover does not hide the only path to an action. A tooltip repeats, it does not replace, the control's name.
- Inputs are at least 16px text where the platform would otherwise zoom on focus, or the viewport is configured so focus does not cause a jump.
- Modals that exceed the viewport become scrollable sheets. The close control stays reachable.

## Data

- Tables collapse to stacked rows or a horizontal region with a visible scroll cue.
- Charts keep their aspect inside the column. Axis labels remain readable or move to a summary.
- Metrics stack. They do not overflow into the next card.

## Type

The type scale in `docs/design/typography.md` can step up at `md` and `lg` breakpoints. It does not jump by an unrelated set of sizes. Line length stays comfortable on desktop by constraining the reading column, not by stretching the paragraph across the monitor.

## Checks

At 320px, 768px, and a desktop width: no horizontal page scroll, no overlapping controls, a reachable navigation path, and a visible primary action. The `responsive-audit` skill is the procedure.
