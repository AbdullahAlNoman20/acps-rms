import { ui } from "../../theme/ui";
import { cx } from "../utils/format";
import RowsEditor from "./RowsEditor";

const YN = ["Yes", "No"];

// Builds the option list of a select from static options or from another collection (optionsFrom).
export function optionsOf(field, lookups = {}) {
  let list = [];
  if (field.options) list = field.options;
  else if (field.optionsFrom) {
    const { collection, value = "id", label = "name", labelTpl, filter } = field.optionsFrom;
    list = (lookups[collection] || []).filter((r) => (filter ? filter(r) : true)).map((r) => ({
      value: r[value], label: labelTpl ? labelTpl.replace(/\{(\w+)\}/g, (_, k) => r[k] ?? "") : r[label],
    }));
  }
  if (field.extraOptions) list = [...field.extraOptions, ...list];
  return list.map((o) => (typeof o === "object" ? o : { value: o, label: o }));
}

export function displayValue(field, value, lookups = {}) {
  if (value === undefined || value === null || value === "") return "-";
  if (field.type === "multi") return (Array.isArray(value) ? value : []).join(", ") || "-";
  if (field.type === "rows") return `${(value || []).length} rows`;
  if (field.type === "select" || field.optionsFrom) { const o = optionsOf(field, lookups).find((x) => String(x.value) === String(value)); return o ? o.label : value; }
  return String(value);
}

export function FieldInput({ field, value, onChange, lookups, disabled, id }) {
  const v = value ?? (field.type === "multi" ? [] : field.type === "rows" ? [] : "");
  const common = { id, disabled, className: ui.input };
  switch (field.type) {
    case "textarea": return <textarea {...common} rows={3} value={v} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />;
    case "number": return <input {...common} type="number" step={field.step || "any"} min={field.min} max={field.max} value={v} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} placeholder={field.placeholder} />;
    case "date": case "time": case "password": return <input {...common} type={field.type} value={v} onChange={(e) => onChange(e.target.value)} autoComplete="off" />;
    case "yesno": return (
      <select {...common} value={v || "No"} onChange={(e) => onChange(e.target.value)}>{YN.map((o) => <option key={o}>{o}</option>)}</select>
    );
    case "select": {
      const opts = optionsOf(field, lookups);
      return (
        <select {...common} value={v} onChange={(e) => onChange(e.target.value)}>
          {(field.allowBlank || !field.required) && <option value="">{field.blankLabel || "- none -"}</option>}
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    case "multi": {
      const opts = optionsOf(field, lookups);
      return (
        <div className="flex flex-wrap gap-2">
          {opts.map((o) => {
            const on = v.includes(o.value);
            return (
              <button key={o.value} type="button" disabled={disabled} onClick={() => onChange(on ? v.filter((x) => x !== o.value) : [...v, o.value])}
                className={cx("rounded-full border px-3 py-1 text-xs font-semibold", on ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 bg-white text-ink-500")}>{o.label}</button>
            );
          })}
        </div>
      );
    }
    case "rows": return <RowsEditor columns={field.columns} value={v} onChange={onChange} lookups={lookups} addLabel={field.addLabel} title={field.rowTitle} />;
    default: return <input {...common} type="text" value={v} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} maxLength={field.maxLength || 300} />;
  }
}

export function FieldBlock({ field, label, error, children }) {
  return (
    <div className={cx(field.type === "rows" || field.type === "textarea" || field.wide ? "col-span-full" : "")}>
      <label className={ui.label}>{label || field.label}{field.required && <span className="text-crimson-500"> *</span>}</label>
      {children}
      {field.help && <p className={ui.help}>{field.help}</p>}
      {error && <p className={ui.error}>{error}</p>}
    </div>
  );
}
