# Input + Textarea Specification

## Purpose
Input and Textarea with states, icon slots, validation feedback. Apex tokens, Geist body, Switzer labels.

## Requirements

| ID | Requirement | Priority | RFC 2119 |
|----|------------|----------|----------|
| INP-01 | Components: `<Input>` (text, email, password) and `<Textarea>` (multiline) | P0 | MUST |
| INP-02 | States: default (`--color-outline` border), focus (2px brand ring), error (`--color-error` border + message), disabled (opacity-50) | P0 | MUST |
| INP-03 | Icons: prefix/suffix slots via `iconPrefix`/`iconSuffix` props, `@phosphor-icons/react` | P1 | SHOULD |
| INP-04 | Validation: error message below input via `error` prop, `aria-describedby` linking input to error | P0 | MUST |
| INP-05 | Labels: above input, Switzer medium, `htmlFor` association required | P0 | MUST |
| INP-06 | Dark/light: both modes via Apex tokens, placeholder uses `--color-on-surface-variant`, contrast ≥ 4.5:1 | P0 | MUST |
| INP-07 | Typography: body Geist 400, label Switzer 500, error Geist 400 text-sm | P0 | MUST |
| INP-08 | Height: Input h-10, Textarea min-h-24 with resize vertical | P1 | SHOULD |
| INP-09 | Border-radius: `--radius-md` (0.75rem) uniform | P1 | SHOULD |

### Scenario: Input with error shows validation feedback
- GIVEN `<Input label="Email" error="Invalid email format" />`
- WHEN rendered
- THEN border is `--color-error`
- AND error text renders below the input in Geist 400
- AND `aria-describedby` links input to error message

### Scenario: Focus-visible ring appears on keyboard Tab
- GIVEN user presses Tab into an Input
- WHEN focus lands
- THEN a 2px solid ring in `--color-brand` with 2px offset renders
- AND contrast against surface meets ≥4.5:1

### Scenario: Textarea resizes vertically
- GIVEN `<Textarea rows={4} />`
- WHEN user drags the resize handle
- THEN the element resizes vertically only
- AND minimum height is 6rem (24)
