# Delta for profile-fields

## ADDED Requirements

### Requirement: phone + portfolioUrl fields on Profile

The Profile model MUST add two new nullable fields: `phone` (String?) and `portfolioUrl` (String?). No data migration — existing profiles SHALL start with null values.

| ID | Field | Type | Validation |
|----|-------|------|------------|
| REQ-PF-008 | `phone` | `String?` | Free text, no format enforced |
| REQ-PF-009 | `portfolioUrl` | `String?` | Valid URL when non-empty |

The server's `toProfileDTO` mapper MUST include both fields in GET/PUT responses.

#### Scenario: Save phone as plain text

- GIVEN user submits `{ phone: "+54 11 5555-5555" }`
- WHEN PUT `/api/profile`
- THEN 200 with `phone: "+54 11 5555-5555"`; no format validation error

#### Scenario: Save valid portfolio URL

- GIVEN user submits `{ portfolioUrl: "https://portfolio.dev" }`
- WHEN PUT `/api/profile`
- THEN 200 with `portfolioUrl: "https://portfolio.dev"`

#### Scenario: Clear phone to empty string → null

- GIVEN profile has `phone: "1555555555"`
- WHEN user submits `{ phone: "" }`
- THEN the field is saved as null; GET returns `phone: null`
