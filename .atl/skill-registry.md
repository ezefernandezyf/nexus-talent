# Skill Registry — Nexus Talent

> Auto-generated. Source of truth: each skill's `SKILL.md` frontmatter.
> Last updated: 2026-06-25 (init refresh)

## Registry Contract

- Subagents receive **exact SKILL.md paths** and read the full source of truth.
- Skills are indexed, not summarized. No inline rules injection.
- Project-level skills take priority over global skills with the same name.

## Project Skills (Local)

| Skill | Trigger / Description | Path |
|-------|----------------------|------|
| **frontend-design** | Interfaces de alto impacto, diseño visual distintivo | `skills/frontend-design/SKILL.md` |
| **react-19** | Convenciones React 19 (React Compiler, Actions, ref como prop) | `skills/react-19/SKILL.md` |
| **tailwind-4** | Tailwind CSS 4, cn(), tokens, responsive | `skills/tailwind-4/SKILL.md` |
| **typescript** | Tipado estricto, const types, flat interfaces | `skills/typescript/SKILL.md` |
| **zod-4** | Validación Zod 4, breaking changes desde v3 | `skills/zod-4/SKILL.md` |

## Global Skills (User-Level)

| Skill | Trigger / Description | Path |
|-------|----------------------|------|
| **geo-audit** | Full GEO+SEO audit with multi-agent orchestration | `~/.config/opencode/skills/geo-audit/SKILL.md` |
| **geo-brand-mentions** | Brand mention and authority scanner for AI visibility | `~/.config/opencode/skills/geo-brand-mentions/SKILL.md` |
| **geo-citability** | AI citability scoring and optimization | `~/.config/opencode/skills/geo-citability/SKILL.md` |
| **geo-compare** | Monthly delta tracking and progress reporting for GEO | `~/.config/opencode/skills/geo-compare/SKILL.md` |
| **geo-content** | Content quality and E-E-A-T assessment | `~/.config/opencode/skills/geo-content/SKILL.md` |
| **geo-crawlers** | AI crawler access analysis (robots.txt, meta, headers) | `~/.config/opencode/skills/geo-crawlers/SKILL.md` |
| **geo-llmstxt** | llms.txt analysis and generation | `~/.config/opencode/skills/geo-llmstxt/SKILL.md` |
| **geo-platform-optimizer** | Per-platform AI search optimization | `~/.config/opencode/skills/geo-platform-optimizer/SKILL.md` |
| **geo-proposal** | Client-ready GEO proposal generation | `~/.config/opencode/skills/geo-proposal/SKILL.md` |
| **geo-prospect** | CRM-lite for GEO agency pipeline management | `~/.config/opencode/skills/geo-prospect/SKILL.md` |
| **geo-report** | Client-facing GEO report generation | `~/.config/opencode/skills/geo-report/SKILL.md` |
| **geo-report-pdf** | PDF generation from GEO audit reports | `~/.config/opencode/skills/geo-report-pdf/SKILL.md` |
| **geo-schema** | Schema.org structured data audit and generation | `~/.config/opencode/skills/geo-schema/SKILL.md` |
| **geo-technical** | Technical SEO + GEO-specific infrastructure audit | `~/.config/opencode/skills/geo-technical/SKILL.md` |
| **geo-update** | Pull latest GEO-SEO skill updates from upstream | `~/.config/opencode/skills/geo-update/SKILL.md` |
| **geo** | GEO-first SEO analysis (umbrella) | `~/.config/opencode/skills/geo/SKILL.md` |
| **branch-pr** | Creating, opening, or preparing PRs for review | `~/.config/opencode/skills/branch-pr/SKILL.md` |
| **chained-pr** | Splitting oversized PRs into stacked review slices | `~/.config/opencode/skills/chained-pr/SKILL.md` |
| **cognitive-doc-design** | Writing guides, READMEs, RFCs, and architecture docs | `~/.config/opencode/skills/cognitive-doc-design/SKILL.md` |
| **comment-writer** | Writing warm, direct collaboration comments | `~/.config/opencode/skills/comment-writer/SKILL.md` |
| **customize-opencode** | Editing opencode's own configuration | `~/.config/opencode/skills/customize-opencode/SKILL.md` |
| **go-testing** | Go testing patterns (test coverage, golden files) | `~/.config/opencode/skills/go-testing/SKILL.md` |
| **issue-creation** | Creating GitHub issues, bug reports, feature requests | `~/.config/opencode/skills/issue-creation/SKILL.md` |
| **judgment-day** | Adversarial dual review, blind code audit | `~/.config/opencode/skills/judgment-day/SKILL.md` |
| **skill-creator** | Creating LLM-first skills with valid frontmatter | `~/.config/opencode/skills/skill-creator/SKILL.md` |
| **skill-improver** | Auditing and upgrading existing LLM-first skills | `~/.config/opencode/skills/skill-improver/SKILL.md` |
| **work-unit-commits** | Planning commits as reviewable work units | `~/.config/opencode/skills/work-unit-commits/SKILL.md` |

## Project Conventions

- [AGENTS.md](AGENTS.md) — Workspace instructions, SDD protocol, stack, roadmap.
- DESIGN.md — Not created yet (referenced in AGENTS.md but missing).

## Notes

- **ESLint**: No ESLint config installed. `tsc --noEmit` used as the sole lint/typecheck step.
- **Prettier**: Installed but no config file — uses Prettier 3 defaults.
- **Skipped**: `sdd-*`, `_shared`, `skill-registry` (system skills excluded from index).
- **Deduplication**: geo-* skills found in both `~/.config/opencode/skills/` and `~/.claude/skills/`; first scan path wins.
