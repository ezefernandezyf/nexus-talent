# settings-cv-hub Specification

## Purpose

Transform Settings into a CV Hub: Accordion-based layout with 7 sections covering account, appearance, data, contact, skills, experience, and education — fully editable inline.

## Requirements

### Requirement: Accordion-based SettingsFeature layout

SettingsFeature MUST render 7 Accordion Items: Account (01), Appearance (02), Data (03), Contact, Skills, Experience, Education. ProfileEditorCard SHALL NOT be rendered. Account/Appearance/Data MUST retain their current content unchanged.

| ID | Requirement |
|----|-------------|
| REQ-CVH-001 | Account (01) — opened by default |
| REQ-CVH-002 | Appearance (02), Data (03) — keep existing UI |
| REQ-CVH-003 | ProfileEditorCard is NOT in the DOM |
| REQ-CVH-004 | Accordion Items render in order: 01, 02, 03, Contact, Skills, Experience, Education |

#### Scenario: All sections render

- GIVEN authenticated user navigates to Settings
- WHEN the page loads
- THEN 7 Accordion Items render; Account section is open by default; ProfileEditorCard is absent

### Requirement: ContactSection

MUST render a 5-field form: email (readonly), phone, portfolioUrl, linkedinUrl, githubUrl. Saves via `useSettings().saveProfile` using `profileUpdateSchema`.

| ID | Requirement |
|----|-------------|
| REQ-CVH-005 | Email rendered as readonly text from auth context |
| REQ-CVH-006 | All 5 fields use `useForm` with `zodResolver(profileUpdateSchema)` |
| REQ-CVH-007 | Save button triggers `saveProfile`; pending/error/success states handled |

#### Scenario: Load with existing data

- GIVEN profile has phone, linkedinUrl, githubUrl filled
- WHEN ContactSection renders
- THEN all 5 fields show existing values; email readonly

#### Scenario: Clear optional fields

- GIVEN user clears phone and portfolioUrl inputs
- WHEN user clicks Save
- THEN PUT body includes `phone: undefined`, `portfolioUrl: undefined`; fields become null

### Requirement: SkillsSection

MUST provide comma-separated input. On display, skills MUST be parsed by comma into visual Tag components each with `onRemove`. On save, skills MUST be rejoined as comma-separated string.

| ID | Requirement |
|----|-------------|
| REQ-CVH-008 | Input accepts comma-separated text (e.g., "React, TypeScript") |
| REQ-CVH-009 | Tags render below input; each Tag has remove button |
| REQ-CVH-010 | Removing a Tag removes it from the visual list; save rejoins remaining |

#### Scenario: Add skills → 3 tags

- GIVEN skills input is empty
- WHEN user types "React, TypeScript, Node"
- THEN 3 Tags render below input: React, TypeScript, Node

#### Scenario: Remove a tag

- GIVEN tags: React, TypeScript, Node
- WHEN user clicks remove on "TypeScript"
- THEN Tags show React, Node; on save, `skills: "React, Node"`

#### Scenario: Empty skills

- GIVEN `skills` is null or empty
- WHEN SkillsSection renders
- THEN input is empty; no Tags rendered

### Requirement: ExperienceSection (inline CRUD)

MUST reuse `useExperience()` hook. SHALL render experience list with inline Create/Edit/Delete. Each item displays: role, company, description, location, startDate–endDate. Delete MUST show confirmation.

| ID | Requirement |
|----|-------------|
| REQ-CVH-011 | List fetched via `useExperience().data` |
| REQ-CVH-012 | Inline form expands when Add or Edit is clicked |
| REQ-CVH-013 | Create/Update call `createMutation`/`updateMutation`; invalidates query on success |
| REQ-CVH-014 | Delete triggers confirmation dialog; calls `deleteMutation` on confirm |
| REQ-CVH-015 | Help text at top; date format tooltips on startDate/endDate fields |

#### Scenario: Create experience

- GIVEN user clicks "Add Experience"
- WHEN user fills role, company, startDate and clicks Save
- THEN `createMutation` is called; list refreshes; form collapses

#### Scenario: Delete with confirmation

- GIVEN one experience item exists
- WHEN user clicks Delete icon
- THEN confirmation prompt appears; on confirm, item removed from list

#### Scenario: Empty state

- GIVEN no experience records exist
- WHEN ExperienceSection renders
- THEN message "No experience yet" and Add button visible

### Requirement: EducationSection (inline CRUD)

MUST reuse `useEducation()` hook. Same inline CRUD pattern as ExperienceSection. Each item displays: institution, degree, field, startDate–endDate.

| ID | Requirement |
|----|-------------|
| REQ-CVH-016 | List fetched via `useEducation().data` |
| REQ-CVH-017 | Inline form with fields: institution, degree, field, startDate, endDate |
| REQ-CVH-018 | Create/Update/Delete via mutations; query invalidated on success |

#### Scenario: Create education

- GIVEN user clicks "Add Education"
- WHEN user fills institution, degree, startDate and clicks Save
- THEN item added; list refreshes

#### Scenario: Empty state

- GIVEN no education records
- WHEN EducationSection renders
- THEN empty state message shown; Add button available
