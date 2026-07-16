# Empty Section Filtering Specification

## Purpose
Filter CV sections with no content from preview and export to produce a cleaner, more professional document.

## Requirements

### Requirement: Filter empty sections before render
The system MUST omit any CV section whose body is empty, null, or whitespace-only from preview and export.

| Section | Condition | Action |
|---------|-----------|--------|
| Any | Body empty/null/whitespace | Section hidden in preview and export |

#### Scenario: Education section empty → hidden
- GIVEN user has no education data in Settings
- WHEN CV generates with empty Education body
- THEN Education heading and body are not rendered in preview

#### Scenario: Experience section empty → hidden
- GIVEN user has no experience data in Settings
- WHEN CV generates with empty Experience body
- THEN Experience heading and body are not rendered in preview

#### Scenario: All sections have data → all rendered
- GIVEN every CV section has non-empty body
- WHEN CV preview renders
- THEN all sections are visible

#### Scenario: Ad-hoc items preserve explicit content
- GIVEN user adds ad-hoc items with content
- WHEN CV renders
- THEN ad-hoc items render even if core sections are hidden

### Requirement: Empty sections excluded from export
The system MUST apply the same filtering to MD, HTML, and PDF exports.

#### Scenario: MD export omits empty sections
- GIVEN Education is empty
- WHEN user exports CV as MD
- THEN Education section is absent from the markdown output

#### Scenario: HTML export omits empty sections
- GIVEN Education is empty
- WHEN user exports CV as HTML
- THEN Education section is absent from the HTML output
