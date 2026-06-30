# Delta for UI Shell

## MODIFIED

### AppLayout
MUST use new OKLCH tokens. Dark default, light via `[data-theme="light"]`. Toggle mechanism preserved.
(Previously: "Signal" identity + old tokens)
**GIVEN** authenticated user **WHEN** AppLayout renders **THEN** shell uses new tokens, dark active, toggle works.

### Navigation
Nav MUST use taste-skill fonts (NOT Cabinet Grotesk) + new accent (NOT Indigo/Chartreuse). Structure/routes preserved.
(Previously: Cabinet Grotesk + old accent)
**GIVEN** user on Analysis **WHEN** sidebar renders **THEN** active nav uses new accent+font, zero Cabinet Grotesk.

### Footer
MUST use new tokens + new caption scale (NOT Satoshi). Layout/visibility preserved.
(Previously: Satoshi + old tokens)
**GIVEN** any page **WHEN** scrolling to footer **THEN** typography uses new caption scale + surface/text tokens.

## Preserved
Desktop sidebar, Mobile hamburger (<768px), Mobile drawer (slide-out, backdrop, close on link/backdrop).
