# Delta Specification for Routing & Shell Refactor

## Domain: Routing

### ADDED Requirements

#### Requirement: Centralized Application Router
The system MUST implement a centralized `AppRouter` component in `src/router/AppRouter.tsx`.
The router MUST define all application routes and manage navigation state using React Router.

#### Requirement: Public Landing Page Route
The system MUST provide a public landing page at the root path (`/`).
The landing page MUST be accessible to unauthenticated users.

#### Requirement: Application Layout Wrapper
The system MUST implement an `AppLayout` component in `src/layouts/AppLayout.tsx` that wraps application routes (e.g., `/app`).
The `AppLayout` MUST enforce the "Deep Space" UI design system defined in `DESIGN.md`.

#### Requirement: Page-Level Components
The system MUST introduce a `src/pages/` directory containing page-level wrapper components (e.g., `LandingPage.tsx`, `AnalysisPage.tsx`).

### MODIFIED Requirements

#### Requirement: Application Entry Point Simplification
The monolithic `src/App.tsx` MUST be simplified to only provide the top-level application providers and render the `AppRouter`.
All existing routing and shell layout logic currently in `App.tsx` MUST be migrated to `AppRouter` and `AppLayout` respectively.

#### Requirement: Navigation Links Update
All existing plain HTML `<a>` tags for internal navigation MUST be updated to use React Router's `Link` or `NavLink` components to prevent full page reloads.

#### Requirement: Unified Public/Private App Experience
The core application routes (e.g., `/app`, `/app/analysis`) MUST support access by both authenticated and unauthenticated users gracefully.
The UI and UX MUST remain functionally identical regardless of authentication status. Data persistence logic MUST be decoupled and branched at the service/data layer, not by blocking routes.

### REMOVED Requirements

#### Requirement: Monolithic App Structure
The single monolithic structure in `App.tsx` handling routing, shell layout, and feature composition SHALL be completely removed.

---

## Domain: UI/UX & Constraints

### ADDED Requirements

#### Requirement: Strict Design System Adherence
All new routing components and layouts MUST strictly adhere to the `DESIGN.md` "Deep Space" system.

### MODIFIED Requirements

#### Requirement: Zero Material UI
The system MUST NOT incorporate any Material UI components or external UI library dependencies during this refactor.

### Exclusions
- No changes to underlying AI analysis logic.
- No changes to Supabase persistence schema in this phase.
