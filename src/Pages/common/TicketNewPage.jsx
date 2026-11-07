import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSend } from "react-icons/fi";
import { useAuth } from "../../Components/hooks/useAuth";
import { useToast } from "../../Components/hooks/useToast";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { api } from "../../Components/services/api";
import { makeId } from "../../Components/utils/ids";
import { today } from "../../Components/utils/format";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";
import Card from "../../Components/Shared/Card";
import Button from "../../Components/Shared/Button";
import { FieldBlock } from "../../Components/Shared/FormFields";

export default function TicketNewPage() {
  const { user } = useAuth(); const toast = useToast(); const nav = useNavigate(); const base = useBasePath();
  const [f, setF] = useState({ title: "", details: "", priority: "normal" }); const [err, setErr] = useState({});
  async function submit(e) {
    e.preventDefault();
    const er = {}; if (!f.title.trim()) er.title = "Write the problem in a few words."; if (!f.details.trim()) er.details = "Please describe what happened.";
    setErr(er); if (Object.keys(er).length) return;
    const rec = await api.create("tickets", { id: makeId("TK"), ...f, title: f.title.trim(), details: f.details.trim(), status: "open", createdBy: user.name, role: user.role, createdAt: today(), replies: [] });
    toast.push("Ticket created. The IT team will reply."); nav(`${base}/support/${rec.id}`, { replace: true });
  }
  return (
    <form onSubmit={submit} noValidate>
      <PageHeader title="New support ticket" note="Tell us what is wrong: what you were doing, which page, and what you saw. The more details, the faster the answer." />
      <Card><div className="grid gap-4">
        <FieldBlock field={{ label: "Problem (short)", required: true }} error={err.title}><input className={ui.input} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={120} /></FieldBlock>
        <FieldBlock field={{ label: "Details", required: true, type: "textarea" }} error={err.details}><textarea rows={5} className={ui.input} value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} /></FieldBlock>
        <FieldBlock field={{ label: "How urgent?" }}><select className={ui.input} value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}><option value="low">Low - can wait</option><option value="normal">Normal</option><option value="high">High - I cannot work</option></select></FieldBlock>
      </div></Card>
      <div className="mt-4 flex gap-2"><Button type="submit" icon={FiSend}>Create ticket</Button><Button variant="secondary" to={`${base}/support`}>Cancel</Button></div>
    </form>
  );
}
