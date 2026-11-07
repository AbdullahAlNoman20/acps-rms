import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

export function useCollection(name) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => { setItems(await api.list(name)); setLoading(false); }, [name]);
  useEffect(() => {
    reload();
    const h = (e) => { if (e.detail === name) reload(); };
    window.addEventListener("acps:data", h);
    return () => window.removeEventListener("acps:data", h);
  }, [name, reload]);
  return {
    items, loading, reload,
    create: (i) => api.create(name, i), update: (id, p, d) => api.update(name, id, p, d), remove: (id) => api.remove(name, id),
    replace: (arr, d) => api.replace(name, arr, d), upsertMany: (arr, d) => api.upsertMany(name, arr, d),
  };
}

// Loads many collections at once: const { data, loading } = useCollections(["students", "exams"])
export function useCollections(names) {
  const sig = names.join(",");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    const list = sig.split(",").filter(Boolean);
    const load = async () => {
      const entries = await Promise.all(list.map(async (n) => [n, await api.list(n)]));
      if (alive) { setData(Object.fromEntries(entries)); setLoading(false); }
    };
    load();
    const h = (e) => { if (list.includes(e.detail)) load(); };
    window.addEventListener("acps:data", h);
    return () => { alive = false; window.removeEventListener("acps:data", h); };
  }, [sig]);
  return { data, loading };
}
