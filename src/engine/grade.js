export function round(n, d = 2) {
  const f = 10 ** d;
  return Math.round((Number(n) + Number.EPSILON) * f) / f; // round half-up
}

export function gradeFor(on100, passed, rows = []) {
  if (!passed) return { letter: "F", gp: 0 };
  const sorted = [...rows].sort((a, b) => b.min - a.min);
  const hit = sorted.find((r) => on100 >= Number(r.min));
  const r = hit || sorted[sorted.length - 1] || { letter: "C", gp: 2 };
  return { letter: r.letter, gp: Number(r.gp) };
}

export function letterFromGpa(gpa, rows = []) {
  const sorted = [...rows].sort((a, b) => b.min - a.min);
  const hit = sorted.find((r) => gpa >= Number(r.min));
  return hit ? hit.letter : "F";
}
