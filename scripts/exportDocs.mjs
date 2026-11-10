// Builds docs/FEATURE_GUIDE.md and docs/FUTURE_SCOPE.md from src/config/brand.js and roadmap.js (run: npm run docs).
import { writeFileSync, mkdirSync } from "node:fs";
import { FEATURES, BRAND } from "../src/config/brand.js";
import { SCHOOL_CHECKLIST, DEVELOPER_STEPS, LATER_IDEAS } from "../src/config/roadmap.js";

mkdirSync("docs", { recursive: true });
const feats = Object.values(FEATURES).filter((f) => f.steps);
let g = `# ${BRAND.name} - Feature Guide\n\n${BRAND.tagline}\n\n${BRAND.promise}\n\n`;
for (const f of feats) {
  g += `## ${f.name}\n*${f.tagline}*\n\n${f.what}\n\n**For:** ${f.who.join(", ")}\n\n${f.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n`;
  if (f.nb) g += `**NB:** ${f.nb}\n\n`;
  if (f.future) g += `**In the future:** ${f.future}\n\n`;
}
writeFileSync("docs/FEATURE_GUIDE.md", g);

let d = `# ${BRAND.name} - Future Scope\n\nNothing here stops the system from being used today. It tells the school and the developer what to do next.\n\n## A. What the school must give\n\n`;
SCHOOL_CHECKLIST.forEach((c, i) => { d += `${i + 1}. **${c.title}**\n   - Why: ${c.why}\n   - How: ${c.how}\n${c.nb ? `   - NB: ${c.nb}\n` : ""}\n`; });
d += `## B. Developer steps (connect the backend)\n\n`;
DEVELOPER_STEPS.forEach((s) => { d += `### ${s.title}\n${s.how.map((h, i) => `${i + 1}. ${h}`).join("\n")}\n${s.nb ? `\n**NB:** ${s.nb}\n` : ""}\n`; });
d += `## C. What each feature will do next\n\n${feats.filter((f) => f.future).map((f) => `- **${f.name}** - ${f.future}`).join("\n")}\n\n## D. Later ideas\n\n${LATER_IDEAS.map(([t, x]) => `- **${t}** - ${x}`).join("\n")}\n`;
writeFileSync("docs/FUTURE_SCOPE.md", d);
console.log("docs written:", feats.length, "features");
