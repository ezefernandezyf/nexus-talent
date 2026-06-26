import React from "react";
import { AuthShell, SignUpForm } from "@/features/auth/components";

export default function SignupPage() {
  return (
    <AuthShell mode="sign-up">
      <SignUpForm />
    </AuthShell>
  );
}

export { SignupPage };
