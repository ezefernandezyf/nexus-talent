# Delta for UI

## MODIFIED

### Landing Page
MUST use new tokens + taste-skill fonts (NOT Cabinet Grotesk/Satoshi). Routing preserved.
(Previously: "Signal" colors + Cabinet Grotesk)
**GIVEN** visitor at `/` **WHEN** page loads **THEN** new display font, new brand colors, Login→`/login`, CTA→`/signup`.

### Token Usage
Components MUST reference new `--color-*` properties. Zero HEX, zero old tokens, `cn()` preserved. Visual breakage in P9 ACCEPTABLE (P10 fixes). CSS layer SHALL map `.primary-button`/`.surface-panel` to new values.
(Previously: old "Signal" tokens)
**GIVEN** `<Button variant="primary">` **WHEN** inspecting styles **THEN** new tokens, no `--color-indigo`/`--color-chartreuse`.

## Preserved
Login/Signup Zod, Auth redirect, Badge variants, WCAG 2.2 AA.
