# Delta for UI Shell

## ADDED Requirements

### Requirement: Settings Visibility Follows Authentication
The shell MUST show Settings only to authenticated users in desktop navigation and the mobile drawer.
The shell MUST omit Settings from public navigation surfaces.

#### Scenario: Signed-in user sees Settings
- GIVEN an authenticated user
- WHEN the app shell renders
- THEN Settings MUST appear in desktop and mobile navigation

#### Scenario: Public visitor sees navigation
- GIVEN a visitor without an authenticated session
- WHEN the app shell or public drawer renders
- THEN Settings MUST NOT appear