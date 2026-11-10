import { Link } from "react-router-dom";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { useCollections } from "../../../../Components/hooks/useCollection";
import { useAuth } from "../../../../Components/hooks/useAuth";
import { fmtDate } from "../../../../Components/utils/format";
import PageHeader from "../../../../Components/Shared/PageHeader";
import Card from "../../../../Components/Shared/Card";
import StatusBadge from "../../../../Components/Shared/StatusBadge";
import CountdownBadge from "../../../../Components/Shared/CountdownBadge";
import FeatureTiles from "../../../../Components/Shared/FeatureTiles";
import Loader from "../../../../Components/Shared/Loader";
import { NEXT_STEP } from "../../../common/ExamsPage";

const BASE = "/app/it-head";
export default function ITHeadDashboard() {
  const { user } = useAuth();
  const { data, loading } = useCollections(["students", "teachers", "exams", "extensions", "corrections", "grace", "tickets", "batches"]);
  if (loading) return <Loader />;
  const active = data.exams.filter((e) => !["published", "board"].includes(e.status));
  const waiting = data.extensions.filter((x) => x.status === "requested").length + data.corrections.filter((x) => x.status === "pending" && x.itHeadApproved !== "Yes").length + data.grace.filter((x) => x.status === "pending").length;
  const open = data.tickets.filter((t) => ["open", "in_progress"].includes(t.status)).length;
  const noTeacher = data.batches.filter((b) => b.isClassTeacher === "Yes").length;
  const tiles = [{ feature: "examJourney", to: "exams" }, { feature: "approvals", to: "approvals", badge: waiting }, { feature: "teacherPlanner", to: "planner" }, { feature: "classExplorer", to: "classes" }, { feature: "studentBook", to: "data/students" }, { feature: "easyImport", to: "students/import" }, { feature: "reportShelf", to: "reports" }, { feature: "ruleStudio", to: "rules" }];
  return (
    <>
      <PageHeader back={false} title={`Welcome, ${user.name}`} subtitle={`${data.students.filter((s) => s.status === "Active").length} students - ${data.teachers.length} teachers - ${noTeacher} class teachers assigned${open ? ` - ${open} help tickets open` : ""}`} />
      <Card title="Do this next" className="mb-5">
        {active.length === 0 && <p className="flex items-center gap-2 text-sm text-ink-500"><FiCheckCircle className="text-brand-600" /> All exams are finished.</p>}
        <ul className="divide-y divide-ink-100">
          {active.map((e) => (
            <li key={e.id}><Link to={`${BASE}/exams/${e.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:text-brand-700">
              <span><b className="text-ink-900">{e.name}</b> <StatusBadge status={e.status} /><span className="mt-0.5 block text-sm text-ink-600">{NEXT_STEP[e.status]}</span></span>
              <span className="flex items-center gap-2 text-xs text-ink-500">{e.status === "entry_open" && <CountdownBadge date={e.entryEnd} />}{fmtDate(e.entryEnd)} <FiArrowRight /></span>
            </Link></li>))}
        </ul>
      </Card>
      <h2 className="mb-3 text-base font-semibold text-ink-900">What do you want to do?</h2>
      <FeatureTiles tiles={tiles} base={BASE} />
    </>
  );
}
