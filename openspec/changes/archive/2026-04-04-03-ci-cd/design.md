# Design: CI/CD

## Technical Approach

Add a GitHub Actions workflow that runs the same validation commands used locally, pin Node with `.nvmrc`, and add Vercel build settings so the main branch stays deployable through Vercel Git integration.

## Architecture Decisions

### Decision: Use GitHub Actions for CI
**Choice**: Run `npm ci`, `npm run test`, `npm run typecheck`, and `npm run build` in GitHub Actions.
**Alternatives considered**: Vercel-only validation or a custom deploy script.
**Rationale**: The repo already has strong local validation commands, so CI should enforce the same checks before merge.

### Decision: Pin Node with `.nvmrc`
**Choice**: Add a repo Node pin and use the same version in the workflow.
**Alternatives considered**: Rely on whatever Node GitHub runners provide.
**Rationale**: Keeps local and CI environments aligned and reduces toolchain drift.

### Decision: Keep deployment Vercel-native
**Choice**: Add minimal Vercel config and rely on Vercel Git integration for production deploys.
**Alternatives considered**: CLI-based deploy workflow with secrets.
**Rationale**: The repo has no deployment secrets yet; a Git integration is lower risk and matches the project guidance.

### Decision: Ignore build artifacts
**Choice**: Add `dist/` to `.gitignore`.
**Alternatives considered**: Track build output or leave it visible.
**Rationale**: Build output is generated, not source, and should not stay in the working tree as a permanent git concern.

## Data Flow

`pull_request` / `push main` -> GitHub Actions -> install -> test -> typecheck -> build -> status gate

`push main` -> Vercel Git integration -> build using repo config -> deploy

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.github/workflows/ci.yml` | Create | CI pipeline for validation commands. |
| `.nvmrc` | Create | Node pin for local and CI. |
| `package.json` | Modify | Add Node engine constraint. |
| `vercel.json` | Create | Vercel build/output config. |
| `.gitignore` | Modify | Ignore `dist/`. |
| `README.md` | Modify | Document CI/CD and deployment flow. |

## Interfaces / Contracts

```yaml
name: CI
on: [pull_request, push]
jobs:
  validate:
    steps:
      - run: npm ci
      - run: npm run test
      - run: npm run typecheck
      - run: npm run build
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|--------------|----------|
| Unit | Workflow command list and Node pin | Review generated YAML and repo config. |
| Integration | Build/test/typecheck on CI | Execute the same commands locally and in workflow. |
| Deployment | Vercel build compatibility | Confirm the build output and config match Vercel expectations. |

## Migration / Rollout

No migration required. Merge the workflow and config files, then connect the repository to Vercel if it is not already linked.

## Open Questions

- [ ] Do we want a separate preview deployment workflow later, or is Vercel Git integration enough for now?