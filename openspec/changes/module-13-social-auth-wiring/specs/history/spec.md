# Delta for History

## Exclusions
This change does not redesign history cards, introduce new history management flows, or move legacy files.

## ADDED Requirements

### Requirement: Clickable History Items
The system MUST open the full saved analysis when a history item is clicked and MUST not depend on `matchIndex` for that interaction.

#### Scenario: User opens a saved item
- GIVEN a saved analysis is visible in history
- WHEN the user clicks the card or row
- THEN the full analysis view MUST open for that item
- AND the interaction MUST resolve from stable analysis identity, not `matchIndex`

#### Scenario: `matchIndex` is absent
- GIVEN a history item has no `matchIndex`
- WHEN the user clicks the item
- THEN the same saved analysis MUST still open
- AND the UI MUST NOT block the interaction

### Requirement: History Export Action
The system MUST provide an export action for a saved analysis from the history view.

#### Scenario: Exporting a saved analysis
- GIVEN a saved analysis is visible in history
- WHEN the user triggers export for that item
- THEN the system MUST export the current analysis data
- AND the export MUST succeed without requiring `matchIndex`

#### Scenario: Export after metadata cleanup
- GIVEN the item no longer carries dead-weight metadata
- WHEN the user exports it
- THEN the export MUST still produce the same analysis content