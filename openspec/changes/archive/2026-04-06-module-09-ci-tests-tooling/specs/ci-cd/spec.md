# Delta for CI/CD

## ADDED Requirements

### Requirement: Type validation gates CI
The system MUST fail the CI workflow when `npm run typecheck` fails.

#### Scenario: Type errors block the workflow
- GIVEN a pull request or push reaches CI
- WHEN `npm run typecheck` reports an error
- THEN the workflow MUST fail
- AND the change MUST not be treated as passing validation.

#### Scenario: Clean types allow validation to continue
- GIVEN the repository has no TypeScript errors
- WHEN CI runs `npm run typecheck`
- THEN the workflow SHOULD continue to the next validation step.

### Requirement: Test execution gates CI
The system MUST fail the CI workflow when `npm run test` fails.

#### Scenario: Failing tests block merge readiness
- GIVEN the test suite has a failing spec
- WHEN CI runs `npm run test`
- THEN the workflow MUST fail
- AND the failing tests MUST be visible in the check output.

#### Scenario: Passing tests keep validation moving
- GIVEN the test suite passes
- WHEN CI runs `npm run test`
- THEN the workflow MUST continue toward the remaining validation steps.

### Requirement: Coverage is visible for critical modules
The system MUST report coverage for the repository's critical analysis and library modules in CI.

#### Scenario: Coverage is generated on successful validation
- GIVEN the targeted test suite passes
- WHEN the coverage job runs
- THEN the workflow MUST publish coverage results for the critical modules.

#### Scenario: Coverage regressions are visible
- GIVEN a critical module falls below its expected coverage target
- WHEN CI runs the coverage job
- THEN the report MUST show the regression clearly.

### Requirement: Shared test utilities are available
The repository MUST provide shared test utilities for repeated analysis and library test setup.

#### Scenario: A test reuses common setup
- GIVEN a new test needs standard browser or API mocks
- WHEN the test is written
- THEN the shared utilities MUST make the setup reusable across files.

#### Scenario: Common setup remains consistent
- GIVEN multiple tests use the shared utilities
- WHEN they run in CI
- THEN they MUST behave consistently across suites.

## MODIFIED Requirements

### Requirement: Run validation on pull requests and main pushes
The system MUST run install, typecheck, test, and build on every pull request and every push to `main`, in that order.
(Previously: install, test, typecheck, and build on every pull request and every push to `main`.)

#### Scenario: PR validation succeeds
- GIVEN a pull request is opened
- WHEN the workflow runs
- THEN the workflow MUST execute `npm ci`, `npm run typecheck`, `npm run test`, and `npm run build` in that order.

#### Scenario: Typecheck failure stops later steps
- GIVEN `npm run typecheck` fails during validation
- WHEN the workflow runs
- THEN `npm run test` and `npm run build` MUST not be treated as successful validation for that run.