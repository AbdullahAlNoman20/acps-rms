import { useParams } from "react-router-dom";
import { useResultData } from "../../Components/hooks/useResultData";
import { useAuth } from "../../Components/hooks/useAuth";
import PageHeader from "../../Components/Shared/PageHeader";
import TranscriptView from "../../Components/Shared/TranscriptView";
import NoteBox from "../../Components/Shared/NoteBox";
import Loader from "../../Components/Shared/Loader";

export default function ResultViewPage() {
  const { studentId, scope } = useParams();
  const { data, ctx, loading } = useResultData();
  const { user } = useAuth();
  if (loading) return <Loader />;
  const student = data.students.find((s) => s.id === studentId);
  if (!student) return <><PageHeader title="Student not found" /><NoteBox tone="warning">This student does not exist.</NoteBox></>;
  return (<><PageHeader title={`Transcript - ${student.name}`} note="Check the numbers. Press 'Print or save as PDF' to get a copy." /><TranscriptView ctx={ctx} data={data} student={student} scope={scope} mode={user.role === "teacher" ? "student" : "staff"} /></>);
}
