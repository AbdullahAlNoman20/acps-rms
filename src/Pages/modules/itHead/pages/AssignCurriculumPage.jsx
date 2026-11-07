import { useMemo, useState } from "react";
import { FiSave } from "react-icons/fi";
import { useCollections } from "../../../../Components/hooks/useCollection";
import { useToast } from "../../../../Components/hooks/useToast";
import { api } from "../../../../Components/services/api";
import { unique } from "../../../../Components/utils/format";
import { ui } from "../../../../theme/ui";
import PageHeader from "../../../../Components/Shared/PageHeader";
import FilterBar from "../../../../Components/Shared/FilterBar";
import DataTable from "../../../../Components/Shared/DataTable";
import Button from "../../../../Components/Shared/Button";
import NoteBox from "../../../../Components/Shared/NoteBox";
import Loader from "../../../../Components/Shared/Loader";

// Student-wise 4th (optional) subject for Class IX and X. The choices come from the Curriculum setup.
export default function AssignCurriculumPage() {
  const { data, loading } = useCollections(["students", "curriculum", "courses", "programs", "versions", "sections", "groups"]);
  const toast = useToast();
  const [f, setF] = useState({ program: "IX", version: "", section: "", group: "" }); const [edits, setEdits] = useState({});
  const rows = useMemo(() => (data.students || []).filter((s) => s.status === "Active" && s.program === f.program && s.group !== "General" && (!f.version || s.version === f.version) && (!f.section || s.section === f.section) && (!f.group || s.group === f.group)), [data.students, f]);
  if (loading) return <Loader />;
  const cn = (c) => data.courses.find((x) => x.code === c)?.name || c;
  const optionsFor = (s) => (data.curriculum.find((c) => c.program === s.program && c.group === s.group)?.courses || []).filter((c) => ["mainOrFourth", "fourthOnly"].includes(c.role)).map((c) => ({ value: c.code, label: `${c.code} - ${cn(c.code)}` }));
  const value = (s) => (s.id in edits ? edits[s.id] : s.fourthSubject || "");
  async function save() {
    const recs = Object.entries(edits).map(([id, fourthSubject]) => ({ id, fourthSubject }));
    if (!recs.length) { toast.push("Nothing was changed.", "info"); return; }
    await api.upsertMany("students", recs, "4th subject assigned"); setEdits({}); toast.push(`${recs.length} students updated.`);
  }
  return (
    <>
      <PageHeader title="Assign 4th subject" note="Class IX and X students choose one 4th (optional) subject. Pick it for each student and press Save. The result uses it for the bonus point. Religious Studies is chosen automatically from the student's religion."
        actions={<Button icon={FiSave} onClick={save}>Save changes ({Object.keys(edits).length})</Button>} />
      <FilterBar values={f} onChange={setF} filters={[{ key: "program", label: "Class", allLabel: null, options: data.programs.filter((p) => p.hasGroup === "Yes").map((p) => p.name) }, { key: "version", label: "Version", options: unique(data.versions.map((v) => v.name)) }, { key: "section", label: "Section", options: unique(data.sections.map((v) => v.name)) }, { key: "group", label: "Group", options: data.groups.filter((g) => g.name !== "General").map((g) => g.name) }]} />
      {rows.length === 0 && <NoteBox tone="info">No students found for this selection.</NoteBox>}
      <DataTable rows={rows} pageSize={25} columns={[{ key: "roll", label: "Roll" }, { key: "name", label: "Student", render: (s) => <span><b className="text-ink-900">{s.name}</b><span className="block text-xs text-ink-400">{s.id} - {s.version}, {s.section}</span></span> }, { key: "group", label: "Group" }, { key: "religion", label: "Religion" },
        { key: "fs", label: "4th subject", render: (s) => <select className={`${ui.input} min-w-[200px]`} value={value(s)} onChange={(e) => setEdits({ ...edits, [s.id]: e.target.value })}><option value="">- none -</option>{optionsFor(s).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select> }]} />
    </>
  );
}
