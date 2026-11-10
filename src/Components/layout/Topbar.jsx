import { FiMenu } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { ROLE_LABELS } from "../constants/roles";
import { BRAND } from "../../config/brand";

export default function Topbar({ onMenu }) {
  const { user } = useAuth();
  return (
    <header className="no-print flex h-14 shrink-0 items-center gap-3 border-b border-ink-100 bg-white px-3 sm:px-6">
      <button type="button" onClick={onMenu} aria-label="Open menu" className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 md:hidden"><FiMenu size={20} /></button>
      <p className="truncate text-sm font-semibold text-ink-700">{BRAND.name}</p>
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden text-right leading-tight sm:block"><p className="text-sm font-semibold text-ink-900">{user?.name}</p><p className="text-xs text-ink-500">{ROLE_LABELS[user?.role]}</p></div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: user?.avatarColor || "#087A49" }}>{user?.name?.charAt(0)}</span>
      </div>
    </header>
  );
}
