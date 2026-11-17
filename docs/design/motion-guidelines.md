# Motion guidelines

Animation shows where an object came from, what changed, and whether an action was accepted. If removing the animation loses no information, remove the animation.

Tokens in `docs/design/tokens.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--duration-enter` | `200ms` | Entrances |
| `--duration-exit` | `160ms` | Exits, about 20% shorter |
| `--duration-menu` | `200ms` | Menus, inside the 150–250ms band |
| `--duration-stagger` | `30ms` | Delay between related rows |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances |
| `--ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)` | Position changes |
| `--scale-press` | `0.97` | Pressed control |
| `--scale-popover` | `0.95` | Popover start scale |

## Behavior

- Ease-out for entrances. Ease-in-out when an element moves from one place to another.
- A popover or menu enters from the trigger and leaves toward the trigger.
- Overlap the outgoing and incoming state when a shared region changes, instead of leaving a blank gap.
- A success pulse may play once on the control that succeeded. It does not loop.
- A knob or switch thumb may stretch about 12% along its travel, then settle.
- Secondary detail can follow the main element by one stagger step.
- Movement that represents a physical object can arc. UI panels travel on a short, direct path.
- Color and reveal transitions may use a mask or a short crossfade. Icon swaps can add a few pixels of blur during the crossfade.
- Rubber-banding past a scroll boundary belongs to the platform. Do not add a custom bounce to ordinary panels.
- Shared-element transitions reuse one layout identifier for the list item and the detail.

## Principles behind the numbers

Squash, stretch, anticipation, and follow-through show up in the press scale, the knob stretch, and the stagger. They stay small. Staging means one element moves first and the rest follow. Pose-to-pose means the start and end states are designed, and the tween only connects them. Exaggeration is limited to success feedback.

Everyday UI does not bounce. An element under an active pointer is positioned directly. It is not eased on every move event.

## Constraints

- `prefers-reduced-motion: reduce` sets durations to 0ms and removes the scale change.
- Transitions are interruptible. A second click reverses or retargets the current transition.
- Prefer `transform` and `opacity`. Width, height, and top animations on a chart or a long list are avoided.
- Motion does not block input. The control remains hittable.
- A large dataset does not stagger hundreds of rows. Stagger the first screenful, then render the rest settled.
- `tw-animate-css` is already a dependency. Use it for the standard enter and exit utilities. Add a custom keyframe only when those utilities cannot express the transition.

## Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Put that block in `globals.css` during the visual-system task. Until then, a new animation in a component still checks the media query itself.
