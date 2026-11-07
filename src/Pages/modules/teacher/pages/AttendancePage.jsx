import { useMemo, useState } from "react";
import { FiSave } from "react-icons/fi";
import { useCollections } from "../../../../Components/hooks/useCollection";
import { useAuth } from "../../../../Components/hooks/useAuth";
import { useToast } from "../../../../Components/hooks/useToast";
import { api } from "../../../../Components/services/api";
import { ui } from "../../../../theme/ui";
import PageHeader from "../../../../Components/Shared/PageHeader";
import FilterBar from "../../../../Components/Shared/FilterBar";
import DataTable from "../../../../Components/Shared/DataTable";
import Button from "../../../../Components/Shared/Button";
import NoteBox from "../../../../Components/Shared/NoteBox";
import Loader from "../../../../Components/Shared/Loader";

const REMARKS = ["Excellent", "Good", "Satisfactory", "Need improvement"];
// Class teacher: working days, days present and a remark for each student, per exam.
export default function AttendancePage() {
  const { data, loading } = useCollections(["batches", "students", "exams", "attendance"]);
  const { user } = useAuth(); const toast = useToast();
  const [f, setF] = useState({ examId: "", cs: "" }); const [edits, setEdits] = useState({});
  const mine = useMemo(() => (data.batches || []).filter((b) => b.teacherId === user.teacherId && b.isClassTeacher === "Yes"), [data.batches, user.teacherId]);
  const cs = mine.find((b) => b.id === (f.cs || mine[0]?.id));
  const exams = (data.exams || []).filter((e) => e.type === "school" && e.status !== "setup" && cs && e.programs.includes(cs.program));
  const exam = exams.find((e) => e.id === (f.examId || exams.find((x) => x.status === "entry_open")?.id || exams[0]?.id));
  const students = useMemo(() => (cs ? data.students.filter((s) => s.status === "Active" && s.program === cs.program && s.version === cs.version && s.section === cs.section).sort((a, b) => a.roll - b.roll) : []), [cs, data.students]);
  if (loading) return <Loader />;
  const rec = (s) => data.attendance.find((a) => a.id === `${exam?.id}|${s.id}`) || { workingDays: 70, present: "", remarks: "" };
  const val = (s, k) => edits[`${s.id}.${k}`] ?? rec(s)[k];
  const locked = exam?.status === "published";
  async function save() {
    const recs = students.map((s) => ({ id: `${exam.id}|${s.id}`, examId: exam.id, studentId: s.id, workingDays: Number(val(s, "workingDays")), present: Number(val(s, "present")), remarks: val(s, "remarks") }));
    const bad = recs.find((r) => !(r.present >= 0 && r.present <= r.workingDays));
    if (bad) { toast.push("Present days cannot be more than working days.", "error"); return; }
    await api.upsertMany("attendance", recs, `Attendance ${cs.program}-${cs.section}`); setEdits({}); toast.push("Attendance and remarks saved.");
  }
  return (
    <>
      <PageHeader title="Attendance and remarks" note="Class teachers fill working days, days present and a short remark for every student. These appear on the transcript. Press Save when you finish." actions={!locked && mine.length > 0 && <Button icon={FiSave} onClick={save}>Save</Button>} />
      {mine.length === 0 ? <NoteBox tone="warning" title="You are not a class teacher">Ask the IT Head to assign you as class teacher in Teacher batches.</NoteBox> : (
        <>
          <FilterBar values={{ examId: exam?.id, cs: cs?.id }} onChange={(v) => { setF(v); setEdits({}); }} filters={[{ key: "cs", label: "My class", allLabel: null, options: mine.map((b) => ({ value: b.id, label: `Class ${b.program}-${b.section} (${b.version})` })) }, { key: "examId", label: "Exam", allLabel: null, options: exams.map((e) => ({ value: e.id, label: e.name })) }]} />
          {locked && <NoteBox tone="info" className="mb-4">This exam is published, so attendance is locked.</NoteBox>}
          <DataTable rows={students} pageSize={30} columns={[{ key: "roll", label: "Roll" }, { key: "name", label: "Student" },
            { key: "wd", label: "Working days", render: (s) => <input type="number" min="0" className={`${ui.input} w-24`} disabled={locked} value={val(s, "workingDays")} onChange={(e) => setEdits({ ...edits, [`${s.id}.workingDays`]: e.target.value })} /> },
            { key: "pr", label: "Present", render: (s) => <input type="number" min="0" className={`${ui.input} w-24`} disabled={locked} value={val(s, "present")} onChange={(e) => setEdits({ ...edits, [`${s.id}.present`]: e.target.value })} /> },
            { key: "rm", label: "Remarks", render: (s) => <select className={`${ui.input} min-w-[160px]`} disabled={locked} value={val(s, "remarks")} onChange={(e) => setEdits({ ...edits, [`${s.id}.remarks`]: e.target.value })}><option value="">-</option>{REMARKS.map((r) => <option key={r}>{r}</option>)}</select> }]} />
        </>)}
    </>
  );
}
