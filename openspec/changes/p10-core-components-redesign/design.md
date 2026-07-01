# Design: P10 — Core Components Redesign

## Technical Approach

Rebuild 12 component families from zero, self-contained in dedicated folders with `.module.css` or inline `cn()` styles. Old `@layer components` classes stay until their matching batch ships. Three PRs: Foundation (Button, Input, Card + server lint), Mid-level (Modal/Drawer, Badge, Toast, Dropdown, Tabs, Tooltip/Popover), Polish (Skeleton, snapshots, `@layer` removal). Taste-skill dials: VARIANCE 8, MOTION 6, DENSITY 4 from DESIGN.md. Apex tokens only — Deep Teal brand, Warm Amber accent, cool-tinted surfaces.

## Architecture Decisions

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| Component folder vs flat files | Folders: more boilerplate, clearer co-location (test + snap + index) | **Folder per component** — snapshot test colocation wins |
| framer-motion vs motion/react | framer-motion: exists in V1.1, deprecated upstream. motion/react: React 19 forward | **motion/react** — isolate to Modal/Drawer only, CSS fallback documented |
| Zustand vs Context for Toast | Context: re-render cascade. Zustand: fine-grained, works outside React tree | **Zustand `toastStore`** — `addToast`/`removeToast`/`clearToasts` |
| Portal vs CSS positioning | Portal: escape overflow, DOM detached from source. CSS: simpler, clipping risk | **Portal** — dropdown menus + ToastProvider render via `createPortal` |
| `cn()` vs `.module.css` | `cn()`: runtime cost, theme-aware via CSS vars. Module CSS: zero JS, build-time | **`cn()` with CSS variables** — existing pattern in V1.1, consistent |
| `forwardRef` vs React 19 ref prop | React 19: `ref` as regular prop. `forwardRef`: backward-compat | **`forwardRef`** — Vite + TS still on React 19 stable |

## Data Flow

```
User Action → Component Handler → Zustand Store (Toast) / Context (Modal/Drawer)
                                        ↓
                                   State change
                                        ↓
                             Re-render / Portal mount
                                        ↓
                                  Animation (motion/react enter/exit or CSS)
```

Overlay stack: Portal → `AnimatePresence` → focus trap → Escape listener. Z-index from `--z-dropdown(10)` → `--z-modal-backdrop(30)` → `--z-modal(40)` → `--z-toast(50)` → `--z-tooltip(60)`.

## CSS Strategy

- Each component folder: own `.tsx` with `cn()` calls using `var(--color-*)` tokens
- Animations via `motion/react` (Modal/Drawer) or CSS `transition` with `var(--ease-out-expo)`
- Theme switching: `html[data-theme="light"]` — no JS media queries
- **No `@layer components`** in new components. Removal per batch after confirmation
- `prefers-reduced-motion` collapses all transitions to instant

## File Changes

### PR 1 — Foundation (Button, Input, Card + lint fix)
| File | Action |
|------|--------|
| `web/src/shared/components/button/Button.tsx` | Create |
| `web/src/shared/components/button/Button.test.tsx` | Create |
| `web/src/shared/components/button/Button.snap.tsx` | Create |
| `web/src/shared/components/button/index.ts` | Create |
| `web/src/shared/components/input/Input.tsx` | Create |
| `web/src/shared/components/input/Input.test.tsx` | Create |
| `web/src/shared/components/input/Input.snap.tsx` | Create |
| `web/src/shared/components/input/Textarea.tsx` | Create |
| `web/src/shared/components/input/index.ts` | Create |
| `web/src/shared/components/card/Card.tsx` | Create |
| `web/src/shared/components/card/Card.test.tsx` | Create |
| `web/src/shared/components/card/Card.snap.tsx` | Create |
| `web/src/shared/components/card/index.ts` | Create |
| `web/src/shared/components/_internal/useEscapeKey.ts` | Create |
| `web/src/shared/components/_internal/useClickOutside.ts` | Create |
| `web/src/shared/components/Button.tsx` | Delete |
| `web/src/shared/components/Input.tsx` | Delete |
| `web/src/shared/components/Card.tsx` | Delete |
| `server/src/history/history.service.ts` | Fix — `as object` → `as JsonValue` |

### PR 2 — Mid-level (Modal, Drawer, Badge, Toast, Dropdown, Tabs, Tooltip)
| File | Action |
|------|--------|
| `web/src/shared/components/modal/Modal.tsx` | Create |
| `web/src/shared/components/modal/Modal.test.tsx` | Create |
| `web/src/shared/components/modal/Modal.snap.tsx` | Create |
| `web/src/shared/components/modal/index.ts` | Create |
| `web/src/shared/components/badge/Badge.tsx` | Create |
| `web/src/shared/components/badge/Tag.tsx` | Create |
| `web/src/shared/components/badge/Status.tsx` | Create |
| `web/src/shared/components/toast/ToastProvider.tsx` | Create |
| `web/src/shared/components/toast/toastStore.ts` | Create |
| `web/src/shared/components/dropdown/Dropdown.tsx` | Create |
| `web/src/shared/components/dropdown/Dropdown.test.tsx` | Create |
| `web/src/shared/components/dropdown/index.ts` | Create |
| `web/src/shared/components/tabs/Tabs.tsx` | Create |
| `web/src/shared/components/tabs/ToggleGroup.tsx` | Create |
| `web/src/shared/components/tabs/index.ts` | Create |
| `web/src/shared/components/tooltip/Tooltip.tsx` | Create |
| `web/src/shared/components/tooltip/Popover.tsx` | Create |
| `web/src/shared/components/_internal/focusTrap.ts` | Create |
| `web/src/shared/_internal/portal.ts` | Create |
| `web/src/shared/components/Modal.tsx` | Delete |
| `web/src/shared/components/Badge.tsx` | Delete |
| `web/src/shared/components/MobileDrawer.tsx` | Delete |
| `web/src/shared/components/motion.ts` | Delete |

### PR 3 — Polish (Skeleton, snapshots, cleanup)
| File | Action |
|------|--------|
| `web/src/shared/components/skeleton/Skeleton.tsx` | Create |
| `web/src/shared/components/skeleton/Skeleton.test.tsx` | Create |
| `web/src/shared/components/skeleton/index.ts` | Create |
| `web/src/shared/components/LoadingSkeleton.tsx` | Delete |
| `web/src/index.css` | Remove `@layer components` block (lines 279–483) |

## State Management

| Store/Context | Tool | Scope | Key Actions |
|---------------|------|-------|-------------|
| Toast | Zustand `toastStore` | Global | `addToast({id, variant, message, duration})`, `removeToast(id)`, `clearToasts()` |
| Modal | React Context | Per-modal | `open`/`onClose` prop, stacking via `AnimatePresence` |
| Drawer | React Context | Per-drawer | Same pattern as Modal |
| Tabs | Compound context | Per-group | `value`/`onChange`, `active` managed internally |
| Dropdown | Local state | Per-instance | `isOpen` state, `useClickOutside` + keyboard nav |

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Button click/disabled/loading, Input focus/error, Toast store actions | Vitest + @testing-library/react, fireEvent |
| Snapshot | All 12 components in dark mode (default) | Vitest snapshot, `ThemeProvider` wrapping with dark |
| Integration | Modal + Toast interaction, Dropdown keyboard nav | RTL userEvent, sequential interaction tests |
| E2E | Selector compatibility after each batch | Playwright — update selectors per batch PR |

## Migration / Rollout

Each PR independently revertible. Old component files stay until their batch merge confirms the replacement. `@layer components` CSS classes removed only in PR 3 — never before. Server lint fix merges first (blocks CI).

## Open Questions

- [ ] Confirm `motion/react` is installed — current V1.1 uses `framer-motion` directly
- [ ] Confirm `@phosphor-icons/react` is in `web/package.json`
- [ ] Confirm floating-ui or CSS anchor positioning for Portal — spec references both options
