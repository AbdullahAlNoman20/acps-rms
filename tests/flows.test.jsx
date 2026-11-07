// Behaviour tests for the key business flows (data layer + engine), without a browser.
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { dataStore } from "../src/Components/services/dataStore";
import { api } from "../src/Components/services/api";
import { buildCtx, computeExam, computeAggregate, promotionOf, sscEligibility } from "../src/engine/calc";
import { COLLECTIONS } from "../src/config/appConfig";

const seed = (n) => JSON.parse(readFileSync(`public/data/${n}.json`, "utf8"));
const load = async () => { const d = {}; for (const n of COLLECTIONS) d[n] = await api.list(n); return d; };

beforeAll(() => { globalThis.fetch = async (u) => ({ ok: true, json: async () => seed(String(u).replace("/data/", "").replace(".json", "")) }); dataStore.init(); });

describe("33 pass rule", () => {
  it("switching ONE student to 33 changes only that student", async () => {
    let d = await load(); let ctx = buildCtx(d);
    const fail = d.students.find((s) => s.status === "Active" && s.passRule === "45" && computeExam(ctx, s, "2026-second")?.result === "Fail");
    expect(fail).toBeTruthy();
    const other = d.students.find((s) => s.id !== fail.id && s.passRule === "45" && s.program === fail.program);
    const before = computeExam(ctx, other, "2026-second");
    await api.update("students", fail.id, { passRule: "33" });
    d = await load(); ctx = buildCtx(d);
    const after = computeExam(ctx, d.students.find((s) => s.id === fail.id), "2026-second");
    expect(after.rule).toBe("33");
    expect(computeExam(ctx, d.students.find((s) => s.id === other.id), "2026-second").gpa).toBe(before.gpa);
  });
});

describe("workflow data", () => {
  it("grace marks count only after approval", async () => {
    let d = await load(); const g = d.grace.find((x) => x.status === "pending");
    const s = d.students.find((x) => x.id === g.studentId);
    const a = computeExam(buildCtx(d), s, g.examId).rows.find((r) => r.code === g.courseCode);
    await api.update("grace", g.id, { status: "approved" });
    d = await load();
    const b = computeExam(buildCtx(d), d.students.find((x) => x.id === g.studentId), g.examId).rows.find((r) => r.code === g.courseCode);
    expect(b.total).toBeGreaterThanOrEqual(a.total + g.marks - 0.01);
  });
  it("audit log records every change", async () => { const d = await load(); expect(d.audit.some((a) => a.entity === "students" && a.action === "update")).toBe(true); });
  it("class X aggregate uses 4 school exams with scheme weights", async () => {
    const d = await load(); const ctx = buildCtx(d); const x = d.students.find((s) => s.program === "X" && s.status === "Active");
    const agg = computeAggregate(ctx, x, "staff"); expect(agg.examsUsed).toEqual(["First Term", "Second Term", "Pre-Test", "Final Test"]); expect(agg.gpa).toBeGreaterThanOrEqual(0);
    expect(["Eligible", "Not eligible"]).toContain(sscEligibility(ctx, x).eligibility);
  });
  it("student only sees published exams in aggregate", async () => {
    const d = await load(); const ctx = buildCtx(d); const x = d.students.find((s) => s.program === "X" && s.status === "Active");
    expect(computeAggregate(ctx, x, "student").examsUsed).not.toContain("Final Test");
    expect(promotionOf(ctx, x, computeAggregate(ctx, x, "staff")).decision).toBe("Passed Out");
  });
  it("editing a formula changes results (IT Head can change logic)", async () => {
    let d = await load(); const s = d.students.find((x) => x.program === "IX" && x.passRule === "45" && x.status === "Active");
    const before = computeExam(buildCtx(d), s, "2026-first").totalMarks;
    await api.update("ruleFormulas", "componentConvert", { expr: "raw * pr / 100 * 0.9" });
    d = await load(); const after = computeExam(buildCtx(d), s, "2026-first").totalMarks;
    expect(after).toBeLessThan(before);
  });
});
