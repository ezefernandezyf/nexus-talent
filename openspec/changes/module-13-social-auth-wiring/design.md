# Design: Module 13 - Social Auth Wiring

## Technical Approach
Keep the existing Supabase auth bootstrap and add a thin OAuth layer on top of the current email/password flow. OAuth buttons will call a centralized auth helper, redirect through a lightweight callback route, and let the existing `getSession` + `onAuthStateChange` path settle the session before navigating into `/app`.

Shell wiring stays local: landing CTA goes to the current auth entry point, the app logo goes to the shell home route, and the app router gains privacy and 404 pages. History stays focused on stable identity by `analysis.id`; clicking an item opens a full analysis detail view and export uses the same saved record. Theme persistence is intentionally minimal and limited to the current toggle value only.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| OAuth entry flow | Add `signInWithOAuth` to the auth context/provider and send redirects to a small `/auth/callback` route. | Parse tokens in forms or add custom callback logic inside each button. | Centralizes callback/session handling and keeps error states inside the existing auth shell. |
| Provider registry | Create a tiny provider config map under `src/lib/supabase/` and expose GitHub/Google by default; LinkedIn is hidden unless its config flag is verified. | Hardcode three buttons or ship LinkedIn as always-on. | Lets the phase ship without blocking on an unverified provider and keeps the UI honest. |
| History open/export | Resolve history items by `analysis.id`, add a detail route/page that reuses `AnalysisResultView`, and export from the saved analysis data. | Keep a row-only click, or keep `matchIndex` in the interaction path. | `analysis.id` already exists and is stable; `matchIndex` is derived noise and should be removed if no consumer remains. |
| Theme persistence | Add a tiny localStorage-backed preference hook used by `AppLayout` only. | Move theme state into the settings feature or repository layer. | Satisfies the persistence requirement without broadening settings scope. |

## Data Flow

OAuth:

`Login/Signup button` -> `AuthProvider.signInWithOAuth()` -> `Supabase OAuth redirect` -> `/auth/callback` -> `AuthProvider.getSession()/onAuthStateChange()` -> `/app/analysis`

History:

`HistoryCard click` -> `/app/history/:analysisId` -> `useAnalysisById()` -> `AnalysisResultView` + export helper

Theme:

`AppLayout mount` -> `read theme preference` -> `apply current theme` -> `toggle updates localStorage`

## File Changes

| File | Action | Description |
|---|---|---|
| `src/lib/supabase/client.ts` | Modify | Extend the auth client contract for OAuth sign-in. |
| `src/lib/supabase/oauth-providers.ts` | Create | Centralize provider labels, redirect options, and LinkedIn gating. |
| `src/features/auth/AuthProvider.tsx` | Modify | Add OAuth sign-in, callback-safe error handling, and session fallback. |
| `src/features/auth/components/SignInForm.tsx` / `SignUpForm.tsx` | Modify | Wire provider buttons to the shared auth action and surface failures. |
| `src/features/auth/components/AuthShell.tsx` | Modify | Add callback/loading copy and keep fallback email/password visible. |
| `src/router/AppRouter.tsx` | Modify | Add `/auth/callback`, privacy, and 404 routes. |
| `src/pages/PrivacyPage.tsx` / `src/pages/NotFoundPage.tsx` | Create | Public legal and fallback pages. |
| `src/layouts/AppLayout.tsx` | Modify | Make the logo navigate home and persist the current theme choice. |
| `src/pages/LandingPage.tsx` / `src/components/landing/CTASection.tsx` | Modify | Route the primary CTA to auth signup/login. |
| `src/features/history/*` and `src/pages/HistoryPage.tsx` | Modify/Create | Make cards clickable, add detail/export plumbing, and remove `matchIndex` if unused. |

## Interfaces / Contracts

```ts
type OAuthProvider = "github" | "google" | "linkedin";

type OAuthProviderConfig = {
  enabled: boolean;
  label: string;
  provider: OAuthProvider;
};
```

`useAnalysisById(analysisId)` returns `{ analysis, isLoading, isError }` from the existing history repository. The detail page renders the same saved result shape already stored in `SavedJobAnalysis`.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | OAuth provider gating, auth error fallback, history identity, export payloads | Add focused Vitest coverage around new helpers/hooks and card click behavior. |
| Integration | Callback route, detail route, privacy/404 rendering | Render router paths with mocked auth/repository state. |
| E2E | Landing CTA, social sign-in redirect, clickable history item, export action | Verify the main user journeys end-to-end once provider envs are available. |

## Migration / Rollout
No migration required. LinkedIn remains behind a verified-config gate until Supabase provider setup is confirmed.

## Open Questions
None blocking. If LinkedIn config is not confirmed during implementation, ship GitHub and Google only and keep the provider hidden.
