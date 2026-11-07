import { Link } from "react-router-dom";
import { FiUsers, FiUser, FiClipboard, FiClock, FiEdit3, FiPercent, FiLifeBuoy, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { useCollections } from "../../../../Components/hooks/useCollection";
import { useAuth } from "../../../../Components/hooks/useAuth";
import { fmtDate } from "../../../../Components/utils/format";
import PageHeader from "../../../../Components/Shared/PageHeader";
import StatCard from "../../../../Components/Shared/StatCard";
import Card from "../../../../Components/Shared/Card";
import StatusBadge from "../../../../Components/Shared/StatusBadge";
import CountdownBadge from "../../../../Components/Shared/CountdownBadge";
import Loader from "../../../../Components/Shared/Loader";
import { NEXT_STEP } from "../../../common/ExamsPage";

const BASE = "/app/it-head";
export default function ITHeadDashboard() {
  const { user, can } = useAuth();
  const { data, loading } = useCollections(["students", "teachers", "exams", "extensions", "corrections", "grace", "tickets"]);
  if (loading) return <Loader />;
  const active = data.exams.filter((e) => !["published", "board"].includes(e.status));
  const pend = { ext: data.extensions.filter((x) => x.status === "requested").length, cor: data.corrections.filter((x) => x.status === "pending" && x.itHeadApproved !== "Yes").length, tick: data.tickets.filter((t) => ["open", "in_progress"].includes(t.status)).length };
  const links = [["data/students", "Add or correct a student", "students.manage"], ["data/markDistributions", "Change marks and pass marks", "setup.manage"], ["rules", "Change a rule or formula", "customize.manage"], ["permissions", "Change who can do what", "permissions.manage"], ["labels", "Rename a heading", "customize.manage"], ["reports", "Print a report", "reports.view"]];
  return (
    <>
      <PageHeader back={false} title={`Welcome, ${user.name}`} note="This is your control room. Start from 'Exams that need your attention'. Everything in the system (marks, rules, names, fields, permissions) can be changed from the menu on the left." />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={FiUsers} label="Active students" value={data.students.filter((s) => s.status === "Active").length} to={`${BASE}/data/students`} />
        <StatCard icon={FiUser} label="Teachers" value={data.teachers.length} to={`${BASE}/data/teachers`} tone="blue" />
        <StatCard icon={FiClipboard} label="Exams in progress" value={active.length} to={`${BASE}/exams`} tone="amber" />
        <StatCard icon={FiClock} label="Time extension requests" value={pend.ext} to={`${BASE}/extensions`} tone="orange" hint="Waiting for you" />
        <StatCard icon={FiEdit3} label="Marks corrections to approve" value={pend.cor} to={`${BASE}/corrections`} tone="violet" />
        <StatCard icon={FiLifeBuoy} label="Open support tickets" value={pend.tick} to={`${BASE}/support`} tone="red" />
      </div>
      <Card title="Exams that need your attention" className="mb-5">
        {active.length === 0 && <p className="flex items-center gap-2 text-sm text-ink-500"><FiCheckCircle className="text-brand-600" /> All exams are finished.</p>}
        <ul className="divide-y divide-ink-100">
          {active.map((e) => (
            <li key={e.id}><Link to={`${BASE}/exams/${e.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:text-brand-700">
              <span><b className="text-ink-900">{e.name}</b> <StatusBadge status={e.status} /><span className="mt-0.5 block text-xs text-ink-500">{NEXT_STEP[e.status]}</span></span>
              <span className="flex items-center gap-2 text-xs text-ink-500">{e.status === "entry_open" && <CountdownBadge date={e.entryEnd} />}{fmtDate(e.entryEnd)} <FiArrowRight /></span>
            </Link></li>))}
        </ul>
      </Card>
      <Card title="Quick jumps"><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{links.filter(([, , perm]) => can(perm)).map(([to, label]) => <Link key={to} to={`${BASE}/${to}`} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2.5 text-sm font-medium text-ink-700 hover:border-brand-300 hover:bg-brand-50">{label}<FiArrowRight className="text-ink-300" /></Link>)}</div></Card>
    </>
  );
}
