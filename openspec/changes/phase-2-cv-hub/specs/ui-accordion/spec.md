# ui-accordion Specification

## Purpose

Reusable single-expand accordion component with CSS grid animation and ARIA compliance.

## Requirements

### Requirement: Single-expand accordion with ARIA

The Accordion component MUST support composition via `Accordion.Root`, `Accordion.Item`, `Accordion.Trigger`, `Accordion.Content`. Only one Item SHALL be open at a time. The open Item MUST close when another Trigger is activated.

| ID | Requirement |
|----|-------------|
| REQ-ACC-001 | `Accordion.Root` manages single-expand state via controlled `activeId` |
| REQ-ACC-002 | Content height animation MUST use `grid-template-rows: 0fr ↔ 1fr` with CSS transition |
| REQ-ACC-003 | Trigger MUST set `aria-expanded`, `aria-controls` linking to Content `id` |
| REQ-ACC-004 | Content MUST use `role="region"` with `aria-labelledby` linking to Trigger `id` |
| REQ-ACC-005 | `Accordion.Root` MUST accept optional `defaultOpen` to set initial open Item |

#### Scenario: Expand collapses sibling

- GIVEN Item A is open and Item B is collapsed
- WHEN user clicks Item B Trigger
- THEN Item A collapses (grid-template-rows transitions to 0fr), Item B expands (1fr)

#### Scenario: Spam-click same trigger toggles

- GIVEN Item A is collapsed
- WHEN user clicks Item A Trigger twice rapidly
- THEN Item A expands on first click, collapses on second; no visual glitch

#### Scenario: Keyboard navigation

- GIVEN focus is on Trigger A
- WHEN user presses Enter or Space key
- THEN the section expands; aria-expanded updates; sibling collapses

#### Scenario: Default open section

- GIVEN `Accordion.Root defaultOpen="account"`
- WHEN the component mounts
- THEN the Item with `id="account"` is open; all others collapsed
