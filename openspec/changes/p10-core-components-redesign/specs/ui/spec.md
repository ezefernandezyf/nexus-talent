# Delta for UI

## ADDED Requirements

### Requirement: Tag Component
The system MUST provide a `<Tag>` component for labeling/categorization. Variants SHALL map to Apex semantic tokens. Tag MUST use `--radius-full` (pill shape), Geist font at `--text-label` size, and support an optional `onRemove` callback that renders an X icon.

#### Scenario: Tag renders with variant
- GIVEN `<Tag variant="info">React</Tag>`
- WHEN rendered
- THEN background uses `--color-info` at low opacity container variant
- AND text uses `--color-info` full saturation
- AND shape is pill (`--radius-full`)

#### Scenario: Tag with remove button
- GIVEN `<Tag onRemove={() => removeSkill("React")}>React</Tag>`
- WHEN rendered
- THEN an X icon from `@phosphor-icons/react` renders on the right
- AND clicking X calls `onRemove`

### Requirement: Status Indicator
The system MUST provide a `<Status>` component combining a colored dot with a label. Variants: success, warning, error, info, neutral. The dot SHALL render as an 8px circle using the semantic token. The label SHALL use Geist at `--text-caption` size.

#### Scenario: Status renders success indicator
- GIVEN `<Status variant="success">Active</Status>`
- WHEN rendered
- THEN an 8px circle in `--color-success` renders
- AND "Active" label renders beside it in Geist at caption size
- AND gap between dot and text is 0.5rem

## MODIFIED Requirements

### Requirement: Badge Component
The system MUST provide a `Badge` component supporting variant (info, success, warning, error) and size (sm, md) props, styled with Apex OKLCH design tokens. Badge SHALL use Geist font, `--radius-full` pill shape, uppercase tracking at `--text-label` size. The sm size renders at h-5, md at h-6.
(Previously: Badge used old Signal OKLCH tokens with Cabinet Grotesk font.)

#### Scenario: Badge renders with variant
- GIVEN `<Badge variant="success">Complete</Badge>`
- WHEN rendered in dark mode
- THEN background uses `--color-success` container variant
- AND text uses `--color-success` full saturation
- AND font is Geist not Cabinet Grotesk
- AND shape is pill (`--radius-full`)

#### Scenario: Badge renders in sm size
- GIVEN `<Badge size="sm" variant="warning">Pending</Badge>`
- WHEN rendered
- THEN height is 1.25rem (h-5)
- AND padding is px-2
- AND font size is `--text-label`
