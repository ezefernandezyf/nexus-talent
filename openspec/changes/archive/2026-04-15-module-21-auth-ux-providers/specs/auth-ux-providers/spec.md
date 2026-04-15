# Delta for Auth UX and Social Providers

## ADDED Requirements

### Requirement: Signup Must Confirm Password

The signup flow MUST require the user to confirm their password before account creation.
The form MUST reject mismatched passwords before contacting the backend.

#### Scenario: User enters mismatched passwords
- GIVEN the user is creating an account with email and password
- WHEN the confirm password value does not match the password value
- THEN the form MUST show a validation error
- AND the account creation request MUST NOT be sent

#### Scenario: User enters matching passwords
- GIVEN the user is creating an account with matching password values
- WHEN the form is submitted
- THEN the account creation request MUST be allowed to proceed

### Requirement: OAuth Buttons Stay Readable Across Themes

The Google and GitHub OAuth entry points MUST remain readable in light and dark themes.

#### Scenario: User views the auth form in light mode
- GIVEN the user opens the sign-in or sign-up form in light mode
- WHEN the OAuth buttons render
- THEN the button text MUST remain legible against the button background
- AND the provider label MUST be readable without theme-dependent ambiguity

### Requirement: Auth Shell Must Not Expose Placeholder UI

The auth shell MUST not display developer placeholder wording or non-functional help text as a visible control.

#### Scenario: User opens the auth page
- GIVEN the user lands on the sign-in or sign-up shell
- WHEN the header renders
- THEN the visible header controls MUST be intentional user-facing UI
- AND no placeholder text such as "help_outline" MUST be shown

### Requirement: Social Provider Enablement Must Be Explicit

GitHub, Google, and LinkedIn provider availability MUST be represented clearly so that frontend failures are not mistaken for code bugs when the Supabase provider is not enabled.

#### Scenario: Provider is not enabled in Supabase
- GIVEN a provider is disabled or missing in Supabase Auth settings
- WHEN the user clicks the corresponding OAuth action
- THEN the UI MUST surface a clear provider-not-enabled state
- AND the implementation MUST make the dependency on Supabase configuration explicit

#### Scenario: LinkedIn remains disabled by configuration
- GIVEN LinkedIn is not yet configured in Supabase
- WHEN the provider list is rendered
- THEN LinkedIn MUST remain disabled or hidden according to the current config
- AND the code MUST not claim social login is fully available

## Acceptance Criteria
- Signup blocks password mismatches before account creation.
- OAuth buttons are legible in light mode.
- The auth shell no longer shows placeholder help text.
- Provider enablement behavior is explicit and aligned with Supabase configuration.