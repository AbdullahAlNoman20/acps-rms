import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiChevronDown, FiChevronRight, FiLogOut, FiX } from "react-icons/fi";
import logo from "../../assets/logo.png";
import { useAuth } from "../hooks/useAuth";
import { useLabel } from "../hooks/useLabel";
import { cx } from "../utils/format";
import { BRAND, FEATURES } from "../../config/brand";

function Item({ item, base, onNavigate }) {
  const t = useLabel();
  const f = FEATURES[item.feature]; const Icon = f.icon;
  return (
    <NavLink to={`${base}/${item.to}`} end={item.to === "dashboard"} onClick={onNavigate}
      className={({ isActive }) => cx("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition", isActive ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white")}>
      {Icon && <Icon size={18} className="shrink-0" />}<span className="truncate">{t(`nav.${item.to}`, item.label || f.name)}</span>
    </NavLink>
  );
}

export default function Sidebar({ nav, base, open, onClose }) {
  const { can, logout } = useAuth();
  const [closed, setClosed] = useState({});
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  const sections = nav.map((s) => ({ ...s, items: s.items.filter((i) => !i.perm || i.perm.split("|").some((p) => can(p))) })).filter((s) => s.items.length);
  const body = (
    <div className="flex h-full flex-col bg-brand-800 text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <img src={logo} alt="School logo" className="h-11 w-11 rounded-full bg-white object-contain p-0.5" />
        <div className="min-w-0 leading-tight"><p className="truncate text-sm font-bold">{BRAND.name}</p><p className="truncate text-[11px] text-white/60">Adamjee Cantonment Public School</p></div>
        <button type="button" onClick={onClose} aria-label="Close menu" className="ml-auto rounded p-1.5 text-white/70 hover:bg-white/10 md:hidden"><FiX size={18} /></button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-3">
        {sections.map((s, i) => (
          <div key={s.group || i} className={s.group ? "pt-2" : ""}>
            {s.group && (
              <button type="button" onClick={() => setClosed((c) => ({ ...c, [s.group]: !c[s.group] }))} className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold text-white/50 hover:text-white/80">
                {s.group}{closed[s.group] ? <FiChevronRight size={14} /> : <FiChevronDown size={14} />}
              </button>
            )}
            {!closed[s.group] && <div className="space-y-0.5">{s.items.map((it) => <Item key={it.to} item={it} base={base} onNavigate={onClose} />)}</div>}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"><FiLogOut size={18} /> Sign out</button>
      </div>
    </div>
  );
  return (
    <>
      <aside className="no-print hidden w-64 shrink-0 md:block">{body}</aside>
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="relative w-[80%] max-w-[18rem]">{body}</div>
        </div>
      )}
    </>
  );
}
