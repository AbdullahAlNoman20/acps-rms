import { FiPhone } from "react-icons/fi";
import { useCollections } from "../../../../Components/hooks/useCollection";
import { useAuth } from "../../../../Components/hooks/useAuth";
import PageHeader from "../../../../Components/Shared/PageHeader";
import Card from "../../../../Components/Shared/Card";
import Loader from "../../../../Components/Shared/Loader";

const tel = (n) => `tel:${String(n).replace(/[^0-9+]/g, "")}`;
export default function StudentContactPage() {
  const { user } = useAuth();
  const { data, loading } = useCollections(["students", "batches", "teachers", "settings"]);
  if (loading) return <Loader />;
  const s = data.students.find((x) => x.id === user.studentId); const st = data.settings[0] || {};
  const ct = s && data.batches.find((b) => b.isClassTeacher === "Yes" && b.program === s.program && b.version === s.version && b.section === s.section);
  const teacher = ct && data.teachers.find((t) => t.id === ct.teacherId);
  const Row = ({ title, name, number }) => (
    <Card><div className="flex items-center justify-between gap-3"><div><p className="font-semibold text-ink-900">{title}</p><p className="text-sm text-ink-500">{name}</p><p className="text-sm font-medium text-ink-700">{number}</p></div>
      <a href={tel(number)} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"><FiPhone /> Call</a></div></Card>
  );
  return (
    <>
      <PageHeader title="Call the school" note="Press Call. On a phone it opens the dialer. On a computer it opens your calling app." />
      <div className="space-y-3">
        {teacher && <Row title="Class teacher" name={teacher.name} number={teacher.phone} />}
        <Row title="School office" name={st.schoolName} number={st.officePhone || st.phone} />
      </div>
    </>
  );
}
