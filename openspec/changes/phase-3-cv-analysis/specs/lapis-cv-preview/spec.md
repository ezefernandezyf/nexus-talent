# Lapis CV Preview Specification

## Purpose
Restyle CVPreview from generic Card-based layout to a Lapis CV document aesthetic: A4-like proportions, serif headings, compact 9.5pt body, professional document look.

## Requirements

### Requirement: Lapis typography
The system MUST render CV preview with SourceHanSerifCN (headings), SourceHanSansCN (body), JetBrainsMono (links/code). Fonts MUST load from jsdelivr CDN (SIL OFL).

| Element | Font | Size | Weight |
|---------|------|------|--------|
| h1 (name) | SourceHanSerifCN | 14pt | 700 |
| h2 (section) | SourceHanSerifCN | 10.5pt | 600 |
| Body | SourceHanSansCN | 9.5pt | 400 |
| Links/code | JetBrainsMono | 9pt | 400 |
| Line height | — | 1.55 | — |

#### Scenario: CV preview renders with Lapis typography
- GIVEN CV generation succeeds
- WHEN CVPreview renders
- THEN headings use SourceHanSerifCN, body uses SourceHanSansCN, monospace elements use JetBrainsMono

#### Scenario: Font fallback
- GIVEN CDN fonts fail to load
- WHEN browser renders fallback
- THEN serif/sans-serif/monospace system fallbacks apply without layout breakage

### Requirement: Document-like layout
The system MUST render CV preview with 20mm padding, box-shadow on screen, and h2 sections separated by 1px solid bottom border.

#### Scenario: Layout renders
- GIVEN CV data with multiple sections
- WHEN CVPreview renders
- THEN h2 headings have a 1px solid bottom border
- AND container has 20mm padding with box-shadow

#### Scenario: Name centered
- GIVEN CV data includes a name
- WHEN CVPreview renders
- THEN the name is centered via h1

#### Scenario: Contact styled as blockquote
- GIVEN CV data includes contact info
- WHEN CVPreview renders
- THEN contact info renders in a styled blockquote element

### Requirement: Export fidelity
Export formats MUST preserve CV structure.

| Format | Behavior |
|--------|----------|
| MD    | Plain text structure, no inline CSS |
| HTML  | Inline Lapis CSS included in `<style>` |
| PDF   | react-pdf with closest available fonts |

#### Scenario: MD export preserves structure
- GIVEN CV preview rendered
- WHEN user exports as MD
- THEN sections, headings, and body text are preserved as plain markdown

#### Scenario: HTML export includes styles
- GIVEN CV preview rendered
- WHEN user exports as HTML
- THEN output includes inline Lapis CSS in a `<style>` block
