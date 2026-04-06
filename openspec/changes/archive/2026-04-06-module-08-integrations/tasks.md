# Tasks: Module 08 Integrations

## Phase 1: Export Foundation
- [x] 1.1 Create `src/features/analysis/export/format-outreach.ts` with pure helpers for markdown, JSON, and `mailto:` payloads.
- [x] 1.2 Create `src/features/analysis/export/download.ts` with a browser-safe download helper for exported outreach files.
- [x] 1.3 Define the export payload shape from the current edited subject/body so every export path uses the same data.

## Phase 2: UI Wiring
- [x] 2.1 Update `src/features/analysis/components/AnalysisResultView.tsx` to add email, markdown, and JSON export actions beside clipboard copy.
- [x] 2.2 Keep the existing copy feedback state intact while adding export success/fallback feedback.
- [x] 2.3 Ensure export actions use the latest edited subject and body from the analysis result form.

## Phase 3: Testing and Verification
- [x] 3.1 Add unit tests for `src/features/analysis/export/format-outreach.ts` covering markdown, JSON, mailto, and escaping edge cases.
- [x] 3.2 Add tests for `src/features/analysis/export/download.ts` covering filename creation and fallback behavior.
- [x] 3.3 Update `src/features/analysis/components/AnalysisResultView.test.tsx` to verify export actions, fallback copy, and clipboard regression.
- [x] 3.4 Update `src/features/analysis/components/AnalysisFeature.test.tsx` to confirm the shell still renders export controls with the analysis result.

## Phase 4: Cleanup
- [x] 4.1 Update export copy/messages in the UI if needed to match the Precision Instrument tone.
- [x] 4.2 Confirm no history, auth, or analysis-generation code was changed outside the export surface.