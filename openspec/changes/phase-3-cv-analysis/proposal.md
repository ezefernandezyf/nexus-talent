# Proposal: Phase 3 — CV + Analysis Unificado

## Intent

CV generation and Analysis are currently separate pages under different routes. Users paste the same JD twice and context-switch between tools. Unifying them creates a single workflow: paste JD once → get CV preview + skill analysis simultaneously via parallel API calls.

## Scope

### In Scope
- Single unified page replacing `/app/cv` and `/app/analysis`
- Vertical stack: config panel → [GENERATE] → CV preview/export → Analysis panels
- Lapis CV styling (SourceHanSerifCN/CS + JetBrainsMono, compact A4-like)
- Parallel CV + Analysis API calls
- Delete `/app/cv/experience` and `/app/cv/education` routes
- Hide empty CV sections from preview/export
- Analysis page becomes protected (like CV currently is)

### Out of Scope
- CV history / saved CVs (ephemeral — same as p17)
- Multiple CV templates
- New Prisma models or API endpoints
- Auto-fill from LinkedIn / resume parsing

## Capabilities

### New Capabilities
- None — both capabilities already exist (analysis spec, CV generator from p17)

### Modified Capabilities
- `analysis`: moves from standalone public route to embedded fragment inside unified protected page. Receives JD/tone from shared config panel instead of owning its own form.

## Approach

### Why each decision

| Decision | Rationale |
|----------|-----------|
| **Unified page** | JD is the single input for both CV and Analysis. Two pages = duplicated input + lost insight that both outputs serve the same goal: landing the role. |
| **Vertical stack** | Config → Generate → Results is the natural reading flow. No tab-switching, no hidden panels. User fills (top), triggers (middle), scrolls through results (bottom). |
| **Lapis CV** | Current CVPreview uses generic Card components — doesn't look like a real document. Lapis CV gives A4-like layout, serif headings, compact 9.5pt body. Preview/export becomes directly usable without reformatting. |
| **Parallel API** | CV and Analysis have no data dependency. `Promise.all()` cuts wait time to `max(t_cv, t_analysis)` instead of `t_cv + t_analysis`. |
| **Hide empty sections** | Empty "Education" or "Projects" headers make the CV look incomplete. Filtering them server-side + skipping in render produces a cleaner document. |
| **Delete manager routes** | SettingsPage Accordion now handles education/experience CRUD. These sub-routes from p17 become dead code. |
| **Analysis protected** | Analysis currently has no auth requirement. Unified page lives under `/app` (protected), so Analysis inherits auth implicitly. |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `web/src/core/router.tsx` | Modified | Replace `/app/cv` + `/app/analysis` with single unified route; remove `/app/cv/experience` + `/app/cv/education` |
| `web/src/features/cv/pages/CVPage.tsx` | Removed | Merged into unified page |
| `web/src/features/analysis/pages/AnalysisPage.tsx` | Removed | Merged into unified page |
| `web/src/features/cv/pages/ExperienceManagerPage.tsx` | Removed | Replaced by Settings |
| `web/src/features/cv/pages/EducationManagerPage.tsx` | Removed | Replaced by Settings |
| `web/src/features/cv/components/CVPreview.tsx` | Modified | Lapis CV styling + section visibility |
| New unified page | New | `web/src/features/cv-analysis/pages/UnifiedPage.tsx` |
| `web/src/shared/layouts/AppLayout.tsx` | Modified | Single nav link for unified page |
| `web/src/features/analysis/` | Modified | Extract AnalysisFeature for embedding |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Font licensing | Low | SourceHan + JetBrainsMono are SIL OFL — free |
| Parallel partial failure | Med | Handle per-endpoint: show CV error + Analysis success (or vice versa) |
| Lapis CV breaks existing tests | Low | Update CV preview tests, keep same data contract |

## Rollback Plan

- Revert `router.tsx` — restore `/app/analysis` and `/app/cv` routes
- Delete `web/src/features/cv-analysis/` folder
- `git checkout` deleted page files
- No DB changes to roll back

## Dependencies

- Font files: SourceHanSansCN, SourceHanSerifCN, JetBrainsMono (from cv-hub repo)
- Existing endpoints: `POST /api/cv/generate`, `POST /api/ai/analyze`

## Success Criteria

- [ ] Single page renders config → CV preview/export → Analysis panels vertically
- [ ] CV preview matches Lapis CV style (SourceHanSerifCN headings, 9.5pt body, h2 border)
- [ ] [GENERATE] fires both API calls in parallel (`Promise.all`)
- [ ] Empty CV sections omitted from preview
- [ ] `/app/cv/experience` and `/app/cv/education` return 404
- [ ] All existing CV + Analysis tests pass (updated for route changes)
