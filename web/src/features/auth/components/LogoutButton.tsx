import { useState } from "react";
import { Button } from "../../../components/ui/Button";
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
    <Button variant="secondary" className={className} onClick={handleClick} disabled={isPending}>
      {isPending ? "Cerrando..." : "Cerrar sesión"}
    </Button>
  );
}
