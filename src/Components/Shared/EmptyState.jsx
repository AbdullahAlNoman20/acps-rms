import { FiInbox } from "react-icons/fi";

export default function EmptyState({ title = "Nothing here yet", children }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-ink-200 bg-white px-4 py-10 text-center">
      <FiInbox className="text-ink-300" size={28} />
      <p className="font-semibold text-ink-700">{title}</p>
      {children && <p className="max-w-md text-sm text-ink-500">{children}</p>}
    </div>
  );
}
