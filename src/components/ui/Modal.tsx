import type { ReactNode } from "react";
import { Card } from "./Card";

interface ModalProps {
  children: ReactNode;
  onClose?: () => void;
  title: string;
}

export function Modal({ children, onClose, title }: ModalProps) {
  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8" role="dialog">
      <button
        aria-label="Cerrar modal"
        className="absolute inset-0 cursor-default bg-surface-container-lowest/70 backdrop-blur-sm"
        type="button"
        onClick={onClose}
      />
      <Card className="relative z-10 w-full max-w-2xl p-6 sm:p-8">
        <div className="space-y-2">
          <span className="label-chip">{title}</span>
        </div>
        <div className="mt-5">{children}</div>
      </Card>
    </div>
  );
}