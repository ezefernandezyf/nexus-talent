# Exploration: Module 18 - Legacy Cleanup

### Current State
The active landing experience lives in `src/pages/LandingPage.tsx` and `src/components/landing/*`. A separate legacy landing tree exists under `src/features/landing/*`, but it is not referenced by the router or by any other file outside that subtree.

### Affected Areas
- `src/features/landing/pages/LandingPage.tsx` — legacy landing page implementation with no external references.
- `src/features/landing/components/Hero.tsx` — legacy hero component only used by the legacy landing page.
- `src/features/landing/components/FeatureList.tsx` — legacy feature list only used by the legacy landing page.
- `src/features/landing/components/Footer.tsx` — legacy footer only used by the legacy landing page.
- `src/pages/LandingPage.tsx` — active landing page that must remain untouched.

### Approaches
1. **Delete the unused legacy tree** — remove the obsolete `src/features/landing/*` implementation.
   - Pros: removes dead code cleanly, no runtime behavior change, low risk.
   - Cons: loses the legacy files from the working tree.
   - Effort: Low.

2. **Move the legacy tree to `old/`** — archive the files outside the active source tree.
   - Pros: preserves the legacy implementation for reference.
   - Cons: adds another folder to maintain, still leaves dead code in the repo.
   - Effort: Low/Medium.

### Recommendation
Delete the unused legacy landing tree. The active landing implementation already exists and is routed, so removal is the smallest safe cleanup. If archival is desired later, the deleted files can be recovered from Git history.

### Risks
- A hidden reference could remain outside the current search results.
- Cleanup might be mistaken for a landing rewrite if the active tree is not preserved.

### Ready for Proposal
Yes — the change is ready to be formalized as a small legacy-cleanup proposal focused on removing the unused `src/features/landing` tree.