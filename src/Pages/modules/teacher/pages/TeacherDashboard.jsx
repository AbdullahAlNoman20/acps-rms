import { Link } from "react-router-dom";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { useCollections } from "../../../../Components/hooks/useCollection";
import { useAuth } from "../../../../Components/hooks/useAuth";
import PageHeader from "../../../../Components/Shared/PageHeader";
import Card from "../../../../Components/Shared/Card";
import StatusBadge from "../../../../Components/Shared/StatusBadge";
import CountdownBadge from "../../../../Components/Shared/CountdownBadge";
import NoteBox from "../../../../Components/Shared/NoteBox";
import FeatureTiles from "../../../../Components/Shared/FeatureTiles";
import Loader from "../../../../Components/Shared/Loader";

const BASE = "/app/teacher";
export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data, loading } = useCollections(["batches", "exams", "submissions", "courses"]);
  if (loading) return <Loader />;
  const mine = data.batches.filter((b) => b.teacherId === user.teacherId && b.courseCode !== "*");
  const classOf = data.batches.filter((b) => b.teacherId === user.teacherId && b.isClassTeacher === "Yes");
  const open = data.exams.filter((e) => e.status === "entry_open");
  const cn = (c) => data.courses.find((x) => x.code === c)?.name || c;
  const todo = open.flatMap((e) => mine.filter((b) => e.programs.includes(b.program)).map((b) => ({ e, b, sub: data.submissions.find((s) => s.id === `${e.id}|${b.id}`) })).filter((x) => x.sub?.status !== "submitted"));
  const tiles = [{ feature: "marksDesk", to: "entry", badge: todo.length }, { feature: "attendanceBook", to: "attendance" }, { feature: "classExplorer", to: "classes" }, { feature: "resultBoard", to: "my-class", label: "Class Results" }, { feature: "extraTime", to: "extension" }, { feature: "correctionDesk", to: "corrections" }, { feature: "parentConnect", to: "sms" }, { feature: "reportShelf", to: "reports" }];
  return (
    <>
      <PageHeader back={false} title={`Welcome, ${user.name}`} subtitle={`${mine.length} subject batches${classOf.length ? ` - class teacher of ${classOf.map((b) => `${b.program}-${b.section} (${b.version})`).join(", ")}` : ""}`} />
      {open.length === 0 ? <NoteBox tone="info" className="mb-5">No exam is open for marks entry right now.</NoteBox> : open.map((e) => (
        <Card key={e.id} className="mb-5" title={`${e.name}: marks to submit`} actions={<CountdownBadge date={e.entryEnd} />}>
          {todo.filter((x) => x.e.id === e.id).length === 0 ? <p className="flex items-center gap-2 text-sm text-ink-600"><FiCheckCircle className="text-brand-600" /> You have submitted everything. Thank you!</p> : (
            <ul className="divide-y divide-ink-100">{todo.filter((x) => x.e.id === e.id).map(({ b, sub }) => (
              <li key={b.id}><Link to={`${BASE}/entry/${e.id}/${b.id}`} className="flex items-center justify-between gap-2 py-3 text-sm hover:text-brand-700"><span><b className="text-ink-900">Class {b.program}-{b.section}</b> ({b.version}{b.group !== "All" ? `, ${b.group}` : ""})<span className="block text-ink-600">{cn(b.courseCode)}</span></span><span className="flex items-center gap-2"><StatusBadge status={sub?.status || "missing"} label={sub ? undefined : "Not started"} /><FiArrowRight /></span></Link></li>))}</ul>)}
        </Card>))}
      <h2 className="mb-3 text-base font-semibold text-ink-900">What do you want to do?</h2>
      <FeatureTiles tiles={tiles} base={BASE} />
    </>
  );
}
