import { useState } from "react";
import { FiEdit3, FiEye } from "react-icons/fi";
import { useCollections } from "../../../../Components/hooks/useCollection";
import { useAuth } from "../../../../Components/hooks/useAuth";
import { useBasePath } from "../../../../Components/hooks/useBasePath";
import { fmtDate } from "../../../../Components/utils/format";
import PageHeader from "../../../../Components/Shared/PageHeader";
import FilterBar from "../../../../Components/Shared/FilterBar";
import DataTable from "../../../../Components/Shared/DataTable";
import StatusBadge from "../../../../Components/Shared/StatusBadge";
import CountdownBadge from "../../../../Components/Shared/CountdownBadge";
import Button from "../../../../Components/Shared/Button";
import NoteBox from "../../../../Components/Shared/NoteBox";
import Loader from "../../../../Components/Shared/Loader";

export default function EntryListPage() {
  const { data, loading } = useCollections(["batches", "exams", "submissions", "courses", "students"]);
  const { user } = useAuth(); const base = useBasePath();
  const [examId, setExamId] = useState("");
  if (loading) return <Loader />;
  const exams = data.exams.filter((e) => e.type === "school" && e.status !== "setup");
  const exam = exams.find((e) => e.id === (examId || exams.find((x) => x.status === "entry_open")?.id || exams[exams.length - 1]?.id));
  const mine = data.batches.filter((b) => b.teacherId === user.teacherId && b.courseCode !== "*" && exam?.programs.includes(b.program));
  const cn = (c) => data.courses.find((x) => x.code === c)?.name || c;
  const rows = mine.map((b) => ({ id: b.id, b, cls: `Class ${b.program}-${b.section} (${b.version}${b.group !== "All" ? `, ${b.group}` : ""})`, subject: cn(b.courseCode), status: exam.status !== "entry_open" ? "locked" : data.submissions.find((s) => s.id === `${exam.id}|${b.id}`)?.status || "not_started" }));
  const open = exam?.status === "entry_open";
  return (
    <>
      <PageHeader title="Enter marks" note="Choose the exam. Then press 'Enter marks' next to your class and subject. You can save a draft and come back; press Submit only when all marks are correct." />
      <FilterBar values={{ examId: exam?.id }} onChange={(v) => setExamId(v.examId)} filters={[{ key: "examId", label: "Exam", allLabel: null, options: exams.map((e) => ({ value: e.id, label: e.name })) }]} />
      {exam && <div className="mb-4 flex flex-wrap items-center gap-2 text-sm"><StatusBadge status={exam.status} />{open ? <><CountdownBadge date={exam.entryEnd} /> <span className="text-ink-500">Last date: {fmtDate(exam.entryEnd)}</span></> : <span className="text-ink-500">Marks entry is not open for this exam.</span>}</div>}
      {!open && <NoteBox tone="info" className="mb-4">You can only look at marks of this exam now. If you need a change, send a correction request.</NoteBox>}
      <DataTable rows={rows} pageSize={20} empty="No subjects assigned to you for this exam" emptyText="Ask the IT Head to assign your classes in Teacher batches." columns={[{ key: "cls", label: "Class" }, { key: "subject", label: "Subject" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status === "not_started" ? "missing" : r.status} label={r.status === "not_started" ? "Not started" : undefined} /> },
        { key: "o", label: "", render: (r) => <Button to={`${base}/entry/${exam.id}/${r.b.id}`} size="sm" variant={open && r.status !== "submitted" ? "primary" : "secondary"} icon={open && r.status !== "submitted" ? FiEdit3 : FiEye}>{open && r.status !== "submitted" ? "Enter marks" : "View marks"}</Button> }]} />
    </>
  );
}
