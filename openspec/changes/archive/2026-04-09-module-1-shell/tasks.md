# Tasks: Module 1 — Shell + Mobile Navigation + Footer

## Phase 1: Foundation

- [x] 1.1 Add `src/components/ui/Footer.tsx` with the shared copyright copy and compact surface styling.
- [x] 1.2 Add `src/components/ui/MobileMenuButton.tsx` with an accessible toggle label and open/close icon state.
- [x] 1.3 Add `src/components/ui/MobileDrawer.tsx` using a portal, backdrop, and close-on-Escape behavior.

## Phase 2: Core Shell Wiring

- [x] 2.1 Update `src/layouts/AppLayout.tsx` to own drawer open state and pass `appNavItems` into the drawer.
- [x] 2.2 Replace the mobile gap in the header with the new `MobileMenuButton` and keep desktop nav unchanged.
- [x] 2.3 Remove the technical sidebar copy blocks and keep only user-facing navigation/content.
- [x] 2.4 Mount `Footer` at the bottom of the shell and keep the main content stretched with `flex-1`.
- [x] 2.5 Keep the mobile menu and footer visible for public visitors without requiring login.

## Phase 3: Public Page Wiring

- [x] 3.1 Update `src/pages/LandingPage.tsx` to render the mobile menu trigger and shared `Footer` around the hero content.
- [x] 3.2 Verify the landing page still preserves the existing hero layout and spacing after the drawer and footer insertion.

## Phase 4: Testing and Verification

- [x] 4.1 Add component tests for drawer open/close, backdrop click, and navigation click dismissal.
- [x] 4.2 Add layout tests for mobile visibility of the menu button on landing and app shell pages.
- [x] 4.3 Validate footer rendering on landing and app shell pages at mobile and desktop widths.

## Phase 5: Cleanup

- [x] 5.1 Confirm no unused imports remain after extracting the footer and drawer components.
- [x] 5.2 Review copy to ensure no technical implementation strings remain visible in the shell UI.