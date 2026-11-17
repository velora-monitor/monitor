# Accessibility

Accessibility is part of the definition of done for a screen. The short rule is `.cursor/rules/accessibility.mdc`.

## Structure

- Use `button`, `a`, `form`, `label`, `input`, `table`, and heading elements for those roles.
- One `h1` per view. The next headings step down without skipping a level to change the font size. Size comes from the type scale in `docs/design/typography.md`.
- A clickable card that navigates is a link. A control that acts is a button.
- ARIA mirrors a real gap. It does not replace the element that already had the semantics.

## Keyboard and focus

- Tab order follows the visual order.
- `:focus-visible` uses the ring token. A `outline-none` class is paired with the ring, which the button primitive already does.
- Dialogs trap focus, restore it to the trigger, and close on Escape. Reka UI dialogs are the default tool when a dialog is added.
- Menus are operable with arrow keys when they are menus. A disclosure that only needs Enter can be a button.
- A drag gesture has a keyboard equivalent.

## Forms and errors

- Every input has a label. Placeholder text is not the label.
- The error is tied to the field with `aria-describedby` or the Reka/vee-validate wiring, and it is text.
- A failed submit moves focus to the first invalid field or the error summary.

## Status, charts, and motion

- Status color is paired with the display word from `docs/product/observability-domain.md`.
- A chart has a textual summary or a table alternative for the same numbers.
- Loading regions use `aria-busy` or visible text. A skeleton is not the only indication.
- Reduced motion is specified in `docs/design/motion-guidelines.md`.

## Contrast and targets

Follow the ratios in `docs/design/color-system.md`. Body text stays at or above 4.5:1. Control edges and focus rings stay at or above 3:1.

Pointer targets are at least 24 by 24 CSS pixels. The current default button is 36px tall (`h-9`). A primary touch action can use the `lg` size when the phone layout needs a larger target. Leave the primitive sizes alone unless the task is the button component.

## Verification

For a changed flow: keyboard only, one screen reader pass on the platform you have, a 200% zoom check, and the contrast pairs the colors actually use. Playwright can assert roles, names, and focus. Record what you could not run.
