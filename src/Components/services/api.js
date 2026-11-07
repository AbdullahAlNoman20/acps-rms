// BACKEND HAND-OVER POINT: every page talks to data ONLY through this file.
// Replace each function body with fetch("/api/<name>") calls and nothing else in the app changes.
import { dataStore } from "./dataStore";
import { makeId } from "../utils/ids";
import { nowStamp } from "../utils/format";

async function audit(action, entity, ref, detail = "") {
  if (entity === "audit") return;
  const s = dataStore.getSession();
  const list = await dataStore.load("audit");
  dataStore.save("audit", [{ id: makeId("AU"), at: nowStamp(), user: s?.name || "system", role: s?.role || "", action, entity, ref, detail }, ...list].slice(0, 2000));
}

export const api = {
  list: (name) => dataStore.load(name),
  async get(name, id) { return (await dataStore.load(name)).find((i) => i.id === id) || null; },
  async create(name, item) {
    const items = await dataStore.load(name);
    const rec = { ...item, id: item.id || makeId(name.slice(0, 3).toUpperCase()) };
    dataStore.save(name, [...items, rec]); await audit("create", name, rec.id); return rec;
  },
  async update(name, id, patch, detail = "") {
    const items = await dataStore.load(name);
    dataStore.save(name, items.map((i) => (i.id === id ? { ...i, ...patch } : i))); await audit("update", name, id, detail);
  },
  async remove(name, id) {
    const items = await dataStore.load(name);
    dataStore.save(name, items.filter((i) => i.id !== id)); await audit("delete", name, id);
  },
  async replace(name, items, detail = "") { dataStore.save(name, items); await audit("replace", name, "*", detail); },
  async upsertMany(name, recs, detail = "") {
    const items = await dataStore.load(name);
    const map = new Map(items.map((i) => [i.id, i]));
    recs.forEach((r) => map.set(r.id, { ...(map.get(r.id) || {}), ...r }));
    dataStore.save(name, [...map.values()]); await audit("upsert", name, `${recs.length} records`, detail);
  },
  audit,
};
