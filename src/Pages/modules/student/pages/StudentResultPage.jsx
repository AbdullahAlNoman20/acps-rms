import { useParams } from "react-router-dom";
import { useResultData } from "../../../../Components/hooks/useResultData";
import { useAuth } from "../../../../Components/hooks/useAuth";
import PageHeader from "../../../../Components/Shared/PageHeader";
import TranscriptView from "../../../../Components/Shared/TranscriptView";
import NoteBox from "../../../../Components/Shared/NoteBox";
import Loader from "../../../../Components/Shared/Loader";

export default function StudentResultPage() {
  const { scope } = useParams(); const { user } = useAuth();
  const { data, ctx, loading } = useResultData();
  if (loading) return <Loader />;
  const s = data.students.find((x) => x.id === user.studentId);
  const exam = ctx.exams.find((e) => e.id === scope);
  if (!s || (scope !== "aggregate" && (!exam || exam.status !== "published"))) return (<><PageHeader title="Result not available" /><NoteBox tone="info">This result is not published yet.</NoteBox></>);
  return (<><PageHeader title="My result" note="Press 'Print or save as PDF' to keep a copy." /><TranscriptView ctx={ctx} data={data} student={s} scope={scope} mode="student" /></>);
}
