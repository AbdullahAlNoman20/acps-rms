// Transcript Studio: printable academic transcript (single exam or aggregated) in English or Bangla.
// Used by staff pages and the student portal.
import { useMemo, useState } from "react";
import { FiPrinter } from "react-icons/fi";
import logo from "../../assets/logo.png";
import { computeExam, computeAggregate, assignPositions, availableExams, promotionOf } from "../../engine/calc";
import { evaluateConditions } from "../../engine/conditions";
import { fix, fmtDate } from "../utils/format";
import StatusBadge from "./StatusBadge";
import Button from "./Button";
import NoteBox from "./NoteBox";

export const resultFor = (ctx, student, scope, mode = "staff") => (scope === "aggregate" ? computeAggregate(ctx, student, mode) : computeExam(ctx, student, scope));
const compText = (r) => Object.entries(r.comps || {}).map(([k, v]) => `${k} ${v}`).join(" · ");

const BN = { "Academic Transcript": "একাডেমিক ট্রান্সক্রিপ্ট", "Student ID": "শিক্ষার্থীর আইডি", Name: "নাম", Class: "শ্রেণি", Group: "বিভাগ", Section: "শাখা", Roll: "রোল", Shift: "শিফট", Version: "ভার্সন", Session: "সেশন", Subject: "বিষয়", "Parts (raw marks)": "নম্বরের অংশ", Total: "মোট", "On 100": "১০০-তে", Aggregated: "সমন্বিত", Highest: "সর্বোচ্চ", Grade: "গ্রেড", GP: "জিপি", GPA: "জিপিএ", "Total marks (GPA subjects)": "মোট নম্বর (জিপিএ-ভুক্ত বিষয়)", "Position in merit list": "মেধা তালিকায় অবস্থান", "Attendance and remarks": "উপস্থিতি ও মন্তব্য", "Working days": "কর্মদিবস", Present: "উপস্থিত", Remarks: "মন্তব্য", "Class Teacher": "শ্রেণি শিক্ষক", "Parents/Guardian": "অভিভাবক", "Vice Principal": "উপাধ্যক্ষ", Principal: "অধ্যক্ষ", Pass: "উত্তীর্ণ", Fail: "অনুত্তীর্ণ", "Promotion information": "পদোন্নতি তথ্য", "Marks from": "নম্বর", "Print or save as PDF": "প্রিন্ট বা PDF সংরক্ষণ" };

export default function TranscriptView({ ctx, data, student, scope, mode = "staff", showPrint = true }) {
  const [lang, setLang] = useState("en");
  const L = (k) => (lang === "bn" ? BN[k] || k : k);
  const settings = data.settings?.[0] || {};
  const result = useMemo(() => resultFor(ctx, student, scope, mode), [ctx, student, scope, mode]);
  const peers = useMemo(() => {
    const list = (data.students || []).filter((s) => s.status === "Active" && s.program === student.program).map((s) => ({ student: s, result: resultFor(ctx, s, scope, mode) })).filter((x) => x.result);
    return assignPositions(list, ctx);
  }, [ctx, data.students, student.program, scope, mode]);
  const me = peers.find((p) => p.student.id === student.id);
  const highest = useMemo(() => { // highest marks per subject: same class and group
    const m = {}; peers.filter((p) => p.student.group === student.group).forEach((p) => [...p.result.main, ...(p.result.fourth ? [p.result.fourth] : [])].forEach((r) => { m[r.name] = Math.max(m[r.name] || 0, r.on100); })); return m;
  }, [peers, student.group]);
  const isAgg = scope === "aggregate";
  const exams = isAgg ? availableExams(ctx, student, mode) : [];
  const exam = isAgg ? exams[exams.length - 1]?.inst : ctx.exams.find((e) => e.id === scope);
  if (!result) return <NoteBox tone="info" title="No result yet">There is no published result for this student yet. It will appear here after the Principal signs and the IT Head publishes it.</NoteBox>;

  const rows = [...result.main, ...(result.fourth ? [{ ...result.fourth, name: `${result.fourth.name} (4th)` , _base: result.fourth.name }] : [])];
  const att = isAgg ? null : ctx.attendance.get(`${scope}|${student.id}`);
  const attAll = isAgg ? exams.map((e) => ctx.attendance.get(`${e.inst.id}|${student.id}`)).filter(Boolean) : [];
  const wd = isAgg ? attAll.reduce((s, a) => s + a.workingDays, 0) : att?.workingDays;
  const pr = isAgg ? attAll.reduce((s, a) => s + a.present, 0) : att?.present;
  const remarks = isAgg ? attAll[attAll.length - 1]?.remarks : att?.remarks;
  const flags = isAgg ? result.flags || [] : evaluateConditions(ctx.conditions, "result", { gpa: result.gpa, failedCount: result.failedCount, attendancePercent: wd ? (pr / wd) * 100 : 100, program: student.program, passRule: result.rule, result: result.result, group: student.group }).flags;
  const sigOf = (role) => (exam?.signatures || []).find((s) => s.role === role);
  const promo = isAgg && mode === "staff" ? promotionOf(ctx, student, result) : null;
  const next = data.programs?.find((p) => p.name === student.program)?.nextProgram;
  const title = isAgg ? (lang === "bn" ? "বার্ষিক সমন্বিত ফলাফল" : "Aggregated result") : exam?.name || "Result";
  const Info = ({ k, v }) => (<div className="flex gap-2 text-sm"><span className="w-28 shrink-0 text-ink-500">{L(k)}</span><span className="font-medium text-ink-900">{v || "-"}</span></div>);
  const th = "border border-ink-200 px-2 py-2"; const td = "border border-ink-200 px-2 py-1.5";
  const legend = ctx.tables.standard || [];

  return (
    <div>
      {showPrint && (
        <div className="no-print mb-3 flex flex-wrap items-center justify-end gap-2">
          <div className="inline-flex rounded-lg border border-ink-200 bg-white p-0.5 text-sm font-semibold" role="group" aria-label="Language">
            {[["en", "English"], ["bn", "বাংলা"]].map(([k, l]) => <button key={k} type="button" onClick={() => setLang(k)} className={`rounded-md px-3 py-1.5 ${lang === k ? "bg-brand-600 text-white" : "text-ink-600"}`}>{l}</button>)}
          </div>
          <Button variant="secondary" icon={FiPrinter} onClick={() => window.print()}>{L("Print or save as PDF")}</Button>
        </div>)}
      <div className="print-sheet rounded-xl border border-ink-200 bg-white p-4 shadow-card sm:p-6">
        <div className="flex flex-col items-center gap-1 border-b-2 border-brand-600 pb-3 text-center">
          <img src={logo} alt="" className="h-16 w-16 object-contain" />
          <h2 className="text-lg font-bold text-ink-900 sm:text-xl">{lang === "bn" && settings.schoolNameBn ? settings.schoolNameBn : settings.schoolName}</h2>
          <p className="text-xs text-ink-500">{settings.address}{settings.phone ? ` · ${settings.phone}` : ""}</p>
          <p className="mt-1 rounded bg-ink-100 px-4 py-1 text-sm font-semibold italic text-ink-800">{L("Academic Transcript")} - {title}</p>
          {isAgg && <p className="text-xs text-ink-500">{result.examsUsed.join(", ")}{result.partial ? ` (${result.examsUsed.length}/${result.examsExpected})` : ""}</p>}
        </div>
        <div className="grid gap-x-6 gap-y-1 border-b border-ink-100 py-3 sm:grid-cols-2">
          <Info k="Student ID" v={student.id} /><Info k="Name" v={lang === "bn" && student.nameBn ? student.nameBn : student.name} /><Info k="Class" v={student.program} /><Info k="Group" v={student.group} />
          <Info k="Section" v={student.section} /><Info k="Roll" v={student.roll} /><Info k="Shift" v={student.shift} /><Info k="Version" v={student.version} /><Info k="Session" v={student.session} />
          {result.special && <div className="text-sm"><StatusBadge status="Hold" label="Pass rule 33" /></div>}
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border border-ink-200 text-sm">
            <thead className="bg-ink-50 text-xs text-ink-600">
              <tr><th className={`${th} text-left`}>{L("Subject")}</th>
                {isAgg ? exams.map((e) => <th key={e.key} className={`${th} text-center`}>{e.name}</th>) : <><th className={`${th} text-left`}>{L("Parts (raw marks)")}</th><th className={`${th} text-center`}>{L("Total")}</th></>}
                <th className={`${th} text-center`}>{isAgg ? L("Aggregated") : L("On 100")}</th><th className={`${th} text-center`}>{L("Highest")}</th><th className={`${th} text-center`}>{L("Grade")}</th><th className={`${th} text-center`}>{L("GP")}</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className={r.passed ? "" : "bg-crimson-50/60"}>
                  <td className={`${td} font-medium`}>{r.name}{!r.isEffective && <span className="ml-1 text-[11px] text-ink-400">(not in GPA)</span>}{r.status && <span className="ml-1 rounded bg-crimson-50 px-1 text-[11px] font-semibold text-crimson-600">{r.status}</span>}</td>
                  {isAgg ? exams.map((e) => { const x = result.perExam[e.key]?.rows.find((y) => y.key === r.key) || result.perExam[e.key]?.fourth; return <td key={e.key} className={`${td} text-center`}>{x ? `${fix(x.on100)} (${x.letter})` : "-"}</td>; })
                    : <><td className={`${td} text-xs text-ink-500`}>{r.missing ? "Not entered" : compText(r)}{r.grace ? ` · grace +${r.grace}` : ""}</td><td className={`${td} text-center`}>{fix(r.total)}/{r.full}</td></>}
                  <td className={`${td} text-center font-semibold`}>{fix(r.on100)}</td><td className={`${td} text-center text-ink-500`}>{fix(highest[r._base || r.name])}</td>
                  <td className={`${td} text-center font-bold`}>{r.letter}</td><td className={`${td} text-center`}>{fix(r.gp)}</td>
                </tr>))}
            </tbody>
            <tfoot className="bg-ink-50 font-semibold"><tr><td className={th} colSpan={isAgg ? exams.length + 1 : 3}>{L("Total marks (GPA subjects)")}</td><td className={`${th} text-center`}>{fix(result.totalMarks)}</td><td className={`${th} text-center`} colSpan={3}>-</td></tr></tfoot>
          </table>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-ink-200 p-3 text-sm"><p className="text-xs text-ink-500">{L("GPA")}</p><p className="text-2xl font-bold text-brand-700">{fix(result.gpa)} <span className="text-base">({result.letter})</span></p><div className="mt-1"><StatusBadge status={result.result} label={lang === "bn" ? L(result.result) : undefined} /></div>{result.bonus > 0 && <p className="mt-1 text-xs text-ink-500">+ 4th subject {fix(result.bonus)}</p>}{result.failed.length > 0 && <p className="mt-1 text-xs text-crimson-600">{result.failed.join(", ")}</p>}</div>
          <div className="rounded-lg border border-ink-200 p-3 text-sm"><p className="text-xs text-ink-500">{L("Position in merit list")}</p><p>{L("Section")}: <b>{me?.pos?.section ?? "-"}</b> / {me?.pos?.sectionOf ?? "-"}</p><p>{L("Class")}: <b>{me?.pos?.klass ?? "-"}</b> / {me?.pos?.klassOf ?? "-"}</p>{student.group !== "General" && <p>{L("Group")}: <b>{me?.pos?.group ?? "-"}</b> / {me?.pos?.groupOf ?? "-"}</p>}</div>
          <div className="rounded-lg border border-ink-200 p-3 text-sm"><p className="text-xs text-ink-500">{L("Attendance and remarks")}</p><p>{L("Working days")}: <b>{wd ?? "-"}</b></p><p>{L("Present")}: <b>{pr ?? "-"}</b></p><p>{L("Remarks")}: <b>{remarks || "-"}</b></p></div>
        </div>
        {promo && <div className="mt-3 rounded-lg border border-ink-200 p-3 text-sm"><p className="text-xs text-ink-500">{L("Promotion information")}</p><p><StatusBadge status={promo.decision} /> {promo.decision === "Promoted" && next && next !== "Passed Out" ? <span className="ml-2">{L("Class")} {next}</span> : null}</p></div>}
        {flags.length > 0 && <p className="mt-3 flex flex-wrap gap-2 text-xs">{flags.map((f) => <StatusBadge key={f} status="Hold" label={f} />)}</p>}
        {result.savedBy33 && <p className="mt-2 text-xs text-ink-500">Special pass rule 33 was used for this student. Actual marks are shown above.</p>}
        <div className="mt-4 overflow-x-auto"><table className="border border-ink-200 text-[11px] text-ink-600"><thead><tr><th className="border border-ink-200 px-2 py-1">{L("Grade")}</th><th className="border border-ink-200 px-2 py-1">{L("Marks from")}</th><th className="border border-ink-200 px-2 py-1">{L("GP")}</th></tr></thead><tbody>{legend.map((g) => <tr key={g.letter}><td className="border border-ink-200 px-2 py-0.5 text-center">{g.letter}</td><td className="border border-ink-200 px-2 py-0.5 text-center">{g.min}+</td><td className="border border-ink-200 px-2 py-0.5 text-center">{fix(g.gp)}</td></tr>)}</tbody></table></div>
        <div className="mt-8 grid grid-cols-2 gap-6 text-center text-xs text-ink-600 sm:grid-cols-4">
          {[["Class Teacher", null], ["Parents/Guardian", null], ["Vice Principal", sigOf("vice_principal")], ["Principal", sigOf("principal")]].map(([label, sig]) => (
            <div key={label}><div className="h-9 border-b border-ink-400 pb-1 text-[11px] italic text-brand-700">{sig ? `${lang === "bn" ? "ডিজিটাল স্বাক্ষর" : "Digitally " + sig.action} ${fmtDate(sig.at)}` : ""}</div><p className="mt-1 font-semibold">{L(label)}</p>{sig && <p className="text-[11px] text-ink-500">{sig.name}</p>}</div>))}
        </div>
      </div>
    </div>
  );
}
