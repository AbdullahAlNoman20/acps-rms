// Interaction tests: the new assignment, language and permission features.
import { readFileSync } from "node:fs";
import { render, waitFor, cleanup, fireEvent, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { routes } from "../src/Router";
import { dataStore } from "../src/Components/services/dataStore";
import { api } from "../src/Components/services/api";
import { ToastProvider } from "../src/Components/context/ToastContext";
import { LabelProvider } from "../src/Components/context/LabelContext";
import { AuthProvider } from "../src/Components/context/AuthContext";

const seed = (n) => JSON.parse(readFileSync(`public/data/${n}.json`, "utf8"));
const users = seed("users");
beforeAll(() => { window.scrollTo = () => {}; globalThis.fetch = async (u) => ({ ok: true, json: async () => seed(String(u).replace("/data/", "").replace(".json", "")) }); dataStore.init(); });
afterEach(cleanup);

async function open(userId, path) {
  const u = users.find((x) => x.id === userId);
  dataStore.setSession({ id: u.id, name: u.name, role: u.role, email: u.email, teacherId: u.teacherId || "", studentId: u.studentId || "", avatarColor: u.avatarColor });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const r = render(<ToastProvider><LabelProvider><AuthProvider><RouterProvider router={router} /></AuthProvider></LabelProvider></ToastProvider>);
  await waitFor(() => expect(r.container.textContent).not.toMatch(/Loading\.\.\./), { timeout: 8000 });
  return r;
}

describe("Teacher Planner", () => {
  it("assigns a class teacher and a subject teacher and saves", async () => {
    await open("U-ITH", "/app/it-head/planner?program=VI&version=English&section=B");
    const ct = await screen.findByLabelText("Class teacher");
    fireEvent.change(ct, { target: { value: "T05" } });
    const math = screen.getAllByLabelText(/Teacher for Mathematics/)[0];
    fireEvent.change(math, { target: { value: "T06" } });
    fireEvent.click(screen.getByRole("button", { name: /Save plan/ }));
    await waitFor(async () => {
      const b = await api.list("batches");
      expect(b.find((x) => x.program === "VI" && x.version === "English" && x.section === "B" && x.isClassTeacher === "Yes").teacherId).toBe("T05");
      expect(b.find((x) => x.program === "VI" && x.version === "English" && x.section === "B" && x.courseCode === "109").teacherId).toBe("T06");
    });
  });
});

describe("Teacher Desk", () => {
  it("adds a new teacher with a login", async () => {
    await open("U-ITH", "/app/it-head/teachers/new");
    const inputs = (await screen.findAllByRole("textbox"));
    fireEvent.change(inputs[0], { target: { value: "Mrs. Test Teacher" } });
    fireEvent.change(inputs[3], { target: { value: "newteacher@acps.edu.bd" } });
    fireEvent.click(screen.getByRole("button", { name: /Add teacher/ }));
    await waitFor(async () => { expect((await api.list("teachers")).some((t) => t.name === "Mrs. Test Teacher")).toBe(true); expect((await api.list("users")).some((u) => u.email === "newteacher@acps.edu.bd" && u.role === "teacher")).toBe(true); });
  });
});

describe("Transcript language and brand", () => {
  it("switches to Bangla", async () => {
    const s = seed("students").find((x) => x.program === "X" && x.status === "Active");
    const r = await open("U-ITH", `/app/it-head/results/view/${s.id}/2026-first`);
    fireEvent.click(await screen.findByRole("button", { name: "বাংলা" }));
    await waitFor(() => expect(r.container.textContent).toContain("একাডেমিক ট্রান্সক্রিপ্ট"));
    expect(r.container.textContent).toContain("সর্বোচ্চ");
  });
  it("shows brand names in the menu and a how-to box", async () => {
    const r = await open("U-ITH", "/app/it-head/exams");
    expect(r.container.textContent).toContain("Exam Journey");
    expect(r.container.textContent).toContain("How to use Exam Journey");
  });
  it("teacher menu hides IT Head tools", async () => {
    const r = await open("U-T1", "/app/teacher/dashboard");
    expect(r.container.textContent).toContain("Marks Desk"); expect(r.container.textContent).not.toContain("Teacher Planner");
  });
});
