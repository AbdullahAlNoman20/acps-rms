import { useMemo } from "react";
import { FiCheck, FiRefreshCw, FiFlag } from "react-icons/fi";
import { useResultData } from "../../Components/hooks/useResultData";
import { useAuth } from "../../Components/hooks/useAuth";
import { useToast } from "../../Components/hooks/useToast";
import { api } from "../../Components/services/api";
import { computeAggregate, promotionOf } from "../../engine/calc";
import { fix, fmtDate, today } from "../../Components/utils/format";
import PageHeader from "../../Components/Shared/PageHeader";
import Card from "../../Components/Shared/Card";
import DataTable from "../../Components/Shared/DataTable";
import StatusBadge from "../../Components/Shared/StatusBadge";
import StatCard from "../../Components/Shared/StatCard";
import Button from "../../Components/Shared/Button";
import ConfirmButton from "../../Components/Shared/ConfirmButton";
import NoteBox from "../../Components/Shared/NoteBox";
import Loader from "../../Components/Shared/Loader";

// Prepare (IT Head) -> Approve (Principal) -> Rollover (IT Head). Rules come from "promotion" conditions in Rules.
export default function YearEndPage() {
  const { data, ctx, loading } = useResultData(["yearEnd", "sessions"]);
  const { user, can } = useAuth(); const toast = useToast();
  const session = data.settings?.[0]?.currentSession || "2026";
  const rows = useMemo(() => {
    if (!ctx) return [];
    return data.students.filter((s) => s.status === "Active" && s.session === session).map((s) => {
      const agg = computeAggregate(ctx, s, "staff"); const p = promotionOf(ctx, s, agg);
      return { id: s.id, student: s, agg, decision: p.decision, name: s.name, cls: `${s.program}-${s.section} (${s.version})`, gpa: agg?.gpa ?? 0, result: agg?.result || "-", failed: agg?.failedCount ?? 0, att: agg?.attendance ?? "-" };
    });
  }, [ctx, data.students, session]);
  if (loading) return <Loader />;
  const rec = data.yearEnd.find((y) => y.session === session);
  const counts = rows.reduce((m, r) => ({ ...m, [r.decision]: (m[r.decision] || 0) + 1 }), {});

  async function prepare() {
    const rec2 = { id: `YE-${session}`, session, status: "prepared", preparedAt: today(), preparedBy: user.name, note: "", decisions: Object.fromEntries(rows.map((r) => [r.id, r.decision])) };
    if (rec) await api.update("yearEnd", rec.id, rec2, "Prepared"); else await api.create("yearEnd", rec2);
    toast.push("Promotion list prepared. The Principal can approve it now.");
  }
  async function approve() { await api.update("yearEnd", rec.id, { status: "approved", approvedBy: user.name, approvedAt: today() }, "Approved"); toast.push("Approved. The IT Head can run the rollover."); }
  async function rollover() {
    const next = String(Number(session) + 1);
    const nextOf = (p) => data.programs.find((x) => x.name === p)?.nextProgram || "Passed Out";
    const hasGroup = (p) => data.programs.find((x) => x.name === p)?.hasGroup === "Yes";
    const updates = []; const place = new Map();
    rows.filter((r) => r.decision === "Promoted").sort((a, b) => b.gpa - a.gpa || (b.agg?.totalMarks || 0) - (a.agg?.totalMarks || 0)).forEach((r) => {
      const np = nextOf(r.student.program); const key = `${np}|${r.student.version}|${r.student.section}`; const roll = (place.get(key) || 0) + 1; place.set(key, roll);
      updates.push({ id: r.id, program: np, roll, session: next, group: hasGroup(np) && r.student.group === "General" ? "Science" : r.student.group, fourthSubject: hasGroup(np) && hasGroup(r.student.program) ? r.student.fourthSubject : "" });
    });
    rows.filter((r) => r.decision === "Passed Out").forEach((r) => updates.push({ id: r.id, status: "Passed Out" }));
    rows.filter((r) => !["Promoted", "Passed Out"].includes(r.decision)).forEach((r) => updates.push({ id: r.id, session: next }));
    await api.upsertMany("students", updates, `Rollover ${session} to ${next}`);
    const sess = data.sessions.map((s) => ({ ...s, isCurrent: "No" })); if (!sess.some((s) => s.id === next)) sess.push({ id: next, name: next, startDate: `${next}-01-01`, endDate: `${next}-12-31`, isCurrent: "Yes" }); else sess.forEach((s) => { if (s.id === next) s.isCurrent = "Yes"; });
    await api.replace("sessions", sess, "New session"); await api.update("settings", "main", { currentSession: next }, "Session changed");
    await api.update("yearEnd", rec.id, { status: "rolled", rolledAt: today(), archive: rows.map((r) => ({ studentId: r.id, program: r.student.program, section: r.student.section, gpa: r.gpa, result: r.result, decision: r.decision })) }, "Rollover done");
    toast.push(`Rollover done. Session ${next} is now current.`);
  }
  const status = rec?.status || "draft";
  return (
    <>
      <PageHeader title="Year-end promotion" subtitle={`Session ${session}`} note={<>Three steps: <b>1. IT Head prepares</b> the promotion list from the year's results, <b>2. Principal approves</b>, <b>3. IT Head runs the rollover</b> (moves students to the next class, gives new roll by merit, starts the new session). The rules are the "promotion" conditions in Rules and formulas.</>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{["Promoted", "Passed Out", "Re-exam", "Repeat", "Hold"].map((d) => <StatCard key={d} label={d} value={counts[d] || 0} tone={d === "Promoted" ? "green" : d === "Repeat" ? "red" : "amber"} />)}</div>
      <Card className="mb-4" title="Status" actions={<StatusBadge status={status === "rolled" ? "published" : status} label={{ draft: "Not prepared", prepared: "Waiting for Principal", approved: "Approved", rolled: "Rollover done" }[status]} />}>
        <div className="flex flex-wrap gap-2">
          {can("yearend.prepare") && ["draft", "prepared"].includes(status) && <Button icon={FiRefreshCw} onClick={prepare}>{status === "draft" ? "Prepare promotion list" : "Prepare again"}</Button>}
          {can("yearend.approve") && status === "prepared" && <Button icon={FiCheck} onClick={approve}>Approve the list</Button>}
          {can("yearend.prepare") && status === "approved" && <ConfirmButton variant="primary" size="md" icon={FiFlag} label="Run rollover to next session" confirmText="This moves all students. Take a backup first. Continue?" onConfirm={rollover} />}
          {status === "rolled" && <p className="text-sm text-ink-500">Rollover finished on {fmtDate(rec.rolledAt)}. A summary of last session is saved in the archive.</p>}
        </div>
        {rec?.preparedAt && <p className="mt-2 text-xs text-ink-500">Prepared by {rec.preparedBy} on {fmtDate(rec.preparedAt)}{rec.approvedBy ? `; approved by ${rec.approvedBy} on ${fmtDate(rec.approvedAt)}` : ""}.</p>}
        {status !== "rolled" && <NoteBox tone="warning" className="mt-3">Students moving from Class VIII to IX get the Science group by default. Correct any group and 4th subject later in Students.</NoteBox>}
      </Card>
      <DataTable rows={rows} pageSize={20} columns={[{ key: "name", label: "Student", render: (r) => <span><b className="text-ink-900">{r.name}</b><span className="block text-xs text-ink-400">{r.id}</span></span> }, { key: "cls", label: "Class" }, { key: "gpa", label: "Year GPA", render: (r) => fix(r.gpa) },
        { key: "result", label: "Result", render: (r) => <StatusBadge status={r.result} /> }, { key: "failed", label: "Failed subjects" }, { key: "att", label: "Attendance %" }, { key: "decision", label: "Decision", render: (r) => <StatusBadge status={r.decision} /> }]} />
    </>
  );
}
