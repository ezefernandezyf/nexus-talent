import { useContext } from "react";
import { AuthContext, AUTH_MESSAGES, AUTH_STATUS } from "../AuthProvider";

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}

export { AUTH_MESSAGES, AUTH_STATUS };
