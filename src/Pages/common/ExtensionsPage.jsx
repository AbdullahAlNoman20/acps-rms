import { FiPlus } from "react-icons/fi";
import { useCollections } from "../../Components/hooks/useCollection";
import { useAuth } from "../../Components/hooks/useAuth";
import { useToast } from "../../Components/hooks/useToast";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { api } from "../../Components/services/api";
import { addDays, fmtDate } from "../../Components/utils/format";
import PageHeader from "../../Components/Shared/PageHeader";
import DataTable from "../../Components/Shared/DataTable";
import StatusBadge from "../../Components/Shared/StatusBadge";
import Button from "../../Components/Shared/Button";
import Loader from "../../Components/Shared/Loader";

// Flow: Teacher asks -> IT Head recommends (maximum from Rules) -> Principal approves -> exam end date moves.
export default function ExtensionsPage() {
  const { data, loading } = useCollections(["extensions", "exams", "teachers", "ruleParams"]);
  const { user, can } = useAuth(); const toast = useToast(); const base = useBasePath();
  if (loading) return <Loader />;
  const max = Number(data.ruleParams.find((p) => p.key === "maxExtensions")?.value || 2);
  const exam = (id) => data.exams.find((e) => e.id === id);
  const rows = (user.role === "teacher" ? data.extensions.filter((x) => x.teacherId === user.teacherId) : data.extensions).slice().reverse();

  async function recommend(x) {
    const e = exam(x.examId);
    const used = (e.extensionsUsed || 0) + data.extensions.filter((y) => y.examId === x.examId && y.status === "recommended" && y.id !== x.id).length;
    if (used >= max) { toast.push(`Maximum ${max} extensions already used for this exam.`, "error"); return; }
    await api.update("extensions", x.id, { status: "recommended", note: `Recommended by ${user.name}` }, "Recommended"); toast.push("Recommended. The Principal will approve.");
  }
  async function approve(x) {
    const e = exam(x.examId);
    await api.update("exams", e.id, { entryEnd: addDays(e.entryEnd, x.days), extensionsUsed: (e.extensionsUsed || 0) + 1 }, `Extended by ${x.days} days`);
    await api.update("extensions", x.id, { status: "approved", note: `Approved by ${user.name}` }, "Approved"); toast.push(`Approved. The exam now ends on ${fmtDate(addDays(e.entryEnd, x.days))}.`);
  }
  const reject = async (x) => { await api.update("extensions", x.id, { status: "rejected", note: `Rejected by ${user.name}` }, "Rejected"); toast.push("Rejected."); };

  const columns = [
    { key: "e", label: "Exam", render: (x) => exam(x.examId)?.name }, { key: "t", label: "Teacher", render: (x) => data.teachers.find((t) => t.id === x.teacherId)?.name },
    { key: "reason", label: "Reason" }, { key: "days", label: "Extra days" }, { key: "status", label: "Status", render: (x) => <StatusBadge status={x.status} /> },
    { key: "requestedAt", label: "Asked on", render: (x) => fmtDate(x.requestedAt) },
    { key: "a", label: "Action", render: (x) => (
      <div className="flex flex-wrap gap-1.5">
        {x.status === "requested" && can("extension.recommend") && <Button size="sm" onClick={() => recommend(x)}>Recommend</Button>}
        {x.status === "recommended" && can("extension.approve") && <Button size="sm" onClick={() => approve(x)}>Approve</Button>}
        {((x.status === "requested" && can("extension.recommend")) || (x.status === "recommended" && can("extension.approve"))) && <Button size="sm" variant="secondary" onClick={() => reject(x)}>Reject</Button>}
        {x.note && <span className="text-xs text-ink-400">{x.note}</span>}
      </div>) },
  ];
  return (
    <>
      <PageHeader title="Time extensions" note={<>When a teacher needs more time for marks entry: <b>Teacher asks</b> then <b>IT Head recommends</b> then <b>Principal approves</b>. One exam can be extended at most {max} times. After approval the end date moves automatically.</>}
        actions={can("extension.request") && <Button to={`${base}/extension/new`} icon={FiPlus}>Ask for more time</Button>} />
      <DataTable columns={columns} rows={rows} empty="No extension requests" emptyText="Requests will appear here." />
    </>
  );
}
