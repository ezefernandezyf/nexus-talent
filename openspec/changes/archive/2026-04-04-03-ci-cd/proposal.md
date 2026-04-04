# Proposal: CI/CD

## Intent
Add a repository-level CI/CD baseline so every PR runs the same validation gates and the main branch stays deployable to Vercel. This reduces regressions and makes the release path explicit.

## Scope

### In Scope
- GitHub Actions workflow for install, test, typecheck, and build.
- Node version pinning for local and CI consistency.
- Vercel-ready repo config and documentation.

### Out of Scope
- Secret-based deployment automation.
- Preview environment orchestration.
- Test suite expansion beyond the existing validation commands.

## Approach
Use GitHub Actions as the CI gate for PRs and pushes to main. Pin the Node version in the repo, keep build output ignored, and add Vercel config/docs so deployment can happen through the existing Git integration without extra secrets.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.github/workflows/` | New | CI workflow for validation gates. |
| `.nvmrc` | New | Local/CI Node pin. |
| `package.json` | Modified | Node engine constraint. |
| `vercel.json` | New | Vercel build/output settings. |
| `.gitignore` | Modified | Ignore build output (`dist/`). |
| `README.md` | Modified | Document CI/CD flow. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CI fails on Node mismatch | Medium | Pin Node in `.nvmrc` and workflow. |
| Build output pollutes git status | Medium | Ignore `dist/`. |
| Vercel deployment assumptions differ | Medium | Keep deployment config minimal and documented. |

## Rollback Plan
Remove the workflow and deployment config files, revert the Node pin/docs changes, and fall back to the current manual/local validation flow.

## Dependencies
- GitHub repository access for Actions.
- Vercel Git integration for production deployment.

## Success Criteria
- [ ] PRs fail when tests, typecheck, or build fail.
- [ ] Main remains deployable through Vercel using the repo config.
- [ ] Node version is consistent across local and CI.