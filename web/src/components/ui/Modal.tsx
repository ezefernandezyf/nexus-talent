import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { Card } from "./Card";
import { fadeUpVariants, scaleInVariants } from "./motion";

interface ModalProps {
  children: ReactNode;
  onClose?: () => void;
  title: string;
}

export function Modal({ children, onClose, title }: ModalProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8" role="dialog">
      <motion.button
        aria-label="Cerrar modal"
        className="absolute inset-0 cursor-default bg-surface-container-lowest/70 backdrop-blur-sm"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0 }}
        type="button"
        onClick={onClose}
      />
      <motion.div
        className="relative z-10 w-full max-w-2xl"
        exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
        initial={prefersReducedMotion ? false : "hidden"}
        animate={prefersReducedMotion ? undefined : "visible"}
        variants={scaleInVariants}
      >
        <Card className="p-6 sm:p-8">
          <div className="space-y-2">
            <motion.span className="label-chip" variants={fadeUpVariants}>
              {title}
            </motion.span>
          </div>
          <div className="mt-5">{children}</div>
        </Card>
      </motion.div>
    </motion.div>
  );
}