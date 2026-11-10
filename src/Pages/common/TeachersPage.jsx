import { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiArrowRight, FiPhone } from "react-icons/fi";
import { useCollections } from "../../Components/hooks/useCollection";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { unique } from "../../Components/utils/format";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";
import Button from "../../Components/Shared/Button";
import StatusBadge from "../../Components/Shared/StatusBadge";
import EmptyState from "../../Components/Shared/EmptyState";
import Loader from "../../Components/Shared/Loader";

// Teacher Desk: every teacher with workload at a glance.
export default function TeachersPage() {
  const { data, loading } = useCollections(["teachers", "batches", "users"]);
  const base = useBasePath(); const [q, setQ] = useState("");
  if (loading) return <Loader />;
  const list = data.teachers.filter((t) => `${t.name} ${t.designation} ${t.phone}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Teachers" subtitle={`${data.teachers.length} teachers`} actions={<Button to={`${base}/teachers/new`} icon={FiPlus}>Add teacher</Button>} />
      <input className={`${ui.input} mb-4 max-w-md`} placeholder="Search a teacher" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
      {list.length === 0 ? <EmptyState title="No teacher found" /> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => {
            const bs = data.batches.filter((b) => b.teacherId === t.id); const subj = bs.filter((b) => b.courseCode !== "*"); const cts = bs.filter((b) => b.isClassTeacher === "Yes");
            const login = data.users.find((u) => u.teacherId === t.id);
            return (
              <Link key={t.id} to={`${base}/teachers/${t.id}`} className="group flex flex-col rounded-xl border border-ink-100 bg-white p-4 shadow-card hover:border-brand-300">
                <div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold text-ink-900">{t.name}</h3><p className="text-xs text-ink-500">{t.designation}</p></div><StatusBadge status={login?.status || "Inactive"} label={login ? `Login ${login.status}` : "No login"} /></div>
                <p className="mt-2 flex items-center gap-2 text-xs text-ink-500"><FiPhone /> {t.phone}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">{unique(subj.map((b) => b.courseCode)).length} subjects</span><span className="rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">{unique(subj.map((b) => `${b.program}${b.section}${b.version}`)).length} sections</span></div>
                <p className="mt-2 flex-1 text-xs text-ink-600">{cts.length ? `Class teacher of ${cts.map((b) => `${b.program}-${b.section} (${b.version})`).join(", ")}` : "Not a class teacher"}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">Open <FiArrowRight className="transition group-hover:translate-x-0.5" /></span>
              </Link>);
          })}
        </div>)}
    </>
  );
}
