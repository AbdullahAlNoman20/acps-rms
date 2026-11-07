import { Link } from "react-router-dom";
import { FiCompass } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <FiCompass size={36} className="text-ink-300" />
      <h1 className="text-xl font-bold text-ink-900">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-500">The page you opened does not exist. Use the menu or press the button below.</p>
      <Link className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white" to="/">Go to home</Link>
    </div>
  );
}
