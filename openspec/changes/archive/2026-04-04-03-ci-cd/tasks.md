# Tasks: CI/CD

## Phase 1: Foundation

- [x] 1.1 Add `.nvmrc` with the pinned Node version used by CI and local development.
- [x] 1.2 Update `package.json` engines so the supported Node major version is explicit.
- [x] 1.3 Add `dist/` to `.gitignore` so build output does not stay in source control.

## Phase 2: Core Implementation

- [x] 2.1 Create `.github/workflows/ci.yml` to run install, test, typecheck, and build on PRs and pushes to `main`.
- [x] 2.2 Add `vercel.json` with the build command and output directory expected by Vercel.
- [x] 2.3 Update `README.md` with the CI/CD and deployment flow.

## Phase 3: Verification

- [x] 3.1 Run `npm run test` locally to confirm the repo still passes after config changes.
- [x] 3.2 Run `npm run typecheck` locally to confirm TypeScript settings remain valid.
- [x] 3.3 Run `npm run build` locally to confirm the Vercel build target is correct.

## Phase 4: Cleanup

- [x] 4.1 Review workflow naming and documentation for clarity.
- [x] 4.2 Remove any temporary notes or experimental config before archiving.