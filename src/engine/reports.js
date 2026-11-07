// Report builders. Each returns { columns:[{key,label}], rows:[{...}] } so one page can show/print/export any report.
import { computeExam, computeAggregate, assignPositions, availableExams, pickDistribution } from "./calc.js";

export const REPORT_TYPES = [
  { key: "tabulation", label: "Tabulation sheet", desc: "Every student with marks of every subject, total, GPA and position." },
  { key: "merit", label: "Merit list", desc: "Students in order of position (only those who passed)." },
  { key: "subjectwise", label: "Subject-wise result", desc: "For each subject: passed, failed, highest, average." },
  { key: "fail", label: "Fail list", desc: "Students who failed, with the subjects they failed." },
  { key: "grade", label: "Grade sheet", desc: "Letter grade and grade point of each subject for each student." },
  { key: "progress", label: "Progress report", desc: "GPA of every exam of the year, aggregate GPA and attendance." },
  { key: "teachermarks", label: "Teacher marks sheet", desc: "Raw marks of one subject (parts like Objective, Subjective). Check before submitting." },
];

const f2 = (n) => (Number.isFinite(Number(n)) ? Number(n).toFixed(2) : "-");
const resOf = (ctx, s, scope, mode) => (scope === "aggregate" ? computeAggregate(ctx, s, mode) : computeExam(ctx, s, scope));

export function buildReport(type, { ctx, pool, show, scope, mode = "staff", course }) {
  const items = assignPositions(pool.map((s) => ({ student: s, result: resOf(ctx, s, scope, mode) })).filter((x) => x.result), ctx).filter((x) => show(x.student));
  const sorted = [...items].sort((a, b) => a.student.section.localeCompare(b.student.section) || a.student.roll - b.student.roll);
  const subjects = [...new Set(items.flatMap((x) => [...x.result.main, ...(x.result.fourth ? [x.result.fourth] : [])].map((r) => r.name)))];
  const cell = (it, name, fn) => { const r = [...it.result.main, ...(it.result.fourth ? [it.result.fourth] : [])].find((x) => x.name === name); return r ? fn(r) : "-"; };
  const who = (it) => ({ id: it.student.id, roll: it.student.roll, name: it.student.name, cls: `${it.student.program}-${it.student.section}${it.student.group !== "General" ? ` ${it.student.group}` : ""} (${it.student.version})` });
  const idCols = [{ key: "roll", label: "Roll" }, { key: "name", label: "Student" }, { key: "cls", label: "Class" }];

  switch (type) {
    case "tabulation":
      return { columns: [...idCols, ...subjects.map((n) => ({ key: n, label: n })), { key: "total", label: "Total" }, { key: "gpa", label: "GPA" }, { key: "letter", label: "Grade" }, { key: "result", label: "Result" }, { key: "pos", label: "Section pos." }],
        rows: sorted.map((it) => ({ ...who(it), ...Object.fromEntries(subjects.map((n) => [n, cell(it, n, (r) => (r.status ? r.status : f2(r.on100)))])), total: f2(it.result.totalMarks), gpa: f2(it.result.gpa), letter: it.result.letter, result: it.result.result, pos: it.pos.section ?? "-" })) };
    case "merit":
      return { columns: [{ key: "pos", label: "Position" }, ...idCols, { key: "total", label: "Total marks" }, { key: "gpa", label: "GPA" }, { key: "letter", label: "Grade" }],
        rows: items.filter((x) => x.pos.section).sort((a, b) => a.pos.klass - b.pos.klass).map((it) => ({ ...who(it), pos: `${it.pos.klass} (section ${it.pos.section})`, total: f2(it.result.totalMarks), gpa: f2(it.result.gpa), letter: it.result.letter })) };
    case "subjectwise":
      return { columns: [{ key: "subject", label: "Subject" }, { key: "appeared", label: "Students" }, { key: "passed", label: "Passed" }, { key: "failed", label: "Failed" }, { key: "rate", label: "Pass %" }, { key: "high", label: "Highest" }, { key: "avg", label: "Average" }],
        rows: subjects.map((n) => { const v = items.map((it) => [...it.result.main, ...(it.result.fourth ? [it.result.fourth] : [])].find((x) => x.name === n)).filter(Boolean); const p = v.filter((r) => r.passed).length;
          return { subject: n, appeared: v.length, passed: p, failed: v.length - p, rate: v.length ? `${Math.round((p / v.length) * 100)}%` : "-", high: f2(Math.max(0, ...v.map((r) => r.on100))), avg: f2(v.reduce((s, r) => s + r.on100, 0) / (v.length || 1)) }; }) };
    case "fail":
      return { columns: [...idCols, { key: "n", label: "Failed subjects" }, { key: "list", label: "Which subjects" }, { key: "rule", label: "Pass rule" }],
        rows: sorted.filter((it) => it.result.failedCount > 0 || it.result.result === "Incomplete").map((it) => ({ ...who(it), n: it.result.failedCount, list: it.result.failed.join(", ") || it.result.result, rule: it.result.rule })) };
    case "grade":
      return { columns: [...idCols, ...subjects.map((n) => ({ key: n, label: n })), { key: "gpa", label: "GPA" }],
        rows: sorted.map((it) => ({ ...who(it), ...Object.fromEntries(subjects.map((n) => [n, cell(it, n, (r) => `${r.letter} (${f2(r.gp)})`)])), gpa: f2(it.result.gpa) })) };
    case "progress": {
      const sample = pool[0]; const exs = sample ? availableExams(ctx, sample, mode) : [];
      return { columns: [...idCols, ...exs.map((e) => ({ key: e.key, label: `${e.name} GPA` })), { key: "agg", label: "Aggregate GPA" }, { key: "att", label: "Attendance %" }],
        rows: sorted.map((it) => { const agg = computeAggregate(ctx, it.student, mode); return { ...who(it), ...Object.fromEntries(exs.map((e) => [e.key, agg?.perExam[e.key] ? f2(agg.perExam[e.key].gpa) : "-"])), agg: agg ? f2(agg.gpa) : "-", att: agg ? agg.attendance : "-" }; }) };
    }
    case "teachermarks": {
      const students = pool.filter(show).sort((a, b) => a.section.localeCompare(b.section) || a.roll - b.roll); const d = students[0] && pickDistribution(ctx, students[0]); const row = d?.courses.find((c) => c.code === course);
      const comps = row?.components || [];
      return { columns: [{ key: "roll", label: "Roll" }, { key: "name", label: "Student" }, ...comps.map((c) => ({ key: c.key, label: `${c.label} /${c.exam}` })), { key: "status", label: "Status" }],
        rows: students.map((s) => { const m = ctx.marks.get(`${scope}|${s.id}|${course}`); return { roll: s.roll, name: s.name, ...Object.fromEntries(comps.map((c) => [c.key, m ? m.comps?.[c.key] ?? "-" : "-"])), status: m?.status || "" }; }) };
    }
    default: return { columns: [], rows: [] };
  }
}
