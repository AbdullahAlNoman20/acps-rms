import { FiPlus } from "react-icons/fi";
import { useCollection } from "../../Components/hooks/useCollection";
import { useAuth } from "../../Components/hooks/useAuth";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { fmtDate } from "../../Components/utils/format";
import PageHeader from "../../Components/Shared/PageHeader";
import DataTable from "../../Components/Shared/DataTable";
import StatusBadge from "../../Components/Shared/StatusBadge";
import Button from "../../Components/Shared/Button";
import Loader from "../../Components/Shared/Loader";

export default function TicketsPage() {
  const { items, loading } = useCollection("tickets");
  const { user, can } = useAuth(); const base = useBasePath();
  if (loading) return <Loader />;
  const rows = (can("support.manage") ? items : items.filter((t) => t.createdBy === user.name)).slice().reverse();
  return (
    <>
      <PageHeader title="Support tickets" note="Having a problem? Press 'New ticket', describe it and the IT team will reply here. You can come back any time to see the answer."
        actions={<Button to={`${base}/support/new`} icon={FiPlus}>New ticket</Button>} />
      <DataTable rows={rows} empty="No tickets yet" emptyText="When you create a ticket it will appear here." columns={[{ key: "id", label: "No" }, { key: "title", label: "Problem", render: (t) => <span className="font-semibold text-ink-900">{t.title}</span> },
        { key: "priority", label: "Priority", render: (t) => <StatusBadge status={t.priority} /> }, { key: "status", label: "Status", render: (t) => <StatusBadge status={t.status} /> }, { key: "createdBy", label: "From" }, { key: "createdAt", label: "Date", render: (t) => fmtDate(t.createdAt) },
        { key: "o", label: "", render: (t) => <Button to={`${base}/support/${t.id}`} variant="soft" size="sm">Open</Button> }]} />
    </>
  );
}
