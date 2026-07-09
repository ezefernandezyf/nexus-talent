# profile-editor Specification

## Purpose

Profile card form in Settings using React Hook Form + Zod resolver.

## Requirements

### Requirement: ProfileEditorCard component

The Settings page MUST render a ProfileEditorCard as its 4th card after Account, Appearance, Data. The form MUST use `useForm` with `zodResolver(profileUpdateSchema)`.

#### Scenario: Form renders all 7 fields
- GIVEN the user navigates to Settings
- WHEN the Profile card loads
- THEN Input fields for skills, experienceLevel, roleTitle, resumeLink, linkedinUrl, githubUrl, location are rendered using existing Input/Label primitives

#### Scenario: Successful save
- GIVEN user fills skills: "React, Node.js" and roleTitle: "Full-Stack Developer"
- WHEN user clicks Save
- THEN PUT `/api/profile` is called; button shows loading state; on success shows toast; form values persist

#### Scenario: Validation error
- GIVEN user enters `linkedinUrl: "invalid"`
- WHEN user clicks Save
- THEN client-side Zod validation triggers; error message appears below the field; no API call is made

#### Scenario: Save failure
- GIVEN server returns 500
- WHEN user clicks Save
- THEN error toast is displayed; form data is preserved; retry is possible

### Requirement: UX states

The ProfileEditorCard MUST handle all four UX states: loading, empty, error, and populated.

#### Scenario: Skeleton while loading
- GIVEN profile data is being fetched
- WHEN the card renders
- THEN skeleton placeholders (pulsing gray bars) are shown for each input

#### Scenario: Empty state
- GIVEN no profile data exists (all fields null)
- WHEN the card renders after loading
- THEN all inputs are empty; placeholder text guides the user

#### Scenario: Populated state
- GIVEN profile has `skills: "Python"` and `experienceLevel: "5+ años"`
- WHEN the card renders
- THEN inputs are pre-filled with existing values
