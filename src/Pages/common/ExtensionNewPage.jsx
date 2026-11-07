import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSend } from "react-icons/fi";
import { useCollections } from "../../Components/hooks/useCollection";
import { useAuth } from "../../Components/hooks/useAuth";
import { useToast } from "../../Components/hooks/useToast";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { api } from "../../Components/services/api";
import { makeId } from "../../Components/utils/ids";
import { fmtDate, today } from "../../Components/utils/format";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";
import Card from "../../Components/Shared/Card";
import Button from "../../Components/Shared/Button";
import NoteBox from "../../Components/Shared/NoteBox";
import Loader from "../../Components/Shared/Loader";
import { FieldBlock } from "../../Components/Shared/FormFields";

export default function ExtensionNewPage() {
  const { data, loading } = useCollections(["exams"]);
  const { user } = useAuth(); const toast = useToast(); const nav = useNavigate(); const base = useBasePath();
  const [f, setF] = useState({ examId: "", days: 3, reason: "" }); const [err, setErr] = useState({});
  if (loading) return <Loader />;
  const open = data.exams.filter((e) => e.status === "entry_open");
  async function submit(e) {
    e.preventDefault();
    const er = {}; if (!f.examId) er.examId = "Choose an exam."; if (!f.reason.trim()) er.reason = "Please write the reason."; if (!(f.days >= 1 && f.days <= 15)) er.days = "Choose 1 to 15 days.";
    setErr(er); if (Object.keys(er).length) return;
    await api.create("extensions", { id: makeId("EXT"), examId: f.examId, teacherId: user.teacherId, reason: f.reason.trim(), days: Number(f.days), status: "requested", requestedAt: today(), note: "" });
    toast.push("Request sent to the IT Head."); nav(`${base}/extension`);
  }
  return (
    <form onSubmit={submit} noValidate>
      <PageHeader title="Ask for more time" note="Write why you need more days. The IT Head will recommend it and the Principal will approve it. You will see the answer on the previous page." />
      {open.length === 0 && <NoteBox tone="info" className="mb-4">No exam is open for marks entry right now.</NoteBox>}
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldBlock field={{ label: "Exam", required: true }} error={err.examId}><select className={ui.input} value={f.examId} onChange={(e) => setF({ ...f, examId: e.target.value })}><option value="">- choose -</option>{open.map((e) => <option key={e.id} value={e.id}>{e.name} (ends {fmtDate(e.entryEnd)})</option>)}</select></FieldBlock>
          <FieldBlock field={{ label: "Extra days needed", required: true }} error={err.days}><input type="number" min="1" max="15" className={ui.input} value={f.days} onChange={(e) => setF({ ...f, days: e.target.value })} /></FieldBlock>
          <FieldBlock field={{ label: "Reason", required: true, type: "textarea" }} error={err.reason}><textarea rows={3} className={ui.input} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></FieldBlock>
        </div>
      </Card>
      <div className="mt-4 flex gap-2"><Button type="submit" icon={FiSend}>Send request</Button><Button variant="secondary" to={`${base}/extension`}>Cancel</Button></div>
    </form>
  );
}
