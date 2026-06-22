# E2E Smoke Tests Specification

## Purpose
Defines Playwright end-to-end smoke tests for auth, analysis, and history flows. Tests MUST run against an ephemeral SQLite database with zero external dependencies.

## Requirements

### Requirement: Auth Flow Smoke Tests
The system MUST have Playwright smoke tests covering login, register, and logout flows end-to-end.

#### Scenario: Login smoke
- GIVEN a registered user exists in the ephemeral DB
- WHEN Playwright fills sign-in form and submits
- THEN the user is redirected to /app/analysis
- AND the auth session cookie is set

#### Scenario: Register smoke
- GIVEN a clean ephemeral DB
- WHEN Playwright fills sign-up form with valid credentials and submits
- THEN the user is redirected to /app/analysis
- AND the user can access a protected route

#### Scenario: Logout smoke
- GIVEN an authenticated session
- WHEN Playwright clicks the logout button
- THEN the session cookie is cleared
- AND the user is redirected to the sign-in page

### Requirement: Analysis Flow Smoke Tests
The system MUST have Playwright smoke tests covering the analysis submission and result view.

#### Scenario: Submit JD and view result
- GIVEN an authenticated user on /app/analysis
- WHEN Playwright pastes a job description and submits the form
- THEN a loading state is visible
- AND the analysis result renders with summary, skills, and outreach

#### Scenario: Empty JD blocked
- GIVEN an authenticated user on /app/analysis
- WHEN Playwright submits the form with empty text
- THEN submission is blocked
- AND a validation error is visible

### Requirement: History Flow Smoke Tests
The system MUST have Playwright smoke tests covering history list display and analysis deletion.

#### Scenario: View history list
- GIVEN a saved analysis exists in the ephemeral DB
- WHEN Playwright navigates to /app/history
- THEN the analysis card is visible with title and date

#### Scenario: Delete analysis from history
- GIVEN a saved analysis visible in the history list
- WHEN Playwright triggers delete on that item
- THEN the card is removed from the list
- AND the empty state is shown if it was the last item

### Requirement: Ephemeral SQLite Database
Tests MUST run against an ephemeral SQLite database. No external PostgreSQL or Supabase connection SHALL be required.

#### Scenario: Isolated test runs
- GIVEN the test suite starts
- WHEN Playwright initializes
- THEN the server uses `DATABASE_URL=file:./test.db` in SQLite mode
- AND the database is created fresh per run

### Requirement: Single Command Execution
All smoke tests MUST be runnable with a single command from the project root.

#### Scenario: Run all smokes
- GIVEN the project is installed (`pnpm install`)
- WHEN `pnpm --filter @nexus-talent/e2e test` runs
- THEN all auth, analysis, and history smoke tests execute
- AND a summary report is produced
