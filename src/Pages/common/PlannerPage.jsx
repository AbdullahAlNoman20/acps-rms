import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSave, FiCopy } from "react-icons/fi";
import { useCollections } from "../../Components/hooks/useCollection";
import { useToast } from "../../Components/hooks/useToast";
import { api } from "../../Components/services/api";
import { makeId } from "../../Components/utils/ids";
import { unique } from "../../Components/utils/format";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";
import Card from "../../Components/Shared/Card";
import Tabs from "../../Components/Shared/Tabs";
import Button from "../../Components/Shared/Button";
import NoteBox from "../../Components/Shared/NoteBox";
import StatusBadge from "../../Components/Shared/StatusBadge";
import Loader from "../../Components/Shared/Loader";
import { FieldBlock } from "../../Components/Shared/FormFields";

const sameSec = (b, s) => b.program === s.program && b.version === s.version && b.section === s.section;

export default function PlannerPage() {
  const { data, loading } = useCollections(["batches", "teachers", "students", "markDistributions", "courses", "programs", "versions", "sections"]);
  const [sp] = useSearchParams(); const toast = useToast();
  const [tab, setTab] = useState("section");
  const [sel, setSel] = useState({ program: sp.get("program") || "IX", version: sp.get("version") || "Bangla", section: sp.get("section") || "A" });
  const [plan, setPlan] = useState(null); const [copyFrom, setCopyFrom] = useState("");
  const [subj, setSubj] = useState({ code: "", plan: null });
  const cn = (c) => data.courses?.find((x) => x.code === c)?.name || c;

  const studs = useMemo(() => (data.students || []).filter((s) => s.status === "Active" && s.program === sel.program && s.version === sel.version && s.section === sel.section), [data.students, sel]);
  const rows = useMemo(() => unique(studs.map((s) => s.group)).flatMap((g) => {
    const d = (data.markDistributions || []).find((x) => x.programs.includes(sel.program) && (x.group === "General" || x.group === g));
    const gs = studs.filter((s) => s.group === g);
    return (d?.courses || []).filter((c) => (!c.religion || gs.some((s) => s.religion === c.religion)) && (c.role !== "fourthOnly" || gs.some((s) => s.fourthSubject === c.code))).map((c) => ({ key: `${g}|${c.code}`, group: g, code: c.code, name: c.name }));
  }), [studs, data.markDistributions, sel.program]);

  const initial = useMemo(() => {
    const bs = (data.batches || []).filter((b) => sameSec(b, sel));
    return { ct: bs.find((b) => b.isClassTeacher === "Yes")?.teacherId || "", t: Object.fromEntries(bs.filter((b) => b.courseCode !== "*").map((b) => [`${b.group}|${b.courseCode}`, b.teacherId])) };
  }, [data.batches, sel]);
  useEffect(() => setPlan(initial), [initial]);

  // "By subject" tab: one subject across all sections of a class
  const subjectCodes = useMemo(() => unique((data.markDistributions || []).filter((d) => d.programs.includes(sel.program)).flatMap((d) => d.courses.map((c) => c.code))), [data.markDistributions, sel.program]);
  const code = subj.code && subjectCodes.includes(subj.code) ? subj.code : subjectCodes[0];
  const spots = useMemo(() => {
    const out = [];
    (data.versions || []).forEach((v) => (data.sections || []).forEach((s) => {
      const gs = (data.students || []).filter((x) => x.status === "Active" && x.program === sel.program && x.version === v.name && x.section === s.name);
      unique(gs.map((x) => x.group)).forEach((g) => { const d = data.markDistributions.find((y) => y.programs.includes(sel.program) && (y.group === "General" || y.group === g)); const c = d?.courses.find((y) => y.code === code); if (!c) return;
        const ss = gs.filter((x) => x.group === g); if (c.religion && !ss.some((x) => x.religion === c.religion)) return; if (c.role === "fourthOnly" && !ss.some((x) => x.fourthSubject === code)) return;
        out.push({ key: `${v.name}|${s.name}|${g}`, version: v.name, section: s.name, group: g }); });
    }));
    return out;
  }, [data, sel.program, code]);
  const subjInitial = useMemo(() => Object.fromEntries(spots.map((p) => [p.key, (data.batches || []).find((b) => b.program === sel.program && b.version === p.version && b.section === p.section && b.group === p.group && b.courseCode === code)?.teacherId || ""])), [spots, data.batches, sel.program, code]);
  useEffect(() => setSubj((x) => ({ ...x, plan: subjInitial })), [subjInitial]);

  if (loading || !plan) return <Loader />;
  const Teach = ({ value, onChange, label }) => (<select aria-label={label} className={ui.input} value={value || ""} onChange={(e) => onChange(e.target.value)}><option value="">- no teacher yet -</option>{data.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>);
  const pick = (k, v) => setPlan({ ...plan, t: { ...plan.t, [k]: v } });

  async function saveSection() {
    const old = data.batches.filter((b) => sameSec(b, sel)); const keep = Object.fromEntries(old.map((b) => [`${b.group}|${b.courseCode}`, b]));
    const next = [];
    rows.forEach((r) => { const tid = plan.t[r.key]; if (tid) next.push({ canEnter: "Yes", grantUntil: "", ...(keep[r.key] || { id: makeId("B") }), teacherId: tid, ...sel, group: r.group, courseCode: r.code, isClassTeacher: "No" }); });
    if (plan.ct) next.push({ canEnter: "Yes", grantUntil: "", ...(keep["All|*"] || { id: makeId("B") }), teacherId: plan.ct, ...sel, group: "All", courseCode: "*", isClassTeacher: "Yes" });
    await api.replace("batches", [...data.batches.filter((b) => !sameSec(b, sel)), ...next], `Teacher plan ${sel.program}-${sel.section} ${sel.version}`); toast.push("Plan saved. Teachers now see these subjects.");
  }
  function doCopy() {
    if (!copyFrom) return; const [v, s] = copyFrom.split("|"); const src = data.batches.filter((b) => b.program === sel.program && b.version === v && b.section === s);
    setPlan({ ct: plan.ct, t: { ...plan.t, ...Object.fromEntries(src.filter((b) => b.courseCode !== "*").map((b) => [`${b.group}|${b.courseCode}`, b.teacherId]).filter(([k]) => rows.some((r) => r.key === k))) } }); toast.push("Copied. Check the plan and press Save.", "info");
  }
  async function saveSubject() {
    const old = data.batches.filter((b) => b.program === sel.program && b.courseCode === code); const keepOf = (p) => old.find((b) => b.version === p.version && b.section === p.section && b.group === p.group);
    const next = spots.filter((p) => subj.plan[p.key]).map((p) => ({ canEnter: "Yes", grantUntil: "", ...(keepOf(p) || { id: makeId("B") }), teacherId: subj.plan[p.key], program: sel.program, version: p.version, section: p.section, group: p.group, courseCode: code, isClassTeacher: "No" }));
    await api.replace("batches", [...data.batches.filter((b) => !(b.program === sel.program && b.courseCode === code)), ...next], `Subject plan ${sel.program} ${code}`); toast.push("Subject plan saved.");
  }
  const missing = rows.filter((r) => !plan.t[r.key]).length;
  const progs = data.programs.map((p) => p.name);
  return (
    <>
      <PageHeader title="Teacher Planner" subtitle="Give every subject and every section a teacher" />
      <Tabs value={tab} onChange={setTab} tabs={[{ value: "section", label: "By section" }, { value: "subject", label: "By subject" }]} />
      <Card className="mb-4"><div className="grid gap-3 sm:grid-cols-3">
        <FieldBlock field={{ label: "Class" }}><select className={ui.input} value={sel.program} onChange={(e) => setSel({ ...sel, program: e.target.value })}>{progs.map((p) => <option key={p}>{p}</option>)}</select></FieldBlock>
        {tab === "section" && <><FieldBlock field={{ label: "Version" }}><select className={ui.input} value={sel.version} onChange={(e) => setSel({ ...sel, version: e.target.value })}>{data.versions.map((v) => <option key={v.id}>{v.name}</option>)}</select></FieldBlock>
          <FieldBlock field={{ label: "Section" }}><select className={ui.input} value={sel.section} onChange={(e) => setSel({ ...sel, section: e.target.value })}>{data.sections.map((v) => <option key={v.id}>{v.name}</option>)}</select></FieldBlock></>}
        {tab === "subject" && <FieldBlock field={{ label: "Subject" }}><select className={ui.input} value={code} onChange={(e) => setSubj({ ...subj, code: e.target.value })}>{subjectCodes.map((c) => <option key={c} value={c}>{c} - {cn(c)}</option>)}</select></FieldBlock>}
      </div></Card>
      {tab === "section" && (studs.length === 0 ? <NoteBox tone="info">No students in this section yet, so there is nothing to plan.</NoteBox> : (
        <>
          <Card title="Class teacher" subtitle="One class teacher for each section" className="mb-4"><Teach label="Class teacher" value={plan.ct} onChange={(v) => setPlan({ ...plan, ct: v })} /></Card>
          <Card title="Subject teachers" subtitle={`${rows.length} subjects - ${missing ? `${missing} without a teacher` : "all have a teacher"}`} actions={<div className="flex flex-wrap items-center gap-2"><select aria-label="Copy from" className={`${ui.input} w-auto py-1.5 text-xs`} value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)}><option value="">Copy plan from...</option>{data.versions.flatMap((v) => data.sections.map((s) => ({ v: v.name, s: s.name }))).filter((x) => !(x.v === sel.version && x.s === sel.section)).map((x) => <option key={`${x.v}|${x.s}`} value={`${x.v}|${x.s}`}>{sel.program}-{x.s} ({x.v})</option>)}</select><Button size="sm" variant="secondary" icon={FiCopy} onClick={doCopy}>Copy</Button></div>}>
            <div className="divide-y divide-ink-100">
              {rows.map((r) => (
                <div key={r.key} className="grid gap-2 py-3 sm:grid-cols-[1fr_1fr] sm:items-center">
                  <div><p className="text-sm font-semibold text-ink-900">{r.name} <span className="font-normal text-ink-400">({r.code})</span></p><p className="text-xs text-ink-500">{r.group !== "General" ? `${r.group} group` : "All students"}</p></div>
                  <Teach label={`Teacher for ${r.name}`} value={plan.t[r.key]} onChange={(v) => pick(r.key, v)} />
                </div>))}
            </div>
          </Card>
          <div className="sticky bottom-16 mt-4 md:bottom-0"><Button icon={FiSave} onClick={saveSection}>Save plan</Button></div>
        </>))}
      {tab === "subject" && subj.plan && (
        <Card title={`${cn(code)} in Class ${sel.program}`} subtitle="Choose the teacher for every section that studies this subject">
          <div className="divide-y divide-ink-100">{spots.map((p) => (<div key={p.key} className="grid gap-2 py-3 sm:grid-cols-[1fr_1fr] sm:items-center"><p className="text-sm font-semibold text-ink-900">{sel.program}-{p.section} ({p.version}){p.group !== "General" && <span className="ml-1 text-xs font-normal text-ink-400">{p.group}</span>}</p><Teach label="Teacher" value={subj.plan[p.key]} onChange={(v) => setSubj({ ...subj, plan: { ...subj.plan, [p.key]: v } })} /></div>))}</div>
          {spots.length === 0 && <StatusBadge status="missing" label="No section studies this subject" />}
          <Button className="mt-4" icon={FiSave} onClick={saveSubject}>Save subject plan</Button>
        </Card>)}
    </>
  );
}
