# Exploration: 03 CI/CD

### Current State
The repo already has the core validation commands needed for CI: `npm run test`, `npm run typecheck`, and `npm run build`. There is no `.github/workflows/` directory yet, no Node version pin, and no repo-level deployment config. AGENTS.md already states that CI/CD should deploy to Vercel.

### Affected Areas
- `.github/workflows/` — new GitHub Actions workflow for CI.
- `.nvmrc` — pin the Node version used locally and in CI.
- `package.json` — lock the supported Node range.
- `vercel.json` — optional deployment/build config for Vercel.
- `README.md` — document the CI/CD path and deployment assumptions.

### Approaches
1. **GitHub Actions CI + Vercel-ready config** — run install, test, typecheck, and build on PRs and main; keep deployment on Vercel Git integration.
   - Pros: simple, enforceable, no secret-based deploy pipeline required.
   - Cons: deployment itself is outside the repo.
   - Effort: Medium.

2. **GitHub Actions CI + deploy workflow** — add a repo deploy job that pushes to Vercel via CLI.
   - Pros: fully code-driven CI/CD.
   - Cons: requires secrets and project IDs not present yet.
   - Effort: High.

### Recommendation
Start with GitHub Actions CI plus Vercel-ready configuration. That gives us strong validation gates now and keeps deployment simple through Vercel’s Git integration until deployment secrets are explicitly available.

### Risks
- Node version drift between local and CI.
- Build output accidentally tracked in git if `dist/` stays visible.
- Vercel deployment details may need a later follow-up if secrets or preview deploys are required.

### Ready for Proposal
Yes. The repo has enough build/test signal to define the first CI/CD change now.