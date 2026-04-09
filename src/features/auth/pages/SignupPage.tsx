import React from "react";
import { AuthShell, SignUpForm } from "../components";

export default function SignupPage() {
  return (
    <AuthShell mode="sign-up">
      <SignUpForm />
    </AuthShell>
  );
}

export { SignupPage };
