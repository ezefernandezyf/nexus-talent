# Delta for Analysis

## ADDED Requirements

### Requirement: Outreach Export Actions

The system MUST allow the user to export the editable outreach message produced by the analysis result view through shareable and downloadable formats.

#### Scenario: Open a draft email
- GIVEN a valid analysis result is on screen
- WHEN the user chooses the email export action
- THEN the system MUST open a draft email flow populated with the current edited subject and body
- AND the clipboard copy behavior MUST remain available as a fallback.

#### Scenario: Download outreach as markdown or JSON
- GIVEN a valid analysis result is on screen
- WHEN the user chooses to export the outreach
- THEN the system MUST allow downloading the outreach content in a reusable format
- AND the exported content MUST reflect the latest edited subject and body.

#### Scenario: Export remains available when a browser blocks a share path
- GIVEN the user attempts an export in a browser that does not support the preferred handoff
- WHEN the export action cannot complete directly
- THEN the system MUST present a fallback path that still lets the user copy the outreach content
- AND the user MUST receive clear feedback that the export path was not completed.

### Requirement: Preserve Existing Clipboard Copy Behavior

The system MUST keep the current clipboard copy action working as the fallback path for outreach sharing.

#### Scenario: Clipboard copy still works after export actions are added
- GIVEN a valid analysis result with edited outreach content
- WHEN the user clicks the copy action
- THEN the system MUST copy the latest edited subject and body to the clipboard
- AND the new export actions MUST not break the existing copy feedback state.