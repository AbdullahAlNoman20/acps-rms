import { FiLock } from "react-icons/fi";
import { useCollection } from "../../Components/hooks/useCollection";
import { useToast } from "../../Components/hooks/useToast";
import { ROLE_LABELS } from "../../Components/constants/roles";
import PageHeader from "../../Components/Shared/PageHeader";
import Loader from "../../Components/Shared/Loader";
import { ui } from "../../theme/ui";

export default function PermissionsPage() {
  const { items, loading, update } = useCollection("permissions"); const toast = useToast();
  if (loading) return <Loader />;
  const roles = Object.keys(ROLE_LABELS);
  const toggle = async (p, r) => { await update(p.id, { roles: { ...p.roles, [r]: !p.roles[r] } }, `${r}: ${p.key}`); toast.push("Saved."); };
  return (
    <>
      <PageHeader title="Who can do what" note="Tick a box to give that role the permission. It works at once (menus and buttons change). The IT Head always has every permission. Teachers can still use only their own classes even if a box is ticked." />
      <div className={`${ui.card} overflow-x-auto`}>
        <table className="min-w-full divide-y divide-ink-100">
          <thead><tr><th className={`${ui.th} sticky left-0 z-10 min-w-[220px]`}>Permission</th>{roles.map((r) => <th key={r} className={`${ui.th} text-center`}>{ROLE_LABELS[r]}</th>)}</tr></thead>
          <tbody className="divide-y divide-ink-100">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-ink-50/50">
                <td className={`${ui.td} sticky left-0 bg-white font-medium text-ink-800`}>{p.label}</td>
                {roles.map((r) => (
                  <td key={r} className={`${ui.td} text-center`}>
                    {r === "it_head" ? <FiLock className="mx-auto text-ink-300" aria-label="Always allowed" /> : <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={!!p.roles[r]} onChange={() => toggle(p, r)} aria-label={`${ROLE_LABELS[r]}: ${p.label}`} />}
                  </td>))}
              </tr>))}
          </tbody>
        </table>
      </div>
    </>
  );
}
