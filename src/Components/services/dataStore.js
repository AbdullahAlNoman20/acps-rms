// Local data layer: first load reads /public/data/<name>.json, then everything lives in localStorage.
// A backend developer replaces ONLY this file (and api.js) with real HTTP calls.
import { STORAGE_PREFIX, SEED_BASE, SEED_VERSION, COLLECTIONS } from "../../config/appConfig";

const mem = new Map();
const pending = new Map();
const key = (n) => `${STORAGE_PREFIX}${n}`;
const emit = (name) => window.dispatchEvent(new CustomEvent("acps:data", { detail: name }));

export const dataStore = {
  init() {
    if (localStorage.getItem(key("__seed")) !== SEED_VERSION) {
      Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX) && k !== key("session")).forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(key("__seed"), SEED_VERSION);
    }
  },
  async load(name) {
    if (mem.has(name)) return mem.get(name);
    if (pending.has(name)) return pending.get(name);
    const p = (async () => {
      const raw = localStorage.getItem(key(name));
      if (raw) { try { const v = JSON.parse(raw); mem.set(name, v); return v; } catch { /* fall through to seed */ } }
      const res = await fetch(`${SEED_BASE}/${name}.json`);
      const v = res.ok ? await res.json() : [];
      this.save(name, v, true);
      return v;
    })();
    pending.set(name, p);
    try { return await p; } finally { pending.delete(name); }
  },
  save(name, items, silent = false) {
    mem.set(name, items);
    try { localStorage.setItem(key(name), JSON.stringify(items)); } catch (e) { console.error("Storage is full", e); }
    if (!silent) emit(name);
  },
  async reset(name) {
    mem.delete(name); localStorage.removeItem(key(name));
    const v = await this.load(name); emit(name); return v;
  },
  async resetAll() {
    for (const n of COLLECTIONS) { mem.delete(n); localStorage.removeItem(key(n)); }
    for (const n of COLLECTIONS) await this.load(n);
    COLLECTIONS.forEach(emit);
  },
  async exportAll() {
    const out = {};
    for (const n of COLLECTIONS) out[n] = await this.load(n);
    return out;
  },
  async importAll(obj) {
    for (const n of COLLECTIONS) if (Array.isArray(obj[n])) this.save(n, obj[n], true);
    COLLECTIONS.forEach(emit);
  },
  getSession() { try { return JSON.parse(localStorage.getItem(key("session")) || "null"); } catch { return null; } },
  setSession(s) { localStorage.setItem(key("session"), JSON.stringify(s)); },
  clearSession() { localStorage.removeItem(key("session")); },
};
