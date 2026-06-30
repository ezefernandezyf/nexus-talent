# Delta for Design Tokens

## REMOVED
- **OKLCH Color Tokens** — Indigo/Chartreuse → DSF-5.
- **Typography Scale** — Cabinet Grotesk+Satoshi → DSF-4.
- **Shadow/Radius Tokens** — → DSF-6 (adds z-index, animation, glow).

## ADDED

### Requirement: Complete Token Architecture
Token architecture MUST serve 21+ components. SHALL be `@theme` CSS properties. Zero "Signal" carry-over.

**GIVEN** new `@theme` loaded **WHEN** auditing 21 component files **THEN** all refs use new tokens, zero `--color-indigo`/`--font-cabinet` remain, dark/light modes have parity. **GIVEN** P9 complete **WHEN** searching for `cabinet|satoshi|indigo|chartreuse` in `web/src/` **THEN** zero design-token matches; `web/src/components/ui/` removed.
