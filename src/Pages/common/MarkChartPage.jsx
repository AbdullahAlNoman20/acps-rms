import { useState } from "react";
import { useParams } from "react-router-dom";
import { FiPrinter } from "react-icons/fi";
import { useCollections } from "../../Components/hooks/useCollection";
import PageHeader from "../../Components/Shared/PageHeader";
import Button from "../../Components/Shared/Button";
import NoteBox from "../../Components/Shared/NoteBox";
import Loader from "../../Components/Shared/Loader";
import { ui } from "../../theme/ui";
import logo from "../../assets/logo.png";

// Printable "Mark Distribution Chart - Details" in the layout of the school's old ERP report.
export default function MarkChartPage() {
  const { id } = useParams();
  const { data, loading } = useCollections(["markDistributions", "settings"]);
  const [rule, setRule] = useState("45");
  if (loading) return <Loader />;
  const d = data.markDistributions.find((x) => x.id === id);
  if (!d) return <><PageHeader title="Chart not found" /><NoteBox tone="warning">This mark distribution does not exist.</NoteBox></>;
  const keys = [...new Map(d.courses.flatMap((c) => c.components).map((c) => [c.key, c.label])).entries()];
  const p = (a, b) => (rule === "33" ? b : a); const st = data.settings[0] || {};
  const th = "border border-ink-300 bg-ink-50 px-1.5 py-1 text-center text-[11px] font-semibold"; const td = "border border-ink-300 px-1.5 py-1 text-center text-[11px]";
  return (
    <>
      <PageHeader title={`Chart - ${d.name}`} actions={<><select aria-label="Pass rule" className={`${ui.input} w-auto`} value={rule} onChange={(e) => setRule(e.target.value)}><option value="45">Pass rule 45</option><option value="33">Pass rule 33</option></select><Button icon={FiPrinter} onClick={() => window.print()}>Print or save as PDF</Button></>} />
      <style>{"@media print { @page { size: A4 landscape; margin: 8mm; } }"}</style>
      <div className="print-sheet overflow-x-auto rounded-xl border border-ink-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-3 border-b border-ink-200 pb-2"><img src={logo} alt="" className="h-12 w-12 object-contain" /><div><p className="font-bold text-ink-900">{st.schoolName}</p><p className="text-xs text-ink-500">Mark Distribution Chart - Details - Classes {d.programs.join(", ")} - Group {d.group} - Pass rule {rule}</p></div></div>
        <table className="min-w-full border-collapse">
          <thead>
            <tr>{["Srl", "Code", "Course name", "Exam mark", "Pass mark", "M.J", "J", "J.O", "Joint pass", "Is J", "E"].map((h) => <th key={h} rowSpan={2} className={th}>{h}</th>)}{keys.map(([k, l]) => <th key={k} colSpan={3} className={th}>{l}</th>)}</tr>
            <tr>{keys.map(([k]) => ["Exam", "PR%", "Pass"].map((x) => <th key={`${k}${x}`} className={th}>{x}</th>))}</tr>
          </thead>
          <tbody>
            {d.courses.map((c, i) => (
              <tr key={`${c.code}${i}`}><td className={td}>{i + 1}</td><td className={td}>{c.code}</td><td className={`${td} text-left`}>{c.name}{c.religion ? ` (${c.religion})` : ""}</td><td className={td}>{c.fullMark}</td><td className={td}>{p(c.passMark, c.passMark33)}</td><td className={td}>{c.mj}</td><td className={td}>{c.j || "-"}</td><td className={td}>{c.jo || "-"}</td><td className={td}>{c.jp ? p(c.jp, c.jp33) : "-"}</td><td className={td}>{c.j ? "Y" : "N"}</td><td className={td}>{c.isEffective === "Yes" ? "Y" : "N"}</td>
                {keys.map(([k]) => { const x = c.components.find((y) => y.key === k); return x ? [x.exam, Number(Number(x.pr).toFixed(2)), p(x.pass, x.pass33)].map((v, j) => <td key={`${k}${j}`} className={td}>{v}</td>) : [0, 1, 2].map((j) => <td key={`${k}${j}`} className={td}>-</td>); })}</tr>))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-ink-600">No of subject for GPA division: <b>{d.gpaDivision}</b> &nbsp; Deduct from 4th subject: <b>{d.deduct4th}</b> &nbsp; Fail for 4th subject: <b>{d.failFor4th}</b></p>
        <p className="mt-1 text-[11px] text-ink-400">M.J = multiply by, J = joint code, J.O = joint order, E = counted in GPA, PR% = percent of raw marks that count.</p>
      </div>
    </>
  );
}
