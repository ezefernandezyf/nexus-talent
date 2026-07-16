# Route Cleanup Specification

## Purpose
Remove deprecated CV manager sub-routes and redirect old Analysis route to unified page.

## REMOVED Routes

| Route | Removed Component | Reason |
|-------|------------------|--------|
| `/app/cv/experience` | ExperienceManagerPage | Settings Accordion handles CRUD |
| `/app/cv/education` | EducationManagerPage | Settings Accordion handles CRUD |

### Requirement: Removed route returns 404
The system MUST return 404 for `/app/cv/experience` and `/app/cv/education`.

#### Scenario: User navigates to removed route
- GIVEN user navigates to `/app/cv/experience` or `/app/cv/education`
- WHEN React Router resolves the route
- THEN a 404 page renders

## ADDED Requirements

### Requirement: Analysis redirect
The system MUST redirect `/app/analysis` to `/app/cv`.

#### Scenario: User navigates to old analysis route
- GIVEN user visits `/app/analysis`
- WHEN React Router resolves the route
- THEN user is redirected to `/app/cv`

### Requirement: Nav consolidation
AppLayout navigation MUST show a single "CV" entry linking to `/app/cv`.

#### Scenario: Nav renders one entry
- GIVEN user is authenticated
- WHEN AppLayout renders nav
- THEN only one "CV" link is visible (no separate "Analysis" link)
