import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function BackButton({ label = "Back" }) {
  const nav = useNavigate();
  return (
    <button type="button" onClick={() => nav(-1)} className="mb-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-800">
      <FiArrowLeft /> {label}
    </button>
  );
}
