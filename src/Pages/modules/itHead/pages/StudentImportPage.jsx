import { useMemo, useRef, useState } from "react";
import { FiDownload, FiUpload, FiCheckCircle } from "react-icons/fi";
import { ENTITIES } from "../../../../Components/constants/entitySchemas";
import { useCollections } from "../../../../Components/hooks/useCollection";
import { useToast } from "../../../../Components/hooks/useToast";
import { useBasePath } from "../../../../Components/hooks/useBasePath";
import { api } from "../../../../Components/services/api";
import { exportRows, readRows, downloadJson } from "../../../../Components/utils/excel";
import { ui } from "../../../../theme/ui";
import PageHeader from "../../../../Components/Shared/PageHeader";
import Card from "../../../../Components/Shared/Card";
import Button from "../../../../Components/Shared/Button";
import NoteBox from "../../../../Components/Shared/NoteBox";
import DataTable from "../../../../Components/Shared/DataTable";
import Loader from "../../../../Components/Shared/Loader";
import { useNavigate } from "react-router-dom";

const FIELDS = ENTITIES.students.fields;
const TEMPLATE = { id: "260999", roll: 1, name: "Md. Sample Student", nameBn: "", program: "IX", version: "Bangla", group: "Science", section: "A", shift: "Morning", session: "2026", gender: "Male", religion: "Islam", dob: "2011-05-20", father: "Md. Sample Father", mother: "Mst. Sample Mother", guardianMobile: "01700-000000", address: "Dhaka Cantonment", fourthSubject: "126" };
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
const SYN = { studentid: "id", sid: "id", class: "program", programme: "program", mobile: "guardianMobile", phone: "guardianMobile", guardianmobile: "guardianMobile", fathername: "father", mothername: "mother", dateofbirth: "dob", birthdate: "dob", studentname: "name", fullname: "name", rollno: "roll", classroll: "roll" };
const slug = (h) => `cf_${norm(h).slice(0, 24)}`;

export default function StudentImportPage() {
  const { data, loading } = useCollections(["students", "customFields", "programs", "versions", "sections", "groups", "settings"]);
  const toast = useToast(); const base = useBasePath(); const nav = useNavigate(); const fileRef = useRef(null);
  const [rows, setRows] = useState([]); const [headers, setHeaders] = useState([]); const [map, setMap] = useState({}); const [busy, setBusy] = useState(false); const [fileName, setFileName] = useState("");
  const cfs = (data.customFields || []).filter((c) => c.entity === "students");

  const autoMap = (hs) => Object.fromEntries(hs.map((h) => {
    const n = norm(h); const f = FIELDS.find((x) => norm(x.key) === n || norm(x.label) === n) || FIELDS.find((x) => x.key === SYN[n]);
    const c = cfs.find((x) => norm(x.key) === n || norm(x.label) === n);
    return [h, f ? f.key : c ? `cf:${c.key}` : "new"];
  }));
  async function onFile(e) {
    const file = e.target.files?.[0]; if (!file) return;
    try { const r = await readRows(file); if (!r.length) throw new Error("empty"); const hs = Object.keys(r[0]); setRows(r); setHeaders(hs); setMap(autoMap(hs)); setFileName(file.name); } catch { toast.push("Could not read this file. Use Excel, CSV or JSON.", "error"); }
    e.target.value = "";
  }
  const session = data.settings?.[0]?.currentSession || "2026";
  const built = useMemo(() => {
    if (!rows.length) return [];
    const names = { program: (data.programs || []).map((p) => p.name), version: (data.versions || []).map((p) => p.name), section: (data.sections || []).map((p) => p.name) };
    const seen = new Set();
    return rows.map((r, i) => {
      const rec = { custom: {} };
      headers.forEach((h) => { const m = map[h]; if (!m) return; const v = typeof r[h] === "string" ? r[h].trim() : r[h]; if (m === "new") rec.custom[slug(h)] = v; else if (m.startsWith("cf:")) rec.custom[m.slice(3)] = v; else rec[m] = m === "roll" ? Number(v) || v : m === "id" ? String(v) : v; });
      const errs = [];
      ["id", "name", "program", "version", "section", "religion"].forEach((k) => { if (!rec[k]) errs.push(`${k} is empty`); });
      ["program", "version", "section"].forEach((k) => { if (rec[k] && !names[k].includes(String(rec[k]))) errs.push(`${k} "${rec[k]}" is not in the list`); });
      if (rec.id && seen.has(rec.id)) errs.push("ID is repeated in the file"); seen.add(rec.id);
      return { row: i + 2, rec: { group: "General", shift: "Morning", status: "Active", passRule: "45", fourthSubject: "", passRuleReason: "", session, ...rec }, errs, exists: (data.students || []).some((s) => s.id === rec.id) };
    });
  }, [rows, headers, map, data, session]);
  if (loading) return <Loader />;
  const good = built.filter((b) => !b.errs.length); const bad = built.filter((b) => b.errs.length);

  async function run() {
    setBusy(true);
    const newMaps = headers.filter((h) => map[h] === "new");
    for (const h of newMaps) if (!cfs.some((c) => c.key === slug(h))) await api.create("customFields", { id: `CF-${slug(h)}`, entity: "students", key: slug(h), label: h, type: "text", options: "", required: "No" });
    const existing = new Map(data.students.map((s) => [s.id, s]));
    await api.upsertMany("students", good.map((b) => ({ ...b.rec, id: b.rec.id, custom: { ...(existing.get(b.rec.id)?.custom || {}), ...b.rec.custom } })), `Imported from ${fileName}`);
    setBusy(false); toast.push(`${good.length} students imported.`); nav(`${base}/data/students`);
  }
  const options = [{ value: "", label: "- skip this column -" }, ...FIELDS.map((f) => ({ value: f.key, label: f.label })), ...cfs.map((c) => ({ value: `cf:${c.key}`, label: `${c.label} (custom field)` })), { value: "new", label: "+ make a new custom field" }];
  return (
    <>
      <PageHeader title="Import students" note="Four easy steps: 1) download the sample file, 2) fill it from SICS or choose your own file, 3) check how each column matches, 4) press Import. Existing students with the same ID are updated, new IDs are added. Columns the system does not know can become new custom fields." />
      <Card title="Step 1 - Sample file" className="mb-4"><div className="flex flex-wrap gap-2"><Button variant="secondary" icon={FiDownload} onClick={() => exportRows("student-import-sample", [TEMPLATE], "Students")}>Download Excel sample</Button><Button variant="secondary" icon={FiDownload} onClick={() => downloadJson("student-import-sample.json", [TEMPLATE])}>Download JSON sample</Button></div></Card>
      <Card title="Step 2 - Choose your file" className="mb-4">
        <Button icon={FiUpload} onClick={() => fileRef.current?.click()}>Choose Excel, CSV or JSON</Button><input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.json" className="hidden" onChange={onFile} />
        {fileName && <p className="mt-2 text-sm text-ink-600">File: <b>{fileName}</b> - {rows.length} rows</p>}
      </Card>
      {rows.length > 0 && (
        <>
          <Card title="Step 3 - Check the columns" subtitle="We matched them for you. Change any that is wrong." className="mb-4">
            <div className="grid gap-3 sm:grid-cols-2">{headers.map((h) => (
              <div key={h} className="rounded-lg border border-ink-100 p-2"><p className="mb-1 text-xs text-ink-500">Column in file: <b className="text-ink-900">{h}</b> (example: {String(rows[0][h]).slice(0, 24)})</p>
                <select className={ui.input} value={map[h] || ""} onChange={(e) => setMap({ ...map, [h]: e.target.value })}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>))}</div>
          </Card>
          <Card title="Step 4 - Check and import">
            <div className="mb-3 flex flex-wrap gap-3 text-sm"><span className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700">{good.length} ready</span><span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">{good.filter((b) => b.exists).length} will be updated</span><span className="rounded-full bg-crimson-50 px-3 py-1 font-semibold text-crimson-600">{bad.length} have problems</span></div>
            {bad.length > 0 && <NoteBox tone="warning" className="mb-3" title="These rows will be skipped">{bad.slice(0, 8).map((b) => <p key={b.row}>Row {b.row}: {b.errs.join(", ")}</p>)}{bad.length > 8 && <p>... and {bad.length - 8} more. Fix the file or the column matching.</p>}</NoteBox>}
            <DataTable rows={good.slice(0, 5).map((b) => ({ id: b.rec.id, ...b.rec }))} columns={["id", "roll", "name", "program", "version", "section", "group"].map((k) => ({ key: k, label: k }))} pageSize={5} empty="No valid rows" />
            <Button className="mt-4" icon={FiCheckCircle} disabled={!good.length || busy} onClick={run}>{busy ? "Importing..." : `Import ${good.length} students`}</Button>
          </Card>
        </>
      )}
    </>
  );
}
