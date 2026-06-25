import type { Transition, Variants } from "framer-motion";

export const uiTransition: Transition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1],
};

export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: uiTransition,
  },
};

export const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: uiTransition,
  },
};

export const panelSlideVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 28,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: uiTransition,
  },
  exit: {
    opacity: 0,
    x: 28,
    transition: {
      duration: 0.24,
      ease: [0.4, 0, 1, 1],
    },
  },
};