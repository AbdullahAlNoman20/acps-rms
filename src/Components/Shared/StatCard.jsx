import { Link } from "react-router-dom";
import { ui } from "../../theme/ui";
import { cx } from "../utils/format";

export default function StatCard({ icon: Icon, label, value, hint, to, tone = "green" }) {
  const body = (
    <div className={cx(ui.card, "flex items-center gap-3 p-4 transition hover:border-brand-200")}>
      {Icon && <div className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", ui.tones[tone])}><Icon size={20} /></div>}
      <div className="min-w-0"><p className="text-2xl font-bold leading-tight text-ink-900">{value}</p><p className="truncate text-sm text-ink-600">{label}</p>{hint && <p className="truncate text-xs text-ink-400">{hint}</p>}</div>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}
