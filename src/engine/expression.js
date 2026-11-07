// Safe formula evaluator. IT Head can edit formulas (e.g. "raw * pr / 100") from the UI.
// Only numbers, operators, brackets, the listed variables and the helper functions below are allowed.

const FNS = { min: Math.min, max: Math.max, round: Math.round, floor: Math.floor, ceil: Math.ceil, abs: Math.abs, sqrt: Math.sqrt, pow: Math.pow };
const SAFE_CHARS = /^[0-9A-Za-z_+\-*/().,\s<>=!&|?:%]*$/;

export function parseVars(text = "") {
  return String(text).split(",").map((v) => v.trim()).filter(Boolean);
}

export function validateExpression(expr, vars = []) {
  const text = String(expr || "").trim();
  if (!text) return { ok: false, error: "The formula is empty." };
  if (!SAFE_CHARS.test(text)) return { ok: false, error: "Only numbers, + - * / ( ) and the listed words are allowed." };
  const allowed = new Set([...vars, ...Object.keys(FNS)]);
  const words = text.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
  const unknown = words.filter((w) => !allowed.has(w));
  if (unknown.length) return { ok: false, error: `Unknown word: ${[...new Set(unknown)].join(", ")}. You can use: ${vars.join(", ")}` };
  try {
    const fn = new Function(...vars, ...Object.keys(FNS), `"use strict"; return (${text});`);
    const sample = fn(...vars.map(() => 1), ...Object.values(FNS));
    if (typeof sample !== "number" && typeof sample !== "boolean") return { ok: false, error: "The formula must give a number." };
  } catch (e) {
    return { ok: false, error: "The formula is not written correctly." };
  }
  return { ok: true, error: "" };
}

const cache = new Map();
export function evaluate(expr, scope = {}, fallback = 0) {
  const vars = Object.keys(scope);
  const key = `${vars.join(",")}::${expr}`;
  try {
    let fn = cache.get(key);
    if (!fn) {
      const v = validateExpression(expr, vars);
      if (!v.ok) return fallback;
      fn = new Function(...vars, ...Object.keys(FNS), `"use strict"; return (${expr});`);
      cache.set(key, fn);
    }
    const out = fn(...vars.map((k) => Number(scope[k]) || 0), ...Object.values(FNS));
    return Number.isFinite(Number(out)) ? Number(out) : fallback;
  } catch {
    return fallback;
  }
}
