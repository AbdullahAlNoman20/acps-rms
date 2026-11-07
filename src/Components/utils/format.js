export const cx = (...a) => a.filter(Boolean).join(" ");
export const today = () => new Date().toISOString().slice(0, 10);
export const nowStamp = () => new Date().toISOString().slice(0, 16).replace("T", " ");
export function fmtDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
export function daysLeft(iso) {
  if (!iso) return null;
  const end = new Date(`${iso}T23:59:59`);
  return Math.ceil((end.getTime() - Date.now()) / 86400000);
}
export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00`); d.setDate(d.getDate() + Number(n)); return d.toISOString().slice(0, 10);
}
export const fix = (v, d = 2) => (v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? "-" : Number(v).toFixed(d));
export const titleCase = (s = "") => String(s).replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
export const unique = (a) => [...new Set(a)];
