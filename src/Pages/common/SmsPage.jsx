import { useMemo, useState } from "react";
import { FiSend } from "react-icons/fi";
import { useCollections } from "../../Components/hooks/useCollection";
import { useAuth } from "../../Components/hooks/useAuth";
import { useToast } from "../../Components/hooks/useToast";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { api } from "../../Components/services/api";
import { makeId } from "../../Components/utils/ids";
import { nowStamp, unique } from "../../Components/utils/format";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";
import Card from "../../Components/Shared/Card";
import Tabs from "../../Components/Shared/Tabs";
import DataTable from "../../Components/Shared/DataTable";
import Button from "../../Components/Shared/Button";
import NoteBox from "../../Components/Shared/NoteBox";
import Loader from "../../Components/Shared/Loader";
import { FieldBlock } from "../../Components/Shared/FormFields";

const fill = (text, s, exam) => text.replace(/\{name\}/g, s.name).replace(/\{class\}/g, s.program).replace(/\{section\}/g, s.section).replace(/\{exam\}/g, exam);

export default function SmsPage() {
  const { data, loading } = useCollections(["students", "smsTemplates", "smsLog", "exams", "batches", "settings"]);
  const { user, can } = useAuth(); const toast = useToast(); const base = useBasePath();
  const [tab, setTab] = useState("send");
  const [f, setF] = useState({ program: "", version: "", section: "", audience: "Parent", tpl: "", text: "", exam: "" });
  const mine = useMemo(() => (user.role === "teacher" ? (data.batches || []).filter((b) => b.teacherId === user.teacherId && b.isClassTeacher === "Yes") : null), [data.batches, user]);
  if (loading) return <Loader />;
  const programs = unique(mine ? mine.map((b) => b.program) : data.students.map((s) => s.program));
  const program = f.program || programs[0];
  const recipients = data.students.filter((s) => s.status === "Active" && s.program === program && (!f.version || s.version === f.version) && (!f.section || s.section === f.section) && (!mine || mine.some((b) => b.program === s.program && b.version === s.version && b.section === s.section)));
  const examName = data.exams.find((e) => e.id === f.exam)?.name || "exam";
  const count = recipients.length * (f.audience === "Both" ? 2 : 1);
  async function send(e) {
    e.preventDefault();
    if (!f.text.trim()) { toast.push("Please write the message or choose a template.", "error"); return; }
    if (!recipients.length) { toast.push("No students match this selection.", "error"); return; }
    await api.create("smsLog", { id: makeId("LOG"), at: nowStamp(), by: user.name, audience: f.audience, program, section: f.section || "All", count, text: fill(f.text, recipients[0], examName) });
    toast.push(`Message prepared for ${count} numbers and saved in the SMS log.`);
  }
  return (
    <>
      <PageHeader title="SMS" note="Choose the class, pick a message and send it to students or parents together. The SMS gateway is not connected yet, so each send is saved in the log. A backend developer connects the gateway later." />
      <Tabs value={tab} onChange={setTab} tabs={[{ value: "send", label: "Send SMS" }, { value: "log", label: "Sent log" }]} />
      {tab === "send" ? (
        <form onSubmit={send} noValidate>
          <Card>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FieldBlock field={{ label: "Class" }}><select className={ui.input} value={program} onChange={(e) => setF({ ...f, program: e.target.value })}>{programs.map((p) => <option key={p}>{p}</option>)}</select></FieldBlock>
              <FieldBlock field={{ label: "Version" }}><select className={ui.input} value={f.version} onChange={(e) => setF({ ...f, version: e.target.value })}><option value="">All</option>{unique(data.students.map((s) => s.version)).map((v) => <option key={v}>{v}</option>)}</select></FieldBlock>
              <FieldBlock field={{ label: "Section" }}><select className={ui.input} value={f.section} onChange={(e) => setF({ ...f, section: e.target.value })}><option value="">All</option>{unique(data.students.map((s) => s.section)).map((v) => <option key={v}>{v}</option>)}</select></FieldBlock>
              <FieldBlock field={{ label: "Send to" }}><select className={ui.input} value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value })}><option>Parent</option><option>Student</option><option>Both</option></select></FieldBlock>
              <FieldBlock field={{ label: "Template" }}><select className={ui.input} value={f.tpl} onChange={(e) => setF({ ...f, tpl: e.target.value, text: data.smsTemplates.find((t) => t.id === e.target.value)?.text || f.text })}><option value="">- write my own -</option>{data.smsTemplates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></FieldBlock>
              <FieldBlock field={{ label: "Exam name in message" }}><select className={ui.input} value={f.exam} onChange={(e) => setF({ ...f, exam: e.target.value })}><option value="">-</option>{data.exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></FieldBlock>
              <FieldBlock field={{ label: "Message", type: "textarea" }}><textarea rows={4} className={ui.input} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} placeholder="Use {name} {class} {section} {exam}" /></FieldBlock>
            </div>
          </Card>
          <NoteBox tone="info" className="mt-4" title={`${count} message${count === 1 ? "" : "s"} will be sent`}>
            {recipients[0] ? <>Example for {recipients[0].name}: <i>{fill(f.text || "(your message)", recipients[0], examName)}</i></> : "No students match."}
            <span className="mt-1 block text-xs text-ink-500">First numbers: {recipients.slice(0, 3).map((s) => s.guardianMobile).join(", ")}</span>
          </NoteBox>
          <div className="mt-4 flex flex-wrap gap-2"><Button type="submit" icon={FiSend}>Send</Button>{can("sms.send") && user.role !== "teacher" && <Button variant="secondary" to={`${base}/data/smsTemplates`}>Edit templates</Button>}</div>
        </form>
      ) : (
        <DataTable rows={[...data.smsLog].reverse()} columns={[{ key: "at", label: "When" }, { key: "by", label: "By" }, { key: "audience", label: "To" }, { key: "program", label: "Class" }, { key: "section", label: "Section" }, { key: "count", label: "Messages" }, { key: "text", label: "Message" }]} />
      )}
    </>
  );
}
