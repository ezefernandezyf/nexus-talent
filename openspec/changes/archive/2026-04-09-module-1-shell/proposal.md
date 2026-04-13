# Proposal: Module 1 — Shell + Mobile Navigation + Footer

## Intent

The current application lacks a navigation mechanism for mobile users (screens under 768px) and does not have a global footer. Additionally, the desktop sidebar contains technical implementation details that should not be visible to end users. This change aims to provide a unified, responsive navigation experience and a polished UI shell aligned with the `DESIGN.md` guidelines. The mobile menu and footer MUST be available to any user who enters the site, whether they are authenticated or browsing publicly.

## Scope

### In Scope
- Implement a Hamburger Menu Button for mobile devices (`< md`).
- Create a Mobile Drawer overlay for navigation on small screens.
- Create and integrate a global Footer component across the application.
- Add the mobile menu entry point to the public landing page as well as the app shell.
- Remove technical strings and implementation details from the AppLayout sidebar.

### Out of Scope
- Modifying authentication flow or route protection logic.
- Redesigning the entire desktop sidebar (only removing technical text).
- Adding new navigation routes (sticking to the existing ones like Análisis, Historial, Settings).

## Approach

We will use the **Hamburger Drawer Menu** pattern. The header will include a hamburger icon visible only on mobile, which triggers a glassmorphism drawer (`MobileDrawer`) using a React Portal for proper z-index stacking. A new `Footer` component will be added at the bottom of the main layout using the "Deep Space" color palette from the design system. The drawer is a slide-out side panel that overlays the content and can be dismissed by tapping the backdrop, choosing a link, or pressing Escape.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/layouts/AppLayout.tsx` | Modified | Add mobile menu trigger, render drawer, include footer, remove technical text. |
| `src/pages/LandingPage.tsx` | Modified | Include the new Footer component. |
| `src/pages/LandingPage.tsx` | Modified | Add the public mobile menu trigger and drawer wiring. |
| `src/components/ui/` | New | Create `MobileDrawer.tsx`, `MobileMenuButton.tsx`, and `Footer.tsx`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Z-index conflicts with modals | Medium | Use a dedicated Portal with z-index 40 for the drawer and 30 for the backdrop. |
| Layout shifts from Footer | Low | Ensure the main container uses `min-h-screen flex flex-col` with `flex-1` for content. |

## Rollback Plan

Revert the changes to `AppLayout.tsx` and `LandingPage.tsx` to their previous states. Remove the newly created components from `src/components/ui/`.

## Dependencies

- Existing Tailwind responsive breakpoints and `DESIGN.md` color system.

## Success Criteria

- [ ] Users on mobile devices (< 768px) can open the menu and navigate between routes.
- [ ] The global footer is visible at the bottom of the App and Landing pages for authenticated and public users.
- [ ] The mobile hamburger is available on both the landing page and the app shell for public and authenticated users.
- [ ] Technical implementation details are no longer visible in the desktop sidebar.
- [ ] No visual regressions on desktop screens (>= 1024px).
