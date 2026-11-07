import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FiDownload, FiPrinter } from "react-icons/fi";
import { useResultData } from "../../Components/hooks/useResultData";
import { useCollection } from "../../Components/hooks/useCollection";
import { useAuth } from "../../Components/hooks/useAuth";
import { buildReport, REPORT_TYPES } from "../../engine/reports";
import { pickDistribution } from "../../engine/calc";
import { exportRows } from "../../Components/utils/excel";
import { unique } from "../../Components/utils/format";
import PageHeader from "../../Components/Shared/PageHeader";
import FilterBar from "../../Components/Shared/FilterBar";
import DataTable from "../../Components/Shared/DataTable";
import Button from "../../Components/Shared/Button";
import NoteBox from "../../Components/Shared/NoteBox";
import Loader from "../../Components/Shared/Loader";

export default function ReportRunner() {
  const { type } = useParams();
  const meta = REPORT_TYPES.find((r) => r.key === type);
  const { data, ctx, loading } = useResultData();
  const { items: batches } = useCollection("batches");
  const { user } = useAuth();
  const isTeacher = user.role === "teacher";
  const mode = isTeacher ? "student" : "staff";
  const [f, setF] = useState({ scope: "", program: "", version: "", section: "", group: "", course: "" });

  const mine = useMemo(() => (isTeacher ? batches.filter((b) => b.teacherId === user.teacherId) : null), [batches, isTeacher, user.teacherId]);
  const exams = useMemo(() => (ctx ? ctx.exams.filter((e) => e.type === "school" && e.status !== "setup" && (type === "teachermarks" || !isTeacher || e.status === "published")) : []), [ctx, isTeacher, type]);
  const needsExam = type === "teachermarks";
  const scope = f.scope || (needsExam ? exams.find((e) => e.status === "entry_open")?.id : exams.find((e) => e.status === "published")?.id) || exams[0]?.id || "aggregate";
  const programs = unique(mine ? mine.map((b) => b.program) : (data.programs || []).map((p) => p.name));
  const program = f.program || programs[programs.indexOf("IX") >= 0 ? programs.indexOf("IX") : 0] || "";
  const pool = useMemo(() => (data.students || []).filter((s) => s.status === "Active" && s.program === program), [data.students, program]);
  const sample = pool.find((s) => (!f.group || s.group === f.group)) || pool[0];
  const dist = ctx && sample ? pickDistribution(ctx, sample) : null;
  const courseOptions = (dist?.courses || []).filter((c) => !mine || mine.some((b) => b.program === program && (b.courseCode === c.code || b.courseCode === "*"))).map((c) => ({ value: c.code, label: `${c.code} - ${c.name}` }));
  const course = f.course || courseOptions[0]?.value;

  const report = useMemo(() => {
    if (!ctx || !meta || !program) return { columns: [], rows: [] };
    const allowed = (s) => !mine || mine.some((b) => b.program === s.program && b.version === s.version && b.section === s.section && (b.group === "All" || b.group === s.group) && (type !== "teachermarks" || b.courseCode === course || b.courseCode === "*"));
    const show = (s) => allowed(s) && (!f.version || s.version === f.version) && (!f.section || s.section === f.section) && (!f.group || s.group === f.group);
    return buildReport(type, { ctx, pool, show, scope, mode, course });
  }, [ctx, meta, program, pool, f, scope, mode, course, mine, type]);

  if (loading) return <Loader />;
  if (!meta) return <><PageHeader title="Report not found" /><NoteBox tone="warning">Choose a report from the Reports page.</NoteBox></>;
  const columns = report.columns.map((c) => ({ key: c.key, label: c.label }));
  const examLabel = scope === "aggregate" ? "Aggregate of the year" : exams.find((e) => e.id === scope)?.name;
  return (
    <>
      <PageHeader title={meta.label} subtitle={`${examLabel || ""} - Class ${program}`} note={meta.desc}
        actions={<><Button variant="secondary" icon={FiPrinter} onClick={() => window.print()}>Print</Button><Button variant="secondary" icon={FiDownload} onClick={() => exportRows(`${type}-${program}`, report.rows.map((r) => Object.fromEntries(report.columns.map((c) => [c.label, r[c.key]]))))}>Export Excel</Button></>} />
      <FilterBar values={{ ...f, scope, program, course }} onChange={setF} filters={[
        { key: "scope", label: "Exam", allLabel: null, options: [...exams.map((e) => ({ value: e.id, label: e.name })), ...(needsExam ? [] : [{ value: "aggregate", label: "Aggregate of the year" }])] },
        { key: "program", label: "Class", allLabel: null, options: programs }, { key: "version", label: "Version", options: unique((data.versions || []).map((v) => v.name)) }, { key: "section", label: "Section", options: unique((data.sections || []).map((v) => v.name)) },
        { key: "group", label: "Group", options: unique((data.groups || []).map((v) => v.name)) }, ...(needsExam ? [{ key: "course", label: "Subject", allLabel: null, options: courseOptions }] : []),
      ]} />
      <div className="hidden print:block"><h2 className="mb-2 text-lg font-bold">{meta.label} - {examLabel} - Class {program}</h2></div>
      <DataTable columns={columns} rows={report.rows.map((r, i) => ({ ...r, _id: i }))} rowKey="_id" pageSize={50} empty="No data for this selection" emptyText="Choose another exam or class. Marks must be entered first." />
    </>
  );
}
