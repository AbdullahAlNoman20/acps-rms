import { FiPlus, FiTrash2, FiArrowUp, FiArrowDown } from "react-icons/fi";
import Button from "./Button";
import { FieldInput, FieldBlock } from "./FormFields";

const blankRow = (columns) => Object.fromEntries(columns.map((c) => [c.key, c.default !== undefined ? c.default : c.type === "rows" ? [] : c.type === "number" ? "" : ""]));

// A list of small forms (cards). Works on phones. Used for grades, exam schemes, subjects, components...
export default function RowsEditor({ columns, value = [], onChange, lookups, addLabel = "Add row", title = "Row" }) {
  const set = (i, key, val) => onChange(value.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  const move = (i, d) => { const a = [...value]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; onChange(a); };
  return (
    <div className="space-y-3">
      {value.length === 0 && <p className="rounded-lg border border-dashed border-ink-200 p-3 text-center text-sm text-ink-400">No rows yet. Press "{addLabel}".</p>}
      {value.map((row, i) => (
        <div key={i} className="rounded-xl border border-ink-100 bg-ink-50/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-ink-500">{title} {i + 1}{row.name || row.label ? ` - ${row.name || row.label}` : ""}</span>
            <span className="flex gap-1">
              <button type="button" aria-label="Move up" onClick={() => move(i, -1)} className="rounded p-1.5 text-ink-400 hover:bg-white"><FiArrowUp size={14} /></button>
              <button type="button" aria-label="Move down" onClick={() => move(i, 1)} className="rounded p-1.5 text-ink-400 hover:bg-white"><FiArrowDown size={14} /></button>
              <button type="button" aria-label="Remove row" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="rounded p-1.5 text-crimson-500 hover:bg-white"><FiTrash2 size={14} /></button>
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((c) => (
              <FieldBlock key={c.key} field={c}>
                <FieldInput field={c} value={row[c.key]} onChange={(v) => set(i, c.key, v)} lookups={lookups} />
              </FieldBlock>
            ))}
          </div>
        </div>
      ))}
      <Button variant="soft" size="sm" icon={FiPlus} onClick={() => onChange([...value, blankRow(columns)])}>{addLabel}</Button>
    </div>
  );
}
