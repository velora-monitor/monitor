---
name: animation-review
description: Audits Velora Monitor transitions for timing, origin, reduced motion, and compositor-friendly properties. Use when adding animation, reviewing motion, or changing dialogs, menus, and press states.
icon: code
color: magenta
---

# Animation review

## When to use

A change adds or edits a transition, keyframe, enter/leave class, or dialog motion, or the user asked for a motion review.

## Workflow

1. Read `docs/design/motion-guidelines.md` and the tokens in `docs/design/tokens.css`.
2. For each animation, name the information it carries (origin, press, success, or presence). Remove it when the answer is none.
3. Check durations against `--duration-enter` (200ms), `--duration-exit` (160ms), and the 150–250ms menu band.
4. Check that popovers start near scale 0.95 from the trigger and that press scale is about 0.97.
5. Check the animated properties. `transform` and `opacity` are the default. Layout properties on a list or chart are a finding.
6. Confirm the animation can be interrupted and that `prefers-reduced-motion` disables it.
7. Confirm a stagger is about 30ms and does not run for every row of a long history.

## Report

Cite the component, the property, the duration, and the replacement. A bounce on ordinary UI is a required fix.

## Verification

Toggle reduced motion and repeat the interaction. Confirm focus and clicks work during the transition.

## References

- `docs/design/motion-guidelines.md`
- `docs/design/tokens.css`
