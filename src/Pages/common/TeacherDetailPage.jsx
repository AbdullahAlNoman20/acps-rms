import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import { useCollections } from "../../Components/hooks/useCollection";
import { useToast } from "../../Components/hooks/useToast";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { api } from "../../Components/services/api";
import { makeId } from "../../Components/utils/ids";
import { unique } from "../../Components/utils/format";
import { DEMO_PASSWORD } from "../../config/appConfig";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";
import Card from "../../Components/Shared/Card";
import Button from "../../Components/Shared/Button";
import ConfirmButton from "../../Components/Shared/ConfirmButton";
import NoteBox from "../../Components/Shared/NoteBox";
import DataTable from "../../Components/Shared/DataTable";
import Loader from "../../Components/Shared/Loader";
import { FieldBlock } from "../../Components/Shared/FormFields";

const blank = { name: "", designation: "", phone: "", email: "" };

export default function TeacherDetailPage() {
  const { id } = useParams(); const isNew = id === "new";
  const { data, loading } = useCollections(["teachers", "users", "batches", "courses", "markDistributions", "students", "programs", "versions", "sections"]);
  const toast = useToast(); const nav = useNavigate(); const base = useBasePath();
  const [form, setForm] = useState(null); const [err, setErr] = useState({}); const [a, setA] = useState({ program: "IX", version: "Bangla", section: "A", kind: "subject", group: "", code: "" });
  const t = data.teachers?.find((x) => x.id === id);
  const mine = useMemo(() => (data.batches || []).filter((b) => b.teacherId === id), [data.batches, id]);
  if (loading) return <Loader />;
  if (!isNew && !t) return <><PageHeader title="Teacher not found" /><NoteBox tone="warning">This teacher does not exist.</NoteBox></>;
  const f = form || (isNew ? blank : t);
  const user = data.users.find((u) => u.teacherId === id);
  const cn = (c) => data.courses.find((x) => x.code === c)?.name || c;

  async function saveProfile(e) {
    e.preventDefault();
    const er = {}; if (!f.name.trim()) er.name = "Please type the name."; if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) er.email = "This email does not look right."; if (isNew && f.email && data.users.some((u) => u.email.toLowerCase() === f.email.toLowerCase())) er.email = "This email is already used.";
    setErr(er); if (Object.keys(er).length) return;
    if (isNew) {
      const next = `T${String(Math.max(0, ...data.teachers.map((x) => Number(x.id.slice(1)) || 0)) + 1).padStart(2, "0")}`;
      await api.create("teachers", { id: next, name: f.name.trim(), designation: f.designation, phone: f.phone, email: f.email, userId: `U-${next}` });
      if (f.email) await api.create("users", { id: `U-${next}`, name: f.name.trim(), email: f.email.trim(), password: DEMO_PASSWORD, role: "teacher", teacherId: next, status: "Active", avatarColor: "#087A49" });
      toast.push("Teacher added. Now give the teacher classes and subjects."); nav(`${base}/teachers/${next}`, { replace: true });
    } else { await api.update("teachers", id, { name: f.name.trim(), designation: f.designation, phone: f.phone, email: f.email }); if (user) await api.update("users", user.id, { name: f.name.trim() }); toast.push("Saved."); }
  }
  const groupsHere = unique(data.students.filter((s) => s.status === "Active" && s.program === a.program && s.version === a.version && s.section === a.section).map((s) => s.group));
  const group = a.group && groupsHere.includes(a.group) ? a.group : groupsHere[0] || "General";
  const dist = data.markDistributions.find((d) => d.programs.includes(a.program) && (d.group === "General" || d.group === group));
  const codes = unique((dist?.courses || []).map((c) => c.code));

  async function addAssignment() {
    if (a.kind === "class") {
      const ex = data.batches.find((b) => b.isClassTeacher === "Yes" && b.program === a.program && b.version === a.version && b.section === a.section);
      if (ex) { toast.push(`${data.teachers.find((x) => x.id === ex.teacherId)?.name} is already class teacher of ${a.program}-${a.section} (${a.version}). Change it in Teacher Planner.`, "error"); return; }
      await api.create("batches", { id: makeId("B"), teacherId: id, program: a.program, version: a.version, section: a.section, group: "All", courseCode: "*", isClassTeacher: "Yes", canEnter: "Yes", grantUntil: "" });
    } else {
      const code = a.code || codes[0];
      const ex = data.batches.find((b) => b.program === a.program && b.version === a.version && b.section === a.section && b.group === group && b.courseCode === code);
      if (ex) { toast.push(`${cn(code)} in ${a.program}-${a.section} already has a teacher. Use Teacher Planner to change it.`, "error"); return; }
      await api.create("batches", { id: makeId("B"), teacherId: id, program: a.program, version: a.version, section: a.section, group, courseCode: code, isClassTeacher: "No", canEnter: "Yes", grantUntil: "" });
    }
    toast.push("Assignment added.");
  }
  const setB = (b, patch) => api.update("batches", b.id, patch, "Assignment changed");
  const rows = mine.map((b) => ({ ...b, what: b.courseCode === "*" ? "Class teacher" : cn(b.courseCode), cls: `${b.program}-${b.section} (${b.version})` }));
  return (
    <>
      <PageHeader title={isNew ? "Add teacher" : t.name} subtitle={isNew ? "Type the details, then give classes and subjects" : t.designation} />
      <form onSubmit={saveProfile} noValidate>
        <Card title="Profile">
          <div className="grid gap-4 sm:grid-cols-2">
            {[["name", "Name", true], ["designation", "Designation"], ["phone", "Phone"], ["email", isNew ? "Email (creates a login)" : "Email"]].map(([k, l, r]) => <FieldBlock key={k} field={{ label: l, required: r }} error={err[k]}><input className={ui.input} value={f[k] || ""} onChange={(e) => setForm({ ...f, [k]: e.target.value })} /></FieldBlock>)}
          </div>
          <Button className="mt-4" type="submit" icon={FiSave}>{isNew ? "Add teacher" : "Save profile"}</Button>
          {isNew && <p className="mt-2 text-xs text-ink-500">The login password will be <b>{DEMO_PASSWORD}</b>. The teacher can change it in Safe Box.</p>}
        </Card>
      </form>
      {!isNew && (
        <>
          <Card className="mt-4" title="Login account" subtitle="Switch off to stop this teacher from signing in">
            {user ? <div className="flex flex-wrap items-center gap-3 text-sm"><span>{user.email}</span><select className={`${ui.input} w-auto`} value={user.status} onChange={(e) => api.update("users", user.id, { status: e.target.value }).then(() => toast.push("Saved."))}><option>Active</option><option>Inactive</option></select></div>
              : <Button variant="secondary" icon={FiPlus} onClick={async () => { if (!t.email) { toast.push("Type an email in the profile first.", "error"); return; } await api.create("users", { id: `U-${t.id}`, name: t.name, email: t.email, password: DEMO_PASSWORD, role: "teacher", teacherId: t.id, status: "Active", avatarColor: "#087A49" }); toast.push("Login created."); }}>Create login</Button>}
          </Card>
          <Card className="mt-4" title="Classes and subjects of this teacher" subtitle={`${rows.length} assignments`}>
            <DataTable rows={rows} pageSize={12} empty="No assignment yet" emptyText="Use the form below to give this teacher a class or a subject." columns={[{ key: "cls", label: "Class" }, { key: "group", label: "Group" }, { key: "what", label: "Subject / duty" },
              { key: "canEnter", label: "Marks entry", render: (b) => b.courseCode === "*" ? "-" : <select aria-label="Marks entry" className={`${ui.input} w-auto py-1.5 text-xs`} value={b.canEnter || "Yes"} onChange={(e) => setB(b, { canEnter: e.target.value })}><option value="Yes">Allowed</option><option value="No">Stopped</option></select> },
              { key: "grantUntil", label: "Extra access until", render: (b) => b.courseCode === "*" ? "-" : <input type="date" aria-label="Extra access until" className={`${ui.input} w-auto py-1.5 text-xs`} value={b.grantUntil || ""} onChange={(e) => setB(b, { grantUntil: e.target.value })} /> },
              { key: "x", label: "", render: (b) => <ConfirmButton icon={FiTrash2} label="Remove" onConfirm={() => api.remove("batches", b.id).then(() => toast.push("Removed."))} /> }]} />
            <NoteBox tone="info" className="mt-3"><b>Marks entry</b> - Stopped means the teacher cannot enter marks for that subject. <b>Extra access until</b> - lets the teacher enter marks after the normal last date, up to the date you choose.</NoteBox>
          </Card>
          <Card className="mt-4" title="Give a class or subject">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FieldBlock field={{ label: "What" }}><select className={ui.input} value={a.kind} onChange={(e) => setA({ ...a, kind: e.target.value })}><option value="subject">Teach a subject</option><option value="class">Be the class teacher</option></select></FieldBlock>
              <FieldBlock field={{ label: "Class" }}><select className={ui.input} value={a.program} onChange={(e) => setA({ ...a, program: e.target.value, code: "", group: "" })}>{data.programs.map((p) => <option key={p.id}>{p.name}</option>)}</select></FieldBlock>
              <FieldBlock field={{ label: "Version" }}><select className={ui.input} value={a.version} onChange={(e) => setA({ ...a, version: e.target.value })}>{data.versions.map((p) => <option key={p.id}>{p.name}</option>)}</select></FieldBlock>
              <FieldBlock field={{ label: "Section" }}><select className={ui.input} value={a.section} onChange={(e) => setA({ ...a, section: e.target.value })}>{data.sections.map((p) => <option key={p.id}>{p.name}</option>)}</select></FieldBlock>
              {a.kind === "subject" && <>
                <FieldBlock field={{ label: "Group" }}><select className={ui.input} value={group} onChange={(e) => setA({ ...a, group: e.target.value, code: "" })}>{(groupsHere.length ? groupsHere : ["General"]).map((g) => <option key={g}>{g}</option>)}</select></FieldBlock>
                <FieldBlock field={{ label: "Subject" }}><select className={ui.input} value={a.code || codes[0] || ""} onChange={(e) => setA({ ...a, code: e.target.value })}>{codes.map((c) => <option key={c} value={c}>{c} - {cn(c)}</option>)}</select></FieldBlock></>}
            </div>
            <Button className="mt-4" icon={FiPlus} onClick={addAssignment}>Add</Button>
          </Card>
        </>)}
    </>
  );
}
