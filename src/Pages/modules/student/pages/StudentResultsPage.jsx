import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useResultData } from "../../../../Components/hooks/useResultData";
import { useAuth } from "../../../../Components/hooks/useAuth";
import { computeAggregate, computeExam } from "../../../../engine/calc";
import { fix } from "../../../../Components/utils/format";
import PageHeader from "../../../../Components/Shared/PageHeader";
import StatusBadge from "../../../../Components/Shared/StatusBadge";
import EmptyState from "../../../../Components/Shared/EmptyState";
import Loader from "../../../../Components/Shared/Loader";

export default function StudentResultsPage() {
  const { user } = useAuth();
  const { data, ctx, loading } = useResultData();
  if (loading) return <Loader />;
  const s = data.students.find((x) => x.id === user.studentId);
  const exams = s ? ctx.exams.filter((e) => e.type === "school" && e.status === "published" && e.programs.includes(s.program)) : [];
  const agg = s ? computeAggregate(ctx, s, "student") : null;
  const Card = ({ to, title, res, sub }) => (
    <Link to={to} className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-card hover:border-brand-300">
      <div><p className="font-semibold text-ink-900">{title}</p><p className="text-xs text-ink-500">{sub}</p></div>
      <div className="flex items-center gap-3"><div className="text-right"><p className="text-lg font-bold text-brand-700">{fix(res.gpa)}</p><StatusBadge status={res.result} /></div><FiArrowRight className="text-ink-300" /></div>
    </Link>
  );
  return (
    <>
      <PageHeader title="My results" note="Only results that the school has signed and published are shown. Open a result to read every subject, then print or save it as PDF." />
      {exams.length === 0 ? <EmptyState title="No result published yet">You will see it here as soon as the school publishes it.</EmptyState> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {exams.map((e) => { const r = computeExam(ctx, s, e.id); return r && <Card key={e.id} to={`/app/student/results/${e.id}`} title={e.name} res={r} sub="Tap to see subjects and grades" />; })}
          {agg && <Card to="/app/student/results/aggregate" title="Aggregate of the year" res={agg} sub={`${agg.examsUsed.length} of ${agg.examsExpected} exams counted`} />}
        </div>)}
    </>
  );
}
