import { create } from "zustand";

export type ToastVariant = "success" | "warning" | "error" | "info";

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => Toast;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

let toastCounter = 0;

function generateId(): string {
  toastCounter += 1;
  return `toast-${toastCounter}-${Date.now()}`;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (input) => {
    const toast: Toast = {
      id: generateId(),
      duration: 5000,
      ...input,
    };
    set({ toasts: [...get().toasts, toast] });
    return toast;
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));
