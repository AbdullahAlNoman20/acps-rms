import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { FEATURES, HUBS } from "../../config/brand";
import { useAuth } from "../../Components/hooks/useAuth";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { useCollections } from "../../Components/hooks/useCollection";
import PageHeader from "../../Components/Shared/PageHeader";
import Loader from "../../Components/Shared/Loader";

// Big-card menu page (Approval Center, Setup Center, Customize Center). A number on a card = items waiting.
export default function HubPage({ hub, title }) {
  const { can } = useAuth(); const base = useBasePath();
  const { data, loading } = useCollections(["extensions", "corrections", "grace"]);
  if (loading) return <Loader />;
  const counts = { extensions: data.extensions.filter((x) => ["requested", "recommended"].includes(x.status)).length, corrections: data.corrections.filter((x) => x.status === "pending").length, grace: data.grace.filter((x) => x.status === "pending").length };
  const cards = HUBS[hub].filter(([, , perm]) => perm.split("|").some((p) => can(p)));
  return (
    <>
      <PageHeader title={title} subtitle="Choose a card" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([key, route]) => { const f = FEATURES[key]; const Icon = f.icon; const n = hub === "approvals" ? counts[route === "extensions" ? "extensions" : route === "corrections" ? "corrections" : route === "grace" ? "grace" : "none"] : 0;
          return (
            <Link key={key} to={`${base}/${route}`} className="group relative flex flex-col rounded-xl border border-ink-100 bg-white p-4 shadow-card transition hover:border-brand-300">
              {n > 0 && <span className="absolute right-3 top-3 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-crimson-500 px-1.5 text-xs font-bold text-white">{n}</span>}
              <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon size={20} /></span>
              <h3 className="font-semibold text-ink-900">{f.name}</h3><p className="mt-0.5 flex-1 text-sm text-ink-500">{f.tagline}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">Open <FiArrowRight className="transition group-hover:translate-x-0.5" /></span>
            </Link>); })}
      </div>
    </>
  );
}
