// Customisable labels: every heading/column/menu name is read with t(key, "Default text").
// The IT Head can rename any of them on the Labels page; renamed text is saved in the "labels" collection.
import { createContext, useCallback, useMemo } from "react";
import { useCollection } from "../hooks/useCollection";

export const LabelContext = createContext({ t: (k, f) => f });
export const labelRegistry = new Map(); // key -> default text (filled while the app is used)

export function LabelProvider({ children }) {
  const { items } = useCollection("labels");
  const map = useMemo(() => Object.fromEntries(items.map((l) => [l.id, l.text])), [items]);
  const t = useCallback((key, fallback) => {
    if (key && fallback && !labelRegistry.has(key)) labelRegistry.set(key, fallback);
    return map[key] || fallback;
  }, [map]);
  const value = useMemo(() => ({ t }), [t]);
  return <LabelContext.Provider value={value}>{children}</LabelContext.Provider>;
}
