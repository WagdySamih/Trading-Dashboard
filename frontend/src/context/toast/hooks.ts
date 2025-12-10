import { useContext } from "react";
import UIContext from "./ToastContext";
import { type ToastContextType } from "./types";

export const useToast = (): ToastContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
