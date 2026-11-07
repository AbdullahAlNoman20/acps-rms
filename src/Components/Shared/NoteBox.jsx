import { FiInfo, FiAlertTriangle, FiCheckCircle, FiHelpCircle } from "react-icons/fi";
import { ui } from "../../theme/ui";
import { cx } from "../utils/format";

const ICONS = { info: FiInfo, tip: FiHelpCircle, warning: FiAlertTriangle, success: FiCheckCircle };

// Plain-language guidance for non-technical users. Use on every page: what to do, what happens next.
export default function NoteBox({ tone = "tip", title, children, className }) {
  const Icon = ICONS[tone] || FiInfo;
  return (
    <div className={cx("flex gap-3 rounded-xl border p-3 text-sm sm:p-4", ui.notes[tone], className)}>
      <Icon className="mt-0.5 shrink-0 text-brand-600" size={18} />
      <div className="min-w-0 space-y-1">{title && <p className="font-semibold text-ink-900">{title}</p>}<div className="leading-relaxed">{children}</div></div>
    </div>
  );
}
