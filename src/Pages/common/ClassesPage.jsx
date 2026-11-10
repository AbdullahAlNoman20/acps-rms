import { Link } from "react-router-dom";
import { FiUsers, FiBookOpen, FiArrowRight } from "react-icons/fi";
import { useCollections } from "../../Components/hooks/useCollection";
import { useBasePath } from "../../Components/hooks/useBasePath";
import PageHeader from "../../Components/Shared/PageHeader";
import Loader from "../../Components/Shared/Loader";

// Class Explorer: Class I to X as cards.
export default function ClassesPage() {
  const { data, loading } = useCollections(["programs", "students", "markDistributions", "batches", "teachers"]);
  const base = useBasePath();
  if (loading) return <Loader />;
  return (
    <>
      <PageHeader title="All classes" subtitle="Tap a class to see its sections, subjects, teachers and students" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...data.programs].sort((a, b) => a.order - b.order).map((p) => {
          const studs = data.students.filter((s) => s.program === p.name && s.status === "Active");
          const dists = data.markDistributions.filter((d) => d.programs.includes(p.name));
          const subjects = new Set(dists.flatMap((d) => d.courses.map((c) => c.jointName || c.code))).size;
          const cts = data.batches.filter((b) => b.program === p.name && b.isClassTeacher === "Yes");
          return (
            <Link key={p.id} to={`${base}/classes/${p.name}`} className="group flex flex-col rounded-xl border border-ink-100 bg-white p-4 shadow-card transition hover:border-brand-300">
              <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-ink-900">Class {p.name}</h3>{p.hasGroup === "Yes" && <span className="rounded-full bg-gold-50 px-2 py-0.5 text-[11px] font-semibold text-gold-600">Groups</span>}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-ink-600">
                <span className="flex items-center gap-2"><FiUsers className="text-brand-600" /> {studs.length} students</span>
                <span className="flex items-center gap-2"><FiBookOpen className="text-brand-600" /> {subjects} subjects</span>
              </div>
              <p className="mt-2 flex-1 text-xs text-ink-500">Class teachers: {cts.length ? cts.map((b) => `${b.section}-${b.version.slice(0, 3)}: ${data.teachers.find((t) => t.id === b.teacherId)?.name.replace(/^(Md\.|Mrs\.|Mr\.)\s*/, "")}`).join(", ") : "not assigned"}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">Open <FiArrowRight className="transition group-hover:translate-x-0.5" /></span>
            </Link>);
        })}
      </div>
    </>
  );
}
