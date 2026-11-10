import { Link } from "react-router-dom";
import { FiBarChart2, FiFileText, FiArrowRight } from "react-icons/fi";
import { REPORT_TYPES } from "../../engine/reports";
import { useBasePath } from "../../Components/hooks/useBasePath";
import PageHeader from "../../Components/Shared/PageHeader";

export default function ReportsHub() {
  const base = useBasePath();
  const cards = [{ key: "transcript", label: "Transcript (one student)", desc: "Open the Results page, choose a student and press Transcript.", to: `${base}/results` }, ...REPORT_TYPES.map((r) => ({ ...r, to: `${base}/reports/${r.key}` })), { key: "chart", label: "Mark Blueprint chart", desc: "The mark distribution chart of a class, printable (45 or 33 rule).", to: `${base}/data/markDistributions` }];
  return (
    <>
      <PageHeader title="Reports" note="Choose a report. Every report can be printed (or saved as PDF) and exported to Excel." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.key} to={c.to} className="group flex flex-col rounded-xl border border-ink-100 bg-white p-4 shadow-card transition hover:border-brand-300">
            <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">{c.key === "transcript" ? <FiFileText /> : <FiBarChart2 />}</span>
            <h3 className="font-semibold text-ink-900">{c.label}</h3><p className="mt-1 flex-1 text-sm text-ink-500">{c.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">Open <FiArrowRight className="transition group-hover:translate-x-0.5" /></span>
          </Link>
        ))}
      </div>
    </>
  );
}
