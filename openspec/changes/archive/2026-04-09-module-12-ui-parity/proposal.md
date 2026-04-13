# Proposal: Module 12 - UI Parity / Visual Polish

## Intent

Systematically close the 20% visual gap to achieve strict parity with the `DESIGN.md` guidelines and visual assets, ensuring consistent hierarchy, feedback states, and layout across the entire Nexus Talent application without introducing new features.

## Scope

### In Scope
- Creating a minimal component library (tertiary-button, select, focus-visible, refined field-surface, checkbox/radio patterns).
- Systematically integrating these components across all features (`analysis`, `auth`, `history`, `settings`).
- Visual refinement including spacing, states (hover/active/disabled), and Lighthouse performance checks.

### Out of Scope
- Introducing new business logic or features.
- Major architectural or state management refactors.
- Replacing existing robust components that already match the design system perfectly.

## Approach

"Hybrid Approach": 
1. **Essential utilities:** Establish the minimal component library and base CSS utility updates matching "Deep Space", "No-Line Rule", and "Cristales y Luces" principles.
2. **Feature integration:** Roll out these utility and component updates feature by feature (`analysis`, `auth`, `history`, `settings`).
3. **Refinement:** Perform final visual QA against `docs/assets/` and run Lighthouse checks to ensure 95+ scores are maintained or achieved.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/index.css` | Modified | Core CSS variables and base styles update. |
| `src/components/*` | Modified/New | New minimal UI components (buttons, inputs). |
| `src/features/*` | Modified | Integration of new UI components and spacing. |
| `src/App.tsx` | Modified | Global layout/spacing adjustments if necessary. |
| `src/components/ErrorBoundary.tsx` | Modified | Visual alignment with the design system. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Over-scoping features | High | Strictly evaluate every change against "visual polish only" rule. No logic changes. |
| Breaking changes in forms | Medium | Rely heavily on existing tests and Zod validations; ensure UI changes don't alter DOM structure excessively. |
| Mobile Strategy drift | Medium | Verify responsiveness at each integration step using standard breakpoints. |

## Rollback Plan

- If a phase introduces critical visual regression or breaks functionality, revert to the commit prior to that specific phase integration.
- If base CSS variables break, revert `src/index.css` and the specific component implementations back to master state as per Git history.

## Dependencies

- Existing `DESIGN.md` rules and `docs/assets/` mocks.
- Existing Zod schemas and validation logic (must remain untouched).

## Success Criteria

- [ ] All features visually match the provided assets and `DESIGN.md` principles.
- [ ] No regressions in core functionalities (parsing, auth, history).
- [ ] Lighthouse scores (Performance, Accessibility, Best Practices) reach 95+.