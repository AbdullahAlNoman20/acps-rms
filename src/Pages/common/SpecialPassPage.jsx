import { useMemo, useState } from "react";
import { FiCheckCircle, FiRotateCcw } from "react-icons/fi";
import { useResultData } from "../../Components/hooks/useResultData";
import { useAuth } from "../../Components/hooks/useAuth";
import { useToast } from "../../Components/hooks/useToast";
import { api } from "../../Components/services/api";
import { resultFor } from "../../Components/Shared/TranscriptView";
import { fix } from "../../Components/utils/format";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";
import Card from "../../Components/Shared/Card";
import FilterBar from "../../Components/Shared/FilterBar";
import StatusBadge from "../../Components/Shared/StatusBadge";
import Button from "../../Components/Shared/Button";
import ConfirmButton from "../../Components/Shared/ConfirmButton";
import EmptyState from "../../Components/Shared/EmptyState";
import Loader from "../../Components/Shared/Loader";
import NoteBox from "../../Components/Shared/NoteBox";

function FailRow({ s, res, p33, canSet, onSwitch }) {
  const [reason, setReason] = useState("");
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><p className="font-semibold text-ink-900">{s.name}</p><p className="text-xs text-ink-500">{s.id} - Class {s.program}-{s.section} ({s.version}) - roll {s.roll}</p></div>
        <StatusBadge status="Fail" label={`Fails ${res.failedCount} subject${res.failedCount > 1 ? "s" : ""}`} />
      </div>
      <p className="mt-2 text-sm text-ink-600">Failed: {res.failed.join(", ")}</p>
      <p className="mt-1 text-sm">With the <b>33 rule</b>: {p33.result === "Pass" ? <span className="font-semibold text-brand-700">Pass, GPA {fix(p33.gpa)} ({p33.letter})</span> : <span className="font-semibold text-crimson-600">still fails ({p33.failed.join(", ")})</span>}</p>
      {canSet && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input className={ui.input} placeholder="Reason / approval note (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button icon={FiCheckCircle} onClick={() => onSwitch(s, reason)} className="shrink-0">Switch to 33 rule</Button>
        </div>
      )}
    </div>
  );
}

export default function SpecialPassPage() {
  const { data, ctx, loading } = useResultData();
  const { can } = useAuth(); const toast = useToast();
  const [f, setF] = useState({ scope: "", program: "" });
  const exams = useMemo(() => (ctx ? ctx.exams.filter((e) => e.type === "school" && e.status !== "setup") : []), [ctx]);
  const scope = f.scope || exams.find((e) => e.status === "published")?.id || "aggregate";
  const active = useMemo(() => (data.students || []).filter((s) => s.status === "Active" && (!f.program || s.program === f.program)), [data.students, f.program]);
  const fails = useMemo(() => {
    if (!ctx) return [];
    return active.filter((s) => s.passRule !== "33").map((s) => ({ s, res: resultFor(ctx, s, scope, "staff") })).filter((x) => x.res && x.res.result === "Fail")
      .map((x) => ({ ...x, p33: resultFor(ctx, { ...x.s, passRule: "33" }, scope, "staff") }));
  }, [ctx, active, scope]);
  if (loading) return <Loader />;
  const on33 = (data.students || []).filter((s) => s.passRule === "33" && s.status === "Active");
  const canSet = can("passrule.set");

  async function switchTo33(s, reason) { await api.update("students", s.id, { passRule: "33", passRuleReason: reason.trim() || "Approved by management" }, "Pass rule 33 switched on"); toast.push(`${s.name} now uses the 33 rule. Everything else stays the same.`); }
  async function backTo45(s) { await api.update("students", s.id, { passRule: "45", passRuleReason: "" }, "Pass rule back to 45"); toast.push(`${s.name} is back on the 45 rule.`); }

  return (
    <>
      <PageHeader title="Special pass (33 rule)" note={<>Everyone passes at <b>45</b>. If the school decides to pass a failed student at <b>33</b>, press one button. That student's whole result (subject pass, parts, grade) is then calculated with the 33 rule. Nobody else changes. The transcript shows a note that the 33 rule was used.</>} />
      <FilterBar values={{ ...f, scope }} onChange={setF} filters={[{ key: "scope", label: "Look at exam", allLabel: null, options: [...exams.map((e) => ({ value: e.id, label: e.name })), { value: "aggregate", label: "Aggregate of the year" }] }, { key: "program", label: "Class", options: data.programs.map((p) => p.name) }]} />
      <h2 className="mb-2 text-base font-semibold text-ink-900">Students who fail with the 45 rule ({fails.length})</h2>
      {!canSet && <NoteBox tone="warning" className="mb-3">Only the IT Head can switch the rule. You can look at this list.</NoteBox>}
      {fails.length === 0 ? <EmptyState title="No failed students here">Choose another exam or class.</EmptyState> : <div className="grid gap-3 lg:grid-cols-2">{fails.map((x) => <FailRow key={x.s.id} {...x} canSet={canSet} onSwitch={switchTo33} />)}</div>}
      <Card className="mt-6" title={`Students on the 33 rule (${on33.length})`}>
        {on33.length === 0 ? <p className="text-sm text-ink-500">No student uses the 33 rule now.</p> : (
          <ul className="divide-y divide-ink-100">{on33.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5"><div><p className="text-sm font-semibold text-ink-900">{s.name} <span className="font-normal text-ink-400">({s.id}, Class {s.program}-{s.section})</span></p><p className="text-xs text-ink-500">{s.passRuleReason || "No note"}</p></div>
              {canSet && <ConfirmButton variant="secondary" icon={FiRotateCcw} label="Back to 45" confirmText="Switch back to 45?" onConfirm={() => backTo45(s)} />}</li>))}</ul>)}
      </Card>
    </>
  );
}
