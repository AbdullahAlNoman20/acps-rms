// Generic list + add/edit pages driven by constants/entitySchemas.js.
// IT Head can add, edit, copy, delete, search, filter and export every list. Custom fields appear automatically.
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FiPlus, FiEdit2, FiCopy, FiDownload, FiSave, FiSearch, FiTrash2, FiEye, FiPrinter } from "react-icons/fi";
import { ENTITIES } from "../constants/entitySchemas";
import { useCollections } from "../hooks/useCollection";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { useLabel } from "../hooks/useLabel";
import { useBasePath } from "../hooks/useBasePath";
import { api } from "../services/api";
import { makeId } from "../utils/ids";
import { exportRows } from "../utils/excel";
import { unique } from "../utils/format";
import { ui } from "../../theme/ui";
import PageHeader from "./PageHeader";
import NoteBox from "./NoteBox";
import Button from "./Button";
import Card from "./Card";
import DataTable from "./DataTable";
import FilterBar from "./FilterBar";
import Loader from "./Loader";
import ConfirmButton from "./ConfirmButton";
import StatusBadge from "./StatusBadge";
import { FieldInput, FieldBlock, displayValue, optionsOf } from "./FormFields";

const collectionsOf = (fields = []) => fields.flatMap((f) => [f.optionsFrom?.collection, ...(f.columns ? collectionsOf(f.columns) : [])]).filter(Boolean);
const BADGE_FIELDS = ["status", "isCurrent", "passRule", "hasGroup", "isClassTeacher", "type"];

function useEntity(key) {
  const ent = ENTITIES[key];
  const names = useMemo(() => (ent ? unique([ent.collection, "customFields", "ruleParams", ...collectionsOf(ent.fields), ...(ent.filters || []).map((f) => f.optionsFrom?.collection).filter(Boolean)]) : []), [ent]);
  const { data, loading } = useCollections(names);
  const customFields = (data.customFields || []).filter((c) => c.entity === key);
  return { ent, data, loading, customFields };
}

const cfField = (c) => ({ key: c.key, label: c.label, type: c.type === "select" ? "select" : c.type, options: c.type === "select" ? String(c.options || "").split(",").map((s) => s.trim()).filter(Boolean) : undefined, required: c.required === "Yes" });

function CrudList({ k }) {
  const { ent, data, loading, customFields } = useEntity(k);
  const { can } = useAuth(); const toast = useToast(); const t = useLabel(); const base = useBasePath();
  const [q, setQ] = useState(""); const [filters, setFilters] = useState({});
  const canEdit = can(ent.perm);
  const items = data[ent.collection] || [];
  const fieldOf = (key) => ent.fields.find((f) => f.key === key) || { key, label: key, type: "text" };
  const cols = ent.columns.map(fieldOf);
  const cfs = customFields.map(cfField);

  const rows = useMemo(() => items.filter((r) => {
    if (!Object.entries(filters).every(([fk, fv]) => !fv || String(r[fk]) === fv)) return false;
    if (!q.trim()) return true;
    const hay = (ent.searchKeys || ent.columns).map((c) => displayValue(fieldOf(c), r[c], data)).join(" ").toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  }), [items, q, filters, data]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Loader />;
  const render = (f) => (r) => {
    const v = r[f.key];
    if (BADGE_FIELDS.includes(f.key) && v) return <StatusBadge status={v} label={f.key === "passRule" ? `Rule ${v}` : undefined} />;
    return displayValue(f, v, data);
  };
  const columns = [
    ...cols.map((f) => ({ key: f.key, label: t(`${k}.${f.key}`, f.label), render: render(f) })),
    ...cfs.map((f) => ({ key: f.key, label: f.label, render: (r) => displayValue(f, r.custom?.[f.key], data) })),
    { key: "_a", label: "Actions", render: (r) => (
      <div className="flex flex-wrap gap-1.5">
        {ent.viewPath && <Button to={`${base}/${ent.viewPath}/${r.id}`} variant="soft" size="sm" icon={FiEye}>View</Button>}
        {ent.printPath && <Button to={`${base}/${ent.printPath}/${r.id}`} variant="soft" size="sm" icon={FiPrinter}>Chart</Button>}
        {(canEdit || !ent.viewPath) && <Button to={`${base}/data/${k}/${r.id}`} variant="secondary" size="sm" icon={canEdit ? FiEdit2 : FiSearch}>{canEdit ? "Edit" : "View"}</Button>}
        {canEdit && ent.canCopy && <Button variant="secondary" size="sm" icon={FiCopy} onClick={() => copy(r)}>Copy</Button>}
        {canEdit && ent.canDelete !== false && <ConfirmButton icon={FiTrash2} onConfirm={() => remove(r)} />}
      </div>) },
  ];
  async function remove(r) { await api.remove(ent.collection, r.id); toast.push("Deleted."); }
  async function copy(r) { const id = makeId(k.slice(0, 3).toUpperCase()); await api.create(ent.collection, { ...r, id, name: `${r.name || r.id} (copy)` }); toast.push("Copied. Open the copy to change it."); }
  const exportAll = () => exportRows(ent.exportName || k, rows.map((r) => ({ ...Object.fromEntries(cols.map((f) => [f.label, displayValue(f, r[f.key], data)])), ...Object.fromEntries(cfs.map((f) => [f.label, r.custom?.[f.key] ?? ""])) })), ent.title);

  return (
    <>
      <PageHeader title={t(`${k}.title`, ent.title)} subtitle={`${items.length} records`} note={ent.note}
        actions={<>{canEdit && <Button to={`${base}/data/${k}/new`} icon={FiPlus}>Add {ent.single.toLowerCase()}</Button>}<Button variant="secondary" icon={FiDownload} onClick={exportAll}>Export Excel</Button></>} />
      {!canEdit && <NoteBox tone="warning" className="mb-4" title="View only">You can look at this list but not change it. Ask the IT Head if you need access.</NoteBox>}
      {ent.filters && (
        <FilterBar values={filters} onChange={setFilters} filters={ent.filters.map((f) => ({ key: f.key, label: f.label, options: optionsOf(f, data) }))}>
          <div className="sm:col-span-2"><label className={ui.label} htmlFor="q">Search</label><input id="q" className={ui.input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a name or number" /></div>
        </FilterBar>
      )}
      {!ent.filters && <div className="mb-4 max-w-md"><input aria-label="Search" className={ui.input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." /></div>}
      <DataTable columns={columns} rows={rows} pageSize={ent.pageSize || 25} empty={`No ${ent.title.toLowerCase()} found`} emptyText={canEdit ? `Press "Add ${ent.single.toLowerCase()}" to create the first one.` : ""} />
    </>
  );
}

function CrudForm({ k, id }) {
  const { ent, data, loading, customFields } = useEntity(k);
  const { can } = useAuth(); const toast = useToast(); const nav = useNavigate(); const base = useBasePath();
  const isNew = id === "new";
  const [form, setForm] = useState(null); const [errors, setErrors] = useState({}); const [busy, setBusy] = useState(false);
  const canEdit = can(ent.perm);
  const cfs = customFields.map(cfField);

  useEffect(() => {
    if (loading || form) return;
    if (isNew) { setForm({ custom: {}, ...Object.fromEntries(ent.fields.filter((f) => f.type === "yesno").map((f) => [f.key, "No"])), ...Object.fromEntries(ent.fields.filter((f) => f.type === "rows" || f.type === "multi").map((f) => [f.key, []])) }); return; }
    const found = (data[ent.collection] || []).find((r) => r.id === id);
    setForm(found ? { custom: {}, ...found } : false);
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || form === null) return <Loader />;
  if (form === false) return (<><PageHeader title="Not found" /><NoteBox tone="warning">This record does not exist any more. Go back and choose another one.</NoteBox></>);

  const set = (key, val) => { setForm((f) => ({ ...f, [key]: val })); setErrors((e) => ({ ...e, [key]: "" })); };
  const setCustom = (key, val) => setForm((f) => ({ ...f, custom: { ...f.custom, [key]: val } }));

  async function save(e) {
    e.preventDefault();
    const errs = {};
    ent.fields.forEach((f) => { const v = form[f.key]; if (f.required && (v === undefined || v === "" || (Array.isArray(v) && !v.length))) errs[f.key] = "Please fill this."; if (f.type === "number" && v !== "" && v !== undefined) { if (f.min !== undefined && v < f.min) errs[f.key] = `Minimum is ${f.min}.`; if (f.max !== undefined && v > f.max) errs[f.key] = `Maximum is ${f.max}.`; } });
    cfs.forEach((f) => { if (f.required && !form.custom?.[f.key]) errs[`cf:${f.key}`] = "Please fill this."; });
    setErrors(errs);
    if (Object.keys(errs).length) { toast.push("Some fields need your attention (shown in red).", "error"); return; }
    setBusy(true);
    let rec = ent.beforeSave ? ent.beforeSave(form) : form;
    const items = data[ent.collection] || [];
    if (isNew) {
      rec = { ...rec, id: rec.id || makeId(k.slice(0, 3).toUpperCase()) };
      if (items.some((r) => r.id === rec.id)) { setBusy(false); toast.push("This ID/code already exists. Use a different one.", "error"); return; }
      await api.create(ent.collection, rec);
    } else await api.update(ent.collection, id, { ...rec, id });
    setBusy(false); toast.push(isNew ? "Saved. New record added." : "Saved."); nav(`${base}/data/${k}`);
  }

  const idField = ent.fields.find((f) => f.key === "id");
  return (
    <form onSubmit={save} noValidate>
      <PageHeader title={`${isNew ? "Add" : canEdit ? "Edit" : "View"} ${ent.single.toLowerCase()}`} note={isNew ? "Fill the fields and press Save. Fields marked * are required." : "Change what you need and press Save. Press Back to leave without saving."} />
      {!canEdit && <NoteBox tone="warning" className="mb-4" title="View only">You cannot change this record.</NoteBox>}
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          {ent.fields.map((f) => (
            <FieldBlock key={f.key} field={f} error={errors[f.key]}>
              <FieldInput id={`fld-${f.key}`} field={f} value={form[f.key]} onChange={(v) => set(f.key, v)} lookups={data} disabled={!canEdit || (f.readOnlyOnEdit && !isNew) || (f.key === "id" && !isNew && idField)} />
            </FieldBlock>
          ))}
        </div>
      </Card>
      {cfs.length > 0 && (
        <Card className="mt-4" title="Extra information" subtitle="Added by the IT Head under Custom fields">
          <div className="grid gap-4 sm:grid-cols-2">
            {cfs.map((f) => (<FieldBlock key={f.key} field={f} error={errors[`cf:${f.key}`]}><FieldInput field={f} value={form.custom?.[f.key]} onChange={(v) => setCustom(f.key, v)} lookups={data} disabled={!canEdit} /></FieldBlock>))}
          </div>
        </Card>
      )}
      {canEdit && (
        <div className="sticky bottom-[60px] z-30 -mx-3 mt-5 md:bottom-0 flex flex-wrap gap-2 border-t border-ink-100 bg-cream-50/95 px-3 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <Button type="submit" icon={FiSave} disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
          {(ent.formActions || []).map((a) => <Button key={a.label} variant="soft" onClick={() => { setForm(a.run(form, data)); toast.push("Done. Check the numbers, then press Save."); }}>{a.label}</Button>)}
          <Button variant="secondary" to={`${base}/data/${k}`}>Cancel</Button>
        </div>
      )}
    </form>
  );
}

export default function CrudPage() {
  const { entity, id } = useParams();
  if (!ENTITIES[entity]) return (<><PageHeader title="Page not found" /><NoteBox tone="warning">This list does not exist. Use the menu on the left.</NoteBox><Link className="mt-3 inline-block text-brand-600 underline" to="..">Go back</Link></>);
  return id ? <CrudForm key={`${entity}-${id}`} k={entity} id={id} /> : <CrudList key={entity} k={entity} />;
}
