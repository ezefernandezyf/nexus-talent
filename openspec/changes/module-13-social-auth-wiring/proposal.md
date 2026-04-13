# Proposal: Module 13 - Social Auth Wiring

## Intent
Add conservative auth and navigation wiring that lets users sign in with email/password plus social providers, while completing only the UI actions that unblock the public shell. This module should improve entry points and lightweight navigation without pulling in the settings rewrite or legacy cleanup.

## Scope

### In Scope
- Supabase auth wiring for email/password plus GitHub and Google; LinkedIn only if provider config is confirmed.
- UI actions: landing primary CTA, GitHub login buttons, navbar logo home link, history export, clickable history items, privacy page, 404 page.
- Minimal theme toggle persistence only if needed to preserve the current user choice.
- Remove `matchIndex` from the history interaction path if it is dead weight for click/export behavior.

### Out of Scope
- Settings rewrite, account preference redesign, and broader theme-system work.
- Legacy cleanup or file moves to `old/`.
- History detail/editor flows beyond click-to-open and export.
- New auth flows beyond provider wiring and existing session handling.

## Approach
1. Keep email/password as the baseline and wire GitHub + Google first.
2. Treat LinkedIn as the last provider and only ship it if the Supabase callback/config path is stable.
3. Wire the shell actions directly into existing routes/features; do not introduce new layout systems.
4. Keep theme persistence minimal, using the current toggle state and storage pattern only.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/supabase/*` | Modified | OAuth provider setup and auth helpers. |
| `src/features/auth/*` | Modified | Login/CTA actions and provider buttons. |
| `src/features/landing/*` | Modified | Primary CTA wiring. |
| `src/features/history/*` | Modified | Clickable items, export action, `matchIndex` removal if unused. |
| `src/layouts/AppLayout.tsx` | Modified | Navbar logo home link and theme toggle wiring. |
| `src/router/AppRouter.tsx` | Modified/New | Privacy and 404 routes. |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| OAuth redirect or provider misconfig | Medium | Ship providers sequentially and verify env/callbacks before enabling UI. |
| LinkedIn integration stalls the module | Medium | Make LinkedIn the last step, not a blocker for GitHub/Google. |
| History changes drift into a redesign | Low | Limit the work to click/export and remove `matchIndex` only if it is not used. |

## Rollback Plan
Revert the provider UI and route wiring first, then disable the social auth config in Supabase if needed. Email/password auth remains the fallback path, and the existing shell/history behavior can be restored without touching later-module work.

## Dependencies
- Supabase OAuth credentials and redirect URLs for GitHub, Google, and LinkedIn.
- Existing auth session plumbing and current router/layout shell.

## Success Criteria
- [ ] Email/password sign-in still works unchanged.
- [ ] GitHub and Google social sign-in work end-to-end; LinkedIn is included only if configuration is validated.
- [ ] Landing CTA, logo home link, history export, clickable history items, privacy, and 404 routes all work.
- [ ] Settings rewrite and legacy cleanup remain out of scope for this module.

## Recommended Order
1. Auth providers and callback plumbing.
2. Landing/navbar/history wiring.
3. Privacy and 404 routes.
4. Theme persistence and `matchIndex` cleanup only if still required.