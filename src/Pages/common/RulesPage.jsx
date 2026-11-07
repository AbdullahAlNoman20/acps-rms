import { useEffect, useState } from "react";
import { FiPlus, FiSave, FiTrash2, FiRotateCcw } from "react-icons/fi";
import { useCollections } from "../../Components/hooks/useCollection";
import { useToast } from "../../Components/hooks/useToast";
import { api } from "../../Components/services/api";
import { dataStore } from "../../Components/services/dataStore";
import { evaluate, validateExpression, parseVars } from "../../engine/expression";
import { CONDITION_FIELDS, CONDITION_OPS, CONDITION_ACTIONS } from "../../engine/conditions";
import { makeId } from "../../Components/utils/ids";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";
import Card from "../../Components/Shared/Card";
import Tabs from "../../Components/Shared/Tabs";
import Button from "../../Components/Shared/Button";
import ConfirmButton from "../../Components/Shared/ConfirmButton";
import NoteBox from "../../Components/Shared/NoteBox";
import Loader from "../../Components/Shared/Loader";

const CORE = ["passStandard", "passSpecial", "gpaCap", "roundDecimals", "graceMaxMarks", "graceMaxSubjects", "minAttendance", "entryDays", "maxExtensions", "tieBreak"];
const DECISIONS = ["Promoted", "Re-exam", "Repeat", "Hold", "Passed Out"];
const SCOPES = [{ value: "result", label: "Result flags" }, { value: "promotion", label: "Promotion" }, { value: "ssc", label: "SSC eligibility" }];
const Reset = ({ name, label, onDone }) => <ConfirmButton variant="secondary" size="sm" icon={FiRotateCcw} label={label} confirmText="Go back to the original values?" onConfirm={async () => { await dataStore.reset(name); onDone(); }} />;

function ParamsTab({ items }) {
  const toast = useToast(); const [list, setList] = useState(items); const [n, setN] = useState({ key: "", label: "", value: "", unit: "", note: "" });
  useEffect(() => setList(items), [items]);
  const set = (id, k, v) => setList(list.map((p) => (p.id === id ? { ...p, [k]: v } : p)));
  const save = async () => { await api.replace("ruleParams", list.map((p) => ({ ...p, value: typeof p.value === "string" && p.value.trim() !== "" && !Number.isNaN(Number(p.value)) && typeof items.find((i) => i.id === p.id)?.value === "number" ? Number(p.value) : p.value })), "Parameters changed"); toast.push("Saved. New results use these numbers."); };
  const add = () => {
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(n.key) || !n.label.trim() || n.value === "") { toast.push("Give a key (letters only), a name and a value.", "error"); return; }
    if (list.some((p) => p.key === n.key)) { toast.push("This key already exists.", "error"); return; }
    setList([...list, { id: n.key, key: n.key, label: n.label.trim(), value: Number.isNaN(Number(n.value)) ? n.value : Number(n.value), unit: n.unit, note: n.note }]); setN({ key: "", label: "", value: "", unit: "", note: "" });
  };
  return (
    <>
      <NoteBox className="mb-4">These numbers are used by the calculation. Change a number and press Save. Numbers you add can be used by name inside formulas.</NoteBox>
      <div className="space-y-3">
        {list.map((p) => (
          <div key={p.id} className="grid items-center gap-2 rounded-xl border border-ink-100 bg-white p-3 sm:grid-cols-[1fr_160px_auto]">
            <div><p className="text-sm font-semibold text-ink-900">{p.label}</p><p className="text-xs text-ink-500">{p.note} <span className="font-mono text-ink-400">({p.key})</span></p></div>
            <div className="flex items-center gap-2"><input className={ui.input} value={p.value} onChange={(e) => set(p.id, "value", e.target.value)} /><span className="text-xs text-ink-500">{p.unit}</span></div>
            {!CORE.includes(p.key) ? <button type="button" aria-label="Delete" className="justify-self-end rounded p-2 text-crimson-500 hover:bg-crimson-50" onClick={() => setList(list.filter((x) => x.id !== p.id))}><FiTrash2 /></button> : <span />}
          </div>))}
      </div>
      <Card className="mt-4" title="Add a new number">
        <div className="grid gap-3 sm:grid-cols-5">{[["key", "Key (letters)"], ["label", "Name"], ["value", "Value"], ["unit", "Unit"], ["note", "Note"]].map(([k, l]) => <div key={k}><label className={ui.label}>{l}</label><input className={ui.input} value={n[k]} onChange={(e) => setN({ ...n, [k]: e.target.value })} /></div>)}</div>
        <Button className="mt-3" variant="secondary" icon={FiPlus} onClick={add}>Add</Button>
      </Card>
      <div className="mt-4 flex flex-wrap gap-2"><Button icon={FiSave} onClick={save}>Save numbers</Button><Reset name="ruleParams" label="Reset to original" onDone={() => toast.push("Reset.")} /></div>
    </>
  );
}

function FormulasTab({ items, numKeys }) {
  const toast = useToast(); const [list, setList] = useState(items); const [test, setTest] = useState({});
  useEffect(() => setList(items), [items]);
  const varsOf = (f) => [...parseVars(f.vars), ...numKeys];
  const check = (f) => validateExpression(f.expr, varsOf(f));
  const save = async () => { const bad = list.find((f) => !check(f).ok); if (bad) { toast.push(`"${bad.label}": ${check(bad).error}`, "error"); return; } await api.replace("ruleFormulas", list, "Formulas changed"); toast.push("Saved. New results use these formulas."); };
  return (
    <>
      <NoteBox className="mb-4">A formula is written with the words shown below it, numbers and + - * / ( ). You can also use <code>min()</code>, <code>max()</code>, <code>round()</code>, <code>ceil()</code> and <code>floor()</code>. Type test numbers to see the answer before you save.</NoteBox>
      <div className="space-y-4">
        {list.map((f) => {
          const v = check(f); const vars = parseVars(f.vars); const t = test[f.id] || {};
          const out = v.ok ? evaluate(f.expr, { ...Object.fromEntries(numKeys.map((k) => [k, 1])), ...Object.fromEntries(vars.map((x) => [x, Number(t[x] ?? 1)])) }, NaN) : NaN;
          return (
            <Card key={f.id} title={f.label} subtitle={f.note}>
              <label className={ui.label}>Formula</label>
              <input className={`${ui.input} font-mono ${v.ok ? "" : "border-crimson-500"}`} value={f.expr} onChange={(e) => setList(list.map((x) => (x.id === f.id ? { ...x, expr: e.target.value } : x)))} />
              {!v.ok && <p className={ui.error}>{v.error}</p>}
              <p className={ui.help}>Words you can use: <b>{vars.join(", ")}</b>{numKeys.length ? ` and the numbers from the Numbers tab` : ""}</p>
              <div className="mt-3 flex flex-wrap items-end gap-3 rounded-lg bg-ink-50 p-3">
                {vars.map((x) => <div key={x}><label className="text-xs font-semibold text-ink-600">{x}</label><input type="number" className={`${ui.input} w-24`} value={t[x] ?? 1} onChange={(e) => setTest({ ...test, [f.id]: { ...t, [x]: e.target.value } })} /></div>)}
                <p className="pb-2 text-sm">Answer: <b className="text-brand-700">{Number.isFinite(out) ? out.toFixed(4).replace(/\.?0+$/, "") : "-"}</b></p>
              </div>
            </Card>);
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2"><Button icon={FiSave} onClick={save}>Save formulas</Button><Reset name="ruleFormulas" label="Reset to original" onDone={() => toast.push("Reset.")} /></div>
    </>
  );
}

function ConditionsTab({ items }) {
  const toast = useToast(); const [list, setList] = useState(items); const [scope, setScope] = useState("promotion");
  useEffect(() => setList(items), [items]);
  const upd = (id, fn) => setList(list.map((c) => (c.id === id ? fn(c) : c)));
  const add = () => setList([...list, { id: makeId("COND"), scope, label: "New condition", enabled: "Yes", when: [{ field: "gpa", op: "<", value: "2" }], then: { action: scope === "promotion" ? "decision" : scope === "ssc" ? "eligibility" : "flag", value: scope === "promotion" ? "Hold" : scope === "ssc" ? "Not eligible" : "Flag" } }]);
  const save = async () => { await api.replace("ruleConditions", list, "Conditions changed"); toast.push("Saved. New results use these conditions."); };
  const shown = list.filter((c) => c.scope === scope);
  const sel = (value, opts, onChange, w = "") => <select className={`${ui.input} ${w}`} value={value} onChange={(e) => onChange(e.target.value)}>{opts.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}</select>;
  return (
    <>
      <NoteBox className="mb-4">A condition says: <b>IF</b> something is true <b>THEN</b> do something. All lines in IF must be true. Conditions are read from top to bottom and the last one that matches wins. Turn a condition off with "Active = No" instead of deleting it.</NoteBox>
      <Tabs value={scope} onChange={setScope} tabs={SCOPES} />
      <div className="space-y-4">
        {shown.map((c) => (
          <Card key={c.id}>
            <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_140px_auto]">
              <input className={ui.input} value={c.label} aria-label="Condition name" onChange={(e) => upd(c.id, (x) => ({ ...x, label: e.target.value }))} />
              {sel(c.enabled, ["Yes", "No"].map((v) => ({ value: v, label: `Active = ${v}` })), (v) => upd(c.id, (x) => ({ ...x, enabled: v })))}
              <button type="button" aria-label="Delete condition" className="justify-self-end rounded p-2 text-crimson-500 hover:bg-crimson-50" onClick={() => setList(list.filter((x) => x.id !== c.id))}><FiTrash2 /></button>
            </div>
            <p className="mb-1 text-xs font-bold text-ink-500">IF</p>
            {c.when.map((w, i) => (
              <div key={i} className="mb-2 grid gap-2 sm:grid-cols-[1fr_90px_1fr_auto]">
                {sel(w.field, CONDITION_FIELDS, (v) => upd(c.id, (x) => ({ ...x, when: x.when.map((y, j) => (j === i ? { ...y, field: v } : y)) })))}
                {sel(w.op, CONDITION_OPS, (v) => upd(c.id, (x) => ({ ...x, when: x.when.map((y, j) => (j === i ? { ...y, op: v } : y)) })))}
                <input className={ui.input} value={w.value} onChange={(e) => upd(c.id, (x) => ({ ...x, when: x.when.map((y, j) => (j === i ? { ...y, value: e.target.value } : y)) }))} />
                <button type="button" aria-label="Remove line" className="rounded p-2 text-ink-400 hover:bg-ink-50" onClick={() => upd(c.id, (x) => ({ ...x, when: x.when.filter((_, j) => j !== i) }))}><FiTrash2 size={14} /></button>
              </div>))}
            <Button variant="soft" size="sm" icon={FiPlus} onClick={() => upd(c.id, (x) => ({ ...x, when: [...x.when, { field: "gpa", op: "<", value: "2" }] }))}>Add IF line</Button>
            <p className="mb-1 mt-3 text-xs font-bold text-ink-500">THEN</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {sel(c.then.action, CONDITION_ACTIONS, (v) => upd(c.id, (x) => ({ ...x, then: { action: v, value: v === "decision" ? "Hold" : v === "eligibility" ? "Not eligible" : "Flag" } })))}
              {c.then.action === "decision" ? sel(c.then.value, DECISIONS, (v) => upd(c.id, (x) => ({ ...x, then: { ...x.then, value: v } })))
                : c.then.action === "eligibility" ? sel(c.then.value, ["Eligible", "Not eligible"], (v) => upd(c.id, (x) => ({ ...x, then: { ...x.then, value: v } })))
                  : <input className={ui.input} value={c.then.value} onChange={(e) => upd(c.id, (x) => ({ ...x, then: { ...x.then, value: e.target.value } }))} />}
            </div>
          </Card>))}
        {shown.length === 0 && <p className="text-sm text-ink-500">No conditions here yet.</p>}
      </div>
      <div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" icon={FiPlus} onClick={add}>Add condition</Button><Button icon={FiSave} onClick={save}>Save conditions</Button><Reset name="ruleConditions" label="Reset to original" onDone={() => toast.push("Reset.")} /></div>
    </>
  );
}

export default function RulesPage() {
  const { data, loading } = useCollections(["ruleParams", "ruleFormulas", "ruleConditions"]);
  const [tab, setTab] = useState("params");
  if (loading) return <Loader />;
  const numKeys = data.ruleParams.filter((p) => typeof p.value === "number").map((p) => p.key);
  return (
    <>
      <PageHeader title="Rules and formulas" note="Everything the result calculation uses is here. When the management decides a new rule, change it here yourself - no developer needed. Past results change only when a result is calculated again. Marks, pass marks and subjects are changed in Mark distribution." />
      <Tabs value={tab} onChange={setTab} tabs={[{ value: "params", label: "Numbers" }, { value: "formulas", label: "Formulas" }, { value: "conditions", label: "Conditions (IF - THEN)" }]} />
      {tab === "params" && <ParamsTab items={data.ruleParams} />}
      {tab === "formulas" && <FormulasTab items={data.ruleFormulas} numKeys={numKeys} />}
      {tab === "conditions" && <ConditionsTab items={data.ruleConditions} />}
    </>
  );
}
