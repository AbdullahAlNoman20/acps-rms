// FUTURE PLAN - one source for the Future Plan page and docs/FUTURE_SCOPE.md (run: npm run docs).
// Written as instructions. NB = important note.

export const SCHOOL_CHECKLIST = [
  { id: "marks", title: "Mark distribution of EVERY class and group", why: "Only Class IX Science came from the school's ERP chart. Other classes use sample numbers.", how: "Send the ERP 'Mark Distribution Chart - Details' PDF for each class, group and term. The IT Head then edits Mark Blueprint.", nb: "Check the pass mark of every part (Objective, Subjective, Practical) for both the 45 and the 33 rule." },
  { id: "ms", title: "Meaning of 'M.S' and the ICT formula", why: "The ERP chart has an 'M.S' column and the ICT row (Objective 25 + Practical 25 at 80%) does not add to 50.", how: "Ask the ERP vendor or the exam office. Then correct Mark Blueprint (ICT row) and Rule Studio if a formula changes.", nb: "Until answered ICT uses 25 + 25 = 50, multiply by 2." },
  { id: "civics", title: "Subject codes", why: "Civics code was given as 112 which is also Hindu religion. Primary and Class VI-VIII subjects have no Board code.", how: "Send the correct code list. Update Subject Library (code is the ID).", nb: "Do not change a code after marks are entered." },
  { id: "decisions", title: "Confirm the assumed rules", why: "Class X weights 20/20/25/35, grade C for 45-49, grace 3 marks in 1 subject, merit tie-break Math-English-Bangla, promotion and SSC eligibility rules.", how: "Management reads the list in Rule Studio and Exam Planner and says yes or gives the new value.", nb: "All of them can be changed by the IT Head any time." },
  { id: "status", title: "What each status code does", why: "AB, EX, WH, EXP, TR currently give 0 marks. Is that right for Exempted and Transferred?", how: "Decide per code. Edit in Status Codes.", nb: "" },
  { id: "files", title: "Logo, seal and signature pictures", why: "Transcripts show a text signature line only.", how: "Send clear PNG files of the school seal, Principal and Vice Principal signatures (digital signature is approved).", nb: "Backend step 'File storage' is needed to keep them safely." },
  { id: "people", title: "Real lists of teachers, students and classes", why: "The system holds 200 sample students and 8 sample teachers.", how: "Export from SICS to Excel. IT Head uses Easy Import. Teachers are added in Teacher Desk, then assigned in Teacher Planner.", nb: "Student ID is permanent. Roll is new each session." },
  { id: "calendar", title: "Academic calendar and working days", why: "Attendance needs working days per exam.", how: "Send the yearly calendar. Class teachers type working days in Attendance Book.", nb: "" },
  { id: "sms", title: "SMS provider", why: "Parent Connect saves messages but cannot send them.", how: "Choose a Bangladeshi SMS gateway, create an account (API key, sender name) and give it to the developer.", nb: "Ask for Bangla (Unicode) SMS support." },
  { id: "hosting", title: "Where the system will run (cloud)", why: "A server and database are needed so everyone uses the same data.", how: "Choose a cloud provider and a domain name. Give access to the developer.", nb: "Daily backup and 5-year audit storage must be on." },
  { id: "format", title: "Approve the transcript design", why: "Bangla and English versions, A4. Sample layout follows the school's old transcript.", how: "Print one transcript from Transcript Studio. Principal marks changes. IT Head or developer applies them.", nb: "" },
];

export const DEVELOPER_STEPS = [
  { id: "db", title: "1. Create the database", how: ["Make one table for each file in public/data (students, teachers, marks, exams ...). The README lists all 37 collections.", "Keep the 'id' of every record as the primary key.", "Fields that look like objects (components, rows, custom) can be JSON columns."], nb: "Do not rename fields - the screens expect these names." },
  { id: "api", title: "2. Connect the screens", how: ["Open src/Components/services/api.js and dataStore.js.", "Replace each function (list, get, create, update, remove, replace, upsertMany) with a fetch() to /api/<collection>.", "Remove the localStorage lines. Nothing else in the project changes."], nb: "Keep audit(): the server should write the Change Trail itself." },
  { id: "auth", title: "3. Real sign-in", how: ["Add POST /api/login that checks a hashed password and returns a token.", "Send the token with every request.", "Check the role and permission on the server for every request (the screen only hides buttons)."], nb: "users.json has demo plain-text passwords. Never ship them." },
  { id: "engine", title: "4. Results on the server", how: ["src/engine is plain JavaScript with no React. Run the same code on Node.", "Calculate when an exam moves to 'Calculated' and store the result.", "Publish copies the stored result so published results never change by accident."], nb: "Run npm run verify:engine after any change." },
  { id: "files", title: "5. File storage", how: ["Add upload for school seal, signatures, student photos.", "Store the file link in settings (seal, signatures) and read it in TranscriptView."], nb: "" },
  { id: "sms", title: "6. Real SMS", how: ["Add POST /api/sms/send that calls the provider.", "In SmsPage replace the api.create('smsLog') call with this endpoint; keep writing to smsLog."], nb: "Limit sending per user per hour." },
  { id: "sics", title: "7. SICS link (optional)", how: ["Until then use Easy Import with the same column names.", "Later write a nightly job that reads SICS and upserts students."], nb: "Student ID is the key." },
  { id: "backup", title: "8. Backup and retention", how: ["Daily database backup.", "Keep the audit table for 5 years.", "Test a restore once."], nb: "" },
  { id: "pwa", title: "9. Phone app feel (optional)", how: ["The project already has an install file (manifest). Add a service worker for offline marks entry.", "Users can use 'Add to Home screen' today."], nb: "" },
];

export const LATER_IDEAS = [
  ["Parent app and WhatsApp alerts", "Result and attendance alerts to parents."],
  ["Smart insights", "Weak subjects per class, improvement over exams, early warning for failing students."],
  ["ERP modules", "ANS (absence alerts) fills attendance. LMS and HRM can share the same students and teachers."],
  ["Online admission and fee link", "New students flow straight into Student Book."],
  ["Teacher leave and substitutes", "Move a teacher's batches to a substitute for a few days."],
];
