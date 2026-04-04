# CI/CD Specification

## Purpose

Define the repository automation that validates every change and keeps the main branch deployable to Vercel.

## Requirements

### Requirement: Run validation on pull requests and main pushes
The system MUST run install, test, typecheck, and build on every pull request and every push to `main`.

#### Scenario: PR validation succeeds
- GIVEN a pull request is opened
- WHEN the workflow runs
- THEN the workflow MUST execute `npm ci`, `npm run test`, `npm run typecheck`, and `npm run build`

#### Scenario: Test failure blocks merge
- GIVEN one validation command fails
- WHEN the workflow completes
- THEN the check MUST fail and report the error

### Requirement: Pin the Node runtime
The system MUST use the same major Node version locally and in CI.

#### Scenario: Local and CI use the same Node line
- GIVEN a developer opens the repo
- WHEN they inspect the Node pin
- THEN `.nvmrc` and the workflow MUST point to the same Node major version

#### Scenario: Unsupported Node version is avoided
- GIVEN CI starts on an unsupported Node version
- WHEN the workflow reads the repo pin
- THEN the job MUST select the pinned version before running validation

### Requirement: Keep the repository Vercel-deployable
The system MUST remain deployable through Vercel without storing secrets in the repository.

#### Scenario: Main branch is deploy-ready
- GIVEN a commit reaches `main`
- WHEN Vercel builds the app
- THEN it MUST use the repo build settings and output directory

#### Scenario: Secrets stay external
- GIVEN deployment or preview variables are needed
- WHEN the repo is committed
- THEN secrets MUST remain outside the repository files

### Requirement: Ignore build output in source control
The system MUST ignore generated build artifacts.

#### Scenario: Local build does not pollute git status
- GIVEN `npm run build` is executed locally
- WHEN the build output is produced
- THEN `dist/` MUST be ignored by git