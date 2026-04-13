# UI Parity Specification

## Purpose

Systematically close the visual gap to achieve strict parity with the `DESIGN.md` guidelines and visual assets for the Nexus Talent application without introducing new features. This covers layout, elevation, typography, and interactive states.

## Requirements

### Requirement: Foundation Alignment (Deep Space & No-Line)

The system MUST implement the "Deep Space" color palette and surface elevations (`surface-container-lowest` to `highest`) without using pure black. The system MUST NOT use 1px solid borders to separate content, relying instead on surface contrast or 15% opacity "Ghost Borders" (`outline_variant`).

#### Scenario: Rendering App Background and Containers
- GIVEN the application is loaded
- WHEN rendering the main layout and content cards
- THEN no element uses pure black (`#000000`) for surfaces or shadows
- AND content separation is achieved via `surface-container` background differences or `outline_variant` at 15% opacity
- AND no solid 1px borders are present on main structural containers.

### Requirement: Typography Hierarchy

The system MUST use Inter for general hierarchy and UI elements, and Space Grotesk exclusively for labels, technical tags, and data points.

#### Scenario: Displaying a Job Match Score
- GIVEN a job analysis result with technical skills and a match score
- WHEN the user views the result card
- THEN the body text and headings use the Inter font family
- AND the score numbers and skill tags (e.g., "React", "TypeScript") use the Space Grotesk font family.

### Requirement: Interactive Elements (Cristales y Luces)

The system MUST implement "Cristales y Luces" styles for interactive elements. Primary buttons MUST have light gradients. Modals MUST use glassmorphism (`surface_variant` at 60% opacity with a 24px background blur). Status indicators MUST use a "Glow Pulse" effect rather than flat solid badges.

#### Scenario: Opening a Modal Dialog
- GIVEN the user is on any feature screen
- WHEN the user triggers an action that opens a modal
- THEN the modal backdrop and surface apply a 60% opacity `surface_variant` with 24px blur
- AND any primary action button inside uses the defined gradient style
- AND dropshadows are tinted, not purely black.

### Requirement: State Feedback (Loading, Success, Error, Empty)

All asynchronous processes MUST have an associated UI state (Loading, Success, Error, Empty) that strictly adheres to the visual design system.

#### Scenario: Submitting a Job Description for Analysis
- GIVEN the user pastes a job description and clicks "Analyze"
- WHEN the request is in flight
- THEN a visual loading state with the defined "Glow Pulse" or skeleton loader is displayed
- WHEN the request fails
- THEN an error state is displayed using the corresponding error surface elevations and typography
- AND the feedback does not break the layout structure.

### Requirement: Performance and Accessibility (Lighthouse)

The application MUST maintain high performance and accessibility standards, achieving a 95+ score on Lighthouse for Performance, Accessibility, and Best Practices.

#### Scenario: Auditing a Core Feature Page
- GIVEN the development build or production deployment
- WHEN running a Lighthouse audit on the Analysis or History features
- THEN the score for Performance is >= 95
- AND Accessibility is >= 95
- AND Best Practices is >= 95.