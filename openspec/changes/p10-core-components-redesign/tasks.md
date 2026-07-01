# Tasks: P10 — Core Components Redesign

## Review Workload Forecast

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

~1050 changed lines across 3 PRs (PR1: ~300, PR2: ~500, PR3: ~250).

### Suggested Work Units

| Unit | Goal | PR | Base |
|------|------|-----|------|
| 1 | Server lint + Button, Input, Card | PR 1 | develop |
| 2 | Modal, Badge, Toast, Dropdown, Tabs, Tooltip | PR 2 | PR 1 or develop |
| 3 | Skeleton, snapshots, @layer removal, audit | PR 3 | PR 2 or develop |

## PR 1 — Foundation

- [x] 1.1 **Server lint**: Replace 4× `as object` with `as any` in `server/src/history/history.service.ts` (Prisma 7 stub types — JsonValue import path unavailable without DATABASE_URL); verify `pnpm typecheck` zero errors
- [x] 1.2 **Button**: Created `button/Button.tsx` — 4 variants (primary/secondary/ghost/danger), 3 sizes (sm/md/lg), loading+disabled+icon slots, forwardRef; `Button.test.tsx` + `Button.snap.test.tsx` + `index.ts`
- [x] 1.3 **Input**: Created `input/Input.tsx` — Input (text/email/password) + Textarea (multiline via prop), icon slots, error+disabled+aria-describedby+label; `Input.test.tsx` + `Input.snap.test.tsx` + `index.ts`
- [x] 1.4 **Card**: Created `card/Card.tsx` — flat/elevated/interactive variants, Card.Header/Body/Footer compound slots, sm/md/lg padding; `Card.test.tsx` + `Card.snap.test.tsx` + `index.ts`
- [x] 1.5 **Hooks + Cleanup**: Created `_internal/useEscapeKey.ts` + `useClickOutside.ts`; preserved old `Button.tsx`/`Input.tsx`/`Card.tsx` as backward-compat re-exports; updated shared `index.ts`; 252/252 tests pass

## PR 2 — Mid-level

- [ ] 2.1 **Utils**: Create `_internal/focusTrap.ts` + `_internal/portal.ts`
- [ ] 2.2 **Badge**: Create `badge/Badge.tsx` (info/success/warning/error, sm/md, Geist, pill) + `Tag.tsx` (onRemove) + `Status.tsx` (dot+label, 5 variants); tests+snapshots+index
- [ ] 2.3 **Modal**: Create `modal/Modal.tsx` — blur backdrop, focus trap, Escape, scroll lock, motion/react spring, slots; `modal/Drawer.tsx` — right-edge slide; tests+snapshots+index
- [ ] 2.4 **Toast**: Create `toast/toastStore.ts` (Zustand addToast/removeToast/clearToasts) + `ToastProvider.tsx` (portal, success/error/warning/info, auto-dismiss 5s, stacking); tests+snapshots+index
- [ ] 2.5 **Dropdown**: Create `dropdown/Dropdown.tsx` (portal, floating-ui, keyboard nav, focus trap) + `Select.tsx` (single-value, brand indicator); tests+snapshots+index
- [ ] 2.6 **Tabs**: Create `tabs/Tabs.tsx` (compound context, horizontal, 2px brand underline, Arrow nav) + `ToggleGroup.tsx` (multi-select); tests+snapshots+index
- [ ] 2.7 **Tooltip**: Create `tooltip/Tooltip.tsx` (hover 200ms, floating-ui, arrow) + `Popover.tsx` (click, focus trap, Escape/click-outside); tests+snapshots+index
- [ ] 2.8 **Cleanup**: Delete old `Modal.tsx`, `Badge.tsx`, `MobileDrawer.tsx`, `motion.ts`; run `pnpm test`

## PR 3 — Polish

- [ ] 3.1 **Skeleton**: Create `skeleton/Skeleton.tsx` — text/circle/rect primitives, pulse, dark/light; tests+snapshots+index; delete old `LoadingSkeleton.tsx`
- [ ] 3.2 **Snapshots**: Confirm all 12 families have `.snap.tsx` with dark ThemeProvider; run `pnpm test -- --update` baseline, then `pnpm test`
- [ ] 3.3 **Audit**: Run `/impeccable audit web/src/shared/components/` — score ≥ 85; remove `@layer components` block from `index.css` (lines 280–483); run `pnpm lint && pnpm test && pnpm typecheck` all green
