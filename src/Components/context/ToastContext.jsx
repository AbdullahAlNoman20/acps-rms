import { createContext, useCallback, useMemo, useState } from "react";
import { FiCheckCircle, FiAlertTriangle, FiInfo } from "react-icons/fi";

export const ToastContext = createContext(null);
const TONE = { success: "border-brand-300 bg-brand-50 text-brand-800", error: "border-crimson-100 bg-crimson-50 text-crimson-700", info: "border-ink-200 bg-white text-ink-700" };
const ICON = { success: FiCheckCircle, error: FiAlertTriangle, info: FiInfo };

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, tone = "success") => {
    const id = Math.random().toString(36).slice(2);
    setItems((l) => [...l, { id, message, tone }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 3800);
  }, []);
  const value = useMemo(() => ({ push }), [push]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-3" aria-live="polite">
        {items.map((t) => {
          const Icon = ICON[t.tone] || FiInfo;
          return (
            <div key={t.id} className={`pointer-events-auto flex w-full max-w-md items-start gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-card ${TONE[t.tone]}`}>
              <Icon className="mt-0.5 shrink-0" /> <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
