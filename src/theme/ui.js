// CENTRAL STYLE CLASSES. Every shared component takes its look from here + tokens.js.
export const ui = {
  input: "w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-ink-50 disabled:text-ink-500",
  label: "mb-1 block text-xs font-semibold text-ink-700",
  help: "mt-1 text-xs text-ink-500",
  error: "mt-1 text-xs font-medium text-crimson-600",
  btnBase: "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-50",
  btn: {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50",
    danger: "bg-crimson-500 text-white hover:bg-crimson-600",
    soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
    ghost: "text-ink-600 hover:bg-ink-100",
  },
  btnSize: { md: "px-4 py-2.5 text-sm", sm: "px-3 py-1.5 text-xs" },
  card: "rounded-xl border border-ink-100 bg-white shadow-card",
  th: "bg-ink-50 px-3 py-2.5 text-left text-xs font-semibold text-ink-500",
  td: "px-3 py-2.5 align-top text-sm text-ink-700",
  tones: {
    gray: "bg-ink-100 text-ink-600", blue: "bg-blue-50 text-blue-700", amber: "bg-amber-50 text-amber-700", violet: "bg-violet-50 text-violet-700",
    teal: "bg-teal-50 text-teal-700", orange: "bg-orange-50 text-orange-700", indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-brand-50 text-brand-700", red: "bg-crimson-50 text-crimson-600",
  },
  notes: {
    info: "border-blue-100 bg-blue-50/60 text-ink-700", tip: "border-brand-100 bg-brand-50/70 text-ink-700",
    warning: "border-amber-200 bg-amber-50 text-ink-700", success: "border-brand-200 bg-brand-50 text-brand-800",
  },
};
