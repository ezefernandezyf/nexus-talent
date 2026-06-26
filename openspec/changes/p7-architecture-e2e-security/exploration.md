# Exploration: P7 Architecture Reorg + E2E/Security

## Change Name
`p7-architecture-e2e-security`

## 1. Current Architecture Map

### 1.1 web/src/ — Complete File Tree

```
web/src/
├── App.tsx                              # Thin wrapper, renders <AppRouter />
├── main.tsx                             # Root: QueryClient > ErrorBound > AuthProvider > BrowserRouter > App
├── index.css                            # Tailwind v4 + custom CSS
├── vite-env.d.ts
│
├── auth/                                # ⚠️ SPLIT DOMAIN: auth-store lives outside features/auth
│   └── auth-store.ts                    # Zustand store: user, status, login/register/logout/restoreSession
│
├── features/
│   ├── auth/                            # Auth feature
│   │   ├── index.ts                     # Barrel exports
│   │   ├── AuthProvider.tsx             # Context provider wrapping useAuthStore (legacy client OR production mode)
│   │   ├── AuthProvider.test.tsx
│   │   ├── ProtectedRoute.tsx           # Route guard (auth → /app/analysis)
│   │   ├── PublicAuthRoute.tsx          # Route guard (unauthenticated → /auth/sign-in)
│   │   ├── ProtectedRoute.test.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts              # useContext(AuthContext) wrapper
│   │   ├── components/
│   │   │   ├── index.ts
│   │   │   ├── AuthForm.tsx
│   │   │   ├── AuthShell.tsx / AuthShell.test.tsx
│   │   │   ├── AuthStatusScreen.tsx
│   │   │   ├── LogoutButton.tsx
│   │   │   ├── SignInForm.tsx / SignInForm.test.tsx
│   │   │   ├── SignUpForm.tsx / SignUpForm.test.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── AuthCallbackPage.tsx
│   │   └── schemas/
│   │       ├── auth.ts
│   │       └── auth.test.ts
│   │
│   ├── analysis/                        # Analysis feature (well-structured internally)
│   │   ├── index.ts                     # Barrel exports
│   │   ├── AnalysisFeature.tsx / .test.tsx
│   │   ├── components/
│   │   │   ├── AnalysisCard.tsx / .test.tsx
│   │   │   ├── AnalysisResultView.tsx / .test.tsx
│   │   │   └── JobDescriptionForm.tsx / .test.tsx
│   │   ├── hooks/
│   │   │   ├── useAnalysisById.ts       # React Query: GET /api/analyses/:id
│   │   │   ├── useAnalysisHistory.ts    # React Query: GET /api/analyses
│   │   │   ├── useAnalysisRepository.ts # Factory hook (scope selection)
│   │   │   └── useJobAnalysis.ts        # React Query mutation + local viewState
│   │   ├── export/
│   │   │   ├── index.ts
│   │   │   ├── download.ts / .test.ts
│   │   │   └── format-outreach.ts / .test.ts
│   │   └── utils/
│   │       └── github-stack-mapper.ts / .test.ts
│   │
│   ├── history/                         # History feature (well-structured)
│   │   ├── index.ts
│   │   ├── HistoryFeature.tsx / .test.tsx
│   │   ├── components/
│   │   │   ├── index.ts
│   │   │   ├── HistoryCard.tsx / .test.tsx
│   │   │   ├── HistoryDetailEditor.tsx
│   │   │   ├── HistoryEmptyState.tsx
│   │   │   ├── HistoryList.tsx / .test.tsx
│   │   │   └── HistoryLoadingState.tsx
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── useDeleteAnalysis.ts    # React Query mutation
│   │   │   └── useUpdateAnalysis.ts    # React Query mutation
│   │   ├── history-export.ts
│   │   ├── history-formatters.ts / .test.ts
│   │
│   ├── landing/                         # Landing feature (has its own pages + components)
│   │   ├── index.ts
│   │   ├── components/
│   │   │   ├── BrandMark.tsx
│   │   │   ├── Cards.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── FeatureSection.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── LandingIcon.tsx
│   │   │   ├── LayoutContainer.tsx
│   │   │   └── Navbar.tsx
│   │   └── pages/
│   │       └── LandingPage.tsx
│   │
│   └── settings/                        # Settings feature
│       ├── index.ts
│       ├── SettingsFeature.tsx / .test.tsx
│       ├── components/
│       │   └── SettingsForm.tsx / .test.tsx
│       ├── hooks/
│       │   └── useSettings.ts          # React Query for profile + UI state (theme, linking)
│       └── settings-export.ts
│
├── pages/                               # ⚠️ SPLIT: pages exist here AND in features/{domain}/pages/
│   ├── AnalysisPage.tsx / .test.tsx
│   ├── HistoryDetailPage.tsx / .test.tsx
│   ├── HistoryPage.tsx / .test.tsx
│   ├── LandingPage.tsx / .test.tsx       # ⚠️ DUPLICATE of features/landing/pages/LandingPage.tsx
│   ├── NotFoundPage.tsx / .test.tsx
│   ├── PrivacyPage.tsx / .test.tsx
│   └── SettingsPage.tsx / .test.tsx
│
├── components/
│   ├── __tests__/
│   │   └── ErrorBoundary.test.tsx
│   ├── ErrorBoundary.tsx
│   ├── ui/                              # Shared UI components (mostly correct)
│   │   ├── index.ts
│   │   ├── Badge.tsx / .test.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── EmptyState.tsx / .test.tsx
│   │   ├── FeaturePageShell.tsx
│   │   ├── Footer.tsx / .test.tsx        # ⚠️ Should be in landing, not shared UI
│   │   ├── Hero.tsx / .test.tsx          # ⚠️ Should be in landing
│   │   ├── Input.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── MobileDrawer.tsx / .test.tsx
│   │   ├── MobileMenuButton.tsx
│   │   ├── Modal.tsx
│   │   ├── motion.ts
│   │   └── PageHeader.tsx / .test.tsx
│   └── landing/                         # ⚠️ STALE DUPLICATE of features/landing/components/
│       ├── BrandMark.tsx
│       ├── Cards.tsx
│       ├── CTASection.tsx
│       ├── FeatureSection.tsx / .test.tsx
│       ├── Footer.tsx
│       ├── HeroSection.tsx
│       ├── LandingIcon.tsx
│       ├── LayoutContainer.tsx
│       └── Navbar.tsx
│
├── core/
│   └── api-client.ts                    # Axios instance + 401 interceptor → auth-store
│
├── layouts/
│   ├── AppLayout.tsx                    # App shell: header, sidebar, Outlet, footer
│   └── AppLayout.test.tsx
│
├── router/
│   ├── AppRouter.tsx                    # All routes: /, /auth/*, /app/*, /privacy, /404
│   └── AppRouter.test.tsx
│
├── schemas/
│   └── job-analysis.ts                  # ⚠️ Domain-specific (analysis), not shared schema
│
├── lib/                                 # ⚠️ MIXED RESPONSIBILITIES (largest problem area)
│   ├── __tests__/
│   │   ├── error-mapper.test.ts
│   │   └── logger.test.ts
│   ├── ai-client.ts                     # ANALYSIS domain: job analysis client
│   ├── ai-errors.ts                     # ANALYSIS domain: AI orchestrator error classes
│   ├── ai-orchestrator.ts               # ANALYSIS domain: AI orchestration with retry
│   ├── ai-provider.ts                   # ANALYSIS domain: backend proxy adapter
│   ├── cn.ts                            # SHARED utility: clsx + twMerge
│   ├── error-mapper.ts                  # INFRA: error mapping utility
│   ├── github-client.ts                 # ANALYSIS domain: GitHub API client
│   ├── logger.ts                        # INFRA: client-side logger
│   ├── query-client.ts                  # INFRA: React Query client factory
│   ├── retry-strategy.ts                # ANALYSIS domain: retry logic
│   ├── theme.tsx                        # UI INFRA: ThemeProvider + useTheme
│   ├── toast.ts                         # UI INFRA: toast notification system
│   ├── mappers/
│   │   ├── index.ts
│   │   └── job-analysis.ts              # ANALYSIS domain: response normalizer
│   ├── repositories/
│   │   ├── index.ts
│   │   ├── analysis-repository.ts       # ANALYSIS domain: repo interface + types
│   │   ├── http-analysis-repository.ts  # ANALYSIS domain: HTTP implementation
│   │   ├── profile-repository.ts        # PROFILE domain: localStorage + Supabase fallback ⚠️
│   │   └── settings-repository.ts       # SETTINGS domain: localStorage + Supabase fallback ⚠️
│   ├── supabase/                        # ⚠️ LEGACY: should be removed per P5
│   │   ├── client.ts
│   │   ├── index.ts
│   │   ├── oauth-providers.ts / .test.ts
│   └── validation/
│       ├── index.ts
│       ├── history.ts                   # HISTORY domain: form validation
│       ├── job-analysis.ts / .test.ts   # ANALYSIS domain: result validation
│       ├── profile.ts                   # PROFILE domain: profile validation
│       └── settings.ts / .test.ts       # SETTINGS domain: app settings validation
│
└── test/
    ├── setup.ts
    ├── factories/
    │   ├── analysis.ts
    │   └── github.ts
    └── mocks/
        ├── browser.ts
        └── query-client.tsx
```

### 1.2 server/src/ — Already Screaming ✅

```
server/src/
├── index.ts                              # Entry point: createApp() + listen
├── auth/                                 # Auth domain
│   ├── auth.controller.ts
│   ├── auth.middleware.ts                # requireAuth + optionalAuth
│   ├── auth.router.ts
│   ├── auth.service.ts
│   └── oauth.service.ts
├── analysis/                             # Analysis domain
│   ├── analysis.controller.ts
│   ├── analysis.router.ts
│   └── analysis.service.ts
├── history/                              # History domain
│   ├── history.controller.ts
│   ├── history.router.ts
│   ├── history.service.ts / .test.ts
├── profile/                              # Profile domain
│   └── profile.router.ts                 # ⚠️ Missing controller + service
└── infra/                                # Infrastructure
    ├── app.ts                            # Express app + middleware wiring
    ├── error-handler.ts                  # AppError + global handler
    ├── http.ts                           # JWT sign/verify (HS256, crypto)
    ├── logger.ts                         # Pino logger (already configured!)
    ├── prisma.ts                         # Prisma singleton
    ├── rate-limiter.ts                   # In-memory rate limiter
    ├── request.ts                        # Request ID middleware
    └── validate.ts                       # Zod validation middleware
```

## 2. Problems Found

### P1: Auth domain split (`src/auth/` vs `src/features/auth/`)

| Location | Problem | Target |
|----------|---------|--------|
| `src/auth/auth-store.ts` | Top-level auth store, not in `features/auth/` | Move to `features/auth/store/auth-store.ts` |
| `src/features/auth/AuthProvider.tsx` | Imports from `../../auth/auth-store` | Update import to `./store/auth-store` |
| `src/features/auth/index.ts` | Re-exports `useAuthStore` from `../../auth/auth-store` | Update to new path |
| `src/core/api-client.ts` | Imports from `../auth/auth-store` | Update import |

### P2: Pages split (`pages/` vs `features/{domain}/pages/`)

| Location | Problem | Target |
|----------|---------|--------|
| `src/pages/AnalysisPage.tsx` | Should be in `features/analysis/pages/` | Move |
| `src/pages/HistoryPage.tsx` | Should be in `features/history/pages/` | Move |
| `src/pages/HistoryDetailPage.tsx` | Should be in `features/history/pages/` | Move |
| `src/pages/SettingsPage.tsx` | Should be in `features/settings/pages/` | Move |
| `src/pages/LandingPage.tsx` | Duplicate of `features/landing/pages/LandingPage.tsx` | Delete |
| `src/pages/PrivacyPage.tsx` | Static privacy page — could stay or move to `features/landing/pages/` | Move |
| `src/pages/NotFoundPage.tsx` | Truly global page — could stay in `pages/` or `shared/pages/` | Move to shared |

### P3: `lib/` is a grab-bag (mixes domains, infra, UI, legacy)

| File | Current Location | Belongs In |
|------|-----------------|------------|
| `ai-client.ts` | `lib/` | `features/analysis/api/ai-client.ts` |
| `ai-orchestrator.ts` | `lib/` | `features/analysis/api/ai-orchestrator.ts` |
| `ai-provider.ts` | `lib/` | `features/analysis/api/ai-provider.ts` |
| `ai-errors.ts` | `lib/` | `features/analysis/api/ai-errors.ts` |
| `retry-strategy.ts` | `lib/` | `features/analysis/api/retry-strategy.ts` |
| `github-client.ts` | `lib/` | `features/analysis/api/github-client.ts` |
| `mappers/job-analysis.ts` | `lib/mappers/` | `features/analysis/api/mappers/job-analysis.ts` |
| `repositories/analysis-repository.ts` | `lib/repositories/` | `features/analysis/api/repository.ts` |
| `repositories/http-analysis-repository.ts` | `lib/repositories/` | `features/analysis/api/http-repository.ts` |
| `repositories/profile-repository.ts` | `lib/repositories/` | `features/profile/api/repository.ts` |
| `repositories/settings-repository.ts` | `lib/repositories/` | `features/settings/api/repository.ts` |
| `validation/job-analysis.ts` | `lib/validation/` | `features/analysis/api/validation.ts` |
| `validation/profile.ts` | `lib/validation/` | `features/profile/api/validation.ts` |
| `validation/settings.ts` | `lib/validation/` | `features/settings/api/validation.ts` |
| `validation/history.ts` | `lib/validation/` | `features/history/api/validation.ts` |
| `query-client.ts` | `lib/` | `core/query-client.ts` |
| `cn.ts` | `lib/` | `shared/utils/cn.ts` |
| `error-mapper.ts` | `lib/` | `core/error-mapper.ts` |
| `logger.ts` | `lib/` | `core/logger.ts` |
| `toast.ts` | `lib/` | `core/toast.ts` |
| `theme.tsx` | `lib/` | `core/theme.tsx` |
| `supabase/` | `lib/supabase/` | **DELETE** (legacy, per P5) |

### P4: Duplicate landing components

| Location | Status |
|----------|--------|
| `components/landing/` (10 files) | STALE — missing `FAQ.tsx`, has old `FeatureSection.test.tsx` |
| `features/landing/components/` (10 files) | ACTIVE — has `FAQ.tsx`, moved test |

### P5: Shared UI components in wrong location

| Component | Location | Belongs In |
|-----------|----------|------------|
| `Footer.tsx` | `components/ui/` | `features/landing/components/` (landing-specific) |
| `Hero.tsx` | `components/ui/` | `features/landing/components/` (landing-specific) |
| `ErrorBoundary.tsx` | `components/` | `core/` or `shared/components/` |

### P6: `core/` is underpopulated

The `core/` directory should be the infrastructure layer. Currently only has `api-client.ts`. Should also own:
- `query-client.ts` (React Query setup)
- `error-mapper.ts` (error mapping)
- `logger.ts` (client logger)
- `toast.ts` (toast system)
- `theme.tsx` (theme provider)
- `router.tsx` (already in `router/` — could stay)

## 3. State Separation Analysis

### Current Zustand Usage

| Store | State | Type | Verdict |
|-------|-------|------|---------|
| `auth-store.ts` | `user`, `status`, `isAdmin`, `login/register/logout/restoreSession` | **SERVER STATE** (session from /api/auth/me) | Should become React Query `useSession()` hook + minimal Zustand slice for status sync |
| `theme.tsx` (useState + Context) | `theme` (dark/light) | **UI STATE** | OK as-is (or move to Zustand if needed) |

### Current React Query Usage

| Hook | Data | Type | Verdict |
|------|------|------|---------|
| `useAnalysisHistory` | List of analyses | Server state | OK — pure React Query |
| `useAnalysisById` | Single analysis detail | Server state | OK — pure React Query |
| `useJobAnalysis` | Analysis result | Server mutation + local UI viewState | OK pattern (mutation + local state) |
| `useDeleteAnalysis` | Delete action | Server mutation | OK |
| `useUpdateAnalysis` | Update action | Server mutation | OK |
| `useSettings` | Profile data + UI theme | Mixed server query + UI state | Server profile query OK; theme/toggle should be separated |

### Auth Store → React Query Migration

Current auth-store (Zustand) holds:
- `user` (server state) → should be `useSession()` via React Query: `queryKey: ["auth", "session"]`, calling `GET /api/auth/me`
- `status` (derived from user) → should be a thin Zustand slice: `{ status: "unknown" | "loading" | "authenticated" | "unauthenticated" }` — this is UI state (used by route guards, layout)
- `isAdmin` (derived) → derived from `user` data
- `login/register/logout` → React Query mutations that invalidate the session query

This is the **biggest refactor** in this change. The AuthProvider, ProtectedRoute, PublicAuthRoute, AppLayout, and all components using `useAuth()` need updating.

### The `useSettings` Store

The `useSettings` hook mixes:
- `React Query` for profile data (server state) ✅
- `useTheme()` context for theme (UI state) ✅
- `linkIdentity`/`unlinkIdentity` from AuthProvider (⚠️ deprecated, tied to Supabase)

The `linkIdentity`/`unlinkIdentity` should be removed entirely (legacy Supabase pattern). Profile save/delete stays as React Query mutations.

## 4. Data Flow Analysis

### Current Flow
```
main.tsx
  └─ QueryClientProvider (from lib/query-client.ts)
  └─ AuthProvider (from features/auth/AuthProvider.tsx)
       └─ restoreSession() → GET /api/auth/me → auth-store (Zustand)
```

### API Client
- `core/api-client.ts` creates an Axios instance with `withCredentials: true`
- Used by: `http-analysis-repository.ts` for analyses CRUD
- NOT used by: auth-store (uses `fetch()` directly)
- NOT used by: repositories for profile/settings (still use Supabase client or localStorage)

### localStorage Fallbacks (P5 pending)
- `profile-repository.ts`: creates `createLocalRepository()` when no Supabase client
- `settings-repository.ts`: creates `createFallbackRepository()` with localStorage
- Both still import `@supabase/supabase-js` and use `getSupabaseClient()`

### Supabase Client (P5 pending)
- `lib/supabase/client.ts` still creates Supabase JS client
- `lib/supabase/oauth-providers.ts` still provides OAuth provider configs
- Should be removed entirely (auth goes through Express backend)

### GitHub Integration
- `lib/github-client.ts` hits GitHub API from the client side
- Could be moved server-side in the future, but OK for now (public API)

## 5. Proposed Target Architecture

### web/src/ Target Tree

```
web/src/
├── main.tsx                         # Keep
├── App.tsx                          # Keep (or merge into main)
├── index.css                        # Keep
│
├── core/                            # Infrastructure layer
│   ├── api-client.ts                # (stay) Axios instance
│   ├── query-client.ts              # FROM lib/query-client.ts
│   ├── error-mapper.ts              # FROM lib/error-mapper.ts
│   ├── logger.ts                    # FROM lib/logger.ts
│   ├── toast.ts                     # FROM lib/toast.ts
│   ├── theme.tsx                    # FROM lib/theme.tsx
│   ├── router.tsx                   # FROM router/AppRouter.tsx (stay or merge)
│   └── components/                  # Infrastructure-level shared components
│       └── ErrorBoundary.tsx        # FROM components/ErrorBoundary.tsx
│
├── shared/                          # Truly shared utilities (no domain coupling)
│   ├── utils/
│   │   └── cn.ts                    # FROM lib/cn.ts
│   └── components/                  # Truly shared UI primitives
│       ├── Badge.tsx                # FROM components/ui/Badge.tsx
│       ├── Button.tsx               # FROM components/ui/Button.tsx
│       ├── Card.tsx                 # FROM components/ui/Card.tsx
│       ├── EmptyState.tsx           # FROM components/ui/EmptyState.tsx
│       ├── Input.tsx                # FROM components/ui/Input.tsx
│       ├── LoadingSkeleton.tsx      # FROM components/ui/LoadingSkeleton.tsx
│       ├── Modal.tsx                # FROM components/ui/Modal.tsx
│       ├── MobileDrawer.tsx         # FROM components/ui/MobileDrawer.tsx
│       ├── MobileMenuButton.tsx     # FROM components/ui/MobileMenuButton.tsx
│       ├── motion.ts                # FROM components/ui/motion.ts
│       ├── PageHeader.tsx           # FROM components/ui/PageHeader.tsx
│       └── FeaturePageShell.tsx     # FROM components/ui/FeaturePageShell.tsx
│
├── features/
│   ├── auth/
│   │   ├── index.ts                 # Barrel exports
│   │   ├── api/
│   │   │   └── useSession.ts        # React Query: GET /api/auth/me (NEW)
│   │   ├── store/
│   │   │   └── auth-status.ts       # Zustand: UI-only status (unknown/loading/auth/un auth)
│   │   ├── components/
│   │   │   ├── AuthForm.tsx         # (stay)
│   │   │   ├── AuthProvider.tsx     # Simplified: reads from useSession + status store
│   │   │   ├── AuthShell.tsx        # (stay)
│   │   │   ├── AuthStatusScreen.tsx # (stay)
│   │   │   ├── LogoutButton.tsx     # (stay)
│   │   │   ├── SignInForm.tsx       # (stay)
│   │   │   └── SignUpForm.tsx       # (stay)
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx        # (stay)
│   │   │   ├── SignupPage.tsx       # (stay)
│   │   │   └── AuthCallbackPage.tsx # (stay)
│   │   └── guards/
│   │       ├── ProtectedRoute.tsx   # (stay, updated imports)
│   │       └── PublicAuthRoute.tsx  # (stay, updated imports)
│   │
│   ├── analysis/
│   │   ├── index.ts                 # Barrel exports
│   │   ├── api/                     # Server state (React Query hooks)
│   │   │   ├── ai-client.ts         # FROM lib/ai-client.ts
│   │   │   ├── ai-orchestrator.ts   # FROM lib/ai-orchestrator.ts
│   │   │   ├── ai-provider.ts       # FROM lib/ai-provider.ts
│   │   │   ├── ai-errors.ts         # FROM lib/ai-errors.ts
│   │   │   ├── retry-strategy.ts    # FROM lib/retry-strategy.ts
│   │   │   ├── github-client.ts     # FROM lib/github-client.ts
│   │   │   ├── mappers/
│   │   │   │   └── job-analysis.ts  # FROM lib/mappers/job-analysis.ts
│   │   │   ├── repository.ts        # FROM lib/repositories/analysis-repository.ts
│   │   │   ├── http-repository.ts   # FROM lib/repositories/http-analysis-repository.ts
│   │   │   ├── validation.ts        # FROM lib/validation/job-analysis.ts
│   │   │   ├── useAnalysisHistory.ts # (stay, import paths update)
│   │   │   ├── useAnalysisById.ts   # (stay, import paths update)
│   │   │   └── useJobAnalysis.ts    # (stay, import paths update)
│   │   ├── store.ts                 # Zustand: UI-only state (current analysis view, form state)
│   │   ├── components/
│   │   │   ├── AnalysisCard.tsx     # (stay)
│   │   │   ├── AnalysisResultView.tsx # (stay)
│   │   │   └── JobDescriptionForm.tsx # (stay)
│   │   ├── pages/
│   │   │   └── AnalysisPage.tsx     # FROM pages/AnalysisPage.tsx
│   │   └── utils/
│   │       └── github-stack-mapper.ts # (stay)
│   │
│   ├── history/
│   │   ├── index.ts
│   │   ├── api/
│   │   │   ├── useDeleteAnalysis.ts # (stay)
│   │   │   ├── useUpdateAnalysis.ts # (stay)
│   │   │   └── validation.ts        # FROM lib/validation/history.ts
│   │   ├── components/
│   │   │   ├── HistoryCard.tsx      # (stay)
│   │   │   ├── HistoryDetailEditor.tsx # (stay)
│   │   │   ├── HistoryEmptyState.tsx # (stay)
│   │   │   ├── HistoryList.tsx      # (stay)
│   │   │   └── HistoryLoadingState.tsx # (stay)
│   │   ├── pages/
│   │   │   ├── HistoryPage.tsx      # FROM pages/HistoryPage.tsx
│   │   │   └── HistoryDetailPage.tsx # FROM pages/HistoryDetailPage.tsx
│   │   └── utils/
│   │       ├── history-export.ts    # (stay)
│   │       └── history-formatters.ts # (stay)
│   │
│   ├── landing/
│   │   ├── index.ts
│   │   ├── components/
│   │   │   ├── BrandMark.tsx        # (stay, delete stale components/landing/)
│   │   │   ├── Cards.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── FeatureSection.tsx
│   │   │   ├── Footer.tsx           # FROM components/ui/Footer.tsx (merge)
│   │   │   ├── HeroSection.tsx
│   │   │   ├── LandingIcon.tsx
│   │   │   ├── LayoutContainer.tsx
│   │   │   └── Navbar.tsx
│   │   └── pages/
│   │       ├── LandingPage.tsx      # (stay)
│   │       └── PrivacyPage.tsx      # FROM pages/PrivacyPage.tsx
│   │
│   └── settings/
│       ├── index.ts
│       ├── api/
│       │   ├── useSettings.ts       # (stay, split theme to store)
│       │   ├── repository.ts        # FROM lib/repositories/settings-repository.ts → refactored to HTTP
│       │   └── validation.ts        # FROM lib/validation/settings.ts
│       ├── store.ts                 # Zustand: UI state (theme toggle, modals)
│       ├── components/
│       │   └── SettingsForm.tsx     # (stay)
│       ├── pages/
│       │   └── SettingsPage.tsx     # FROM pages/SettingsPage.tsx
│       └── utils/
│           └── settings-export.ts   # (stay)
│
├── test/
│   └── (keep — test helpers are cross-domain)
│
├── pages/                           # DELETE — all pages migrated to features
├── components/                      # DELETE — stale landing/ moved, ui/ → shared/, ErrorBoundary → core/
├── lib/                             # DELETE — all files rehomed
├── router/                          # KEEP or merge into core/router.tsx
├── schemas/                         # KEEP or move job-analysis.ts into features/analysis/api/
└── auth/                            # DELETE — auth-store.ts moved to features/auth/store/
```

## 6. State Separation Plan

### Changes Required

| Current Store | New Location | Type | Migration |
|--------------|--------------|------|-----------|
| `auth-store.ts` (Zustand) | `features/auth/store/auth-status.ts` (Zustand) + `features/auth/api/useSession.ts` (React Query) | Split: UI + Server | Extract session data to React Query `useSession()`. Keep only `status` field in Zustand. AuthProvider becomes a thin sync layer. |
| `theme.tsx` (Context + useState) | `core/theme.tsx` | Keep as Context | No change needed. Could become Zustand for consistency but not required. |
| `useJobAnalysis` viewState | `features/analysis/store.ts` | Zustand (UI) | Extract the `AnalysisViewState` (status/data/error of current analysis) to a Zustand store slice |
| `useSettings` theme/toggle | `core/theme.tsx` | Already separate | No change needed |

### Auth Store Split — Detailed Plan

Current `auth-store.ts` fields:
```
user: AuthUser | null           → React Query: useSession() { queryKey: ["auth", "session"] }
status: "unknown" | "loading"   → Zustand: auth-status.ts { status: AuthStatus }
  | "authenticated" | "unauthenticated"
isAdmin: boolean                → Derived from user data (computed)
restoreSession()                → React Query: prefetchQuery or enabled: true
login()                         → React Query mutation: POST /api/auth/login, invalidates session
register()                      → React Query mutation: POST /api/auth/register, invalidates session
logout()                        → React Query mutation: POST /api/auth/logout, clears session cache
clearSession()                  → queryClient.setQueryData(["auth", "session"], null) + status store reset
```

## 7. P7 Impact — How the Reorg Enables P7

### P7 Tasks (from AGENTS.md)

| P7 Task | Status Before Reorg | After Reorg | Impact |
|---------|---------------------|-------------|--------|
| Playwright setup (existing) | `e2e/` exists with `playwright.config.ts` + one smoke test | No structural change needed | Already configured. E2E tests should import from `features/{domain}/` paths after reorg. |
| Auth smoke tests | Pages at `pages/` + `features/auth/pages/` merged | Pages consolidated under `features/auth/pages/` | Easier to write tests against predictable paths. |
| Analysis smoke tests | `AnalysisPage.tsx` at `pages/` | Moves to `features/analysis/pages/` | Route `/app/analysis` unchanged. Import updates needed. |
| History smoke tests | `HistoryPage.tsx` + `HistoryDetailPage.tsx` at `pages/` | Move to `features/history/pages/` | Routes `/app/history` and `/app/history/:id` unchanged. |
| Security headers (CSP, etc.) | Helmet in `server/src/infra/app.ts` (basic config) | No frontend impact | Server-side only. Can be hardened independently. |
| Rate limiting (auth, analysis) | `rate-limiter.ts` exists, used in auth router only | No frontend impact | Server-side. Apply to analysis/history routes. |
| Structured logging (pino) | `server/src/infra/logger.ts` uses pino (already configured!) | No frontend impact | Server-side. Add request logging middleware. |
| Input sanitization | No sanitization currently | Reorg surfaces where input enters system | All Zod validation schemas moving to `features/{domain}/api/validation.ts` makes it clear where sanitization belongs. |

### Reorg as P7 Enabler

1. **E2E selectors**: With screaming architecture, every route has a predictable import path. `features/analysis/components/JobDescriptionForm.tsx` is easy to locate from a Playwright test.

2. **Security boundary**: Moving API/validation into each feature makes it transparent where user input enters the system. Input sanitization can be added at the `api/validation.ts` level in each feature.

3. **Auth cleanup is required for E2E**: The auth-store split (React Query for session, Zustand for status) means E2E tests can use `useSession()` to check auth state instead of reading from Zustand.

4. **Removing Supabase legacy code**: Supabase client removal (P5) cleans up the auth flow so E2E tests can test the custom JWT flow exclusively.

### P7 Tasks NOT affected by reorg

- **Security headers**: Pure server-side (`server/src/infra/app.ts`)
- **Rate limiting**: Pure server-side (`server/src/infra/rate-limiter.ts`, `server/src/auth/auth.middleware.ts`)
- **Structured logging**: Already configured on server (`server/src/infra/logger.ts`)
- **Input sanitization**: New work — needs to be added to request pipeline

## 8. Risks and Tradeoffs

### High Risk

1. **Auth store split** (Zustand → React Query + Zustand slice)
   - **What could break**: ProtectedRoute, PublicAuthRoute, AppLayout, all uses of `useAuth()`, `LogoutButton`, sign-in/sign-up flows
   - **Mitigation**: Keep the same public API from `features/auth/index.ts` — components consuming `useAuth()` should see no API change
   - **Test impact**: All auth tests need updating (AuthProvider.test.tsx, ProtectedRoute.test.tsx, etc.)
   - **Effort**: HIGH — most complex part of the reorg

2. **File move cascade (lib/ unbundling)**
   - **What could break**: Every import from `../../lib/{file}` across the entire codebase
   - **Mitigation**: Update barrel exports — each feature's `index.ts` re-exports the moved files temporarily
   - **Test impact**: All test imports need updating
   - **Effort**: HIGH — dozens of files, but mechanical (find-replace)

### Medium Risk

3. **Duplicate landing components**
   - **What could break**: Nothing (features/landing/ is the active one)
   - **Action**: Delete `components/landing/`, update any remaining imports
   - **Effort**: LOW

4. **Page moves (pages/ → features/{domain}/pages/)**
   - **What could break**: `router/AppRouter.tsx` imports need updating
   - **Mitigation**: Routes stay the same; only import paths change
   - **Effort**: MEDIUM (7 page files + router update + test imports)

5. **settings-repository.ts and profile-repository.ts**
   - **Current state**: Still use localStorage fallback + Supabase client
   - **What needs to happen**: These are P5 leftovers. Should be refactored to use HTTP API (Axios) like analysis-repository already does. This IS work that belongs in P7 (or before).
   - **Mitigation**: Create HTTP implementations, remove localStorage, remove Supabase imports
   - **Effort**: MEDIUM

### Low Risk

6. **Server screaming architecture** — NO changes needed (already clean)
7. **E2E Playwright config** — Minimal changes (paths in page objects might need updating)
8. **Pino logging** — Already on server, no impact
9. **Rate limiting** — Server-side only, no impact

### Test Update Inventory

| Test File | Change Required |
|-----------|----------------|
| `web/src/features/auth/AuthProvider.test.tsx` | Update auth store imports |
| `web/src/features/auth/ProtectedRoute.test.tsx` | Update imports |
| `web/src/features/auth/components/*.test.tsx` | Update imports |
| `web/src/features/analysis/hooks/useJobAnalysis.test.tsx` | Update lib/ imports |
| `web/src/features/analysis/hooks/useAnalysisHistory.test.tsx` | Update lib/ imports |
| `web/src/features/history/hooks/*.test.tsx` | Update lib/ imports |
| `web/src/features/settings/hooks/useSettings.test.tsx` | Update lib/ imports |
| `web/src/pages/*.test.tsx` | Update page imports (will be in features/) |
| `web/src/layouts/AppLayout.test.tsx` | Auth import updates |
| `web/src/router/AppRouter.test.tsx` | Page import updates |
| `web/src/lib/__tests__/*.test.ts` | Move with files |
| `web/src/lib/repositories/*.test.ts` | Move with files |

## Recommendation

**Proceed with the architecture reorg BEFORE P7 E2E/Security tasks.**

The reorg is a prerequisite — doing E2E tests against the current structure means writing tests against paths that will change. The auth store split (Zustand → React Query) is particularly important because:

1. E2E tests can leverage React Query DevTools for debugging
2. Auth smoke tests need the clean useSession() pattern
3. Removing Supabase legacy code simplifies the auth flow for testing

### Execution Order

1. **Phase 1**: Auth store split (React Query + Zustand slice) + AuthProvider simplification
2. **Phase 2**: Move `lib/` files to their feature domains (mechanical)
3. **Phase 3**: Move pages to feature domains + consolidate landing components
4. **Phase 4**: Clean up Supabase/localStorage legacy code (P5 completion)
5. **Phase 5**: P7 E2E tests (auth, analysis, history smokes)
6. **Phase 6**: P7 Security (headers, rate limiting, pino integration, input sanitization)

### Migration Strategy

Use TypeScript path aliases (`@/features/auth/`, `@/shared/`, `@/core/`) in `vite.config.ts` and `tsconfig.json` to make imports cleaner and avoid deeply nested relative paths.

Add a temporary compatibility layer: each moved file should have a re-export at its old location (e.g., `lib/ai-client.ts` re-exports from `features/analysis/api/ai-client.ts`) so the migration can be incremental without breaking the working tree.

## Ready for Proposal

Yes. This exploration provides enough detail to write specs for each phase.
