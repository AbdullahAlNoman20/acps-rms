import { ui } from "../../theme/ui";
import { cx } from "../utils/format";

export default function Card({ title, subtitle, actions, children, className, pad = true }) {
  return (
    <section className={cx(ui.card, pad && "p-4 sm:p-5", className)}>
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div><h2 className="text-base font-semibold text-ink-900">{title}</h2>{subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}</div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
