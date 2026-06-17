# history (MODIFIED)

| REQ ID | Requirement | Type |
|--------|-------------|------|
| REQ-HIST-009 | History list MUST GET /api/analyses with `page` (1-indexed) and `limit` (default 20) params. | ADDED |
| REQ-HIST-010 | Sorting/filtering MUST be backend-handled. Frontend MUST NOT sort/filter client-side. | ADDED |
| REQ-HIST-001 | History List Display — remove localStorage branch. Always fetch from /api/analyses. | MODIFIED |
| REQ-HIST-002 | Empty History State — remove localStorage check. Empty when `items.length === 0` from API. | MODIFIED |
| REQ-HIST-003 | Delete Analysis — remove localStorage branch. Always HttpAnalysisRepository.delete(). | MODIFIED |

### Scenario: Paginated fetch
- GIVEN authenticated → mount → GET /api/analyses?page=1&limit=20 → render cards

### Scenario: Next page
- GIVEN total > items.length → next-page → GET /api/analyses?page=2&limit=20

### Scenario: Always server list
- GIVEN any user → history view → data from /api/analyses (Previously: localStorage for anonymous)

### Scenario: Empty via API
- GIVEN { items: [], total: 0 } → empty state CTA displayed (Previously: localStorage emptiness check)

> REQ-HIST-011 (UI unchanged) and REQ-HIST-012 (tests pass) remain in effect.
