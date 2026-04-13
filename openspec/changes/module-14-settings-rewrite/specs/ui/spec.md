# Delta for UI

## ADDED Requirements

### Requirement: Settings Scope Is User-facing Only
The settings page MUST expose only user-facing account settings. It MUST NOT show admin, maintenance, or platform-level controls, and it MUST NOT provide broader auth provider management beyond displaying supported account status.

#### Scenario: User opens the settings page
- GIVEN an authenticated user
- WHEN the settings page loads
- THEN only user-facing account sections are visible
- AND admin or maintenance controls are not shown

#### Scenario: Provider management remains excluded
- GIVEN the settings page is open
- WHEN the user reviews linked-account content
- THEN the page shows status information only
- AND no provider onboarding, linking, or unlinking workflow is exposed

### Requirement: Account Information Shows Read-only Email and Editable Profile Fields
The system MUST display the account email as read-only and MUST allow editing only the profile fields supported by the current user profile data model.

#### Scenario: Email is not editable
- GIVEN the account information section is loaded
- WHEN the user views their identity fields
- THEN the email is visible
- AND the email cannot be edited

#### Scenario: Profile fields can be updated
- GIVEN the user edits a supported profile field such as display name or location
- WHEN the user saves the form
- THEN the updated value is persisted for the current user
- AND unchanged fields remain intact

### Requirement: Linked Accounts Show Connection Status
The system MUST show the connection status for each supported linked account provider in the settings page.

#### Scenario: A provider is connected
- GIVEN the current user has a linked provider
- WHEN the Linked Accounts section renders
- THEN that provider is shown as connected
- AND the status is visually distinct from unconnected providers

#### Scenario: A provider is not connected
- GIVEN the current user does not have a linked provider
- WHEN the Linked Accounts section renders
- THEN that provider is shown as not connected
- AND no management action is required to read the status

### Requirement: Theme State Reflects the Shared Shell Preference
The settings page MUST reflect the current theme preference from the shared shell state and MUST stay synchronized with theme changes made elsewhere in the app.

#### Scenario: Existing theme is reflected
- GIVEN the shell theme preference is dark or light
- WHEN the user opens settings
- THEN the theme control matches the active shell preference
- AND the page does not create a second theme source of truth

#### Scenario: Theme changes remain synchronized
- GIVEN the theme preference changes in the shell or settings view
- WHEN the new preference is applied
- THEN the settings page reflects the new value
- AND the rest of the app uses the same preference

### Requirement: Delete Account Requires Confirmation
The system MUST require explicit confirmation before deleting the current user account.

#### Scenario: Delete action is initiated
- GIVEN the user selects the delete account action
- WHEN the confirmation step appears
- THEN the account is not deleted yet
- AND cancel leaves the account unchanged

#### Scenario: User confirms deletion
- GIVEN the confirmation step is open
- WHEN the user confirms deletion
- THEN the account deletion flow proceeds for the current user

### Requirement: Settings Editing Depends on Supabase Profile Availability
The settings page MUST treat profile editing as blocked when the required Supabase profile data or access is unavailable, and it MUST surface a clear unavailable state instead of a broken form.

#### Scenario: Profile data is unavailable
- GIVEN the prerequisite profile data or access is unavailable
- WHEN the user opens Account Information
- THEN the page shows a blocked or unavailable state
- AND save actions are disabled

### Requirement: User Data Export Is User-scoped When Present
If the settings page exposes a user data export action, the export MUST contain only data owned by the current user.

#### Scenario: User exports their data
- GIVEN the export action is available on the settings page
- WHEN the user requests an export
- THEN the exported file contains only the current user's data
- AND it excludes admin settings and other users' records
