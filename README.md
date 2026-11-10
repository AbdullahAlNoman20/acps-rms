# ACPS ResultHub

*From marks to merit - simple, safe and signed.* Result system for Adamjee Cantonment Public School
(React 18 + Vite + Tailwind). Data is kept in JSON files and the browser, so a backend can be connected later without changing any screen.

## Start

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 126 checks (every page opens for the right role + key flows)
npm run build
npm run docs     # rewrites docs/ from the feature registry
```

Password for every test account: `Demo@123`

| Role | Email |
|---|---|
| IT Head | ithead@acps.edu.bd |
| IT Admin (support only) | itadmin@acps.edu.bd |
| Exam Authority | examauthority@acps.edu.bd |
| Principal / Vice Principal | principal@acps.edu.bd / vp@acps.edu.bd |
| Teacher (Mathematics, class teacher IX-Bangla-A) | teacher1@acps.edu.bd (up to teacher8) |
| Student (Class X) / Student (Class IX) | student1@acps.edu.bd / student2@acps.edu.bd |
| Parent | parent1@acps.edu.bd |

## Where to change things (one place each)

| To change | Open |
|---|---|
| Product name, feature names, descriptions, how-to steps, "in the future" notes | `src/config/brand.js` |
| Colors and fonts | `src/theme/tokens.js` (fonts also in `index.html`) |
| Shared button/input/card styles | `src/theme/ui.js` |
| Menus and the phone bottom bar | `src/Components/constants/navigation.js` |
| A new data list (page, form, search, Excel, audit appear by themselves) | `src/Components/constants/entitySchemas.js` |
| Result maths | `src/engine/` (plain JavaScript, no React) |
| School checklist and developer steps | `src/config/roadmap.js` |
| Where data lives (for the backend developer) | `src/Components/services/api.js` and `dataStore.js` |

```
src/
  config/        brand.js  roadmap.js  appConfig.js
  theme/         tokens.js  ui.js
  engine/        calc.js  expression.js  conditions.js  grade.js  reports.js
  Components/    constants/  context/  hooks/  layout/  services/  Shared/  utils/
  Pages/         Home  Login  common/ (shared pages)
                 modules/itHead  modules/teacher  modules/authority  modules/student
public/data/     sample JSON, one file per collection
docs/            FEATURE_GUIDE.md  FUTURE_SCOPE.md   (generated)
tests/           smoke, flows, ui
```

## Read next

- **In the app:** How-To Guide (every feature, steps, NB) and Future Plan (school checklist, developer steps, later ideas).
- **`docs/FEATURE_GUIDE.md`** and **`docs/FUTURE_SCOPE.md`** - the same content as files, for sharing and printing.

## Honest limits of this version

Data stays in the browser (use Safe Box > Download backup). SMS is saved to a log, not sent. PDF is the browser's Print > Save as PDF.
Class I-VIII mark distributions are placeholders until the school sends them. Passwords in `users.json` are demo text.
