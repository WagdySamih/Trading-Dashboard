import { ToastType } from "enums";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

export interface ToastContextType {
  toasts: Toast[];
  toast: {
    success: (toast: Omit<Toast, "id" | "type">) => void;
    error: (toast: Omit<Toast, "id" | "type">) => void;
    warning: (toast: Omit<Toast, "id" | "type">) => void;
    info: (toast: Omit<Toast, "id" | "type">) => void;
  };
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}
