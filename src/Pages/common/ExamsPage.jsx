import { FiPlus, FiArrowRight } from "react-icons/fi";
import { useCollections } from "../../Components/hooks/useCollection";
import { useAuth } from "../../Components/hooks/useAuth";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { fmtDate } from "../../Components/utils/format";
import PageHeader from "../../Components/Shared/PageHeader";
import DataTable from "../../Components/Shared/DataTable";
import StatusBadge from "../../Components/Shared/StatusBadge";
import CountdownBadge from "../../Components/Shared/CountdownBadge";
import Button from "../../Components/Shared/Button";
import Loader from "../../Components/Shared/Loader";

export const NEXT_STEP = {
  setup: "IT Head opens the marks entry window", entry_open: "Teachers enter marks and press Submit", entry_closed: "IT Head runs the calculation",
  calculated: "IT Head checks the results and confirms", verified: "IT Head sends the results to Principal/VP", sent: "Vice Principal reviews, Principal signs",
  vp_reviewed: "Principal signs", principal_signed: "IT Head publishes the result", published: "Done. Students and parents can see the result", board: "IT Head types the Board result after the Board publishes it",
};

export default function ExamsPage() {
  const { data, loading } = useCollections(["exams"]);
  const { can } = useAuth();
  const base = useBasePath();
  if (loading) return <Loader />;
  const rows = [...data.exams].sort((a, b) => (a.entryStart || "").localeCompare(b.entryStart || ""));
  const columns = [
    { key: "name", label: "Exam", render: (r) => <span className="font-semibold text-ink-900">{r.name}</span> },
    { key: "programs", label: "Classes", render: (r) => (r.programs.length > 3 ? `${r.programs[0]} to ${r.programs[r.programs.length - 1]}` : r.programs.join(", ")) },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "w", label: "Marks entry window", render: (r) => (r.type === "board" ? "-" : <span className="flex flex-wrap items-center gap-2">{fmtDate(r.entryStart)} to {fmtDate(r.entryEnd)} {r.status === "entry_open" && <CountdownBadge date={r.entryEnd} />}</span>) },
    { key: "n", label: "What happens next", render: (r) => NEXT_STEP[r.status] },
    { key: "o", label: "", render: (r) => <Button to={`${base}/exams/${r.id}`} variant="soft" size="sm" icon={FiArrowRight}>Open</Button> },
  ];
  return (
    <>
      <PageHeader title="Exams" subtitle="Session 2026" note="Each exam goes through the same steps: marks entry, calculation, checking, signing and publishing. Open an exam to see the exact step it is in and what to press next."
        actions={can("setup.manage") && <Button to={`${base}/data/exams/new`} icon={FiPlus} variant="secondary">Add exam</Button>} />
      <DataTable columns={columns} rows={rows} />
    </>
  );
}
