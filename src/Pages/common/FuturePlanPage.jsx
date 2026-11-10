import { useState } from "react";
import { FiPrinter, FiCheck } from "react-icons/fi";
import { FEATURES } from "../../config/brand";
import { SCHOOL_CHECKLIST, DEVELOPER_STEPS, LATER_IDEAS } from "../../config/roadmap";
import { useCollection } from "../../Components/hooks/useCollection";
import { api } from "../../Components/services/api";
import PageHeader from "../../Components/Shared/PageHeader";
import Tabs from "../../Components/Shared/Tabs";
import Card from "../../Components/Shared/Card";
import Button from "../../Components/Shared/Button";
import NoteBox from "../../Components/Shared/NoteBox";
import Loader from "../../Components/Shared/Loader";

// Future Plan: instructions for going live. Content comes from config/roadmap.js and config/brand.js.
export default function FuturePlanPage() {
  const { items, loading } = useCollection("settings");
  const [tab, setTab] = useState("school");
  if (loading) return <Loader />;
  const done = items[0]?.checklist || {};
  const toggle = (id) => api.update("settings", "main", { checklist: { ...done, [id]: !done[id] } }, "Checklist changed");
  const count = SCHOOL_CHECKLIST.filter((c) => done[c.id]).length;
  return (
    <>
      <PageHeader title="Future Plan" subtitle="What works today, what the school must give, and what the developer does next" actions={<Button variant="secondary" icon={FiPrinter} onClick={() => window.print()}>Print</Button>} />
      <Tabs value={tab} onChange={setTab} tabs={[{ value: "school", label: `School checklist (${count}/${SCHOOL_CHECKLIST.length})` }, { value: "dev", label: "Developer steps" }, { value: "today", label: "Works today" }, { value: "later", label: "Later ideas" }]} />
      {tab === "school" && (<>
        <NoteBox className="mb-4" title="What the school must give">Tick each item when it is done. Every item says why it is needed, how to do it and what to watch out for.</NoteBox>
        <div className="space-y-3">{SCHOOL_CHECKLIST.map((c) => (
          <Card key={c.id}>
            <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-brand-600" checked={!!done[c.id]} onChange={() => toggle(c.id)} />
              <span className="min-w-0"><span className="block font-semibold text-ink-900">{c.title}</span><span className="mt-1 block text-sm text-ink-600"><b>Why:</b> {c.why}</span><span className="mt-1 block text-sm text-ink-600"><b>How:</b> {c.how}</span>{c.nb && <span className="mt-1 block text-xs text-ink-500"><b className="text-crimson-600">NB:</b> {c.nb}</span>}</span></label>
          </Card>))}</div></>)}
      {tab === "dev" && (<>
        <NoteBox className="mb-4" title="For the backend developer">The screens already work with sample data kept in the browser. These steps move the data to a real server without changing any screen.</NoteBox>
        <div className="space-y-3">{DEVELOPER_STEPS.map((s) => (
          <Card key={s.id} title={s.title}><ol className="list-decimal space-y-1 pl-5 text-sm text-ink-700">{s.how.map((h) => <li key={h}>{h}</li>)}</ol>{s.nb && <p className="mt-2 text-xs text-ink-500"><b className="text-crimson-600">NB:</b> {s.nb}</p>}</Card>))}</div></>)}
      {tab === "today" && (
        <div className="grid gap-3 lg:grid-cols-2">{Object.values(FEATURES).filter((f) => f.future).map((f) => { const Icon = f.icon; return (
          <Card key={f.name}><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon /></span><div><p className="font-semibold text-ink-900">{f.name} <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700"><FiCheck size={11} /> Works today</span></p><p className="mt-1 text-sm text-ink-600"><b>Next:</b> {f.future}</p></div></div></Card>); })}</div>)}
      {tab === "later" && <div className="grid gap-3 sm:grid-cols-2">{LATER_IDEAS.map(([t, d]) => <Card key={t} title={t}><p className="text-sm text-ink-600">{d}</p></Card>)}</div>}
    </>
  );
}
