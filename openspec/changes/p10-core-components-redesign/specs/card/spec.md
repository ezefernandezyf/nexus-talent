# Card Specification

## Purpose
Container component with 3 variants, header/body/footer slots, padding control. Apex surface tokens. No nested cards.

## Requirements

| ID | Requirement | Priority | RFC 2119 |
|----|------------|----------|----------|
| CRD-01 | Variants: flat (no shadow, `--color-outline` border), elevated (`--shadow-md` + `--color-surface-elevated-2`), interactive (elevated + hover shadow lift + cursor-pointer) | P0 | MUST |
| CRD-02 | Slots: `header`, `body`, `footer` via children or explicit props | P0 | MUST |
| CRD-03 | Padding: `padding` prop (sm=3, md=4, lg=6), maps to spacing tokens | P1 | SHOULD |
| CRD-04 | Dark/light: surfaces use elevation tokens, light via `html[data-theme="light"]` | P0 | MUST |
| CRD-05 | Radius: `--radius-md` (0.75rem) default, configurable via `rounded` prop | P1 | MAY |
| CRD-06 | Typography: header Switzer, body Geist, no em-dashes | P0 | MUST |
| CRD-07 | Interactive hover: shadow transitions to `--shadow-lg` + slight Y translate (-2px), 250ms `--ease-out-expo` | P1 | SHOULD |
| CRD-08 | Anti-pattern: no nested cards, no side-stripe borders | P0 | MUST |

### Scenario: Elevated card renders with shadow
- GIVEN `<Card variant="elevated"><CardBody>Content</CardBody></Card>`
- WHEN rendered in dark mode
- THEN background is `--color-surface-elevated-2`
- AND `--shadow-md` applies
- AND radius is `--radius-md`

### Scenario: Interactive card lifts on hover
- GIVEN `<Card variant="interactive">` with mouse over
- WHEN hover state activates
- THEN shadow transitions to `--shadow-lg`
- AND card translates Y: -2px over 250ms ease-out-expo
- AND cursor becomes pointer

### Scenario: Card with header, body, footer slots
- GIVEN `<Card><CardHeader>Title</CardHeader><CardBody>Text</CardBody><CardFooter>Actions</CardFooter></Card>`
- WHEN rendered
- THEN header renders first in Switzer, body in Geist, footer last
- AND sections are separated by spacing without nested cards
