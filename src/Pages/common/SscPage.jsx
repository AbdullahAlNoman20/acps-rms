import { useMemo, useState } from "react";
import { FiDownload, FiEdit3, FiSliders } from "react-icons/fi";
import { useResultData } from "../../Components/hooks/useResultData";
import { useCollection } from "../../Components/hooks/useCollection";
import { useAuth } from "../../Components/hooks/useAuth";
import { useBasePath } from "../../Components/hooks/useBasePath";
import { sscEligibility } from "../../engine/calc";
import { exportRows } from "../../Components/utils/excel";
import { fix } from "../../Components/utils/format";
import PageHeader from "../../Components/Shared/PageHeader";
import Tabs from "../../Components/Shared/Tabs";
import DataTable from "../../Components/Shared/DataTable";
import StatusBadge from "../../Components/Shared/StatusBadge";
import Button from "../../Components/Shared/Button";
import Loader from "../../Components/Shared/Loader";
import { attendancePercent, computeAggregate } from "../../engine/calc";

export default function SscPage() {
  const { data, ctx, loading } = useResultData();
  const { items: board } = useCollection("boardResults");
  const { can } = useAuth(); const base = useBasePath();
  const [tab, setTab] = useState("eligibility");
  const rows = useMemo(() => {
    if (!ctx) return [];
    return data.students.filter((s) => s.program === "X" && s.status === "Active").map((s) => {
      const e = sscEligibility(ctx, s); const agg = computeAggregate(ctx, s, "staff");
      return { id: s.id, roll: s.roll, name: s.name, cls: `X-${s.section} (${s.version}, ${s.group})`, finalTest: e.finalTest ? e.finalTest.result : "-", gpa: e.finalTest?.gpa ?? 0, att: agg ? agg.attendance : 100, eligibility: e.eligibility, aggGpa: agg?.gpa ?? 0 };
    });
  }, [ctx, data.students]);
  if (loading) return <Loader />;
  const eligible = rows.filter((r) => r.eligibility === "Eligible");
  return (
    <>
      <PageHeader title="Class X and SSC" note="Class X has four school exams (First, Second, Pre-Test, Final Test). After that the student sits the SSC Board exam. Here you see who can sit for SSC and the Board results. The eligibility rule is editable in Rules and formulas (SSC rules)."
        actions={<>{can("customize.manage") && <Button variant="secondary" to={`${base}/rules`} icon={FiSliders}>Change rule</Button>}<Button variant="secondary" icon={FiDownload} onClick={() => exportRows("ssc-form-fillup", eligible.map((r) => ({ ID: r.id, Name: r.name, Class: r.cls, "Final Test GPA": r.gpa, "Attendance %": r.att })), "Eligible")}>Form fill-up list</Button></>} />
      <Tabs value={tab} onChange={setTab} tabs={[{ value: "eligibility", label: `Who can sit for SSC (${eligible.length}/${rows.length})` }, { value: "board", label: "SSC Board results" }]} />
      {tab === "eligibility" ? (
        <DataTable rows={rows} pageSize={20} columns={[{ key: "roll", label: "Roll" }, { key: "name", label: "Student", render: (r) => <span><b className="text-ink-900">{r.name}</b><span className="block text-xs text-ink-400">{r.id} - {r.cls}</span></span> },
          { key: "finalTest", label: "Final Test", render: (r) => <StatusBadge status={r.finalTest} /> }, { key: "gpa", label: "Final Test GPA", render: (r) => fix(r.gpa) }, { key: "att", label: "Attendance", render: (r) => `${r.att}%` },
          { key: "eligibility", label: "SSC eligibility", render: (r) => <StatusBadge status={r.eligibility} /> }]} />
      ) : (
        <>
          {can("board.manage") && <div className="mb-3"><Button to={`${base}/data/boardResults`} icon={FiEdit3}>Add or edit Board results</Button></div>}
          <DataTable rows={board} pageSize={20} columns={[{ key: "studentId", label: "Student", render: (r) => data.students.find((s) => s.id === r.studentId)?.name || r.studentId }, { key: "roll", label: "Board roll" }, { key: "registration", label: "Registration" }, { key: "year", label: "Year" },
            { key: "group", label: "Group" }, { key: "gpa", label: "GPA", render: (r) => fix(r.gpa) }, { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status === "Passed" ? "Pass" : r.status === "Failed" ? "Fail" : "pending"} label={r.status} /> }]} />
        </>
      )}
    </>
  );
}
