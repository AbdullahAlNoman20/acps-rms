import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FiAlertTriangle, FiCornerUpLeft, FiSave } from "react-icons/fi";
import { useCollections } from "../../Components/hooks/useCollection";
import { useAuth } from "../../Components/hooks/useAuth";
import { useToast } from "../../Components/hooks/useToast";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { api } from "../../Components/services/api";
import { EXAM_FLOW, EXAM_STATUS_LABEL } from "../../Components/constants/examStatus";
import { addDays, fmtDate, today } from "../../Components/utils/format";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";
import Card from "../../Components/Shared/Card";
import NoteBox from "../../Components/Shared/NoteBox";
import Stepper from "../../Components/Shared/Stepper";
import StatusBadge from "../../Components/Shared/StatusBadge";
import CountdownBadge from "../../Components/Shared/CountdownBadge";
import Button from "../../Components/Shared/Button";
import StatCard from "../../Components/Shared/StatCard";
import DataTable from "../../Components/Shared/DataTable";
import FilterBar from "../../Components/Shared/FilterBar";
import Loader from "../../Components/Shared/Loader";
import { NEXT_STEP } from "./ExamsPage";

// Each step: who can press it, what it does, what it tells the user.
const STEPS = [
  { from: "setup", to: "entry_open", label: "Open marks entry window", perm: "entry.window", who: "IT Head", info: "Teachers will be able to enter marks from today until the end date you choose below." },
  { from: "entry_open", to: "entry_closed", label: "Close marks entry now", perm: "entry.window", who: "IT Head", info: "Teachers will not be able to change marks after this. Use it when all batches have submitted or the time is over." },
  { from: "entry_closed", to: "calculated", label: "Run calculation", perm: "calc.run", who: "IT Head", info: "The system calculates every student's marks, grade, GPA and merit position using the rules in the Rules page." },
  { from: "calculated", to: "verified", label: "Verify and confirm", perm: "results.verify", who: "IT Head", info: "Open the Results page, check the numbers, then confirm here.", link: "results" },
  { from: "verified", to: "sent", label: "Send to Principal and Vice Principal", perm: "results.verify", who: "IT Head", info: "They will see this exam in their review list." },
  { from: "sent", to: "vp_reviewed", label: "Mark as reviewed", perm: "results.review", who: "Vice Principal", sig: ["vice_principal", "reviewed"], info: "Check the results and mark them reviewed." },
  { from: "sent", to: "principal_signed", label: "Sign the results", perm: "results.sign", who: "Principal", sig: ["principal", "signed"], info: "Your digital signature will print on every transcript of this exam." },
  { from: "vp_reviewed", to: "principal_signed", label: "Sign the results", perm: "results.sign", who: "Principal", sig: ["principal", "signed"], info: "Your digital signature will print on every transcript of this exam." },
  { from: "principal_signed", to: "published", label: "Publish to students and parents", perm: "results.publish", who: "IT Head", info: "Students and parents will see the result in their portal immediately." },
];

export default function ExamDetailPage() {
  const { id } = useParams();
  const { data, loading } = useCollections(["exams", "batches", "submissions", "courses", "teachers", "students", "marks", "ruleParams"]);
  const { user, can } = useAuth(); const toast = useToast(); const base = useBasePath();
  const [reason, setReason] = useState(""); const [dates, setDates] = useState(null); const [f, setF] = useState({});
  const exam = data.exams?.find((e) => e.id === id);

  const progress = useMemo(() => {
    if (!exam) return [];
    const subs = new Map((data.submissions || []).filter((s) => s.examId === exam.id).map((s) => [s.batchId, s]));
    const past = EXAM_FLOW.indexOf(exam.status) > EXAM_FLOW.indexOf("entry_open");
    const cname = Object.fromEntries(data.courses.map((c) => [c.code, c.name])); const tname = Object.fromEntries(data.teachers.map((t) => [t.id, t.name]));
    return data.batches.filter((b) => exam.programs.includes(b.program) && b.courseCode !== "*").map((b) => ({
      id: b.id, cls: `${b.program}-${b.section} (${b.version}${b.group !== "General" ? `, ${b.group}` : ""})`, subject: cname[b.courseCode] || b.courseCode, teacher: tname[b.teacherId] || b.teacherId,
      status: past ? "locked" : subs.get(b.id)?.status || "not_started",
    }));
  }, [exam, data]);

  if (loading) return <Loader />;
  if (!exam) return <><PageHeader title="Exam not found" /><NoteBox tone="warning">This exam does not exist. Go back and choose another.</NoteBox></>;

  const params = Object.fromEntries(data.ruleParams.map((p) => [p.key, p.value]));
  const counts = { submitted: progress.filter((p) => ["submitted", "locked"].includes(p.status)).length, draft: progress.filter((p) => p.status === "draft").length, not_started: progress.filter((p) => p.status === "not_started").length };
  const withMarks = new Set(data.marks.filter((m) => m.examId === exam.id).map((m) => m.studentId));
  const noMarks = data.students.filter((s) => s.status === "Active" && exam.programs.includes(s.program) && !withMarks.has(s.id)).length;
  const actions = STEPS.filter((s) => s.from === exam.status);
  const dt = dates || { start: exam.entryStart || today(), end: exam.entryEnd || addDays(today(), Number(params.entryDays || 15)) };

  async function go(step) {
    const patch = { status: step.to };
    if (step.to === "entry_open") { patch.entryStart = dt.start; patch.entryEnd = dt.end; }
    if (step.sig) patch.signatures = [...(exam.signatures || []).filter((s) => s.role !== step.sig[0]), { role: step.sig[0], name: user.name, at: today(), action: step.sig[1] }];
    await api.update("exams", exam.id, patch, `${exam.status} -> ${step.to}`);
    toast.push(`Done. Now: ${EXAM_STATUS_LABEL[step.to]}.`);
  }
  async function sendBack(to, label) {
    if (!reason.trim()) { toast.push("Please write the reason first.", "error"); return; }
    await api.update("exams", exam.id, { status: to, note: `${label}: ${reason.trim()} (${user.name}, ${fmtDate(today())})`, signatures: [] }, label);
    setReason(""); toast.push("Sent back with your reason.");
  }
  async function saveDates() { await api.update("exams", exam.id, { entryStart: dt.start, entryEnd: dt.end }, "Entry window changed"); toast.push("Entry window saved."); }
  const filtered = progress.filter((p) => !f.status || p.status === f.status);
  const isBoard = exam.type === "board";

  return (
    <>
      <PageHeader title={exam.name} subtitle={`Classes ${exam.programs.length > 3 ? `${exam.programs[0]} to ${exam.programs[exam.programs.length - 1]}` : exam.programs.join(", ")} - Session ${exam.session}`}
        actions={<StatusBadge status={exam.status} />} note={NEXT_STEP[exam.status]} noteTitle="What happens next" />
      {exam.note && <NoteBox tone="warning" className="mb-4" title="Note on this exam">{exam.note}</NoteBox>}
      {!isBoard && <Card className="mb-4" title="Progress"><Stepper steps={EXAM_FLOW.map((v) => ({ value: v, label: EXAM_STATUS_LABEL[v] }))} current={exam.status} /></Card>}
      {isBoard ? (
        <Card title="SSC Board exam"><p className="text-sm text-ink-600">The Board marks the papers and publishes the result. Type it in the Class X and SSC page after it is published.</p><Button className="mt-3" to={`${base}/ssc`}>Open Class X and SSC page</Button></Card>
      ) : (
        <>
          <Card className="mb-4" title="Next action">
            {actions.length === 0 && <p className="text-sm text-ink-600">{exam.status === "published" ? "This exam is complete." : "Nothing to press at this step."}</p>}
            {exam.status === "entry_closed" || exam.status === "calculated" ? (noMarks > 0 ? <NoteBox tone="warning" className="mb-3" title={`${noMarks} students have no marks`}>These students will show as Incomplete in the results. Ask teachers to finish entry, or continue if this is expected.</NoteBox> : null) : null}
            <div className="space-y-3">
              {actions.map((s) => (
                <div key={s.label} className="rounded-xl border border-ink-100 p-3">
                  <p className="text-sm text-ink-600">{s.info}</p>
                  {can(s.perm) ? (
                    <div className="mt-2 flex flex-wrap gap-2"><Button onClick={() => go(s)}>{s.label}</Button>{s.link && <Button variant="secondary" to={`${base}/${s.link}`}>Open results to check</Button>}</div>
                  ) : <p className="mt-2 text-xs font-semibold text-ink-500">Waiting for: {s.who}</p>}
                </div>
              ))}
              {["sent", "vp_reviewed", "principal_signed"].includes(exam.status) && can("results.review") && (
                <div className="rounded-xl border border-crimson-100 bg-crimson-50/40 p-3">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-crimson-700"><FiAlertTriangle /> Something is wrong? Send back to the IT Head</p>
                  <textarea className={ui.input} rows={2} placeholder="Write the reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} />
                  <Button className="mt-2" variant="danger" icon={FiCornerUpLeft} onClick={() => sendBack("calculated", "Returned")}>Return with reason</Button>
                </div>
              )}
              {exam.status === "published" && can("results.publish") && (
                <div className="rounded-xl border border-ink-100 p-3"><p className="mb-2 text-sm text-ink-600">Found a mistake after publishing? Withdraw the result (students will not see it), fix it, then publish again.</p>
                  <textarea className={ui.input} rows={2} placeholder="Write the reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} />
                  <Button className="mt-2" variant="secondary" icon={FiCornerUpLeft} onClick={() => sendBack("verified", "Withdrawn")}>Withdraw result</Button></div>
              )}
            </div>
          </Card>
          <Card className="mb-4" title="Marks entry window" subtitle={exam.status === "entry_open" ? "Teachers can enter marks now" : "Dates teachers can enter marks"} actions={exam.status === "entry_open" && <CountdownBadge date={exam.entryEnd} />}>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><label className={ui.label}>Start date</label><input type="date" className={ui.input} value={dt.start} disabled={!can("entry.window")} onChange={(e) => setDates({ ...dt, start: e.target.value })} /></div>
              <div><label className={ui.label}>End date</label><input type="date" className={ui.input} value={dt.end} disabled={!can("entry.window")} onChange={(e) => setDates({ ...dt, end: e.target.value })} /></div>
              <div className="flex items-end">{can("entry.window") && <Button variant="secondary" icon={FiSave} onClick={saveDates}>Save dates</Button>}</div>
            </div>
            <p className="mt-2 text-xs text-ink-500">Default window: {params.entryDays} days. Extensions used: {exam.extensionsUsed || 0} of {params.maxExtensions}.</p>
          </Card>
          {(exam.signatures || []).length > 0 && <Card className="mb-4" title="Signatures"><ul className="space-y-1 text-sm">{exam.signatures.map((s) => <li key={s.role}><b>{s.name}</b> ({s.role.replace("_", " ")}) {s.action} on {fmtDate(s.at)}</li>)}</ul></Card>}
          <Card title="Marks entry progress" subtitle="Every teacher batch (class + section + subject)">
            <div className="mb-4 grid gap-3 sm:grid-cols-3"><StatCard label="Submitted" value={counts.submitted} tone="green" /><StatCard label="Draft only" value={counts.draft} tone="amber" /><StatCard label="Not started" value={counts.not_started} tone="red" /></div>
            <FilterBar values={f} onChange={setF} filters={[{ key: "status", label: "Show", options: [{ value: "locked", label: "Locked" }, { value: "submitted", label: "Submitted" }, { value: "draft", label: "Draft" }, { value: "not_started", label: "Not started" }] }]} />
            <DataTable rows={filtered} pageSize={15} columns={[{ key: "cls", label: "Class" }, { key: "subject", label: "Subject" }, { key: "teacher", label: "Teacher" }, { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status === "not_started" ? "missing" : r.status} label={r.status === "not_started" ? "Not started" : undefined} /> }]} />
          </Card>
        </>
      )}
    </>
  );
}
