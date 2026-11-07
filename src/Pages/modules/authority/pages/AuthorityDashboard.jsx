import { Link } from "react-router-dom";
import { FiClipboard, FiClock, FiEdit3, FiPercent, FiTrendingUp, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { useCollections } from "../../../../Components/hooks/useCollection";
import { useAuth } from "../../../../Components/hooks/useAuth";
import PageHeader from "../../../../Components/Shared/PageHeader";
import StatCard from "../../../../Components/Shared/StatCard";
import Card from "../../../../Components/Shared/Card";
import StatusBadge from "../../../../Components/Shared/StatusBadge";
import Loader from "../../../../Components/Shared/Loader";
import { NEXT_STEP } from "../../../common/ExamsPage";

const BASE = "/app/authority";
export default function AuthorityDashboard() {
  const { user, can } = useAuth();
  const { data, loading } = useCollections(["exams", "extensions", "corrections", "grace", "yearEnd", "settings"]);
  if (loading) return <Loader />;
  const waiting = data.exams.filter((e) => (e.status === "sent" && can("results.review")) || (e.status === "vp_reviewed" && can("results.sign")));
  const session = data.settings[0]?.currentSession; const ye = data.yearEnd.find((y) => y.session === session);
  const items = [
    { icon: FiClipboard, label: "Exams waiting for your review or signature", value: waiting.length, to: "exams", show: can("results.review") },
    { icon: FiClock, label: "Time extensions to approve", value: data.extensions.filter((x) => x.status === "recommended").length, to: "extensions", show: can("extension.approve"), tone: "orange" },
    { icon: FiEdit3, label: "Marks corrections to approve", value: data.corrections.filter((x) => x.status === "pending" && (user.role === "exam_authority" ? x.authorityApproved !== "Yes" : false)).length, to: "corrections", show: can("correction.approve"), tone: "violet" },
    { icon: FiPercent, label: "Grace marks to approve", value: data.grace.filter((x) => x.status === "pending").length, to: "grace", show: can("grace.approve"), tone: "amber" },
    { icon: FiTrendingUp, label: "Year-end list to approve", value: ye?.status === "prepared" ? 1 : 0, to: "year-end", show: can("yearend.approve"), tone: "blue" },
  ].filter((i) => i.show);
  return (
    <>
      <PageHeader back={false} title={`Welcome, ${user.name}`} note="Things waiting for you are shown below. Open an exam to read the results, then press Review, Sign or Return (with a reason). Your digital signature prints on the transcripts." />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((i) => <StatCard key={i.label} icon={i.icon} label={i.label} value={i.value} tone={i.tone} to={`${BASE}/${i.to}`} />)}</div>
      <Card title="Exams">
        <ul className="divide-y divide-ink-100">
          {data.exams.filter((e) => e.type === "school").map((e) => (
            <li key={e.id}><Link to={`${BASE}/exams/${e.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:text-brand-700"><span><b className="text-ink-900">{e.name}</b> <StatusBadge status={e.status} /><span className="mt-0.5 block text-xs text-ink-500">{NEXT_STEP[e.status]}</span></span><FiArrowRight className="text-ink-300" /></Link></li>))}
        </ul>
        {waiting.length === 0 && <p className="mt-2 flex items-center gap-2 text-sm text-ink-500"><FiCheckCircle className="text-brand-600" /> Nothing is waiting for your sign right now.</p>}
      </Card>
    </>
  );
}
