import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSend } from "react-icons/fi";
import { useCollections } from "../../Components/hooks/useCollection";
import { useAuth } from "../../Components/hooks/useAuth";
import { useToast } from "../../Components/hooks/useToast";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { api } from "../../Components/services/api";
import { makeId } from "../../Components/utils/ids";
import { today } from "../../Components/utils/format";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";
import Card from "../../Components/Shared/Card";
import Button from "../../Components/Shared/Button";
import NoteBox from "../../Components/Shared/NoteBox";
import Loader from "../../Components/Shared/Loader";
import { FieldBlock } from "../../Components/Shared/FormFields";

export default function CorrectionNewPage() {
  const { data, loading } = useCollections(["batches", "exams", "students", "markDistributions", "marks", "courses"]);
  const { user } = useAuth(); const toast = useToast(); const nav = useNavigate(); const base = useBasePath();
  const [f, setF] = useState({ batchId: "", examId: "", studentId: "", component: "", newValue: "", reason: "" }); const [err, setErr] = useState({});
  const batches = useMemo(() => (data.batches || []).filter((b) => b.teacherId === user.teacherId && b.courseCode !== "*"), [data.batches, user.teacherId]);
  const batch = batches.find((b) => b.id === f.batchId);
  const exams = batch ? data.exams.filter((e) => e.type === "school" && e.programs.includes(batch.program) && e.status !== "setup") : [];
  const students = batch ? data.students.filter((s) => s.status === "Active" && s.program === batch.program && s.version === batch.version && s.section === batch.section && (batch.group === "All" || s.group === batch.group)) : [];
  const student = students.find((s) => s.id === f.studentId);
  const row = useMemo(() => {
    if (!batch || !student) return null;
    const d = data.markDistributions.find((x) => x.programs.includes(student.program) && (x.group === "General" || x.group === student.group));
    return d?.courses.find((c) => c.code === batch.courseCode) || null;
  }, [batch, student, data.markDistributions]);
  const comp = row?.components.find((c) => c.key === f.component);
  const rec = batch && student && f.examId ? data.marks.find((m) => m.id === `${f.examId}|${student.id}|${batch.courseCode}`) : null;
  const old = rec && comp ? rec.comps?.[comp.key] : undefined;
  const cn = (c) => data.courses.find((x) => x.code === c)?.name || c;
  if (loading) return <Loader />;

  async function submit(e) {
    e.preventDefault();
    const er = {};
    if (!f.batchId) er.batchId = "Choose a batch."; if (!f.examId) er.examId = "Choose an exam."; if (!f.studentId) er.studentId = "Choose a student."; if (!f.component) er.component = "Choose the part.";
    if (f.newValue === "" || Number(f.newValue) < 0 || (comp && Number(f.newValue) > comp.exam)) er.newValue = `Enter marks from 0 to ${comp ? comp.exam : "the maximum"}.`;
    if (!f.reason.trim()) er.reason = "Please write the reason."; if (rec === undefined || (f.studentId && f.examId && !rec)) er.studentId = "No marks were entered for this student in this exam.";
    setErr(er); if (Object.keys(er).length) return;
    await api.create("corrections", { id: makeId("COR"), examId: f.examId, studentId: f.studentId, courseCode: batch.courseCode, component: f.component, oldValue: old, newValue: Number(f.newValue), reason: f.reason.trim(), teacherId: user.teacherId, itHeadApproved: "", authorityApproved: "", status: "pending", createdAt: today() });
    toast.push("Request sent for approval."); nav(`${base}/corrections`);
  }
  const Sel = ({ k, label, children, disabled }) => (<FieldBlock field={{ label, required: true }} error={err[k]}><select className={ui.input} disabled={disabled} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value, ...(k === "batchId" ? { examId: "", studentId: "", component: "" } : {}) })}><option value="">- choose -</option>{children}</select></FieldBlock>);
  return (
    <form onSubmit={submit} noValidate>
      <PageHeader title="New correction request" note="Choose your batch, the exam and the student. The old marks are shown automatically. After the IT Head and the Exam Authority approve, the marks change." />
      <Card><div className="grid gap-4 sm:grid-cols-2">
        <Sel k="batchId" label="My batch">{batches.map((b) => <option key={b.id} value={b.id}>{b.program}-{b.section} ({b.version}{b.group !== "All" ? `, ${b.group}` : ""}) - {cn(b.courseCode)}</option>)}</Sel>
        <Sel k="examId" label="Exam" disabled={!batch}>{exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</Sel>
        <Sel k="studentId" label="Student" disabled={!batch}>{students.map((s) => <option key={s.id} value={s.id}>{s.roll}. {s.name}</option>)}</Sel>
        <Sel k="component" label="Part of the subject" disabled={!row}>{(row?.components || []).map((c) => <option key={c.key} value={c.key}>{c.label} (max {c.exam})</option>)}</Sel>
        <FieldBlock field={{ label: "Marks now" }}><input className={ui.input} readOnly value={old === undefined ? "-" : old} /></FieldBlock>
        <FieldBlock field={{ label: "Correct marks", required: true }} error={err.newValue}><input type="number" className={ui.input} value={f.newValue} onChange={(e) => setF({ ...f, newValue: e.target.value })} /></FieldBlock>
        <FieldBlock field={{ label: "Reason", required: true, type: "textarea" }} error={err.reason}><textarea rows={3} className={ui.input} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></FieldBlock>
      </div></Card>
      {batches.length === 0 && <NoteBox tone="warning" className="mt-4">You have no subject batches yet. Ask the IT Head to assign you in Teacher batches.</NoteBox>}
      <div className="mt-4 flex gap-2"><Button type="submit" icon={FiSend}>Send request</Button><Button variant="secondary" to={`${base}/corrections`}>Cancel</Button></div>
    </form>
  );
}
