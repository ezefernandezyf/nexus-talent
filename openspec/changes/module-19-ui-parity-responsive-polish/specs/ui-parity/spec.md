# Delta for UI Parity

## ADDED Requirements

### Requirement: Responsive Feature Page Layouts

The system MUST keep the active feature pages legible and balanced across mobile and desktop viewports.
The shared page shell, headers, and primary content blocks MUST preserve clear spacing, readable hierarchy, and usable action placement without introducing new behaviors.

#### Scenario: User opens a feature page on mobile
- GIVEN the user opens Analysis, History, or Settings on a narrow viewport
- WHEN the page renders
- THEN the primary content MUST remain in a single readable flow
- AND actions MUST remain accessible without overlapping the title or content

#### Scenario: User opens a feature page on desktop
- GIVEN the user opens Analysis, History, or Settings on a wide viewport
- WHEN the page renders
- THEN the content MUST keep stable spacing and hierarchy
- AND the shared wrapper MUST not introduce excessive gaps or crowding

### Requirement: Shared State Surfaces Stay Aligned

Loading, empty, and error states MUST preserve the page layout rhythm and remain readable on both mobile and desktop.

#### Scenario: An empty state is shown
- GIVEN the user has no items or results to display
- WHEN an empty state renders
- THEN the CTA and message MUST stay centered and readable
- AND the layout MUST remain consistent with the surrounding page shell

#### Scenario: A loading or error state is shown
- GIVEN a feature is fetching data or encounters an error
- WHEN the state surface renders
- THEN the message MUST remain readable without overlapping adjacent actions or cards
- AND the page MUST preserve its overall structure

## MODIFIED Requirements

### Requirement: Interactive Elements (Cristales y Luces)

The system MUST maintain the existing visual language for primary buttons, cards, and status indicators while preserving responsive behavior on narrow screens.
(Previously: The requirement focused on the visual treatment itself without explicitly constraining the responsive behavior of those surfaces.)

#### Scenario: Primary actions wrap on small screens
- GIVEN a feature page renders multiple action buttons
- WHEN the viewport is narrow
- THEN the action group MUST wrap or stack without clipping
- AND the buttons MUST remain readable and tappable

## Acceptance Criteria
- Shared wrappers and feature pages keep a clean mobile and desktop rhythm.
- Empty, loading, and action states remain readable and non-overlapping.
- No new feature behavior or navigation changes are introduced.