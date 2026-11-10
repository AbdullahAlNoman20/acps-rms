import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FiUserCheck, FiEye } from "react-icons/fi";
import { useCollections } from "../../Components/hooks/useCollection";
import { useAuth } from "../../Components/hooks/useAuth";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { unique } from "../../Components/utils/format";
import PageHeader from "../../Components/Shared/PageHeader";
import Tabs from "../../Components/Shared/Tabs";
import DataTable from "../../Components/Shared/DataTable";
import FilterBar from "../../Components/Shared/FilterBar";
import StatusBadge from "../../Components/Shared/StatusBadge";
import Button from "../../Components/Shared/Button";
import Card from "../../Components/Shared/Card";
import Loader from "../../Components/Shared/Loader";

export default function ClassDetailPage() {
  const { program } = useParams(); const { can } = useAuth(); const base = useBasePath();
  const { data, loading } = useCollections(["students", "batches", "teachers", "courses", "markDistributions", "versions", "sections"]);
  const [tab, setTab] = useState("sections"); const [f, setF] = useState({});
  const studs = useMemo(() => (data.students || []).filter((s) => s.program === program && s.status === "Active"), [data.students, program]);
  if (loading) return <Loader />;
  const tname = (id) => data.teachers.find((t) => t.id === id)?.name || "-";
  const batches = data.batches.filter((b) => b.program === program);
  const sections = data.versions.flatMap((v) => data.sections.map((s) => ({ id: `${v.name}-${s.name}`, version: v.name, section: s.name })));
  const secRows = sections.map((x) => { const ct = batches.find((b) => b.isClassTeacher === "Yes" && b.version === x.version && b.section === x.section); const n = studs.filter((s) => s.version === x.version && s.section === x.section).length; const subj = batches.filter((b) => b.courseCode !== "*" && b.version === x.version && b.section === x.section).length;
    return { ...x, n, ct: ct ? tname(ct.teacherId) : null, subj }; }).filter((r) => r.n > 0 || r.ct);
  const dists = data.markDistributions.filter((d) => d.programs.includes(program));
  const teachersFor = (code) => unique(batches.filter((b) => b.courseCode === code).map((b) => `${tname(b.teacherId)} (${b.section}-${b.version.slice(0, 3)})`));
  const groupsOf = (d) => (d.group === "General" ? "" : ` - ${d.group}`);
  const filtered = studs.filter((s) => (!f.version || s.version === f.version) && (!f.section || s.section === f.section) && (!f.group || s.group === f.group));
  const teachersInClass = unique(batches.map((b) => b.teacherId));
  return (
    <>
      <PageHeader title={`Class ${program}`} subtitle={`${studs.length} students - ${dists.reduce((n, d) => n + d.courses.length, 0)} subject entries - ${teachersInClass.length} teachers`}
        actions={can("batches.manage") && <Button to={`${base}/planner?program=${program}`} icon={FiUserCheck}>Plan teachers</Button>} />
      <Tabs value={tab} onChange={setTab} tabs={[{ value: "sections", label: "Sections" }, { value: "subjects", label: "Subjects and teachers" }, { value: "students", label: `Students (${studs.length})` }]} />
      {tab === "sections" && <DataTable rows={secRows} columns={[{ key: "version", label: "Version" }, { key: "section", label: "Section" }, { key: "n", label: "Students" }, { key: "ct", label: "Class teacher", render: (r) => r.ct || <StatusBadge status="missing" label="Not assigned" /> }, { key: "subj", label: "Subject batches" },
        { key: "a", label: "", render: (r) => can("batches.manage") && <Button to={`${base}/planner?program=${program}&version=${r.version}&section=${r.section}`} size="sm" variant="soft">Plan</Button> }]} />}
      {tab === "subjects" && dists.map((d) => (
        <Card key={d.id} className="mb-4" title={`${d.name}${groupsOf(d)}`} subtitle={`${d.courses.length} subject entries - GPA divisor ${d.gpaDivision}`}>
          <DataTable pageSize={30} rows={d.courses.map((c, i) => ({ id: `${c.code}-${i}`, ...c, t: teachersFor(c.code) }))} columns={[{ key: "code", label: "Code" }, { key: "name", label: "Subject", render: (c) => <span>{c.name}{c.religion && <span className="ml-1 text-xs text-ink-400">({c.religion})</span>}{c.role !== "main" && <span className="ml-1 text-xs text-gold-600">({c.role === "fourthOnly" ? "4th only" : "main or 4th"})</span>}</span> },
            { key: "fullMark", label: "Marks" }, { key: "pass", label: "Pass", render: (c) => `${c.passMark || "joint"}` }, { key: "t", label: "Teachers", render: (c) => (c.t.length ? <span className="text-xs">{c.t.join(", ")}</span> : <StatusBadge status="missing" label="No teacher" />) }]} />
        </Card>))}
      {tab === "students" && (<>
        <FilterBar values={f} onChange={setF} filters={[{ key: "version", label: "Version", options: unique(studs.map((s) => s.version)) }, { key: "section", label: "Section", options: unique(studs.map((s) => s.section)) }, { key: "group", label: "Group", options: unique(studs.map((s) => s.group)) }]} />
        <DataTable rows={filtered} pageSize={20} columns={[{ key: "roll", label: "Roll" }, { key: "name", label: "Student", render: (s) => <span><b className="text-ink-900">{s.name}</b><span className="block text-xs text-ink-400">{s.id}</span></span> }, { key: "section", label: "Section", render: (s) => `${s.section} (${s.version})` }, { key: "group", label: "Group" },
          { key: "passRule", label: "Pass rule", render: (s) => <StatusBadge status={s.passRule === "33" ? "Hold" : "Active"} label={`Rule ${s.passRule}`} /> }, { key: "v", label: "", render: (s) => <Button to={`${base}/students/${s.id}`} size="sm" variant="soft" icon={FiEye}>View</Button> }]} />
      </>)}
    </>
  );
}
