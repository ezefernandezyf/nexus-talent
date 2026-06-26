# admin-cleanup (MODIFIED)

| REQ ID | Requirement | Type |
|--------|-------------|------|
| REQ-ADM-001 | Admin Role Identification — removed. No role in GET /api/auth/me response. | REMOVED |
| REQ-ADM-002 | Admin Route Protection — removed. /app/admin route + AdminRoute component deleted. | REMOVED |
| REQ-AUTH-009 | isAdmin from auth context — removed. (From `auth` spec: "Admin Exposure in Auth Context") | REMOVED |

### Scenario: Admin route gone
- GIVEN any user → /app/admin → 404 (route does not exist)

### Scenario: isAdmin absent
- GIVEN auth context → isAdmin property MUST NOT exist

### Scenario: Settings unchanged
- GIVEN settings UI → Supabase settings repository still works (deferred to V1.2.1)

> REQ-ADM-001/002 from `openspec/specs/admin`. Settings Persistence + Validation remain.
