import { NavLink } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { FEATURES } from "../../config/brand";
import { useLabel } from "../hooks/useLabel";
import { cx } from "../utils/format";

// Phone-only bar with the four most used pages + Menu. Big touch targets.
export default function BottomNav({ items, base, onMenu }) {
  const t = useLabel();
  return (
    <nav aria-label="Main" className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((i) => { const f = FEATURES[i.feature]; const Icon = f.icon; return (
          <li key={i.to}>
            <NavLink to={`${base}/${i.to}`} end={i.to === "dashboard"} className={({ isActive }) => cx("flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-semibold", isActive ? "text-brand-700" : "text-ink-500")}>
              <Icon size={20} /><span className="max-w-full truncate">{t(`nav.${i.to}`, i.label || f.name)}</span>
            </NavLink>
          </li>); })}
        <li><button type="button" onClick={onMenu} className="flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-semibold text-ink-500"><FiMenu size={20} /> Menu</button></li>
      </ul>
    </nav>
  );
}
