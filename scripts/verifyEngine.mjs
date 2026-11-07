// Quick self-check of the result engine with the sample data (run: npm run verify:engine).
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCtx, computeExam, computeAggregate, assignPositions } from "../src/engine/calc.js";
import { evaluate } from "../src/engine/expression.js";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "data");
const load = (n) => JSON.parse(readFileSync(join(dir, `${n}.json`), "utf8"));
const names = ["ruleParams", "ruleFormulas", "ruleConditions", "gradeTables", "statusCodes", "markDistributions", "marks", "attendance", "exams", "examSchemes", "grace", "students"];
const data = Object.fromEntries(names.map((n) => [n, load(n)]));
const ctx = buildCtx(data);
let ok = true;
const check = (label, got, want) => { const pass = Math.abs(got - want) < 0.005; ok = ok && pass; console.log(pass ? "PASS" : "FAIL", label, got, "expected", want); };

// Worked examples from the SRS
check("Math 24 + 55*85.72% + 14*50%", 24 + evaluate("raw * pr / 100", { raw: 55, pr: 85.72 }) + evaluate("raw * pr / 100", { raw: 14, pr: 50 }), 78.15);
check("GPA (36 + 2) / 9", evaluate("min(cap, (sumGp + bonus) / divisor)", { sumGp: 36, bonus: 2, divisor: 9, cap: 5 }), 4.22);
check("Aggregate 80/70/60 at 25/25/50", [80, 70, 60].reduce((s, v, i) => s + evaluate("value * weight / 100", { value: v, weight: [25, 25, 50][i] }), 0), 67.5);

const sample = data.students.filter((s) => s.status === "Active");
const items = sample.filter((s) => s.program === "IX").map((s) => ({ student: s, result: computeExam(ctx, s, "2026-second") }));
assignPositions(items, ctx);
const pass = items.filter((i) => i.result.result === "Pass").length;
console.log(`Class IX second term: ${pass} pass, ${items.length - pass} fail`);
const x = sample.find((s) => s.program === "X" && s.passRule === "45");
const agg = computeAggregate(ctx, x, "staff");
console.log("Class X aggregate:", agg.examsUsed.join(", "), "GPA", agg.gpa, agg.letter, agg.result);
const special = sample.filter((s) => s.passRule === "33").map((s) => computeExam(ctx, s, "2026-second"));
console.log("33-rule students:", special.map((r) => `${r.result} GPA ${r.gpa} savedBy33=${!!r.savedBy33}`).join(" | "));
check("GPA within 0..5", agg.gpa >= 0 && agg.gpa <= 5 ? 1 : 0, 1);
process.exit(ok ? 0 : 1);
