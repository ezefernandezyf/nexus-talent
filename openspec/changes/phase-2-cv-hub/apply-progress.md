# Apply Progress — Phase 2 CV Hub

## PR 2 — Contact + Skills + Layout (✅ Complete)

### Files Changed

| File | Action | Lines |
|------|--------|-------|
| `web/src/features/settings/components/ContactSection.tsx` | **NEW** | ~220 |
| `web/src/features/settings/components/SkillsSection.tsx` | **NEW** | ~120 |
| `web/src/features/settings/SettingsFeature.tsx` | MODIFIED | ~395 (restructured) |
| `web/src/features/settings/SettingsFeature.test.tsx` | MODIFIED | Updated assertions for new layout |

### Tasks

- [x] **1.1** Create ContactSection with 5-field form (email readonly, phone, portfolioUrl, linkedinUrl, githubUrl)
- [x] **1.2** Create SkillsSection with comma-split Tag UI (parse → render → remove → rejoin)
- [x] **1.3** Restructure SettingsFeature: Card layout → Accordion.Root with 5 items (01/02/03/Contact/Skills)
- [x] **1.4** Remove ProfileEditorCard from DOM
- [x] **1.5** Update SettingsFeature test: replace "04"/"Perfil Profesional" assertions with Contact/Skills

### Verification

- [x] `tsc --noEmit` passes (all workspaces)
- [x] `pnpm test --filter @nexus-talent/web` — 29 settings tests pass; 6 pre-existing Accordion test failures (same as before — Accordion content stays in DOM, tests use `not.toBeInTheDocument()` instead of visibility checks)
- [x] Contact form loads existing data and saves via `useSettings().saveProfile`
- [x] Skills parse/split/join round-trips correctly (comma → trim → filter → Tag → join → save)
- [x] ProfileEditorCard no longer in DOM (no "04" or "Perfil Profesional" rendered)

### Edge Cases Handled

- **ContactSection**: Empty fields pass through as `undefined` (schema handles optional URL validation)
- **SkillsSection**: Empty strings after split are filtered out; null/empty profile.skills shows empty state
- **Accordion**: Content stays in DOM (CSS grid animation) — hidden sections still render their components
- **Loading state**: Skeleton shown only when `isLoading && !profile` (first load with no cache)
