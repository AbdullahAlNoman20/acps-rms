import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { FEATURES } from "../../config/brand";
import { useAuth } from "../../Components/hooks/useAuth";
import { ROLE_LABELS } from "../../Components/constants/roles";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";

const ROLE_TO_WHO = { it_head: "IT Head", it_admin: "IT Head", exam_authority: "Exam Authority", principal: "Principal", vice_principal: "Vice Principal", teacher: "Teacher", student: "Student", parent: "Parent" };

// How-To Guide: every feature with its name, purpose, steps and notes (read from config/brand.js).
export default function GuidePage() {
  const { user } = useAuth(); const [q, setQ] = useState(""); const [mine, setMine] = useState(true);
  const me = ROLE_TO_WHO[user.role];
  const list = Object.entries(FEATURES).filter(([k, f]) => f.steps && (!mine || f.who.includes(me)) && `${f.name} ${f.tagline} ${f.what}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="How to use the system" subtitle={`${list.length} features${mine ? ` for ${ROLE_LABELS[user.role]}` : ""}`} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" /><input className={`${ui.input} pl-9`} placeholder="Search a feature" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" /></div>
        <label className="flex items-center gap-2 text-sm text-ink-600"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={mine} onChange={(e) => setMine(e.target.checked)} /> Only features for my role</label>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {list.map(([k, f]) => { const Icon = f.icon; return (
          <details key={k} className="group rounded-xl border border-ink-100 bg-white p-4 shadow-card">
            <summary className="flex cursor-pointer list-none items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon size={20} /></span><span><span className="block font-bold text-ink-900">{f.name}</span><span className="block text-sm text-ink-500">{f.tagline}</span></span></summary>
            <div className="mt-3 space-y-3 border-t border-ink-100 pt-3 text-sm text-ink-700">
              <p>{f.what}</p><p className="text-xs text-ink-500">For: {f.who.join(", ")}</p>
              <ol className="list-decimal space-y-1 pl-5">{f.steps.map((s) => <li key={s}>{s}</li>)}</ol>
              {f.nb && <p className="rounded-lg bg-ink-50 px-3 py-2 text-xs"><b className="text-crimson-600">NB:</b> {f.nb}</p>}
              {f.future && <p className="rounded-lg bg-gold-50 px-3 py-2 text-xs"><b className="text-gold-600">In the future:</b> {f.future}</p>}
            </div>
          </details>); })}
      </div>
    </>
  );
}
