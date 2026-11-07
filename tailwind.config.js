// Colors, fonts, shadows come ONLY from src/theme/tokens.js (single source of truth).
import { colors, fonts, shadows } from "./src/theme/tokens.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors,
      fontFamily: { sans: fonts.sans },
      boxShadow: shadows,
    },
  },
  plugins: [],
};
