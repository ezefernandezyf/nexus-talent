# Delta for profile-editor

## REMOVED Requirements

### Requirement: ProfileEditorCard component

(Reason: Replaced by ContactSection + SkillsSection in the new Accordion-based SettingsFeature. The card-based profile form is split into two focused sections.)
(Migration: ProfileEditorCard component is not rendered. Editing moves to ContactSection and SkillsSection components.)

## MODIFIED Requirements

### Requirement: UX states

The SettingsFeature MUST still handle all four UX states: loading, empty, error, and populated. The skeleton/empty/error states apply to the Accordion container, not individual cards.

(Previously: UX states were per-card, specifically ProfileEditorCard.)

#### Scenario: Skeleton while loading

- GIVEN profile data is being fetched
- WHEN SettingsFeature renders
- THEN Accordion skeleton (pulsing bars) shows placeholder for all 7 sections

#### Scenario: Populated state

- GIVEN profile has skills, contact data, education, and experience
- WHEN SettingsFeature renders after loading
- THEN all 7 Accordion items show populated content
