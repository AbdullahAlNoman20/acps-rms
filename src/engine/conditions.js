// IF-THEN rules edited by the IT Head (Rules page). Scopes: result | promotion | ssc.
export const CONDITION_FIELDS = [
  { value: "gpa", label: "GPA" }, { value: "failedCount", label: "Number of failed subjects" },
  { value: "attendancePercent", label: "Attendance percent" }, { value: "program", label: "Class" },
  { value: "passRule", label: "Pass rule (45 or 33)" }, { value: "result", label: "Result (Pass or Fail)" },
  { value: "finalTestPassed", label: "Passed the Final Test (1 = yes, 0 = no)" }, { value: "group", label: "Group" },
];
export const CONDITION_OPS = ["=", "!=", ">", ">=", "<", "<="];
export const CONDITION_ACTIONS = [
  { value: "decision", label: "Set promotion decision" }, { value: "eligibility", label: "Set SSC eligibility" }, { value: "flag", label: "Show a flag on the report" },
];

function compare(a, op, b) {
  const na = Number(a), nb = Number(b);
  const numeric = a !== "" && b !== "" && !Number.isNaN(na) && !Number.isNaN(nb);
  const x = numeric ? na : String(a), y = numeric ? nb : String(b);
  switch (op) {
    case "=": return x === y; case "!=": return x !== y; case ">": return x > y;
    case ">=": return x >= y; case "<": return x < y; case "<=": return x <= y; default: return false;
  }
}

export function evaluateConditions(conditions = [], scope, facts = {}) {
  const out = { decision: "", eligibility: "", flags: [] };
  for (const c of conditions) {
    if (c.scope !== scope || c.enabled !== "Yes") continue;
    if (!(c.when || []).every((w) => compare(facts[w.field] ?? "", w.op, w.value))) continue;
    const { action, value } = c.then || {};
    if (action === "decision") out.decision = value;
    if (action === "eligibility") out.eligibility = value;
    if (action === "flag" && !out.flags.includes(value)) out.flags.push(value);
  }
  return out;
}
