// Smoke test: opens every important page as the right role and checks nothing crashes.
import { readFileSync } from "node:fs";
import { render, waitFor, cleanup } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { routes } from "../src/Router";
import { dataStore } from "../src/Components/services/dataStore";
import { ToastProvider } from "../src/Components/context/ToastContext";
import { LabelProvider } from "../src/Components/context/LabelContext";
import { AuthProvider } from "../src/Components/context/AuthContext";

const seed = (n) => JSON.parse(readFileSync(`public/data/${n}.json`, "utf8"));
const users = seed("users");
const students = seed("students");
const batches = seed("batches");
const classX = students.find((s) => s.program === "X" && s.status === "Active");
const ixMathBatch = batches.find((b) => b.teacherId === "T01" && b.program === "IX" && b.version === "Bangla" && b.section === "A" && b.courseCode === "109" && b.group === "Science");
const demoStudent = users.find((u) => u.id === "U-S1").studentId;

beforeAll(() => {
  window.scrollTo = () => {};
  globalThis.fetch = async (url) => ({ ok: true, json: async () => seed(String(url).replace("/data/", "").replace(".json", "")) });
  dataStore.init();
});
afterEach(cleanup);

async function open(userId, path) {
  const u = users.find((x) => x.id === userId);
  dataStore.setSession({ id: u.id, name: u.name, role: u.role, email: u.email, teacherId: u.teacherId || "", studentId: u.studentId || "", avatarColor: u.avatarColor });
  const errors = []; const spy = vi.spyOn(console, "error").mockImplementation((...a) => errors.push(a.map(String).join(" ")));
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const { container } = render(<ToastProvider><LabelProvider><AuthProvider><RouterProvider router={router} /></AuthProvider></LabelProvider></ToastProvider>);
  await waitFor(() => { expect(container.textContent).not.toMatch(/Loading\.\.\./); expect(container.textContent.length).toBeGreaterThan(80); }, { timeout: 8000 });
  spy.mockRestore();
  const real = errors.filter((e) => !/act\(|not wrapped|Warning: (An update|Each child|validateDOMNesting)/.test(e));
  expect(real, `${path}: ${real.join("\n")}`).toEqual([]);
  expect(container.textContent).not.toMatch(/Page not found|You do not have access/);
}

const IT = ["dashboard", "exams", "exams/2026-final", "exams/2026-finaltest", "exams/2026-ssc", "results", `results/view/${classX.id}/aggregate`, `results/view/${classX.id}/2026-pretest`, "reports", "reports/tabulation", "reports/merit", "reports/subjectwise", "reports/fail", "reports/grade", "reports/progress", "reports/teachermarks",
  "ssc", "year-end", "extensions", "corrections", "grace", "special-pass", "students/import", "students/curriculum", "data/students", "data/students/new", `data/students/${classX.id}`, "data/teachers", "data/users", "data/batches", "data/courses", "data/markDistributions", "data/markDistributions/md-IX-X-Science",
  "data/examSchemes", "data/exams", "data/gradeTables", "data/curriculum", "data/customFields", "data/statusCodes", "data/programs", "data/boardResults", "data/smsTemplates", "setup", "lists", "approvals", "customize", "classes", "classes/IX", "classes/X", `students/${classX.id}`, "teachers", "teachers/T01", "teachers/new", "planner", "planner?program=IX&version=Bangla&section=A", "guide", "future", "markchart/md-IX-X-Science", "rules", "labels", "permissions", "sms", "support", "support/new", "support/TK-1", "audit", "settings"];
describe("IT Head", () => IT.forEach((p) => it(p, () => open("U-ITH", `/app/it-head/${p}`))));
describe("Teacher", () => ["classes", "classes/IX", `students/${classX.id}`, "guide", "dashboard", "entry", `entry/2026-final/${ixMathBatch.id}`, "attendance", "extension", "extension/new", "corrections", "corrections/new", "my-class", "reports", "reports/teachermarks", "sms", "support", "settings"].forEach((p) => it(p, () => open("U-T1", `/app/teacher/${p}`))));
describe("Principal", () => ["classes", "classes/X", "approvals", "guide", "dashboard", "exams", "exams/2026-finaltest", "results", "extensions", "grace", "year-end", "special-pass", "sms", "audit", "reports/merit"].forEach((p) => it(p, () => open("U-PRI", `/app/authority/${p}`))));
describe("Vice principal and exam authority", () => { it("vp review", () => open("U-VP", "/app/authority/exams/2026-finaltest")); it("corrections", () => open("U-EXA", "/app/authority/corrections")); it("board", () => open("U-EXA", "/app/authority/data/boardResults")); });
describe("Student and parent", () => { ["dashboard", "results", "results/2026-first", "results/aggregate", "ssc", "contact", "support", "settings", "guide"].forEach((p) => it(p, () => open("U-S1", `/app/student/${p}`))); it("parent", () => open("U-P1", "/app/student/dashboard")); it("student id linked", () => expect(demoStudent).toBeTruthy()); });
describe("IT admin", () => it("support", () => open("U-ITA", "/app/it-head/support")));
