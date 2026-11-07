import { cx } from "../utils/format";

export default function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-ink-100 p-1" role="tablist">
      {tabs.map((t) => (
        <button key={t.value} type="button" role="tab" aria-selected={value === t.value} onClick={() => onChange(t.value)}
          className={cx("whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition", value === t.value ? "bg-white text-brand-700 shadow-card" : "text-ink-500 hover:text-ink-800")}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
