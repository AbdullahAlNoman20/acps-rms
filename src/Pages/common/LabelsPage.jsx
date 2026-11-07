import { useMemo, useState } from "react";
import { FiSave } from "react-icons/fi";
import { ENTITIES } from "../../Components/constants/entitySchemas";
import { NAV } from "../../Components/constants/navigation";
import { useCollection } from "../../Components/hooks/useCollection";
import { useToast } from "../../Components/hooks/useToast";
import { labelRegistry } from "../../Components/context/LabelContext";
import { api } from "../../Components/services/api";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";
import Button from "../../Components/Shared/Button";
import Loader from "../../Components/Shared/Loader";

// Rename any menu name, page title or column heading. Empty box = use the original name.
export default function LabelsPage() {
  const { items, loading } = useCollection("labels"); const toast = useToast();
  const [edits, setEdits] = useState({}); const [q, setQ] = useState("");
  const known = useMemo(() => {
    const m = new Map();
    Object.values(NAV).flat().forEach((s) => s.items.forEach((i) => m.set(`nav.${i.to}`, { def: i.label, where: "Menu" })));
    Object.entries(ENTITIES).forEach(([k, e]) => { m.set(`${k}.title`, { def: e.title, where: "Page title" }); e.columns.forEach((c) => { const f = e.fields.find((x) => x.key === c); if (f) m.set(`${k}.${c}`, { def: f.label, where: `${e.title} column` }); }); });
    labelRegistry.forEach((def, key) => { if (!m.has(key)) m.set(key, { def, where: "Page" }); });
    return [...m.entries()].map(([key, v]) => ({ key, ...v }));
  }, []);
  if (loading) return <Loader />;
  const saved = Object.fromEntries(items.map((l) => [l.id, l.text]));
  const value = (k) => (k in edits ? edits[k] : saved[k] || "");
  const rows = known.filter((r) => !q || `${r.key} ${r.def} ${value(r.key)} ${r.where}`.toLowerCase().includes(q.toLowerCase()));
  async function save() {
    const merged = { ...saved, ...edits };
    const out = Object.entries(merged).filter(([k, v]) => v && v.trim()).map(([id, text]) => ({ id, text: text.trim() }));
    await api.replace("labels", out, "Labels changed"); setEdits({}); toast.push("Saved. The new names show everywhere.");
  }
  return (
    <>
      <PageHeader title="Names and labels" note="Type a new name in the box to rename a menu, a page title or a column. Leave the box empty to keep the original name. Press Save when you finish." actions={<Button icon={FiSave} onClick={save}>Save names</Button>} />
      <input className={`${ui.input} mb-4 max-w-md`} placeholder="Search a name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
      <div className="space-y-2">
        {rows.slice(0, 80).map((r) => (
          <div key={r.key} className="grid gap-2 rounded-xl border border-ink-100 bg-white p-3 sm:grid-cols-[1fr_1fr] sm:items-center">
            <div><p className="text-sm font-semibold text-ink-900">{r.def}</p><p className="text-xs text-ink-400">{r.where} - {r.key}</p></div>
            <input className={ui.input} placeholder="New name" value={value(r.key)} onChange={(e) => setEdits({ ...edits, [r.key]: e.target.value })} />
          </div>))}
        {rows.length > 80 && <p className="text-sm text-ink-500">Showing 80 of {rows.length}. Use search to find the rest.</p>}
      </div>
    </>
  );
}
