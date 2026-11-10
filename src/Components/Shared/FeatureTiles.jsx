import { Link } from "react-router-dom";
import { FEATURES } from "../../config/brand";

// Big, friendly buttons: [{ feature, to, badge?, label? }]. Two per row on phones.
export default function FeatureTiles({ tiles, base }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => { const f = FEATURES[t.feature]; const Icon = f.icon; return (
        <Link key={t.to} to={`${base}/${t.to}`} className="relative flex min-h-[116px] flex-col rounded-xl border border-ink-100 bg-white p-3.5 shadow-card transition hover:border-brand-300 sm:p-4">
          {t.badge > 0 && <span className="absolute right-2.5 top-2.5 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-crimson-500 px-1.5 text-xs font-bold text-white">{t.badge}</span>}
          <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon size={20} /></span>
          <span className="text-sm font-bold text-ink-900">{t.label || f.name}</span>
          <span className="mt-0.5 text-xs leading-snug text-ink-500">{f.tagline}</span>
        </Link>); })}
    </div>
  );
}
