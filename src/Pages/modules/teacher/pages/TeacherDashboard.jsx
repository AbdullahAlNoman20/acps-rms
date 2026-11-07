import { Link } from "react-router-dom";
import { FiEdit3, FiClock, FiBookOpen, FiArrowRight, FiCheckSquare, FiCheckCircle } from "react-icons/fi";
import { useCollections } from "../../../../Components/hooks/useCollection";
import { useAuth } from "../../../../Components/hooks/useAuth";
import PageHeader from "../../../../Components/Shared/PageHeader";
import StatCard from "../../../../Components/Shared/StatCard";
import Card from "../../../../Components/Shared/Card";
import StatusBadge from "../../../../Components/Shared/StatusBadge";
import CountdownBadge from "../../../../Components/Shared/CountdownBadge";
import NoteBox from "../../../../Components/Shared/NoteBox";
import Loader from "../../../../Components/Shared/Loader";

const BASE = "/app/teacher";
export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data, loading } = useCollections(["batches", "exams", "submissions", "courses", "extensions"]);
  if (loading) return <Loader />;
  const mine = data.batches.filter((b) => b.teacherId === user.teacherId && b.courseCode !== "*");
  const classOf = data.batches.filter((b) => b.teacherId === user.teacherId && b.isClassTeacher === "Yes");
  const open = data.exams.filter((e) => e.status === "entry_open");
  const cn = (c) => data.courses.find((x) => x.code === c)?.name || c;
  const todo = open.flatMap((e) => mine.filter((b) => e.programs.includes(b.program)).map((b) => ({ e, b, sub: data.submissions.find((s) => s.id === `${e.id}|${b.id}`) })).filter((x) => x.sub?.status !== "submitted"));
  const myExt = data.extensions.filter((x) => x.teacherId === user.teacherId && ["requested", "recommended"].includes(x.status)).length;
  return (
    <>
      <PageHeader back={false} title={`Welcome, ${user.name}`} note="Your work is simple: open 'Enter marks', choose the class and subject, type the marks and press Submit before the last date. Need more days? Use 'Ask for more time'." />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FiBookOpen} label="My subject batches" value={mine.length} to={`${BASE}/entry`} />
        <StatCard icon={FiEdit3} label="Marks still to submit" value={todo.length} tone="amber" to={`${BASE}/entry`} />
        <StatCard icon={FiCheckSquare} label="Class teacher of" value={classOf.length} tone="blue" hint={classOf.map((b) => `${b.program}-${b.section}`).join(", ") || "-"} to={`${BASE}/attendance`} />
        <StatCard icon={FiClock} label="My open time requests" value={myExt} tone="orange" to={`${BASE}/extension`} />
      </div>
      {open.length === 0 && <NoteBox tone="info" className="mb-4">No exam is open for marks entry right now.</NoteBox>}
      {open.map((e) => (
        <Card key={e.id} className="mb-4" title={`${e.name} - marks entry is open`} actions={<CountdownBadge date={e.entryEnd} />}>
          {todo.filter((x) => x.e.id === e.id).length === 0 ? <p className="flex items-center gap-2 text-sm text-ink-600"><FiCheckCircle className="text-brand-600" /> You have submitted everything for this exam.</p> : (
            <ul className="divide-y divide-ink-100">
              {todo.filter((x) => x.e.id === e.id).map(({ b, sub }) => (
                <li key={b.id}><Link to={`${BASE}/entry/${e.id}/${b.id}`} className="flex items-center justify-between gap-2 py-2.5 text-sm hover:text-brand-700">
                  <span><b className="text-ink-900">Class {b.program}-{b.section}</b> ({b.version}{b.group !== "All" ? `, ${b.group}` : ""}) - {cn(b.courseCode)}</span>
                  <span className="flex items-center gap-2"><StatusBadge status={sub?.status || "missing"} label={sub ? undefined : "Not started"} /><FiArrowRight /></span></Link></li>))}
            </ul>)}
        </Card>))}
    </>
  );
}
