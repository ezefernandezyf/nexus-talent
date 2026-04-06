import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const { signOut } = useAuth();
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);

    try {
      await signOut();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button className={className ?? "secondary-button"} type="button" onClick={handleClick} disabled={isPending}>
      {isPending ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
