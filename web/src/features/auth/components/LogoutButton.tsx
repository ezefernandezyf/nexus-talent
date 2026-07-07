import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Button, type ButtonVariant } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface LogoutButtonProps {
  className?: string;
  variant?: ButtonVariant;
  onConfirm?: () => void;
}

export function LogoutButton({ className, variant = "outline", onConfirm }: LogoutButtonProps) {
  const { signOut } = useAuth();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  async function handleConfirm() {
    setIsPending(true);

    try {
      await signOut();
      onConfirm?.();
      navigate("/auth/sign-in", { replace: true });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <Button
        variant={variant}
        className={className}
        data-testid="logout-button"
        onClick={(e) => { e.stopPropagation(); setIsConfirmOpen(true); }}
        disabled={isPending}
      >
        {isPending ? "Cerrando..." : "Cerrar sesión"}
      </Button>

      <AnimatePresence>
        {isConfirmOpen ? (
          <Modal onClose={() => setIsConfirmOpen(false)} title="¿Estás seguro?">
            <div className="space-y-5">
              <p className="text-sm leading-7 text-text-secondary">
                Se cerrará tu sesión y volverás a la página de inicio.
              </p>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setIsConfirmOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleConfirm} disabled={isPending}>
                  {isPending ? "Cerrando..." : "Cerrar sesión"}
                </Button>
              </div>
            </div>
          </Modal>
        ) : null}
      </AnimatePresence>
    </>
  );
}
