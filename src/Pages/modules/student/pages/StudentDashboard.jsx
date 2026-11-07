import { Link } from "react-router-dom";
import { FiAward, FiPhone, FiArrowRight } from "react-icons/fi";
import { useResultData } from "../../../../Components/hooks/useResultData";
import { useAuth } from "../../../../Components/hooks/useAuth";
import { computeExam } from "../../../../engine/calc";
import { fix } from "../../../../Components/utils/format";
import PageHeader from "../../../../Components/Shared/PageHeader";
import Card from "../../../../Components/Shared/Card";
import StatusBadge from "../../../../Components/Shared/StatusBadge";
import NoteBox from "../../../../Components/Shared/NoteBox";
import Loader from "../../../../Components/Shared/Loader";

const BASE = "/app/student";
export default function StudentDashboard() {
  const { user } = useAuth();
  const { data, ctx, loading } = useResultData();
  if (loading) return <Loader />;
  const s = data.students.find((x) => x.id === user.studentId);
  if (!s) return <NoteBox tone="warning" title="Student not found">Your account is not linked to a student. Please contact the school.</NoteBox>;
  const published = ctx.exams.filter((e) => e.type === "school" && e.status === "published" && e.programs.includes(s.program));
  const last = published[published.length - 1]; const res = last ? computeExam(ctx, s, last.id) : null;
  return (
    <>
      <PageHeader back={false} title={user.role === "parent" ? `Result of ${s.name}` : `Welcome, ${s.name}`} note="Your published results are in 'Results'. You can print them or save as PDF. If something looks wrong, call the school or create a support ticket." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Student information">
          <dl className="grid grid-cols-2 gap-3 text-sm">{[["Student ID", s.id], ["Class", `${s.program}-${s.section}`], ["Roll", s.roll], ["Version", s.version], ["Group", s.group], ["Shift", s.shift], ["Session", s.session], ["Guardian mobile", s.guardianMobile]].map(([k, v]) => <div key={k}><dt className="text-xs text-ink-500">{k}</dt><dd className="font-semibold text-ink-900">{v}</dd></div>)}</dl>
        </Card>
        <Card title="Latest result" actions={res && <StatusBadge status={res.result} />}>
          {res ? (<div><p className="text-sm text-ink-500">{last.name}</p><p className="text-3xl font-bold text-brand-700">GPA {fix(res.gpa)} <span className="text-lg">({res.letter})</span></p><Link className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600" to={`${BASE}/results/${last.id}`}>See full result <FiArrowRight /></Link></div>) : <p className="text-sm text-ink-500">No result has been published yet.</p>}
        </Card>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link to={`${BASE}/results`} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-card hover:border-brand-300"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><FiAward /></span><span className="font-semibold text-ink-900">All my results</span></Link>
        <Link to={`${BASE}/contact`} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-card hover:border-brand-300"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-magenta-50 text-magenta-500"><FiPhone /></span><span className="font-semibold text-ink-900">Call the school or class teacher</span></Link>
      </div>
    </>
  );
}
