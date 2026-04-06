# Design: Module 08 Integrations

## Technical Approach

Add a thin export layer on top of the existing analysis result UI. The current outreach editor in `AnalysisResultView` already owns the editable subject/body state, so the integration work should reuse that state and add shareable outputs without changing analysis generation, persistence, or auth.

The first slice is export-first: draft email handoff, markdown download, and JSON export. Clipboard copy remains the fallback path and stays unchanged. GitHub stack detection is intentionally deferred because it introduces external auth, API coupling, and higher operational risk before the export UX is validated.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Integration order | Outreach export first | GitHub stack detection first | Export closes the immediate user need with low risk and no backend dependency. |
| State ownership | Keep subject/body state inside `AnalysisResultView` | Move outreach state into a global store | The existing component already owns editing and copy state; moving it would add unnecessary coupling. |
| Export helpers | Create pure formatter/download helpers under `src/features/analysis/export/` | Encode export logic inline in the component | Pure helpers keep the UI lean, are easy to test, and make future integrations reusable. |
| Fallback strategy | Clipboard copy remains the fallback | Replace clipboard copy with share/export only | Preserving copy avoids regressions and gives users a reliable path across browsers. |

## Data Flow

```text
Analysis result rendered
  -> user edits subject/body
  -> user chooses export action
  -> export helper formats outreach payload
      -> mailto draft / markdown download / JSON download
      -> if unsupported, fallback to clipboard copy
```

`AnalysisResultView` remains the entry point for interaction. Export buttons should reflect the same edited subject/body that copy already uses.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/features/analysis/components/AnalysisResultView.tsx` | Modify | Add export actions and feedback states beside clipboard copy. |
| `src/features/analysis/export/format-outreach.ts` | Create | Build markdown, JSON, and mailto-safe payloads from outreach data. |
| `src/features/analysis/export/download.ts` | Create | Browser download helper for markdown/JSON exports. |
| `src/features/analysis/components/AnalysisResultView.test.tsx` | Modify | Cover export actions, fallback behavior, and copy regression. |
| `src/features/analysis/components/AnalysisFeature.test.tsx` | Modify | Confirm the analysis shell still renders result/export controls normally. |

## Interfaces / Contracts

```ts
interface ExportableOutreach {
  subject: string;
  body: string;
}

interface OutreachExportPayload {
  subject: string;
  body: string;
  markdown: string;
  json: string;
  mailtoHref: string;
}
```

The formatter should derive all export representations from the current edited subject/body so every path stays consistent.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Payload formatting and fallback strings | Test pure export helpers with edge cases for length and escaping. |
| Integration | Export buttons and copy fallback in the analysis result view | React Testing Library with mocked clipboard and download helpers. |
| E2E | User edits outreach, exports it, and copies it | Deferred unless browser automation is already available. |

## Migration / Rollout

No migration required. This change only extends the client-side analysis result UI.

## Open Questions

- [ ] None blocking. GitHub integration is intentionally deferred to a later module after export UX stabilizes.