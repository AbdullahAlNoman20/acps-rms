import { STATUS_TONES } from "../../theme/tokens";
import { ui } from "../../theme/ui";
import { EXAM_STATUS_LABEL } from "../constants/examStatus";
import { titleCase } from "../utils/format";

export default function StatusBadge({ status, label }) {
  const tone = STATUS_TONES[status] || "gray";
  const text = label || EXAM_STATUS_LABEL[status] || titleCase(String(status ?? "-"));
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${ui.tones[tone]}`}>{text}</span>;
}
