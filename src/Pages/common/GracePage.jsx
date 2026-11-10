import { useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useResultData } from "../../Components/hooks/useResultData";
import { useCollection } from "../../Components/hooks/useCollection";
import { useAuth } from "../../Components/hooks/useAuth";
import { useToast } from "../../Components/hooks/useToast";
import { api } from "../../Components/services/api";
import { computeExam } from "../../engine/calc";
import { makeId } from "../../Components/utils/ids";
import { fmtDate, today } from "../../Components/utils/format";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";
import Card from "../../Components/Shared/Card";
import DataTable from "../../Components/Shared/DataTable";
import StatusBadge from "../../Components/Shared/StatusBadge";
import Button from "../../Components/Shared/Button";
import Loader from "../../Components/Shared/Loader";
import NoteBox from "../../Components/Shared/NoteBox";
import { FieldBlock } from "../../Components/Shared/FormFields";

// IT Head enters grace marks (small limit from Rules). Exam Authority approves. Original marks are never changed.
export default function GracePage() {
  const { data, ctx, loading } = useResultData();
  const { items: grace } = useCollection("grace");
  const { can } = useAuth(); const toast = useToast();
  const [f, setF] = useState({ examId: "", program: "", studentId: "", courseCode: "", marks: 1, reason: "" }); const [err, setErr] = useState({});
  const student = data.students?.find((s) => s.id === f.studentId);
  const subjects = useMemo(() => (ctx && student && f.examId ? computeExam(ctx, student, f.examId)?.rows.filter((r) => !r.passed && r.isEffective) || [] : []), [ctx, student, f.examId]);
  if (loading) return <Loader />;
  const max = Number(ctx.params.graceMaxMarks ?? 3), maxSub = Number(ctx.params.graceMaxSubjects ?? 1);
  const exams = data.exams.filter((e) => e.type === "school" && e.status !== "setup");
  const stuName = (id) => { const s = data.students.find((x) => x.id === id); return s ? `${s.name} (${s.program}-${s.section})` : id; };
  const cn = (c) => data.courses.find((x) => x.code === c)?.name || c;

  async function add(e) {
    e.preventDefault();
    const er = {}; if (!f.examId) er.examId = "Choose an exam."; if (!f.studentId) er.studentId = "Choose a student."; if (!f.courseCode) er.courseCode = "Choose a subject.";
    if (!(f.marks > 0 && f.marks <= max)) er.marks = `Grace can be 1 to ${max} marks.`; if (!f.reason.trim()) er.reason = "Please write the reason.";
    const used = new Set(grace.filter((g) => g.examId === f.examId && g.studentId === f.studentId && g.status !== "rejected").map((g) => g.courseCode));
    if (f.courseCode && !used.has(f.courseCode) && used.size >= maxSub) er.courseCode = `Only ${maxSub} subject can get grace marks.`;
    setErr(er); if (Object.keys(er).length) return;
    await api.create("grace", { id: makeId("GR"), examId: f.examId, studentId: f.studentId, courseCode: f.courseCode, marks: Number(f.marks), reason: f.reason.trim(), status: "pending", createdAt: today() });
    toast.push("Grace marks sent for approval."); setF({ ...f, courseCode: "", reason: "", marks: 1 });
  }
  const set = async (g, status) => { await api.update("grace", g.id, { status }, status); toast.push(status === "approved" ? "Approved. It now counts in the result." : "Rejected."); };
  const columns = [
    { key: "e", label: "Exam", render: (g) => data.exams.find((e) => e.id === g.examId)?.name }, { key: "s", label: "Student", render: (g) => stuName(g.studentId) }, { key: "c", label: "Subject", render: (g) => cn(g.courseCode) },
    { key: "marks", label: "Grace marks" }, { key: "reason", label: "Reason" }, { key: "status", label: "Status", render: (g) => <StatusBadge status={g.status} /> },
    { key: "a", label: "Action", render: (g) => (g.status === "pending" && can("grace.approve") ? <div className="flex gap-1.5"><Button size="sm" onClick={() => set(g, "approved")}>Approve</Button><Button size="sm" variant="secondary" onClick={() => set(g, "rejected")}>Reject</Button></div> : <span className="text-xs text-ink-400">{fmtDate(g.createdAt)}</span>) },
  ];
  return (
    <>
      <PageHeader keepNote title="Grace marks" note={<>Small extra marks for a student who is just below the pass mark. Limit: <b>{max} marks</b> in <b>{maxSub} subject</b> per student (change it in Rules). The IT Head enters, the Exam Authority approves. Original marks are never changed.</>} />
      {can("grace.entry") && (
        <Card className="mb-4" title="Add grace marks" subtitle="Only subjects the student failed are listed">
          <form onSubmit={add} noValidate className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FieldBlock field={{ label: "Exam", required: true }} error={err.examId}><select className={ui.input} value={f.examId} onChange={(e) => setF({ ...f, examId: e.target.value, courseCode: "" })}><option value="">- choose -</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></FieldBlock>
            <FieldBlock field={{ label: "Class" }}><select className={ui.input} value={f.program} onChange={(e) => setF({ ...f, program: e.target.value, studentId: "", courseCode: "" })}><option value="">- choose -</option>{data.programs.map((p) => <option key={p.id}>{p.name}</option>)}</select></FieldBlock>
            <FieldBlock field={{ label: "Student", required: true }} error={err.studentId}><select className={ui.input} disabled={!f.program} value={f.studentId} onChange={(e) => setF({ ...f, studentId: e.target.value, courseCode: "" })}><option value="">- choose -</option>{data.students.filter((s) => s.program === f.program && s.status === "Active").map((s) => <option key={s.id} value={s.id}>{s.name} ({s.section}, roll {s.roll})</option>)}</select></FieldBlock>
            <FieldBlock field={{ label: "Failed subject", required: true }} error={err.courseCode}><select className={ui.input} value={f.courseCode} onChange={(e) => setF({ ...f, courseCode: e.target.value })}><option value="">{f.studentId && f.examId ? (subjects.length ? "- choose -" : "No failed subject") : "- choose -"}</option>{subjects.map((r) => <option key={r.code} value={r.code}>{r.name} ({r.on100} / 100)</option>)}</select></FieldBlock>
            <FieldBlock field={{ label: "Grace marks", required: true }} error={err.marks}><input type="number" className={ui.input} value={f.marks} onChange={(e) => setF({ ...f, marks: e.target.value })} /></FieldBlock>
            <FieldBlock field={{ label: "Reason", required: true }} error={err.reason}><input className={ui.input} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></FieldBlock>
            <div className="sm:col-span-2 lg:col-span-3"><Button type="submit" icon={FiPlus}>Add grace marks</Button></div>
          </form>
        </Card>
      )}
      {!can("grace.entry") && !can("grace.approve") && <NoteBox tone="warning" className="mb-4">You can only look at this list.</NoteBox>}
      <DataTable columns={columns} rows={[...grace].reverse()} empty="No grace marks" />
    </>
  );
}
