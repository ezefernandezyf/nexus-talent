# persistence (MODIFIED)

| REQ ID | Requirement | Type |
|--------|-------------|------|
| REQ-HIST-007 | useAnalysisRepository MUST always return HttpAnalysisRepository. Remove localStorage branch entirely. | MODIFIED |
| REQ-HIST-008 | Delete/update MUST always call DELETE/PATCH /api/analyses/:id. No localStorage fallback. | MODIFIED |
| REQ-PER-001 | Save/GetAll/GetById/Delete localStorage paths - removed. All CRUD through HTTP. | REMOVED |

### Scenario: Always HTTP
- GIVEN any auth state → useAnalysisRepository → HttpAnalysisRepository (Previously: LocalAnalysisRepository when anonymous)

### Scenario: Delete always server
- GIVEN any auth state → delete → DELETE /api/analyses/:id (Previously: localStorage delete when anonymous)

> HttpAnalysisRepository (REQ-HIST-006) already exists. Settings/profile repos stay on Supabase (V1.2.1).
