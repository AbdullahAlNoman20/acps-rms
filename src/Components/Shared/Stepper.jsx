import { FiCheck } from "react-icons/fi";
import { cx } from "../utils/format";

// Shows where an exam is in the workflow so non-technical users always know the next step.
export default function Stepper({ steps, current }) {
  const idx = Math.max(0, steps.findIndex((s) => s.value === current));
  return (
    <ol className="flex gap-2 overflow-x-auto pb-1">
      {steps.map((s, i) => (
        <li key={s.value} className="flex min-w-[88px] flex-1 flex-col items-center text-center">
          <span className={cx("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", i < idx ? "bg-brand-600 text-white" : i === idx ? "bg-gold-500 text-ink-900" : "bg-ink-100 text-ink-400")}>
            {i < idx ? <FiCheck /> : i + 1}
          </span>
          <span className={cx("mt-1 text-[11px] leading-tight", i === idx ? "font-semibold text-ink-900" : "text-ink-500")}>{s.label}</span>
        </li>
      ))}
    </ol>
  );
}
