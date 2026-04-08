# Design: Module 12 - UI Parity / Visual Polish

## Technical Approach

The UI parity update will be implemented entirely through CSS and UI component class consolidation, ensuring strict adherence to `DESIGN.md`. We will centralize design tokens and reusable utilities in `src/index.css`, creating specific classes for requirements like `tertiary-button`, `focus-visible` logic, and `glassmorphism`. Then, we will systematically standardize the `.tsx` components across `src/features/*` to match `docs/assets/` perfectly. This means stripping out 1px solid borders in favor of "ghost frames" (15% opacity outlines) and updating typography classes.

## Architecture Decisions

### Decision: Centralized Token Utilities in `src/index.css`

**Choice**: Define complex visual states (glassmorphism, glows, ghost frames) as reusable utilities in `src/index.css`.
**Alternatives considered**: Inline styles or per-component CSS modules.
**Rationale**: `DESIGN.md` requires specific composite effects like "surface_variant 60% + 24px blur". Defining `.glass-panel` and related utilities in one global stylesheet keeps the implementation explicit, consistent, and independent from a Tailwind config file.

### Decision: "Ghost Frames" for Layout Boundaries

**Choice**: Use `outline_variant` at 15% opacity or surface contrast for separation, explicitly dropping `border-solid` classes.
**Alternatives considered**: Minimizing border contrast but keeping 1px borders.
**Rationale**: The "No-Line Rule" and "Deep Space" aesthetic strictly forbid 1px solid borders. Ghost frames provide the required visual separation cleanly via light elevation.

### Decision: Preserving Existing Business Logic

**Choice**: UI parity changes will be restricted to `className` modifications, DOM structure refinements for layout, and CSS files.
**Alternatives considered**: Refactoring component data fetching or state alongside UI updates.
**Rationale**: The goal is visual polish *only*. Modifying state logic risks regressions in the robust AI analysis and Supabase integration workflows.

## Data Flow

Data flow remains identical to the current architecture:
`Input Usuario -> Validación Zod -> Request IA -> Response IA -> Mapper -> Validación Zod -> Render`
Changes are restricted solely to the final `Render` styling phase.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/index.css` | Modify | Add utility classes for `glassmorphism`, `tertiary-button`, `focus-visible`, and `glow-pulse`. |
| `src/components/ui/*` | Modify | Update base elements (buttons, inputs, modals) to consume the new design tokens. |
| `src/features/analysis/*` | Modify | Remove hardcoded solid borders; apply ghost frames, surface elevations, and typography hierarchy. |
| `src/features/history/*` | Modify | Apply "Deep Space" background mapping and ghost frames to history cards. |
| `src/features/auth/*` | Modify | Align auth forms with UI presentation guidelines. |

## Interfaces / Contracts

No changes to TypeScript data interfaces.
CSS utilities introduced in `src/index.css`:
```css
/* Example index.css additions */
@layer utilities {
  .glass-panel {
    @apply bg-surface-variant/60 backdrop-blur-[24px];
  }
  .ghost-frame {
    @apply outline outline-1 outline-outline-variant/15;
  }
  .glow-pulse {
    /* Custom keyframe animations for status indicators */
  }
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Component UI Rendering | Verify components render without regression when classNames change. |
| E2E / Tooling | Performance / Accessibility | Run Lighthouse audits to ensure changes do not drop the score below 95. |
| Manual | Visual Parity | Side-by-side comparison of UI against `docs/assets/` mockups and `DESIGN.md`. |

## Migration / Rollout

No database or data migration required. Rollout is a frontend-only visual update.

## Open Questions

- [ ] None.
