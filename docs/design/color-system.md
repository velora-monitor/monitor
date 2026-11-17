# Color system

Brand anchors are immutable. Supporting tokens may change only when a contrast problem requires it, and the change is recorded here and in `docs/design/tokens.css`.

| Token | Value | Role |
| --- | --- | --- |
| `--brand-charcoal` | `oklch(21.08% 0.00782 285.71)` / `#18181C` | Background |
| `--brand-violet` | `oklch(54.43% 0.25945 287.45)` / `#723BFA` | Primary action |
| `--brand-lime` | `oklch(89.60% 0.22671 125.54)` / `#B9F500` | Success and uptime |

Derived tokens and their jobs:

| Token | Value | Use |
| --- | --- | --- |
| `--foreground` | `oklch(97% 0.004 285.71)` | Primary text |
| `--secondary-foreground` | `oklch(84% 0.01 285.71)` | Secondary text |
| `--muted-foreground` | `oklch(74% 0.012 285.71)` | Meta text |
| `--surface` | `oklch(25.5% 0.0085 285.71)` | Card |
| `--surface-elevated` | `oklch(30% 0.009 285.71)` | Popover, secondary fill |
| `--border` | `oklch(58% 0.014 285.71)` | Input edges |
| `--primary-hover` | `oklch(55.5% 0.25 287.45)` | Hover fill |
| `--primary-active` | `oklch(50% 0.25945 287.45)` | Pressed fill |
| `--warning` | `oklch(84% 0.15 85)` | Warning text or icon on charcoal |
| `--destructive` | `oklch(72% 0.16 25)` | Error text or icon on charcoal |
| `--info` | `oklch(80% 0.1 230)` | Informational text or icon on charcoal |

Hover chroma is slightly below the brand chroma so the lighter fill stays inside the sRGB gamut. The brand violet token itself is unchanged.

## Contrast

Ratios below convert the declared OKLCH to sRGB with the CSS Color 4 OKLab matrices, then apply WCAG 2 relative luminance. Re-check in the browser when the tokens are applied. Small margins can shift with antialiasing.

| Pair | Ratio | Use |
| --- | --- | --- |
| Foreground on charcoal | 16.22:1 | Body text |
| Secondary text on charcoal | 10.82:1 | Secondary text |
| Muted text on charcoal | 7.66:1 | Meta text |
| Muted text on elevated surface | 5.91:1 | Meta text on cards |
| Foreground on violet | 5.17:1 | Primary button label |
| Foreground on hover violet | 4.89:1 | Hover label, keep at or above 4.5:1 |
| Foreground on active violet | 6.31:1 | Pressed label |
| Violet on charcoal | 3.14:1 | Fill, selection, focus ring. Fails normal text |
| Lime on charcoal | 13.59:1 | Status text or icon |
| Charcoal on lime | 13.59:1 | Text on a lime fill |
| Border on charcoal | 4.12:1 | Control edge |
| Border on elevated surface | 3.18:1 | Control edge on a card |
| Warning on charcoal | 10.74:1 | Warning text |
| Destructive on charcoal | 6.66:1 | Error text |
| Info on charcoal | 9.68:1 | Info text |

Warning, destructive, and info are light fills. Put charcoal text on those fills. Light text on those fills fails contrast.

Violet text on a charcoal background is reserved for large or bold display type only when a browser check still meets the large-text threshold. Default UI copy uses `--foreground` and the muted steps.

## Semantic mapping

- Success uses `--brand-lime` and charcoal as the on-fill text.
- Warning and error are the additional hues above. They are not recolored violet or lime.
- Focus uses `--ring`, which aliases brand violet.
- Chart 1 is violet, chart 2 is a cool neutral, chart 3 is lime for uptime, chart 4 is warning, chart 5 is destructive.

## Current stylesheet

Until a visual-system task lands, components keep using the semantic names already wired in `globals.css` (`bg-background`, `text-primary`, `text-destructive`). They do not add local hex. They also do not partially introduce lime or violet in one component while the rest of the app is still neutral.
