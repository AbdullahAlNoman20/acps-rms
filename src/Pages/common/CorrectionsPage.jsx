import { FiPlus } from "react-icons/fi";
import { useCollections } from "../../Components/hooks/useCollection";
import { useAuth } from "../../Components/hooks/useAuth";
import { useToast } from "../../Components/hooks/useToast";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { api } from "../../Components/services/api";
import { fmtDate } from "../../Components/utils/format";
import PageHeader from "../../Components/Shared/PageHeader";
import DataTable from "../../Components/Shared/DataTable";
import StatusBadge from "../../Components/Shared/StatusBadge";
import Button from "../../Components/Shared/Button";
import Loader from "../../Components/Shared/Loader";

// After marks are submitted a teacher cannot edit them. A correction needs IT Head AND Exam Authority approval.
export default function CorrectionsPage() {
  const { data, loading } = useCollections(["corrections", "exams", "students", "courses", "marks"]);
  const { user, can } = useAuth(); const toast = useToast(); const base = useBasePath();
  if (loading) return <Loader />;
  const rows = (user.role === "teacher" ? data.corrections.filter((c) => c.teacherId === user.teacherId) : data.corrections).slice().reverse();
  const mine = (c) => (user.role === "it_head" ? c.itHeadApproved === "Yes" : user.role === "exam_authority" ? c.authorityApproved === "Yes" : true);

  async function approve(c) {
    const patch = user.role === "it_head" ? { itHeadApproved: "Yes" } : { authorityApproved: "Yes" };
    const next = { ...c, ...patch };
    if (next.itHeadApproved === "Yes" && next.authorityApproved === "Yes") {
      const mid = `${c.examId}|${c.studentId}|${c.courseCode}`; const mk = data.marks.find((m) => m.id === mid);
      if (mk) await api.update("marks", mid, { comps: { ...mk.comps, [c.component]: c.newValue } }, `Correction ${c.id}: ${c.oldValue} -> ${c.newValue}`);
      patch.status = "applied";
    }
    await api.update("corrections", c.id, patch, "Approved"); toast.push(patch.status === "applied" ? "Both approvals done. The marks were corrected." : "Your approval is saved. Waiting for the other approver.");
  }
  const reject = async (c) => { await api.update("corrections", c.id, { status: "rejected" }, "Rejected"); toast.push("Rejected."); };
  const yes = (v) => <StatusBadge status={v === "Yes" ? "approved" : "pending"} label={v === "Yes" ? "Yes" : "Waiting"} />;

  const columns = [
    { key: "e", label: "Exam", render: (c) => data.exams.find((e) => e.id === c.examId)?.name },
    { key: "s", label: "Student", render: (c) => { const s = data.students.find((x) => x.id === c.studentId); return s ? `${s.name} (${s.program}-${s.section})` : c.studentId; } },
    { key: "c", label: "Subject and part", render: (c) => `${data.courses.find((x) => x.code === c.courseCode)?.name || c.courseCode} / ${c.component}` },
    { key: "v", label: "Marks", render: (c) => `${c.oldValue} to ${c.newValue}` }, { key: "reason", label: "Reason" },
    { key: "i", label: "IT Head", render: (c) => yes(c.itHeadApproved) }, { key: "x", label: "Exam Authority", render: (c) => yes(c.authorityApproved) },
    { key: "st", label: "Status", render: (c) => <StatusBadge status={c.status} /> },
    { key: "a", label: "Action", render: (c) => c.status === "pending" && can("correction.approve") && !mine(c) ? (
      <div className="flex gap-1.5"><Button size="sm" onClick={() => approve(c)}>Approve</Button><Button size="sm" variant="secondary" onClick={() => reject(c)}>Reject</Button></div>) : <span className="text-xs text-ink-400">{fmtDate(c.createdAt)}</span> },
  ];
  return (
    <>
      <PageHeader title="Marks corrections" note="A correction changes the marks only after BOTH the IT Head and the Exam Authority approve it. The old marks stay in the audit log."
        actions={can("correction.request") && <Button to={`${base}/corrections/new`} icon={FiPlus}>New correction request</Button>} />
      <DataTable columns={columns} rows={rows} empty="No correction requests" />
    </>
  );
}
