# Delta for shared-contracts

## ADDED Requirements

### Requirement: phone + portfolioUrl in profile schemas

`profileSchema` MUST add `phone` (z.string().nullable()) and `portfolioUrl` (z.url().nullable().or(z.literal(""))). `profileUpdateSchema` MUST add both as optional with empty-to-undefined transform.

| ID | Field | profileSchema | profileUpdateSchema |
|----|-------|--------------|---------------------|
| REQ-SC-P09 | `phone` | `z.string().nullable()` | `z.string().optional().or(z.literal("").transform(() => undefined))` |
| REQ-SC-P10 | `portfolioUrl` | `z.url().nullable().or(z.literal(""))` | `z.url().optional().or(z.literal("").transform(() => undefined))` |

#### Scenario: Full profile with new fields

- GIVEN API returns `phone: "+543515555555"` and `portfolioUrl: "https://me.com"`
- WHEN validated against `profileSchema`
- THEN `parse()` succeeds with both fields populated

#### Scenario: Null new fields accepted

- GIVEN a profile where `phone` and `portfolioUrl` are `null`
- WHEN validated against `profileSchema`
- THEN `parse()` succeeds

#### Scenario: Empty phone clears to undefined

- GIVEN `{ phone: "" }`
- WHEN validated against `profileUpdateSchema`
- THEN `parse()` succeeds with `phone: undefined` — server writes NULL

#### Scenario: Invalid portfolio URL rejected

- GIVEN `{ portfolioUrl: "not-a-url" }`
- WHEN validated against `profileUpdateSchema`
- THEN `parse()` fails with Zod validation error
