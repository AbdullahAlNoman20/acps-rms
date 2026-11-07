import { ui } from "../../theme/ui";

// filters: [{ key, label, options:[string | {value,label}], allLabel }]
export default function FilterBar({ filters, values, onChange, children }) {
  return (
    <div className="mb-4 grid gap-3 rounded-xl border border-ink-100 bg-white p-3 sm:grid-cols-2 lg:grid-cols-4">
      {filters.map((f) => (
        <div key={f.key}>
          <label className={ui.label} htmlFor={`f-${f.key}`}>{f.label}</label>
          <select id={`f-${f.key}`} className={ui.input} value={values[f.key] ?? ""} onChange={(e) => onChange({ ...values, [f.key]: e.target.value })}>
            {f.allLabel !== null && <option value="">{f.allLabel || "All"}</option>}
            {f.options.map((o) => { const v = typeof o === "object" ? o.value : o; const l = typeof o === "object" ? o.label : o; return <option key={v} value={v}>{l}</option>; })}
          </select>
        </div>
      ))}
      {children}
    </div>
  );
}
