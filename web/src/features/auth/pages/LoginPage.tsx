import React from "react";
import { AuthShell, SignInForm } from "../components";

export default function LoginPage() {
  return (
    <AuthShell mode="sign-in">
      <SignInForm />
    </AuthShell>
  );
}

export { LoginPage };
