import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiSend } from "react-icons/fi";
import { useCollections } from "../../../../Components/hooks/useCollection";
import { useAuth } from "../../../../Components/hooks/useAuth";
import { useToast } from "../../../../Components/hooks/useToast";
import { useBasePath } from "../../../../Components/hooks/useBasePath";
import { api } from "../../../../Components/services/api";
import { evaluate } from "../../../../engine/expression";
import { DEFAULT_FORMULAS } from "../../../../engine/calc";
import { daysLeft, fmtDate, today } from "../../../../Components/utils/format";
import { ui } from "../../../../theme/ui";
import PageHeader from "../../../../Components/Shared/PageHeader";
import Card from "../../../../Components/Shared/Card";
import Button from "../../../../Components/Shared/Button";
import NoteBox from "../../../../Components/Shared/NoteBox";
import StatusBadge from "../../../../Components/Shared/StatusBadge";
import CountdownBadge from "../../../../Components/Shared/CountdownBadge";
import Loader from "../../../../Components/Shared/Loader";

// Marks entry for ONE batch (class + section + subject). Phone friendly: one card per student.
export default function EntryGridPage() {
  const { examId, batchId } = useParams();
  const { data, loading } = useCollections(["exams", "batches", "students", "courses", "markDistributions", "marks", "submissions", "statusCodes", "ruleFormulas"]);
  const { user, can } = useAuth(); const toast = useToast(); const nav = useNavigate(); const base = useBasePath();
  const [view, setView] = useState("all"); const [vals, setVals] = useState(null); const [errors, setErrors] = useState({}); const [busy, setBusy] = useState(false);
  const exam = data.exams?.find((e) => e.id === examId); const batch = data.batches?.find((b) => b.id === batchId);

  const ctx = useMemo(() => {
    if (!exam || !batch) return null;
    const probe = data.students.find((s) => s.program === batch.program && (batch.group === "All" || s.group === batch.group));
    const d = data.markDistributions.find((x) => x.programs.includes(batch.program) && (x.group === "General" || x.group === (batch.group === "All" ? probe?.group : batch.group)));
    const row = d?.courses.find((c) => c.code === batch.courseCode);
    const students = data.students.filter((s) => s.status === "Active" && s.program === batch.program && s.version === batch.version && s.section === batch.section && (batch.group === "All" || s.group === batch.group)
      && (!row?.religion || s.religion === row.religion) && (row?.role !== "fourthOnly" || s.fourthSubject === row.code)).sort((a, b) => a.roll - b.roll);
    return { row, students };
  }, [exam, batch, data.students, data.markDistributions]);

  useEffect(() => {
    if (!ctx || vals) return;
    const init = {};
    ctx.students.forEach((s) => { const m = data.marks.find((x) => x.id === `${examId}|${s.id}|${batch.courseCode}`); init[s.id] = { comps: { ...(m?.comps || {}) }, status: m?.status || "" }; });
    setVals(init);
  }, [ctx]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !vals) return (loading || !ctx ? (loading ? <Loader /> : <><PageHeader title="Not found" /><NoteBox tone="warning">This batch or exam does not exist.</NoteBox></>) : <Loader />);
  const sub = data.submissions.find((s) => s.id === `${examId}|${batchId}`);
  const mineBatch = batch.teacherId === user.teacherId;
  const granted = !!batch.grantUntil && daysLeft(batch.grantUntil) >= 0 && exam.status !== "published";
  const timeOk = (exam.status === "entry_open" && daysLeft(exam.entryEnd) >= 0) || granted;
  const allowed = batch.canEnter !== "No";
  const editable = can("entry.marks") && mineBatch && allowed && timeOk && sub?.status !== "submitted";
  const why = !mineBatch ? "This batch belongs to another teacher." : !allowed ? "The IT Head has stopped marks entry for this subject." : sub?.status === "submitted" ? "You already submitted these marks. To change them send a correction request." : exam.status !== "entry_open" && !granted ? "Marks entry is closed for this exam." : !timeOk ? "The last date is over. Ask for more time if needed." : "";
  const { row, students } = ctx; const allComps = row?.components || [];
  const monthlyOnly = view === "monthly"; const comps = monthlyOnly ? allComps.filter((c) => c.key.startsWith("mt")) : allComps;
  const cname = data.courses.find((c) => c.code === batch.courseCode)?.name;
  const conv = (raw, pr) => evaluate(data.ruleFormulas.find((f) => f.key === "componentConvert")?.expr || DEFAULT_FORMULAS.componentConvert, { raw, pr }, 0);

  const set = (id, key, v) => { setVals({ ...vals, [id]: { ...vals[id], comps: { ...vals[id].comps, [key]: v } } }); setErrors({ ...errors, [`${id}.${key}`]: "" }); };
  const setStatus = (id, status) => setVals({ ...vals, [id]: { ...vals[id], status } });
  function validate(final) {
    const er = {};
    students.forEach((s) => { const v = vals[s.id]; allComps.forEach((c) => { const x = v.comps[c.key];
      if (x === "" || x === undefined) { if (final && !v.status) er[`${s.id}.${c.key}`] = "Enter marks or choose a status."; return; }
      if (Number(x) < 0 || Number(x) > c.exam) er[`${s.id}.${c.key}`] = `0 to ${c.exam}`; }); });
    setErrors(er); return Object.keys(er).length === 0;
  }
  async function save(final) {
    if (!validate(final)) { toast.push("Some marks need your attention (shown in red).", "error"); return; }
    setBusy(true);
    const recs = students.filter((s) => Object.values(vals[s.id].comps).some((x) => x !== "" && x !== undefined) || vals[s.id].status).map((s) => ({ id: `${examId}|${s.id}|${batch.courseCode}`, examId, studentId: s.id, courseCode: batch.courseCode, comps: Object.fromEntries(Object.entries(vals[s.id].comps).filter(([, x]) => x !== "" && x !== undefined).map(([k, x]) => [k, Number(x)])), status: vals[s.id].status }));
    await api.upsertMany("marks", recs, `${final ? "Submitted" : "Draft"} ${batch.program}-${batch.section} ${batch.courseCode}`);
    await api.upsertMany("submissions", [{ id: `${examId}|${batchId}`, examId, batchId, status: final ? "submitted" : "draft", updatedAt: today() }], final ? "Submitted" : "Draft saved");
    setBusy(false); toast.push(final ? "Submitted. Thank you! The marks are locked." : "Draft saved. You can come back later.");
    if (final) nav(`${base}/entry`);
  }
  return (
    <>
      <PageHeader title={`${cname} - Class ${batch.program}-${batch.section}`} subtitle={`${exam.name} - ${batch.version}${batch.group !== "All" ? `, ${batch.group}` : ""}`}
        actions={<><StatusBadge status={sub?.status || "missing"} label={sub ? undefined : "Not started"} />{exam.status === "entry_open" && <CountdownBadge date={exam.entryEnd} />}</>}
        note={editable ? <>Type marks for each student. Each box shows the highest possible marks. If a student was absent choose a status instead. Press <b>Save draft</b> any time, and <b>Submit</b> when everything is correct (you cannot change after submit).</> : why} noteTone={editable ? "tip" : "warning"} />
      {!row && <NoteBox tone="warning" className="mb-4">This subject has no mark distribution. Ask the IT Head to set it in Mark distribution.</NoteBox>}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-ink-500">Last date: {fmtDate(exam.entryEnd)}{granted ? ` (extra access until ${fmtDate(batch.grantUntil)})` : ""} - {students.length} students</p>
        {allComps.some((c) => c.key.startsWith("mt")) && <div className="inline-flex rounded-lg border border-ink-200 bg-white p-0.5 text-xs font-semibold" role="group" aria-label="Show">{[["all", "All parts"], ["monthly", "Monthly test only"]].map(([k, l]) => <button key={k} type="button" onClick={() => setView(k)} className={`rounded-md px-3 py-1.5 ${view === k ? "bg-brand-600 text-white" : "text-ink-600"}`}>{l}</button>)}</div>}</div>
      <div className="space-y-3">
        {students.map((s) => {
          const v = vals[s.id]; const total = comps.reduce((t, c) => t + (v.comps[c.key] === "" || v.comps[c.key] === undefined ? 0 : conv(Number(v.comps[c.key]), c.pr)), 0);
          return (
            <Card key={s.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm"><b className="text-ink-900">{s.roll}. {s.name}</b> <span className="text-xs text-ink-400">({s.id})</span></p>
                <div className="flex items-center gap-2"><span className="text-xs text-ink-500">Total: <b className="text-ink-900">{total.toFixed(2).replace(/\.00$/, "")}</b>/{row?.fullMark}</span>
                  <select aria-label="Status" className={`${ui.input} w-auto py-1.5 text-xs`} disabled={!editable} value={v.status} onChange={(e) => setStatus(s.id, e.target.value)}><option value="">Present</option>{data.statusCodes.map((c) => <option key={c.code} value={c.code}>{c.code} - {c.label}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {comps.map((c) => (
                  <div key={c.key}><label className={ui.label}>{c.label} <span className="font-normal text-ink-400">/ {c.exam}</span></label>
                    <input type="number" inputMode="decimal" step="0.5" min="0" max={c.exam} className={`${ui.input} ${errors[`${s.id}.${c.key}`] ? "border-crimson-500" : ""}`} disabled={!editable || !!v.status} value={v.comps[c.key] ?? ""} onChange={(e) => set(s.id, c.key, e.target.value === "" ? "" : Number(e.target.value))} />
                    {errors[`${s.id}.${c.key}`] && <p className={ui.error}>{errors[`${s.id}.${c.key}`]}</p>}</div>))}
              </div>
            </Card>);
        })}
        {students.length === 0 && <NoteBox tone="info">No students in this batch.</NoteBox>}
      </div>
      {editable && (
        <div className="sticky bottom-[60px] z-30 -mx-3 mt-5 md:bottom-0 flex flex-wrap gap-2 border-t border-ink-100 bg-cream-50/95 px-3 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <Button variant="secondary" icon={FiSave} disabled={busy} onClick={() => save(false)}>Save draft</Button>
          {!monthlyOnly && <Button icon={FiSend} disabled={busy} onClick={() => save(true)}>Submit marks</Button>}{monthlyOnly && <span className="self-center text-xs text-ink-500">Switch to "All parts" to submit.</span>}
        </div>)}
    </>
  );
}
