import React from "react";
import { AuthShell, SignInForm } from "@/features/auth/components";

export default function LoginPage() {
  return (
    <AuthShell mode="sign-in">
      <SignInForm />
    </AuthShell>
  );
}

export { LoginPage };
