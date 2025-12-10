"use client";

import {
  createContext,
  useState,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";
import { type Toast, type ToastContextType } from "./types";
import { ToastType } from "enums";

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const toast = useMemo(
    () => ({
      success: (toast: Omit<Toast, "id" | "type">) =>
        addToast({ type: ToastType.Success, ...toast }),
      warning: (toast: Omit<Toast, "id" | "type">) =>
        addToast({ type: ToastType.Warning, ...toast }),
      error: (toast: Omit<Toast, "id" | "type">) =>
        addToast({ type: ToastType.Error, ...toast }),
      info: (toast: Omit<Toast, "id" | "type">) =>
        addToast({ type: ToastType.Info, ...toast }),
    }),
    [addToast],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{ toasts, toast, removeToast, clearAllToasts }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export default ToastContext;
