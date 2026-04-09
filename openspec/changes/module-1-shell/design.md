# Design: Module 1 — Shell + Mobile Navigation + Footer

## Technical Approach

The shell will keep the current desktop layout and add a mobile-only navigation drawer triggered from the header. `AppLayout` and `LandingPage` will each own local open/close state, render the drawer through a portal to avoid stacking conflicts, and pass context-specific nav items to the same drawer component. A reusable `Footer` component will be mounted in both pages so the app and public entry share the same closing section. The drawer and footer are public shell elements, so they MUST be reachable without any authentication prerequisite.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Mobile navigation placement | Keep state in `src/layouts/AppLayout.tsx` | Put state inside the drawer or add a global store | The layout already owns shell concerns; local state is simpler and avoids unnecessary shared state. |
| Drawer rendering strategy | Render `MobileDrawer` with a portal | Inline drawer inside the layout tree | The portal avoids clipping and z-index conflicts with panels/modals and matches the existing `Modal` pattern. |
| Navigation source | Reuse the existing `appNavItems` array via props | Extract a new shared navigation module | Prop threading is enough for this module and avoids creating a premature abstraction. |
| Footer reuse | Create one `Footer` component used by both pages | Duplicate footer markup in each page | A shared component keeps the copyright text and visual treatment consistent. |
| Public availability | Keep shell chrome visible to public users | Gate shell chrome behind auth | The user explicitly requested the menu and footer for any visitor; auth should not hide either control. |
| Landing page shell chrome | Add the same mobile drawer pattern to `LandingPage` | Keep landing page as static hero-only header | The user clarified the menu must be available to any user who enters the site, not just authenticated shell users. |

## Data Flow

User clicks mobile menu button -> `AppLayout` toggles local state -> `MobileDrawer` renders in a portal -> backdrop or link click closes the drawer -> route navigation proceeds through `NavLink`.

    Header button ──→ AppLayout state ──→ MobileDrawer (portal)
          │                                  │
          └──────────── close action ◄───────┘

## File Changes

| File | Action | Description |
|---|---|---|
| `src/layouts/AppLayout.tsx` | Modify | Add mobile menu state, button, portal drawer wiring, footer placement, and remove technical sidebar copy. |
| `src/components/ui/MobileMenuButton.tsx` | Create | Mobile-only trigger button with accessible label and open/close icon state. |
| `src/components/ui/MobileDrawer.tsx` | Create | Portal-based drawer with backdrop, nav links, body scroll lock, and escape/backdrop close behavior. |
| `src/components/ui/Footer.tsx` | Create | Shared footer used in the shell and landing page. |
| `src/pages/LandingPage.tsx` | Modify | Mount the shared footer and the same mobile drawer trigger below/around the public landing content. |

## Interfaces / Contracts

```ts
type NavItem = {
  label: string;
  to: string;
};

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

interface MobileDrawerProps {
  isOpen: boolean;
  items: readonly NavItem[];
  onClose: () => void;
}
```

`MobileDrawer` MUST close on backdrop click, navigation click, and `Escape`. It SHOULD lock document scroll while open. The footer SHOULD render the copyright line from the spec and remain visually compact.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Button toggles drawer state; drawer closes on backdrop and link click | React component tests for `AppLayout`, `MobileMenuButton`, and `MobileDrawer`. |
| Integration | Desktop sidebar still renders nav links; mobile view shows button and drawer | Render `AppLayout` at different viewport widths and assert route links/visibility. |
| E2E | Footer appears on landing and app shells without layout overlap | Smoke test the landing page and `/app/*` shell pages after navigation. |

## Migration / Rollout

No migration required.

## Open Questions

- [ ] Should the mobile drawer include the auth action (`Iniciar sesión` / `LogoutButton`) or only primary navigation links?