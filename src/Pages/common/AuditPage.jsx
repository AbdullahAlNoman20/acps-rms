import { useMemo, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { useCollection } from "../../Components/hooks/useCollection";
import { exportRows } from "../../Components/utils/excel";
import { unique } from "../../Components/utils/format";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";
import DataTable from "../../Components/Shared/DataTable";
import FilterBar from "../../Components/Shared/FilterBar";
import Button from "../../Components/Shared/Button";
import Loader from "../../Components/Shared/Loader";

export default function AuditPage() {
  const { items, loading } = useCollection("audit");
  const [f, setF] = useState({ entity: "", action: "", q: "" });
  const rows = useMemo(() => items.filter((r) => (!f.entity || r.entity === f.entity) && (!f.action || r.action === f.action) && (!f.q || JSON.stringify(r).toLowerCase().includes(f.q.toLowerCase()))), [items, f]);
  if (loading) return <Loader />;
  return (
    <>
      <PageHeader title="Audit log" subtitle={`${items.length} records`} note="Every change in the system is written here automatically: who did it, when, and on which record. The school keeps this log for 5 years. It cannot be edited."
        actions={<Button variant="secondary" icon={FiDownload} onClick={() => exportRows("audit-log", rows)}>Export Excel</Button>} />
      <FilterBar values={f} onChange={setF} filters={[{ key: "entity", label: "Where", options: unique(items.map((r) => r.entity)) }, { key: "action", label: "What", options: unique(items.map((r) => r.action)) }]}>
        <div className="sm:col-span-2"><label className={ui.label} htmlFor="aq">Search</label><input id="aq" className={ui.input} value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Name, record or word" /></div>
      </FilterBar>
      <DataTable rows={rows} pageSize={25} columns={[{ key: "at", label: "When" }, { key: "user", label: "Who" }, { key: "action", label: "What" }, { key: "entity", label: "Where" }, { key: "ref", label: "Record" }, { key: "detail", label: "Detail" }]} />
    </>
  );
}
