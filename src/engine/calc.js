// RESULT ENGINE. Every number here comes from editable data: Mark Distribution, Rules (params, formulas,
// conditions), Grade tables and Status codes. Nothing about marks is hard-coded.
import { evaluate } from "./expression.js";
import { round, gradeFor, letterFromGpa } from "./grade.js";
import { evaluateConditions } from "./conditions.js";

export const DEFAULT_FORMULAS = {
  componentConvert: "raw * pr / 100", scaleTo100: "total * mj", fourthBonus: "max(gp - deduct, 0)",
  gpa: "min(cap, (sumGp + bonus) / divisor)", aggregatePart: "value * weight / 100",
};
export const STAFF_VISIBLE = ["calculated", "verified", "sent", "vp_reviewed", "principal_signed", "published"];

export function buildCtx(data) {
  const grace = new Map();
  (data.grace || []).filter((g) => g.status === "approved").forEach((g) => {
    const k = `${g.examId}|${g.studentId}|${g.courseCode}`;
    grace.set(k, (grace.get(k) || 0) + Number(g.marks || 0));
  });
  return {
    params: Object.fromEntries((data.ruleParams || []).map((p) => [p.key, p.value])),
    numParams: Object.fromEntries((data.ruleParams || []).filter((p) => typeof p.value === "number").map((p) => [p.key, p.value])), // usable inside formulas
    formulas: Object.fromEntries((data.ruleFormulas || []).map((f) => [f.key, f.expr])),
    conditions: data.ruleConditions || [],
    tables: Object.fromEntries((data.gradeTables || []).map((t) => [t.id, t.rows || []])),
    status: Object.fromEntries((data.statusCodes || []).map((s) => [s.code, s])),
    dists: data.markDistributions || [],
    marks: new Map((data.marks || []).map((m) => [`${m.examId}|${m.studentId}|${m.courseCode}`, m])),
    attendance: new Map((data.attendance || []).map((a) => [`${a.examId}|${a.studentId}`, a])),
    exams: data.exams || [], schemes: data.examSchemes || [], grace,
  };
}

const F = (ctx, key, scope) => evaluate(ctx.formulas[key] || DEFAULT_FORMULAS[key], { ...ctx.numParams, ...scope }, 0);
const dec = (ctx) => Number(ctx.params.roundDecimals ?? 2);

export function pickDistribution(ctx, student) {
  return ctx.dists.find((d) => d.programs.includes(student.program) && (d.group === "General" || d.group === student.group));
}

function selectRows(dist, student) {
  const out = [];
  for (const c of dist.courses) {
    if (c.religion && c.religion !== student.religion) continue;
    const chosen4th = student.fourthSubject && c.code === student.fourthSubject;
    if (c.role === "fourthOnly" && !chosen4th) continue;
    out.push({ c, isFourth: !!chosen4th && (c.role === "fourthOnly" || c.role === "mainOrFourth") });
  }
  return out;
}

const passOf = (rule, std, special) => (rule === "33" ? Number(special) || 0 : Number(std) || 0);

function paper(ctx, student, examId, c) {
  const rec = ctx.marks.get(`${examId}|${student.id}|${c.code}`);
  if (!rec) return { missing: true, total: 0, comps: {}, statusZero: false, status: "", grace: 0 };
  const sc = ctx.status[rec.status];
  const statusZero = !!sc && sc.effect === "zero";
  let total = 0; const comps = {};
  for (const cp of c.components) {
    const raw = Number(rec.comps?.[cp.key]) || 0;
    comps[cp.key] = raw;
    total += F(ctx, "componentConvert", { raw, pr: cp.pr });
  }
  const grace = ctx.grace.get(`${examId}|${student.id}|${c.code}`) || 0;
  return { missing: false, total: statusZero ? 0 : total + grace, comps, statusZero, status: rec.status || "", grace };
}

function buildRows(ctx, student, examId, dist, rule) {
  const table = ctx.tables[rule === "33" ? "special" : "standard"] || [];
  const rows = []; const joints = new Map();
  for (const { c, isFourth } of selectRows(dist, student)) {
    if (c.j) { if (!joints.has(c.j)) joints.set(c.j, []); joints.get(c.j).push({ c, isFourth }); continue; }
    const p = paper(ctx, student, examId, c);
    const compOk = c.components.every((cp) => { const need = passOf(rule, cp.pass, cp.pass33); return need <= 0 || p.comps[cp.key] >= need; });
    const passed = !p.missing && !p.statusZero && p.total >= passOf(rule, c.passMark, c.passMark33) && compOk;
    const on100 = round(F(ctx, "scaleTo100", { total: p.total, mj: c.mj, full: c.fullMark }), dec(ctx));
    rows.push({ key: c.code, code: c.code, name: c.name, comps: p.comps, total: round(p.total, dec(ctx)), full: c.fullMark, on100, passed, ...gradeFor(on100, passed, table),
      isEffective: c.isEffective === "Yes", isFourth, missing: p.missing, status: p.status, grace: p.grace });
  }
  for (const [j, list] of joints) {
    const papers = list.sort((a, b) => a.c.jo - b.c.jo);
    const last = papers[papers.length - 1].c;
    const ps = papers.map(({ c }) => paper(ctx, student, examId, c));
    const total = ps.reduce((s, p) => s + p.total, 0);
    const full = papers.reduce((s, { c }) => s + c.fullMark, 0);
    const combined = {}; ps.forEach((p) => Object.entries(p.comps).forEach(([k, v]) => { combined[k] = (combined[k] || 0) + v; }));
    const compOk = last.components.every((cp) => { const need = passOf(rule, cp.pass, cp.pass33); return need <= 0 || (combined[cp.key] || 0) >= need; });
    const missing = ps.some((p) => p.missing); const statusZero = ps.some((p) => p.statusZero);
    const passed = !missing && !statusZero && total >= passOf(rule, last.jp, last.jp33) && compOk;
    const on100 = round((total / full) * 100, dec(ctx));
    rows.push({ key: j, code: papers[0].c.code, name: last.jointName || last.name, comps: combined, total: round(total, dec(ctx)), full, on100, passed, ...gradeFor(on100, passed, table),
      isEffective: last.isEffective === "Yes", isFourth: papers[0].isFourth, missing, status: ps.map((p) => p.status).find(Boolean) || "", grace: 0, joint: true });
  }
  return rows;
}

function finalize(ctx, student, dist, rows, rule) {
  const d = dec(ctx);
  const main = rows.filter((r) => !r.isFourth);
  const fourth = rows.find((r) => r.isFourth) || null;
  const eff = main.filter((r) => r.isEffective);
  const failed = eff.filter((r) => !r.passed);
  const incomplete = rows.some((r) => r.missing);
  const bonus = fourth && fourth.passed ? F(ctx, "fourthBonus", { gp: fourth.gp, deduct: dist.deduct4th ?? 2 }) : 0;
  const failedCount = failed.length + (fourth && !fourth.passed && dist.failFor4th === "Yes" ? 1 : 0);
  const divisor = dist.gpaDivision || eff.length || 1;
  const sumGp = eff.reduce((s, r) => s + r.gp, 0);
  const gpa = failedCount > 0 || incomplete ? 0 : round(F(ctx, "gpa", { sumGp, bonus, divisor, cap: ctx.params.gpaCap ?? 5 }), d);
  return {
    studentId: student.id, rows, main, fourth, failed: failed.map((r) => r.name), failedCount, bonus, divisor, gpa,
    letter: letterFromGpa(gpa, ctx.tables.gpaLetters), result: incomplete ? "Incomplete" : failedCount ? "Fail" : "Pass",
    totalMarks: round(eff.reduce((s, r) => s + r.on100, 0), d), rule, special: rule === "33",
  };
}

export function computeExam(ctx, student, examId, opts = {}) {
  const dist = pickDistribution(ctx, student);
  if (!dist) return null;
  const rule = opts.forceRule || (student.passRule === "33" ? "33" : "45");
  const res = finalize(ctx, student, dist, buildRows(ctx, student, examId, dist, rule), rule);
  if (rule === "33" && !opts.forceRule) {
    const std = computeExam(ctx, student, examId, { forceRule: "45" });
    res.savedBy33 = res.result === "Pass" && std && std.result !== "Pass";
  }
  return res;
}

export function schemeFor(ctx, student) {
  return ctx.schemes.find((s) => (s.programs || []).includes(student.program));
}
export function examInstance(ctx, scheme, key, student) {
  return ctx.exams.find((e) => e.key === key && e.programs.includes(student.program));
}
export function availableExams(ctx, student, mode = "staff") {
  const scheme = schemeFor(ctx, student);
  if (!scheme) return [];
  return scheme.exams.filter((e) => e.type === "school" && e.include === "Yes").map((e) => ({ ...e, inst: examInstance(ctx, scheme, e.key, student) }))
    .filter((e) => e.inst && (mode === "student" ? e.inst.status === "published" : STAFF_VISIBLE.includes(e.inst.status)));
}

export function attendancePercent(ctx, student, examIds) {
  let wd = 0, pr = 0;
  examIds.forEach((id) => { const a = ctx.attendance.get(`${id}|${student.id}`); if (a) { wd += Number(a.workingDays); pr += Number(a.present); } });
  return wd ? round((pr / wd) * 100, 1) : 100;
}

export function computeAggregate(ctx, student, mode = "staff") {
  const dist = pickDistribution(ctx, student); const scheme = schemeFor(ctx, student);
  if (!dist || !scheme) return null;
  const avail = availableExams(ctx, student, mode);
  if (!avail.length) return null;
  const rule = student.passRule === "33" ? "33" : "45";
  const table = ctx.tables[rule === "33" ? "special" : "standard"] || [];
  const perExam = {}; avail.forEach((e) => { perExam[e.key] = computeExam(ctx, student, e.inst.id); });
  const totalW = avail.reduce((s, e) => s + Number(e.weight), 0) || 1;
  const first = perExam[avail[0].key];
  const passPct = rule === "33" ? ctx.params.passSpecial ?? 33 : ctx.params.passStandard ?? 45;
  const rows = first.rows.map((r0) => {
    let on100 = 0, anyMissing = false;
    avail.forEach((e) => {
      const r = perExam[e.key]?.rows.find((x) => x.key === r0.key);
      if (!r) return; if (r.missing) anyMissing = true;
      on100 += F(ctx, "aggregatePart", { value: r.on100, weight: (Number(e.weight) / totalW) * 100 });
    });
    on100 = round(on100, dec(ctx));
    const passed = !anyMissing && (r0.isEffective || r0.isFourth ? on100 >= passPct : true);
    return { ...r0, comps: {}, total: on100, full: 100, on100, passed, ...gradeFor(on100, passed, table), missing: anyMissing };
  });
  const res = finalize(ctx, student, dist, rows, rule);
  res.perExam = perExam; res.examsUsed = avail.map((e) => e.name); res.examsExpected = scheme.exams.filter((e) => e.type === "school" && e.include === "Yes").length;
  res.partial = avail.length < res.examsExpected; res.attendance = attendancePercent(ctx, student, avail.map((e) => e.inst.id));
  const facts = { gpa: res.gpa, failedCount: res.failedCount, attendancePercent: res.attendance, program: student.program, passRule: rule, result: res.result, group: student.group };
  res.flags = evaluateConditions(ctx.conditions, "result", facts).flags;
  return res;
}

export function promotionOf(ctx, student, agg) {
  if (!agg) return { decision: "Hold", flags: [] };
  const facts = { gpa: agg.gpa, failedCount: agg.failedCount, attendancePercent: agg.attendance, program: student.program, passRule: agg.rule, result: agg.result, group: student.group };
  const o = evaluateConditions(ctx.conditions, "promotion", facts);
  return { decision: o.decision || "Promoted", flags: o.flags };
}

export function sscEligibility(ctx, student) {
  const ft = ctx.exams.find((e) => e.key === "finaltest");
  const res = ft ? computeExam(ctx, student, ft.id) : null;
  const agg = computeAggregate(ctx, student, "staff");
  const facts = { finalTestPassed: res && res.result === "Pass" ? 1 : 0, attendancePercent: agg ? agg.attendance : 100, gpa: res ? res.gpa : 0, program: student.program };
  const o = evaluateConditions(ctx.conditions, "ssc", facts);
  return { eligibility: o.eligibility || "Eligible", finalTest: res };
}

// ---------- merit ----------
function tieValue(r, names) {
  return names.map((n) => r.rows.find((x) => x.name.toLowerCase().startsWith(n.toLowerCase()))?.on100 || 0);
}
export function assignPositions(items, ctx) {
  const names = String(ctx.params.tieBreak || "").split(",").map((s) => s.trim()).filter(Boolean);
  const cmp = (a, b) => {
    if ((a.result.result === "Pass") !== (b.result.result === "Pass")) return a.result.result === "Pass" ? -1 : 1;
    if (b.result.totalMarks !== a.result.totalMarks) return b.result.totalMarks - a.result.totalMarks;
    const ta = tieValue(a.result, names), tb = tieValue(b.result, names);
    for (let i = 0; i < ta.length; i++) if (tb[i] !== ta[i]) return tb[i] - ta[i];
    return 0;
  };
  const scopes = { section: (s) => `${s.program}|${s.version}|${s.section}`, klass: (s) => `${s.program}|${s.version}`, group: (s) => `${s.program}|${s.group}` };
  items.forEach((it) => { it.pos = {}; });
  Object.entries(scopes).forEach(([name, keyOf]) => {
    const groups = new Map();
    items.forEach((it) => { const k = keyOf(it.student); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(it); });
    groups.forEach((list) => {
      [...list].sort(cmp).forEach((it, i) => { it.pos[name] = it.result.result === "Pass" ? i + 1 : null; it.pos[`${name}Of`] = list.length; });
    });
  });
  return items;
}
