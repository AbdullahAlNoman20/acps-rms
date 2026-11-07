# ACPS RMS - Result Management System (frontend)

Adamjee Cantonment Public School - Result Module. React 18 + Vite + Tailwind. Data comes from JSON files and is kept in
`localStorage`, so a backend developer can replace it later **without touching any page**.

## Run

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build
npm test             # 97 checks: every page opens for the right role + business flows
npm run verify:engine
npm run seed         # regenerate the sample data in public/data
```

Demo password for every account: `Demo@123`

| Role | Email |
|---|---|
| IT Head | ithead@acps.edu.bd |
| IT Admin | itadmin@acps.edu.bd |
| Exam Authority | examauthority@acps.edu.bd |
| Principal | principal@acps.edu.bd |
| Vice Principal | vp@acps.edu.bd |
| Teacher (Math, class teacher IX-Bangla-A) | teacher1@acps.edu.bd ... teacher8@acps.edu.bd |
| Student (Class X) | student1@acps.edu.bd |
| Student (Class IX) | student2@acps.edu.bd |
| Parent of student1 | parent1@acps.edu.bd |

Sample data: 200 students (Class I-X, Bangla and English version, sections A and B), 6 alumni with SSC results, 8 teachers,
exams First, Second, Final, Pre-Test, Final Test, SSC. Settings > "Reset to demo data" restores everything.

## Folder structure

```
src/
  main.jsx  Router.jsx  Root.jsx  index.css
  theme/            tokens.js (colors, fonts)  ui.js (shared style classes)   <- change the look here ONLY
  config/           appConfig.js (names, storage key, collection list)
  engine/           calc.js (result engine)  expression.js (safe formulas)  conditions.js  grade.js  reports.js
  Components/
    constants/      roles.js  navigation.js (menus)  entitySchemas.js (every list)  examStatus.js
    context/        AuthContext  ToastContext  LabelContext
    hooks/          useAuth useCollection useResultData useBasePath useLabel useToast
    services/       dataStore.js  api.js          <- the ONLY files that know where data lives
    layout/         DashboardLayout  Sidebar  Topbar
    Shared/         Button Card DataTable CrudPage FormFields RowsEditor TranscriptView NoteBox ...
    utils/          format  ids  excel
  Pages/
    Home  Login
    common/         pages used by several roles (Exams, Results, Reports, Rules, Tickets ...)
    modules/
      itHead/       layout/  pages/  ITHeadRoutes.jsx
      teacher/      layout/  pages/  TeacherRoutes.jsx
      authority/    layout/  pages/  AuthorityRoutes.jsx   (Exam Authority, Principal, Vice Principal)
      student/      layout/  pages/  StudentRoutes.jsx     (Student and Parent)
public/data/        sample JSON (one file per collection)
scripts/            generateSeed.mjs  verifyEngine.mjs
tests/              smoke.test.jsx  flows.test.jsx
```

## What the IT Head can change without a developer

| Need | Where |
|---|---|
| Marks, parts, PR%, pass marks (45 and 33), joint subjects, 4th subject, GPA divisor | Mark distribution |
| Pass %, grace limit, minimum attendance, entry days, extension limit, merit tie-break | Rules and formulas > Numbers |
| Formulas (conversion, GPA, bonus, aggregate) with a test box | Rules and formulas > Formulas |
| IF-THEN rules for promotion, SSC eligibility, report flags | Rules and formulas > Conditions |
| Exams of each class, weights, board exam (Class X) | Exam schemes |
| Grades and grade points (45 table, 33 table, GPA letters) | Grade tables |
| Subjects and curriculum per class and group | Courses, Curriculum |
| Any heading, menu name or column title | Names and labels |
| New information column on Students, Teachers, Courses | Custom fields (appears on form, list, Excel, import) |
| Who can do what | Permissions (tick boxes) |
| Every list (classes, sections, shifts, sessions, status codes...) | Other lists |

To add a **new list** to the system: add one object to `Components/constants/entitySchemas.js`. The list page, add/edit page, search,
filters, Excel export, custom fields and audit log appear automatically.

## Backend hand-over

All data access goes through `Components/services/api.js` (`list, get, create, update, remove, replace, upsertMany`).
Replace the bodies with HTTP calls (`GET/POST/PUT/DELETE /api/<collection>`); no page changes. Passwords in `users.json` are demo plain
text - the backend must hash them. Authentication/permissions must be enforced on the server too (the frontend only hides things).

Collections (each is `public/data/<name>.json`): settings, labels, customFields, branches, versions, programs, groups, shifts, sections,
sessions, courses, curriculum, markDistributions, gradeTables, statusCodes, ruleParams, ruleFormulas, ruleConditions, examSchemes, exams,
students, teachers, users, batches, marks, submissions, attendance, extensions, corrections, grace, boardResults, smsTemplates, smsLog,
tickets, audit, permissions, yearEnd.

The result engine (`src/engine`) is plain JavaScript with no React; it can be ported to the server or run in both places.

## Business rules built in (from the SRS and client answers)

- Pass 45 for everyone. IT Head switches ONE student to the 33 rule (Special pass page); only that student's subject pass, part pass,
  joint pass and grade use the 33 values. Grade C for 33-49 under the 33 rule.
- Component marks = raw x PR% / 100; subject on 100 = total x M.J; joint subjects (Bangla, English) share one result and combined pass.
- 4th subject: only points above the deduct value are added; failing it does not fail the student. GPA = (sum GP + bonus) / divisor, max 5.
- Status codes AB, EX, WH, EXP, TR give 0 marks and 0 GP.
- Aggregate per scheme: Class I-IX First 25 + Second 25 + Final 50; Class X First, Second, Pre-Test, Final Test, then SSC (Board result typed in).
- Workflow: entry window (15 days) > teachers submit > extension (Teacher asks, IT Head recommends, Principal approves, max 2) >
  calculation > IT Head verifies > Principal/VP review and sign > publish. Corrections need IT Head and Exam Authority.

## Assumptions to confirm with the school (all editable in the app)

Class X weights 20/20/25/35; grade C (2.00) for 45-49 under the 45 rule; grace limit 3 marks in 1 subject; merit tie-break Math, English,
Bangla; promotion: 1 failed subject = re-exam, more = repeat, attendance below 50 = hold; SSC eligibility = pass Final Test and 50% attendance;
monthly test PR% 50; ICT 25 + 25 practical; Class I-VIII distributions are placeholders (only Class IX Science comes from the school's ERP chart).

## Known limits of this version

Data lives in the browser (clear site data = back to demo data; use Settings > Download backup). SMS is saved to a log, not sent.
PDF = browser Print > Save as PDF. Year-end rollover changes the local student records (take a backup first).
