# Proposal: module-08-integrations

## Intent

Add the first external integration layer for Nexus Talent by turning the edited outreach copy into reusable exports. The current UX only supports clipboard copy, so this change closes the next practical step without introducing GitHub auth or high-risk API coupling yet.

## Scope

### In Scope
- Outreach export actions from `AnalysisResultView`.
- Email draft / `mailto` handoff.
- Markdown and JSON download/export for the generated outreach.

### Out of Scope
- GitHub repo parsing / stack detection.
- CRM tracking, delivery logs, or persistence of outbound sends.
- Changes to analysis generation, history storage, or auth.

## Approach

Start with a low-risk export layer that reuses the existing editable subject/body state in `src/features/analysis/components/AnalysisResultView.tsx`. Add focused helpers for formatting the outreach payload and browser-safe export flows. This keeps the current copy-to-clipboard behavior intact and creates a foundation for later integrations (GitHub, email webhooks, CRM) without new backend work.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/analysis/components/AnalysisResultView.tsx` | Modified | Add export actions beside clipboard copy |
| `src/features/analysis/export/*` | New | Formatting and download helpers |
| `src/features/analysis/components/*.test.tsx` | Modified/New | Cover export flows and browser fallbacks |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `mailto` length / browser quirks | Medium | Keep subject/body bounded and provide fallback to copy/download |
| Download support varies by browser | Low | Use blob-based download with explicit user feedback |
| Scope creep into GitHub/CRM | High | Defer those to a later phase after export UX is stable |

## Rollback Plan

Remove the export controls and helper module, leaving the current clipboard-only workflow unchanged. No data migration is required.

## Dependencies

- Browser `Blob` / `URL.createObjectURL` APIs for downloads.
- Existing editable outreach state in the analysis result view.

## Success Criteria

- [x] Users can export the outreach as a markdown file or JSON payload.
- [x] Users can open a draft email using the current subject/body.
- [x] Clipboard copy still works and remains the fallback path.