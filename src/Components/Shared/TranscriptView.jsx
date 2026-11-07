// Printable academic transcript (single exam or aggregated). Used by staff pages and the student portal.
import { useMemo } from "react";
import { FiPrinter } from "react-icons/fi";
import logo from "../../assets/logo.png";
import { computeExam, computeAggregate, assignPositions, availableExams } from "../../engine/calc";
import { evaluateConditions } from "../../engine/conditions";
import { fix, fmtDate } from "../utils/format";
import StatusBadge from "./StatusBadge";
import Button from "./Button";
import NoteBox from "./NoteBox";

export const resultFor = (ctx, student, scope, mode = "staff") => (scope === "aggregate" ? computeAggregate(ctx, student, mode) : computeExam(ctx, student, scope));

const compText = (r) => Object.entries(r.comps || {}).map(([k, v]) => `${k} ${v}`).join(" · ");

export default function TranscriptView({ ctx, data, student, scope, mode = "staff", showPrint = true }) {
  const settings = data.settings?.[0] || {};
  const result = useMemo(() => resultFor(ctx, student, scope, mode), [ctx, student, scope, mode]);
  const peers = useMemo(() => {
    const list = (data.students || []).filter((s) => s.status === "Active" && s.program === student.program).map((s) => ({ student: s, result: resultFor(ctx, s, scope, mode) })).filter((x) => x.result);
    return assignPositions(list, ctx);
  }, [ctx, data.students, student.program, scope, mode]);
  const me = peers.find((p) => p.student.id === student.id);
  const isAgg = scope === "aggregate";
  const exams = isAgg ? availableExams(ctx, student, mode) : [];
  const exam = isAgg ? exams[exams.length - 1]?.inst : ctx.exams.find((e) => e.id === scope);
  if (!result) return <NoteBox tone="info" title="No result yet">There is no published result for this student yet. It will appear here after the Principal signs and the IT Head publishes it.</NoteBox>;

  const rows = [...result.main, ...(result.fourth ? [{ ...result.fourth, name: `${result.fourth.name} (4th subject)` }] : [])];
  const att = isAgg ? null : ctx.attendance.get(`${scope}|${student.id}`);
  const attAll = isAgg ? exams.map((e) => ctx.attendance.get(`${e.inst.id}|${student.id}`)).filter(Boolean) : [];
  const wd = isAgg ? attAll.reduce((s, a) => s + a.workingDays, 0) : att?.workingDays;
  const pr = isAgg ? attAll.reduce((s, a) => s + a.present, 0) : att?.present;
  const remarks = isAgg ? attAll[attAll.length - 1]?.remarks : att?.remarks;
  const flags = isAgg ? result.flags || [] : evaluateConditions(ctx.conditions, "result", { gpa: result.gpa, failedCount: result.failedCount, attendancePercent: wd ? (pr / wd) * 100 : 100, program: student.program, passRule: result.rule, result: result.result, group: student.group }).flags;
  const sigOf = (role) => (exam?.signatures || []).find((s) => s.role === role);
  const title = isAgg ? "Aggregated result" : exam?.name || "Result";
  const Info = ({ k, v }) => (<div className="flex gap-2 text-sm"><span className="w-24 shrink-0 text-ink-500">{k}</span><span className="font-medium text-ink-900">{v || "-"}</span></div>);

  return (
    <div>
      {showPrint && <div className="no-print mb-3 flex justify-end"><Button variant="secondary" icon={FiPrinter} onClick={() => window.print()}>Print or save as PDF</Button></div>}
      <div className="print-sheet rounded-xl border border-ink-200 bg-white p-4 shadow-card sm:p-6">
        <div className="flex flex-col items-center gap-1 border-b-2 border-brand-600 pb-3 text-center">
          <img src={logo} alt="" className="h-16 w-16 object-contain" />
          <h2 className="text-lg font-bold text-ink-900 sm:text-xl">{settings.schoolName}</h2>
          <p className="text-xs text-ink-500">{settings.address}{settings.phone ? ` · ${settings.phone}` : ""}</p>
          <p className="mt-1 rounded bg-ink-100 px-4 py-1 text-sm font-semibold italic text-ink-800">Academic Transcript - {title}</p>
          {isAgg && <p className="text-xs text-ink-500">Counted exams: {result.examsUsed.join(", ")}{result.partial ? ` (${result.examsUsed.length} of ${result.examsExpected} so far)` : ""}</p>}
        </div>
        <div className="grid gap-x-6 gap-y-1 border-b border-ink-100 py-3 sm:grid-cols-2">
          <Info k="Student ID" v={student.id} /><Info k="Name" v={student.name} /><Info k="Class" v={student.program} /><Info k="Group" v={student.group} />
          <Info k="Section" v={student.section} /><Info k="Roll" v={student.roll} /><Info k="Shift" v={student.shift} /><Info k="Version" v={student.version} /><Info k="Session" v={student.session} />
          {result.special && <div className="text-sm"><StatusBadge status="Hold" label="Pass rule 33 applied" /></div>}
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border border-ink-200 text-sm">
            <thead className="bg-ink-50 text-xs text-ink-600">
              <tr>
                <th className="border border-ink-200 px-2 py-2 text-left">Subject</th>
                {isAgg ? exams.map((e) => <th key={e.key} className="border border-ink-200 px-2 py-2 text-center">{e.name}</th>) : <><th className="border border-ink-200 px-2 py-2 text-left">Parts (raw marks)</th><th className="border border-ink-200 px-2 py-2 text-center">Total</th></>}
                <th className="border border-ink-200 px-2 py-2 text-center">{isAgg ? "Aggregated" : "On 100"}</th><th className="border border-ink-200 px-2 py-2 text-center">Grade</th><th className="border border-ink-200 px-2 py-2 text-center">GP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className={r.passed ? "" : "bg-crimson-50/60"}>
                  <td className="border border-ink-200 px-2 py-1.5 font-medium">{r.name}{!r.isEffective && <span className="ml-1 text-[11px] text-ink-400">(not in GPA)</span>}{r.status && <span className="ml-1 rounded bg-crimson-50 px-1 text-[11px] font-semibold text-crimson-600">{r.status}</span>}</td>
                  {isAgg ? exams.map((e) => { const x = result.perExam[e.key]?.rows.find((y) => y.key === r.key) || result.perExam[e.key]?.fourth; return <td key={e.key} className="border border-ink-200 px-2 py-1.5 text-center">{x ? `${fix(x.on100)} (${x.letter})` : "-"}</td>; })
                    : <><td className="border border-ink-200 px-2 py-1.5 text-xs text-ink-500">{r.missing ? "Not entered" : compText(r)}{r.grace ? ` · grace +${r.grace}` : ""}</td><td className="border border-ink-200 px-2 py-1.5 text-center">{fix(r.total)}/{r.full}</td></>}
                  <td className="border border-ink-200 px-2 py-1.5 text-center font-semibold">{fix(r.on100)}</td>
                  <td className="border border-ink-200 px-2 py-1.5 text-center font-bold">{r.letter}</td><td className="border border-ink-200 px-2 py-1.5 text-center">{fix(r.gp)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-ink-50 font-semibold"><tr><td className="border border-ink-200 px-2 py-2" colSpan={isAgg ? exams.length + 2 : 3}>Total marks (GPA subjects)</td><td className="border border-ink-200 px-2 py-2 text-center">{fix(result.totalMarks)}</td><td className="border border-ink-200 px-2 py-2 text-center" colSpan={2}>-</td></tr></tfoot>
          </table>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-ink-200 p-3 text-sm"><p className="text-xs text-ink-500">GPA</p><p className="text-2xl font-bold text-brand-700">{fix(result.gpa)} <span className="text-base">({result.letter})</span></p><div className="mt-1"><StatusBadge status={result.result} /></div>{result.bonus > 0 && <p className="mt-1 text-xs text-ink-500">Includes 4th subject bonus {fix(result.bonus)}</p>}{result.failed.length > 0 && <p className="mt-1 text-xs text-crimson-600">Failed: {result.failed.join(", ")}</p>}</div>
          <div className="rounded-lg border border-ink-200 p-3 text-sm"><p className="text-xs text-ink-500">Position in merit list</p>
            <p>Section: <b>{me?.pos?.section ?? "-"}</b> out of {me?.pos?.sectionOf ?? "-"}</p><p>Class: <b>{me?.pos?.klass ?? "-"}</b> out of {me?.pos?.klassOf ?? "-"}</p>{student.group !== "General" && <p>Group: <b>{me?.pos?.group ?? "-"}</b> out of {me?.pos?.groupOf ?? "-"}</p>}</div>
          <div className="rounded-lg border border-ink-200 p-3 text-sm"><p className="text-xs text-ink-500">Attendance and remarks</p><p>Working days: <b>{wd ?? "-"}</b></p><p>Present: <b>{pr ?? "-"}</b></p><p>Remarks: <b>{remarks || "-"}</b></p></div>
        </div>
        {flags.length > 0 && <p className="mt-3 flex flex-wrap gap-2 text-xs">{flags.map((f) => <StatusBadge key={f} status="Hold" label={f} />)}</p>}
        {result.savedBy33 && <p className="mt-2 text-xs text-ink-500">This student would not pass under the standard rule (45). The result is calculated with the special pass rule (33). Actual marks are shown above.</p>}
        <div className="mt-10 grid grid-cols-2 gap-6 text-center text-xs text-ink-600 sm:grid-cols-4">
          {[["Class Teacher", null], ["Parents/Guardian", null], ["Vice Principal", sigOf("vice_principal")], ["Principal", sigOf("principal")]].map(([label, sig]) => (
            <div key={label}><div className="h-9 border-b border-ink-400 pb-1 text-[11px] italic text-brand-700">{sig ? `Digitally ${sig.action} ${fmtDate(sig.at)}` : ""}</div><p className="mt-1 font-semibold">{label}</p>{sig && <p className="text-[11px] text-ink-500">{sig.name}</p>}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
