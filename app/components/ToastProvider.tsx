"use client";

import {
  useState,
  useRef,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { Check, CircleAlert, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
type ToastMessage = {
  id: number;
  message: string;
  type: ToastType;
};
type ToastContextValue = (message: string, type?: ToastType) => void;

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, { icon: typeof Check; classes: string }> = {
  success: { icon: Check, classes: "border-blue-200 text-blue-700" },
  error: { icon: CircleAlert, classes: "border-rose-200 text-rose-800" },
  info: { icon: Info, classes: "border-blue-200 text-blue-700" },
};

export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) {
    throw new Error("useToast must be used within ToastProvider.");
  }
  return showToast;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);

  const showToast: ToastContextValue = (message, type = "success") => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, type }].slice(-4));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  };

  function dismissToast(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed right-4 top-4 z-100 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6 sm:top-6"
      >
        {toasts.map((toast) => {
          const { icon: Icon, classes } = toastStyles[toast.type];
          return (
            <div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border bg-white px-4 py-3 shadow-lg ${classes}`}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p className="min-w-0 flex-1 text-sm font-medium leading-5">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
