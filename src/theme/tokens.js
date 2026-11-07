// CENTRAL DESIGN TOKENS - colors from the school logo (green wreath, crimson lettering, magenta star).
// Change a color here and the whole app (Tailwind classes) changes.

export const colors = {
  brand: {
    50: "#ECF8F1", 100: "#D3EFE0", 200: "#A7DFC2", 300: "#6FC99C", 400: "#33AE75",
    500: "#0B9159", 600: "#087A49", 700: "#06603A", 800: "#05492C", 900: "#03321E", 950: "#021F13",
  },
  crimson: { 50: "#FDEEEE", 100: "#F9D5D5", 500: "#B01616", 600: "#971212", 700: "#7C0E0E" },
  magenta: { 50: "#FDEDF5", 100: "#FAD3E6", 500: "#D6287B", 600: "#B81E66" },
  gold: { 50: "#FFF8E1", 100: "#FDEBB0", 500: "#E8B923", 600: "#C99A0E" },
  cream: { 50: "#FBFAEF", 100: "#F5F3DC" },
  ink: {
    50: "#F6F7F6", 100: "#E9EBEA", 200: "#D3D7D5", 300: "#B2B8B5", 400: "#8A928E",
    500: "#667069", 600: "#4B534E", 700: "#363D39", 800: "#232825", 900: "#141816",
  },
};

export const fonts = {
  sans: ['"Hind Siliguri"', "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
};

export const shadows = {
  card: "0 1px 2px rgba(20,24,22,0.05), 0 1px 3px rgba(20,24,22,0.06)",
};

// Status -> badge tone (used by <StatusBadge />). Tones map to Tailwind color families.
export const STATUS_TONES = {
  setup: "gray", entry_open: "blue", entry_closed: "amber", calculated: "violet", verified: "teal",
  sent: "orange", vp_reviewed: "indigo", principal_signed: "green", published: "green", board: "gray",
  draft: "gray", submitted: "blue", locked: "green", missing: "red", requested: "amber",
  recommended: "blue", approved: "green", rejected: "red", pending: "amber", applied: "green",
  open: "amber", in_progress: "blue", resolved: "green", closed: "gray",
  Pass: "green", Fail: "red", Active: "green", Inactive: "gray", "Passed Out": "indigo", TC: "gray",
  Promoted: "green", Repeat: "red", "Re-exam": "amber", Hold: "orange", Eligible: "green", "Not eligible": "red",
  low: "gray", normal: "blue", high: "red", Yes: "green", No: "gray",
};
