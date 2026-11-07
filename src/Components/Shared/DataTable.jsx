import { useEffect, useState } from "react";
import { ui } from "../../theme/ui";
import { cx } from "../utils/format";
import EmptyState from "./EmptyState";

// columns: [{ key, label, render?(row), className?, rowHeader? }]. On phones every row becomes a small card.
export default function DataTable({ columns, rows, rowKey = "id", pageSize = 25, empty, emptyText }) {
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [rows.length]);
  if (!rows.length) return <EmptyState title={empty || "No records"}>{emptyText}</EmptyState>;
  const pages = Math.ceil(rows.length / pageSize);
  const view = rows.slice(page * pageSize, page * pageSize + pageSize);
  const cell = (c, r) => (c.render ? c.render(r) : r[c.key] ?? "-");
  return (
    <div>
      <div className={cx(ui.card, "hidden overflow-x-auto md:block")}>
        <table className="min-w-full divide-y divide-ink-100">
          <thead><tr>{columns.map((c) => <th key={c.key} className={cx(ui.th, c.className)}>{c.label}</th>)}</tr></thead>
          <tbody className="divide-y divide-ink-100">
            {view.map((r, i) => (<tr key={r[rowKey] ?? i} className="hover:bg-ink-50/60">{columns.map((c) => <td key={c.key} className={cx(ui.td, c.className)}>{cell(c, r)}</td>)}</tr>))}
          </tbody>
        </table>
      </div>
      <div className="space-y-2 md:hidden">
        {view.map((r, i) => (
          <div key={r[rowKey] ?? i} className={cx(ui.card, "divide-y divide-ink-50 p-3")}>
            {columns.map((c) => (
              <div key={c.key} className="flex items-start justify-between gap-3 py-1.5 text-sm">
                <span className="shrink-0 text-xs text-ink-400">{c.label}</span>
                <span className="min-w-0 break-words text-right text-ink-800">{cell(c, r)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      {pages > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm text-ink-500">
          <span>Page {page + 1} of {pages} ({rows.length} records)</span>
          <span className="flex gap-2">
            <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 disabled:opacity-40">Previous</button>
            <button type="button" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 disabled:opacity-40">Next</button>
          </span>
        </div>
      )}
    </div>
  );
}
