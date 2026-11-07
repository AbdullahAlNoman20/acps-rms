import { FiFlag } from "react-icons/fi";
import { useCollections } from "../../../../Components/hooks/useCollection";
import { useAuth } from "../../../../Components/hooks/useAuth";
import { fix } from "../../../../Components/utils/format";
import PageHeader from "../../../../Components/Shared/PageHeader";
import Card from "../../../../Components/Shared/Card";
import DataTable from "../../../../Components/Shared/DataTable";
import NoteBox from "../../../../Components/Shared/NoteBox";
import Loader from "../../../../Components/Shared/Loader";

export default function StudentSscPage() {
  const { user } = useAuth();
  const { data, loading } = useCollections(["boardResults", "students"]);
  if (loading) return <Loader />;
  const s = data.students.find((x) => x.id === user.studentId); const br = data.boardResults.find((b) => b.studentId === user.studentId);
  return (
    <>
      <PageHeader title="SSC result" note="The SSC Board exam is taken after Class X. The result is given by the Board and entered here by the school." />
      {br ? (
        <Card title={`SSC ${br.year} - ${br.group}`} actions={<span className="text-2xl font-bold text-brand-700">GPA {fix(br.gpa)}</span>}>
          <p className="mb-3 text-sm text-ink-500">Board roll {br.roll} - Registration {br.registration} - {br.status}</p>
          <DataTable rows={br.subjects.map((x, i) => ({ id: i, ...x }))} columns={[{ key: "code", label: "Code" }, { key: "name", label: "Subject" }, { key: "letter", label: "Grade" }, { key: "gp", label: "GP", render: (r) => fix(r.gp) }]} />
        </Card>
      ) : <NoteBox tone="info" title={<span className="flex items-center gap-2"><FiFlag /> No SSC result yet</span>}>{s?.program === "X" ? "You are in Class X. After the Board publishes the SSC result, the school will add it here." : "SSC is taken after Class X."}</NoteBox>}
    </>
  );
}
