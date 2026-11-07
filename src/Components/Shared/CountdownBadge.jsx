import { FiClock } from "react-icons/fi";
import { daysLeft } from "../utils/format";
import { ui } from "../../theme/ui";

export default function CountdownBadge({ date, closedText = "Closed" }) {
  const d = daysLeft(date);
  if (d === null) return null;
  const tone = d < 0 ? "red" : d <= 3 ? "amber" : "green";
  const text = d < 0 ? closedText : d === 0 ? "Last day today" : `${d} day${d > 1 ? "s" : ""} left`;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${ui.tones[tone]}`}><FiClock size={12} />{text}</span>;
}
