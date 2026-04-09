# SDD Design: Landing & Auth

## Architecture Overview
The Landing and Auth modules sit at the public boundary of the feature-based domain isolation architecture. They rely strictly on `@tanstack/react-query` (if needed for remote checks) and the existing `AuthProvider` context.

## Component Boundaries

### `src/features/landing/`
- **`pages/LandingPage.tsx`**: Smart assembly page. Uses dumb components.
- **`components/Hero.tsx`**: Static visual hero from `referenciaLanding.html`.
- **`components/FeatureList.tsx`**: Static features.
- **`components/Footer.tsx`**: Static footer.

### `src/features/auth/`
- **`pages/LoginPage.tsx`**: Contains the smart logic (`useContext(AuthContext)`, Zod resolution) and renders the visual form.
- **`pages/SignupPage.tsx`**: Similar smart wrapper for the sign-up flow.
- **`components/AuthForm.tsx`**: A shared dumb component that takes `{ onSubmit, isLoading, errors }` and renders the pixel-perfect form fields.

## Data Contracts (Zod)
```typescript
// src/features/auth/schemas/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email("El email debe ser válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.")
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

## State Management
- **Local State**: Managed by `react-hook-form` and `@hookform/resolvers/zod` within `LoginPage`/`SignupPage`.
- **Global State**: The `AuthProvider` context already provides `status` (`authenticated` / `unauthenticated`) which the routing will check.

## Sequence Flow: Login
1. User visits `/login`.
2. `LoginPage` renders `AuthForm`.
3. User fills email and password, clicking "Entrar".
4. `react-hook-form` validates against `loginSchema`.
5. If valid, `LoginPage` sets `isLoading` and calls `signIn(email, password)` from `AuthContext`.
6. On success, `react-router-dom` redirects user to the private shell (e.g., `/`).
7. On error, `LoginPage` sets a local error message visible in `AuthForm`.
