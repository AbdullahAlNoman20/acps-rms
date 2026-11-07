import { useRef, useState } from "react";
import { FiDownload, FiUpload, FiSave, FiRefreshCw } from "react-icons/fi";
import { useCollection } from "../../Components/hooks/useCollection";
import { useAuth } from "../../Components/hooks/useAuth";
import { useToast } from "../../Components/hooks/useToast";
import { api } from "../../Components/services/api";
import { dataStore } from "../../Components/services/dataStore";
import { downloadJson } from "../../Components/utils/excel";
import { ROLE_LABELS } from "../../Components/constants/roles";
import { ui } from "../../theme/ui";
import PageHeader from "../../Components/Shared/PageHeader";
import Card from "../../Components/Shared/Card";
import Button from "../../Components/Shared/Button";
import ConfirmButton from "../../Components/Shared/ConfirmButton";
import NoteBox from "../../Components/Shared/NoteBox";
import Loader from "../../Components/Shared/Loader";
import { FieldBlock } from "../../Components/Shared/FormFields";

const SCHOOL_FIELDS = [["schoolName", "School name"], ["schoolNameBn", "School name (Bangla)"], ["address", "Address"], ["phone", "Phone"], ["officePhone", "Office phone (used for Call button)"], ["website", "Website"], ["email", "Email"], ["principalName", "Principal's name"], ["currentSession", "Current session"], ["smsGateway", "SMS gateway note"]];

export default function SettingsPage() {
  const { user, can } = useAuth(); const toast = useToast();
  const { items: settings, loading } = useCollection("settings");
  const [pw, setPw] = useState({ cur: "", next: "", again: "" }); const [pwErr, setPwErr] = useState("");
  const [school, setSchool] = useState(null); const fileRef = useRef(null);
  if (loading) return <Loader />;
  const s = school || settings[0] || {};
  const isAdmin = can("customize.manage");

  async function changePassword(e) {
    e.preventDefault();
    const me = await api.get("users", user.id);
    if (!me || me.password !== pw.cur) { setPwErr("Your current password is not correct."); return; }
    if (pw.next.length < 8) { setPwErr("The new password must have at least 8 characters."); return; }
    if (pw.next !== pw.again) { setPwErr("The two new passwords are not the same."); return; }
    await api.update("users", user.id, { password: pw.next }, "Password changed"); setPw({ cur: "", next: "", again: "" }); setPwErr(""); toast.push("Password changed.");
  }
  async function saveSchool() { await api.update("settings", "main", s, "School information changed"); toast.push("School information saved."); }
  async function importBackup(e) {
    const file = e.target.files?.[0]; if (!file) return;
    try { await dataStore.importAll(JSON.parse(await file.text())); toast.push("Backup restored."); } catch { toast.push("This file is not a valid backup.", "error"); }
    e.target.value = "";
  }
  return (
    <>
      <PageHeader title="Settings" note="Change your password here. The IT Head can also change school information and keep a backup of all data." />
      <Card title="My profile" className="mb-4">
        <dl className="grid gap-2 text-sm sm:grid-cols-3"><div><dt className="text-xs text-ink-500">Name</dt><dd className="font-semibold">{user.name}</dd></div><div><dt className="text-xs text-ink-500">Email</dt><dd className="font-semibold">{user.email}</dd></div><div><dt className="text-xs text-ink-500">Role</dt><dd className="font-semibold">{ROLE_LABELS[user.role]}</dd></div></dl>
      </Card>
      <Card title="Change password" className="mb-4">
        <form onSubmit={changePassword} className="grid gap-4 sm:grid-cols-3" noValidate>
          {[["cur", "Current password"], ["next", "New password"], ["again", "New password again"]].map(([k, l]) => (
            <FieldBlock key={k} field={{ label: l }}><input type="password" autoComplete="off" className={ui.input} value={pw[k]} onChange={(e) => { setPw({ ...pw, [k]: e.target.value }); setPwErr(""); }} /></FieldBlock>))}
          {pwErr && <p className={`${ui.error} sm:col-span-3`} role="alert">{pwErr}</p>}
          <div className="sm:col-span-3"><Button type="submit" icon={FiSave}>Change password</Button></div>
        </form>
      </Card>
      {isAdmin && (
        <>
          <Card title="School information" subtitle="Printed on transcripts and used by the Call button" className="mb-4">
            <div className="grid gap-4 sm:grid-cols-2">{SCHOOL_FIELDS.map(([k, l]) => <FieldBlock key={k} field={{ label: l }}><input className={ui.input} value={s[k] || ""} onChange={(e) => setSchool({ ...s, [k]: e.target.value })} /></FieldBlock>)}</div>
            <Button className="mt-4" icon={FiSave} onClick={saveSchool}>Save school information</Button>
          </Card>
          <Card title="Backup and demo data">
            <NoteBox tone="info" className="mb-3">All data is stored in this browser for now. Download a backup before big changes (like Year-end rollover). A backend developer will move this data to a database later.</NoteBox>
            <div className="flex flex-wrap gap-2">
              <Button icon={FiDownload} onClick={async () => { downloadJson(`acps-rms-backup-${new Date().toISOString().slice(0, 10)}.json`, await dataStore.exportAll()); toast.push("Backup downloaded."); }}>Download backup</Button>
              <Button variant="secondary" icon={FiUpload} onClick={() => fileRef.current?.click()}>Restore from backup</Button><input ref={fileRef} type="file" accept=".json" className="hidden" onChange={importBackup} />
              <ConfirmButton variant="danger" size="md" icon={FiRefreshCw} label="Reset to demo data" confirmText="All changes will be lost. Continue?" onConfirm={async () => { await dataStore.resetAll(); toast.push("Demo data restored."); }} />
            </div>
          </Card>
        </>
      )}
    </>
  );
}
