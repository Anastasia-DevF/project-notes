import type { ToastMessage } from "../types";
import { AlertIcon, CheckIcon, CloseIcon } from "./Icons";

interface ToastsProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function Toasts({ toasts, onDismiss }: ToastsProps) {
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div className={`toast toast--${toast.type}`} key={toast.id}>
          {toast.type === "success" ? <CheckIcon /> : <AlertIcon />}
          <span>{toast.message}</span>
          <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification"><CloseIcon /></button>
        </div>
      ))}
    </div>
  );
}
