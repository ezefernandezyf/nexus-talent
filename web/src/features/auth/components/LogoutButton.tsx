import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const { signOut } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  async function handleClick() {
    setIsPending(true);

    try {
      await signOut();
      navigate("/auth/sign-in", { replace: true });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button variant="outline" className={className} data-testid="logout-button" onClick={handleClick} disabled={isPending}>
      {isPending ? "Cerrando..." : "Cerrar sesión"}
    </Button>
  );
}
