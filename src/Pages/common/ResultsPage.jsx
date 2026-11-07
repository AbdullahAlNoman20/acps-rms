import { useMemo, useState } from "react";
import { FiDownload, FiEye } from "react-icons/fi";
import { useResultData } from "../../Components/hooks/useResultData";
import { useAuth } from "../../Components/hooks/useAuth";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { assignPositions, STAFF_VISIBLE } from "../../engine/calc";
import { resultFor } from "../../Components/Shared/TranscriptView";
import { exportRows } from "../../Components/utils/excel";
import { fix, unique } from "../../Components/utils/format";
import PageHeader from "../../Components/Shared/PageHeader";
import FilterBar from "../../Components/Shared/FilterBar";
import DataTable from "../../Components/Shared/DataTable";
import StatusBadge from "../../Components/Shared/StatusBadge";
import Button from "../../Components/Shared/Button";
import NoteBox from "../../Components/Shared/NoteBox";
import Loader from "../../Components/Shared/Loader";
import { useCollection } from "../../Components/hooks/useCollection";

// Shows calculated results for a class. Teachers only see the class they are class teacher of.
export default function ResultsPage() {
  const { data, ctx, loading } = useResultData();
  const { items: batches } = useCollection("batches");
  const { user } = useAuth(); const base = useBasePath();
  const isTeacher = user.role === "teacher";
  const mode = isTeacher ? "student" : "staff";
  const [f, setF] = useState({ scope: "", program: "", version: "", section: "", group: "" });

  const mine = useMemo(() => (isTeacher ? batches.filter((b) => b.teacherId === user.teacherId && b.isClassTeacher === "Yes") : null), [batches, isTeacher, user.teacherId]);
  const exams = useMemo(() => (ctx ? ctx.exams.filter((e) => e.type === "school" && (isTeacher ? e.status === "published" : e.status !== "setup")) : []), [ctx, isTeacher]);
  const scope = f.scope || exams.find((e) => e.status === "published")?.id || exams[0]?.id || "aggregate";
  const programs = unique((mine ? mine.map((b) => b.program) : data.programs?.map((p) => p.name)) || []);
  const program = f.program || programs[programs.length > 1 ? programs.indexOf("IX") : 0] || programs[0];

  const items = useMemo(() => {
    if (!ctx || !program) return [];
    const list = data.students.filter((s) => s.status === "Active" && s.program === program).map((s) => ({ student: s, result: resultFor(ctx, s, scope, mode) })).filter((x) => x.result);
    return assignPositions(list, ctx);
  }, [ctx, data.students, program, scope, mode]);

  if (loading) return <Loader />;
  const rows = items.filter((it) => (!mine || mine.some((b) => b.version === it.student.version && b.section === it.student.section && b.program === it.student.program))
    && (!f.version || it.student.version === f.version) && (!f.section || it.student.section === f.section) && (!f.group || it.student.group === f.group));
  const flat = rows.map((it) => ({ id: it.student.id, roll: it.student.roll, name: it.student.name, section: it.student.section, version: it.student.version, group: it.student.group, gpa: it.result.gpa, letter: it.result.letter, result: it.result.result, total: it.result.totalMarks, sectionPos: it.pos.section, classPos: it.pos.klass }));
  const cols = [
    { key: "roll", label: "Roll" }, { key: "name", label: "Student", render: (r) => <span className="font-semibold text-ink-900">{r.name}<span className="block text-xs font-normal text-ink-400">{r.id} - {r.version}, {r.section}{r.group !== "General" ? `, ${r.group}` : ""}</span></span> },
    { key: "gpa", label: "GPA", render: (r) => fix(r.gpa) }, { key: "letter", label: "Grade" }, { key: "result", label: "Result", render: (r) => <StatusBadge status={r.result} /> },
    { key: "total", label: "Total marks", render: (r) => fix(r.total) }, { key: "sectionPos", label: "Section position", render: (r) => r.sectionPos ?? "-" }, { key: "classPos", label: "Class position", render: (r) => r.classPos ?? "-" },
    { key: "v", label: "", render: (r) => <Button to={`${base}/results/view/${r.id}/${scope}`} variant="soft" size="sm" icon={FiEye}>Transcript</Button> },
  ];
  const sel = (key, label, options, o = {}) => ({ key, label, options, ...o });
  return (
    <>
      <PageHeader title={isTeacher ? "My class results" : "Results"} note={isTeacher ? "You can see published results of the section where you are class teacher." : "Choose an exam, a class and see every student's result. Choose 'Aggregate' to see all exams of the year together. Press Transcript to open or print one student's result."}
        actions={<Button variant="secondary" icon={FiDownload} onClick={() => exportRows(`results-${scope}-${program}`, flat)}>Export Excel</Button>} />
      {isTeacher && mine.length === 0 && <NoteBox tone="warning" className="mb-4" title="No class assigned">You are not a class teacher of any section yet. Ask the IT Head to assign you in Teacher batches.</NoteBox>}
      <FilterBar values={{ ...f, scope, program }} onChange={setF} filters={[
        sel("scope", "Exam", [...exams.map((e) => ({ value: e.id, label: `${e.name}${e.status !== "published" ? ` (${e.status.replace("_", " ")})` : ""}` })), { value: "aggregate", label: "Aggregate of the year" }], { allLabel: null }),
        sel("program", "Class", programs, { allLabel: null }), sel("version", "Version", unique(data.versions.map((v) => v.name))), sel("section", "Section", unique(data.sections.map((v) => v.name))), sel("group", "Group", unique(data.groups.map((v) => v.name))),
      ]} />
      <DataTable columns={cols} rows={flat} pageSize={20} empty="No students match" emptyText="Try another exam or class. Results appear only after marks are entered." />
    </>
  );
}
