import { useState } from "react";
import { useParams } from "react-router-dom";
import { FiEdit2, FiAward, FiCheckCircle } from "react-icons/fi";
import { useResultData } from "../../Components/hooks/useResultData";
import { useCollections } from "../../Components/hooks/useCollection";
import { useAuth } from "../../Components/hooks/useAuth";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { computeExam, computeAggregate, studentSubjects } from "../../engine/calc";
import { fix, fmtDate } from "../../Components/utils/format";
import PageHeader from "../../Components/Shared/PageHeader";
import Tabs from "../../Components/Shared/Tabs";
import Card from "../../Components/Shared/Card";
import DataTable from "../../Components/Shared/DataTable";
import StatusBadge from "../../Components/Shared/StatusBadge";
import Button from "../../Components/Shared/Button";
import NoteBox from "../../Components/Shared/NoteBox";
import Loader from "../../Components/Shared/Loader";

export default function StudentDetailPage() {
  const { id } = useParams(); const { can, user } = useAuth(); const base = useBasePath();
  const { data, ctx, loading } = useResultData(); const extra = useCollections(["batches", "teachers", "customFields"]);
  const [tab, setTab] = useState("profile");
  if (loading || extra.loading) return <Loader />;
  const s = data.students.find((x) => x.id === id);
  if (!s) return <><PageHeader title="Student not found" /><NoteBox tone="warning">This student does not exist.</NoteBox></>;
  const { batches, teachers, customFields } = extra.data;
  const teacherOf = (code) => { const b = batches.find((x) => x.program === s.program && x.version === s.version && x.section === s.section && x.courseCode === code && (x.group === "All" || x.group === s.group)); return b ? teachers.find((t) => t.id === b.teacherId)?.name : null; };
  const ct = batches.find((b) => b.isClassTeacher === "Yes" && b.program === s.program && b.version === s.version && b.section === s.section);
  const subs = studentSubjects(ctx, s).map((x, i) => ({ id: i, ...x, teacher: teacherOf(x.code) }));
  const exams = ctx.exams.filter((e) => e.type === "school" && e.programs.includes(s.program) && e.status !== "setup");
  const rows = exams.map((e) => ({ id: e.id, exam: e, res: computeExam(ctx, s, e.id) })).filter((r) => r.res);
  const agg = computeAggregate(ctx, s, "staff");
  const Info = ({ k, v }) => (<div><dt className="text-xs text-ink-500">{k}</dt><dd className="text-sm font-semibold text-ink-900">{v || "-"}</dd></div>);
  return (
    <>
      <PageHeader title={s.name} subtitle={`${s.id} - Class ${s.program}-${s.section} (${s.version}) - Roll ${s.roll}`}
        actions={<><StatusBadge status={s.status} />{can("students.manage") && <Button to={`${base}/data/students/${s.id}`} icon={FiEdit2} variant="secondary">Edit</Button>}{can("passrule.set") && <Button to={`${base}/special-pass`} icon={FiCheckCircle} variant="secondary">Pass Switch</Button>}</>} />
      <Tabs value={tab} onChange={setTab} tabs={[{ value: "profile", label: "Profile" }, { value: "subjects", label: `Subjects (${subs.length})` }, { value: "results", label: "Results" }]} />
      {tab === "profile" && (
        <Card><dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Info k="Name (Bangla)" v={s.nameBn} /><Info k="Class / Group" v={`${s.program} / ${s.group}`} /><Info k="Section / Shift" v={`${s.section} / ${s.shift}`} /><Info k="Session" v={s.session} /><Info k="Gender" v={s.gender} /><Info k="Religion" v={s.religion} />
          <Info k="Date of birth" v={fmtDate(s.dob)} /><Info k="Father" v={s.father} /><Info k="Mother" v={s.mother} /><Info k="Guardian mobile" v={s.guardianMobile} /><Info k="Pass rule" v={`Rule ${s.passRule}${s.passRuleReason ? ` - ${s.passRuleReason}` : ""}`} /><Info k="Class teacher" v={ct && teachers.find((t) => t.id === ct.teacherId)?.name} />
          <div className="col-span-full"><Info k="Address" v={s.address} /></div>
          {customFields.filter((c) => c.entity === "students").map((c) => <Info key={c.key} k={c.label} v={s.custom?.[c.key]} />)}
        </dl></Card>)}
      {tab === "subjects" && <DataTable rows={subs} pageSize={20} columns={[{ key: "code", label: "Code" }, { key: "name", label: "Subject", render: (x) => <span>{x.name}{x.isFourth && <span className="ml-1 rounded-full bg-gold-50 px-1.5 text-[11px] font-semibold text-gold-600">4th subject</span>}</span> }, { key: "fullMark", label: "Marks" }, { key: "isEffective", label: "In GPA", render: (x) => (x.isEffective ? "Yes" : "No") }, { key: "teacher", label: "Teacher", render: (x) => x.teacher || <StatusBadge status="missing" label="No teacher" /> }]} />}
      {tab === "results" && (<>
        {agg && <Card className="mb-4" title="Aggregate of the year" actions={<Button size="sm" variant="soft" icon={FiAward} to={`${base}/results/view/${s.id}/aggregate`}>Transcript</Button>}><p className="text-sm">GPA <b className="text-lg text-brand-700">{fix(agg.gpa)} ({agg.letter})</b> <StatusBadge status={agg.result} /> - counted: {agg.examsUsed.join(", ")}</p></Card>}
        <DataTable rows={rows} columns={[{ key: "exam", label: "Exam", render: (r) => r.exam.name }, { key: "gpa", label: "GPA", render: (r) => fix(r.res.gpa) }, { key: "letter", label: "Grade", render: (r) => r.res.letter }, { key: "result", label: "Result", render: (r) => <StatusBadge status={r.res.result} /> }, { key: "st", label: "Exam status", render: (r) => <StatusBadge status={r.exam.status} /> },
          { key: "t", label: "", render: (r) => <Button size="sm" variant="soft" to={`${base}/results/view/${s.id}/${r.exam.id}`}>Transcript</Button> }]} empty="No results yet" />
      </>)}
      {user.role === "teacher" && <p className="mt-4 text-xs text-ink-500">You are viewing this student as a teacher (view only).</p>}
    </>
  );
}
