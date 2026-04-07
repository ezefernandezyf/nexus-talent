# Delta for Auth

## ADDED Requirements

### Requirement: Admin Exposure in Auth Context
The authentication context MUST expose the boolean `isAdmin` derived from the user session.

#### Scenario: Providing admin flag
- GIVEN a valid Supabase Auth session
- WHEN the `AuthProvider` initializes or updates state
- THEN it MUST evaluate `user.user_metadata.role === 'admin'` (or equivalent)
- AND expose `isAdmin` in the `AuthContextValue`
