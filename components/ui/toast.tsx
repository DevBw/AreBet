"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

// ---- Types ----

export type ToastTone = "goal" | "kickoff" | "finished" | "info";

export type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  addToast: (message: string, tone?: ToastTone) => void;
};

// ---- Context ----

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4500;

const TONE_ICON: Record<ToastTone, string> = {
  goal: "\u26BD",
  kickoff: "\u25CF",
  finished: "\u2713",
  info: "\u2022",
};

// ---- Provider ----

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = `t-${Date.now()}-${++counterRef.current}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toasts.length > 0 && (
        <div
          className="toast-stack"
          role="region"
          aria-label="Match notifications"
          aria-live="polite"
          aria-atomic="false"
        >
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast--${t.tone}`}>
              <span className="toast-icon" aria-hidden="true">
                {TONE_ICON[t.tone]}
              </span>
              <span className="toast-msg">{t.message}</span>
              <button
                type="button"
                className="toast-dismiss"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

// ---- Hook ----

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
