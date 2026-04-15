# Exploration: Module 20 - Landing Mobile and Drawer Cleanup

### Current State
The landing page renders a sticky left column in the features section and a responsive grid of feature cards. On narrow screens the sticky behavior remains active, which causes the "Arquitectura de Decisión" block to visually overlap the later bullets/cards below it. The public mobile drawer is a shared overlay that currently exposes developer-facing wording and duplicate auth actions.

### Affected Areas
- `src/components/landing/FeatureSection.tsx` — primary source of the mobile overlap because the sticky left column is not scoped to desktop breakpoints.
- `src/components/ui/MobileDrawer.tsx` — drawer heading includes developer-facing copy and is the place where public nav labels are rendered.
- `src/pages/LandingPage.tsx` — wires the public drawer items and actions; likely needs menu ordering cleanup.

### Approaches
1. **Responsive sticky + drawer copy cleanup** — scope sticky behavior to desktop breakpoints and simplify the drawer heading/actions.
   - Pros: minimal change, high confidence, keeps desktop behavior intact.
   - Cons: only addresses the overlap and drawer polish, not broader auth/navigation work.
   - Effort: Low.

2. **Landing section reflow on mobile** — restructure the features section into a fully separate mobile stack and desktop split layout.
   - Pros: explicit mobile intent.
   - Cons: more markup, more risk, unnecessary for the reported issue.
   - Effort: Medium.

### Recommendation
Use the responsive sticky fix first, then clean the public drawer labels and duplicate actions in the same module. That keeps the change small while solving the user-visible landing/mobile issue.

### Risks
- Overlapping concerns with auth/navigation if the drawer copy cleanup tries to solve too many things at once.
- A broader landing refactor would be higher risk than needed for the current bug.

### Ready for Proposal
Yes — the next step should formalize a narrow UI-parity delta focused on mobile landing flow and drawer cleanup.