import { useState } from "react";
import { useParams } from "react-router-dom";
import { FiSend } from "react-icons/fi";
import { useCollection } from "../../Components/hooks/useCollection";
import { useAuth } from "../../Components/hooks/useAuth";
import { useToast } from "../../Components/hooks/useToast";
import { fmtDate, today } from "../../Components/utils/format";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";
import Card from "../../Components/Shared/Card";
import StatusBadge from "../../Components/Shared/StatusBadge";
import Button from "../../Components/Shared/Button";
import NoteBox from "../../Components/Shared/NoteBox";
import Loader from "../../Components/Shared/Loader";

export default function TicketDetailPage() {
  const { id } = useParams();
  const { items, loading, update } = useCollection("tickets");
  const { user, can } = useAuth(); const toast = useToast();
  const [text, setText] = useState("");
  if (loading) return <Loader />;
  const t = items.find((x) => x.id === id);
  if (!t) return <><PageHeader title="Ticket not found" /><NoteBox tone="warning">This ticket does not exist.</NoteBox></>;
  const manage = can("support.manage");
  async function reply(e) { e.preventDefault(); if (!text.trim()) return; await update(t.id, { replies: [...t.replies, { by: user.name, at: today(), text: text.trim() }], status: manage && t.status === "open" ? "in_progress" : t.status }, "Reply"); setText(""); toast.push("Reply sent."); }
  return (
    <>
      <PageHeader title={t.title} subtitle={`${t.id} - ${t.createdBy} - ${fmtDate(t.createdAt)}`} actions={<><StatusBadge status={t.priority} /><StatusBadge status={t.status} /></>} />
      <Card title="Problem"><p className="whitespace-pre-wrap text-sm text-ink-700">{t.details}</p></Card>
      <div className="mt-4 space-y-3">
        {t.replies.map((r, i) => (<div key={i} className="rounded-xl border border-ink-100 bg-white p-3"><p className="text-xs text-ink-500"><b className="text-ink-800">{r.by}</b> - {fmtDate(r.at)}</p><p className="mt-1 text-sm text-ink-700">{r.text}</p></div>))}
        {t.replies.length === 0 && <p className="text-sm text-ink-500">No reply yet. The IT team has been told.</p>}
      </div>
      <form onSubmit={reply} className="mt-4 space-y-2">
        <textarea rows={3} className={ui.input} placeholder="Write a reply" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex flex-wrap gap-2"><Button type="submit" icon={FiSend}>Send reply</Button>
          {manage && <select aria-label="Change status" className={`${ui.input} w-auto`} value={t.status} onChange={(e) => update(t.id, { status: e.target.value }, "Status changed").then(() => toast.push("Status changed."))}>{["open", "in_progress", "resolved", "closed"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select>}</div>
      </form>
    </>
  );
}
