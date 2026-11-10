// BRAND + FEATURE REGISTRY - the single place for product name, feature names, descriptions and how-to steps.
// Menus, page headers, the Home page, the How-To Guide and the Future Plan all read from here.
// To rename a feature or improve its instructions, edit it here once.
import {
  FiClipboard, FiAward, FiBarChart2, FiFlag, FiTrendingUp, FiClock, FiEdit3, FiPercent, FiCheckCircle, FiGrid, FiUsers, FiUpload, FiLayers, FiUser,
  FiUserCheck, FiLock, FiBookOpen, FiCalendar, FiList, FiSliders, FiTag, FiSend, FiLifeBuoy, FiActivity, FiSettings, FiCheckSquare, FiPhone,
  FiHelpCircle, FiMap, FiHome, FiDatabase, FiCompass, FiShield, FiCopy, FiInbox,
} from "react-icons/fi";

export const BRAND = {
  name: "ACPS ResultHub",
  short: "ResultHub",
  tagline: "From marks to merit - simple, safe and signed.",
  promise: "Teachers enter marks. The system does the maths. The Principal signs. Parents see the result.",
};

// roles shown in the guide
const T = "Teacher", IT = "IT Head", EA = "Exam Authority", PR = "Principal", VP = "Vice Principal", ST = "Student", PA = "Parent";

export const FEATURES = {
  home: { name: "Home", icon: FiHome, tagline: "Your starting point." },
  examJourney: {
    name: "Exam Journey", icon: FiClipboard, tagline: "Follow every exam from marks to published result.",
    what: "Every exam moves through clear steps: marks entry, calculation, checking, signing and publishing. You always see the step an exam is in and the one button to press next.",
    who: [IT, PR, VP], steps: ["Open an exam from the list.", "Read 'What happens next' - it tells you the one thing to do.", "Press the big button in 'Next action'.", "If something is wrong, use 'Return with reason' - nothing is lost."],
    nb: "A published result can be withdrawn, fixed and published again. Students never see unpublished results.", future: "Same screens; the server will keep the status and send alerts (SMS/email) when an exam changes step.",
  },
  marksDesk: {
    name: "Marks Desk", icon: FiEdit3, tagline: "Enter marks class by class - even from a phone.",
    what: "Teachers see only their own classes and subjects. Each student has a small card with boxes for every part (Objective, Subjective, Practical, Monthly test). Totals show while you type.",
    who: [T], steps: ["Choose the exam, then press 'Enter marks' next to your class and subject.", "Type the marks. Use a status (for example Absent) instead of marks when needed.", "Press 'Save draft' as often as you like.", "Press 'Submit marks' when everything is correct - the batch locks."],
    nb: "After Submit you cannot change marks. Use Correction Desk. Need more days? Use Extra Time.", future: "Marks will save to the server automatically while typing; offline saving can be added.",
  },
  attendanceBook: {
    name: "Attendance Book", icon: FiCheckSquare, tagline: "Working days, days present and a remark for every student.",
    what: "Class teachers fill attendance and a short remark once per exam. It prints on the transcript and feeds the attendance rules.",
    who: [T], steps: ["Choose your class and the exam.", "Type working days and days present.", "Choose a remark.", "Press Save."], nb: "Attendance locks when the exam is published. Below 50% attendance shows a warning flag.",
    future: "Daily attendance from the ANS (Absent Notification) module will fill these numbers automatically.",
  },
  extraTime: {
    name: "Extra Time", icon: FiClock, tagline: "Ask for more days. Get a clear yes or no.",
    what: "A teacher asks for more days with a reason. The IT Head recommends, the Principal approves, and the exam's last date moves by itself. The limit (2 times) is set in Rule Studio.",
    who: [T, IT, PR], steps: ["Teacher: press 'Ask for more time', choose the exam, write the reason.", "IT Head: press Recommend (or Reject).", "Principal: press Approve (or Reject).", "The end date of the exam changes automatically."],
    nb: "One exam can be extended at most the number of times set in Rule Studio.", future: "Teachers will get an SMS or app alert when the answer is ready.",
  },
  correctionDesk: {
    name: "Correction Desk", icon: FiEdit3, tagline: "Fix a mark safely, with two approvals and a trail.",
    what: "After marks are submitted a teacher cannot edit them. A correction request needs approval from the IT Head and the Exam Authority. The old and new marks are kept in the Change Trail.",
    who: [T, IT, EA], steps: ["Teacher: press 'New correction request', choose batch, exam, student and part.", "Type the correct marks and the reason.", "IT Head and Exam Authority press Approve.", "After both approvals the marks change by themselves."],
    nb: "If one approver rejects, nothing changes.", future: "Approvers will be notified by SMS or email.",
  },
  graceDesk: {
    name: "Grace Desk", icon: FiPercent, tagline: "Small extra marks - limited, approved, never hidden.",
    what: "For a student just below the pass mark. The limit (marks and subjects) is set in Rule Studio. Original marks never change; grace is shown separately on the transcript.",
    who: [IT, EA], steps: ["IT Head: choose exam, class, student and the failed subject.", "Type the grace marks and the reason.", "Exam Authority presses Approve.", "Approved grace counts in the result at once."],
    nb: "Pending grace marks do not count until approved.", future: "A written approval letter (PDF) can be attached to each grace.",
  },
  passSwitch: {
    name: "Pass Switch", icon: FiCheckCircle, tagline: "Pass one student at 33 with a single tap.",
    what: "Everyone passes at 45. If the school decides to pass a failed student at 33, switch only that student. Their subject pass, part pass, joint pass and grade then use the 33 values. Nobody else changes.",
    who: [IT, EA, PR], steps: ["Choose the exam (or the yearly aggregate).", "Failed students are listed with a preview of the result at 33.", "Write a short reason and press 'Switch to 33 rule'.", "To undo, press 'Back to 45'."],
    nb: "The transcript shows that the 33 rule was used. Actual marks are never changed.", future: "The approving authority's name and date will be stored with each switch.",
  },
  resultBoard: {
    name: "Result Board", icon: FiAward, tagline: "Every student's marks, grade, GPA and position.",
    what: "Pick an exam or the whole year and a class. See GPA, grade, pass or fail and merit position (section, class, group) at once. Open any student for the printable transcript.",
    who: [IT, EA, PR, VP, T], steps: ["Choose Exam and Class at the top.", "Narrow by version, section or group if you want.", "Press 'Transcript' to open one student.", "Press 'Export Excel' to save the list."],
    nb: "Teachers see published results of the section where they are class teacher.", future: "Results will be calculated and stored on the server when an exam is verified.",
  },
  transcript: { name: "Transcript Studio", icon: FiAward, tagline: "A clean transcript in English or Bangla - print or save as PDF.", what: "Subjects, marks, grade, highest marks, GPA, position, attendance, remarks and digital signatures on one A4 page.", who: [IT, PR, ST, PA], steps: ["Open a result.", "Switch language if needed.", "Press 'Print or save as PDF'."], nb: "Choose 'Save as PDF' in the print window.", future: "School seal and signature pictures will be added from Safe Box." },
  reportShelf: {
    name: "Report Shelf", icon: FiBarChart2, tagline: "Eight ready reports. Print or Excel in one tap.",
    what: "Tabulation sheet, Merit list, Subject-wise result, Fail list, Grade sheet, Progress report, Teacher marks sheet and the Mark Blueprint chart.",
    who: [IT, EA, PR, VP, T], steps: ["Choose a report card.", "Choose exam and class.", "Press Print or Export Excel."], nb: "Reports need marks to be entered first.", future: "New reports can be added without changing the other pages.",
  },
  sscPathway: {
    name: "SSC Pathway", icon: FiFlag, tagline: "Class X: school exams, eligibility list and Board results.",
    what: "Class X has four school exams (First, Second, Pre-Test, Final Test). The rule 'who can sit for SSC' is automatic and editable. The Board result is typed in after the Board publishes it.",
    who: [IT, EA, PR], steps: ["Open the 'Who can sit for SSC' tab to see the list.", "Press 'Form fill-up list' to export eligible students.", "After the Board result: open 'SSC Board results' and press Add or edit."], nb: "Eligibility rule: pass the Final Test and attendance 50% (change in Rule Studio).", future: "Board result import from the Board's Excel file.",
  },
  promotionDesk: {
    name: "Promotion Desk", icon: FiTrendingUp, tagline: "Year-end promotion in three calm steps.",
    what: "Decisions (Promoted, Re-exam, Repeat, Hold, Passed Out) come from editable rules. Principal approves, then one button moves students to the next class with new roll by merit and starts the new session.",
    who: [IT, PR], steps: ["IT Head: press 'Prepare promotion list'.", "Principal: press 'Approve the list'.", "IT Head: press 'Run rollover' (take a backup first)."], nb: "Class VIII to IX students get Science by default - correct group and 4th subject afterwards.", future: "Old sessions will stay readable from an archive on the server.",
  },
  classExplorer: {
    name: "Class Explorer", icon: FiMap, tagline: "See every class, section, subject, teacher and student.",
    what: "Start with Class I to X cards. Open a class to see its sections with class teachers, all its subjects (with marks and who teaches them) and all its students.",
    who: [IT, EA, PR, VP, T], steps: ["Open a class card.", "Use the tabs: Sections, Subjects, Students.", "IT Head: press 'Plan teachers' to assign teachers."], nb: "Numbers update at once when you add students or teachers.", future: "Timetable and room plans can be added to each section.",
  },
  studentBook: {
    name: "Student Book", icon: FiUsers, tagline: "Every student: profile, subjects, teachers and results.",
    what: "Search, add, correct and export students. Open a student to see their subjects with the teacher of each, their results and pass rule.",
    who: [IT, T, PR], steps: ["Search by name, ID or mobile, or use the filters.", "Press View for the full profile.", "IT Head: press Edit to correct anything or Add student."], nb: "Student ID never changes. Roll changes each session.", future: "Photo, documents and family details can be added as new fields from Field Builder.",
  },
  easyImport: {
    name: "Easy Import", icon: FiUpload, tagline: "Bring in hundreds of students from Excel in four steps.",
    what: "Upload Excel, CSV or JSON from the SICS system. Columns are matched for you; unknown columns can become new custom fields. Problems are shown row by row before anything is saved.",
    who: [IT], steps: ["Download the sample file.", "Fill it or choose your own file.", "Check the column matching.", "Press Import."], nb: "Same ID = update the student. New ID = add a student.", future: "A direct link to SICS will replace the file step.",
  },
  subjectPicker: {
    name: "Subject Picker", icon: FiLayers, tagline: "Choose the 4th subject for Class IX and X students.",
    what: "The choices come from Subject Map. The result uses it for the bonus point.", who: [IT], steps: ["Choose class and group.", "Pick the 4th subject for each student.", "Press Save."], nb: "Religious Studies is chosen automatically from the student's religion.", future: "Students or parents will be able to request a choice online.",
  },
  teacherDesk: {
    name: "Teacher Desk", icon: FiUser, tagline: "All teachers, their work and their access in one place.",
    what: "See every teacher with the subjects, sections and class they handle. Open a teacher to add or remove assignments, allow or stop marks entry and see the login account.",
    who: [IT], steps: ["Search a teacher or press 'Add teacher'.", "Open a teacher.", "Add assignments (class, section, subject) or class teacher duty.", "Use 'Allow marks entry' to switch access on or off."], nb: "A subject teacher can teach many sections. A section has one class teacher.", future: "Teacher leave and substitute teacher can be added.",
  },
  teacherPlanner: {
    name: "Teacher Planner", icon: FiUserCheck, tagline: "Assign class teachers and subject teachers in minutes.",
    what: "Pick a class and section: every subject is listed with a teacher box. Or pick a subject and give it to teachers section by section. Copy a whole plan from another section.",
    who: [IT], steps: ["Choose Class, Version and Section.", "Choose the class teacher.", "Choose a teacher for each subject.", "Press Save plan."], nb: "Teachers only see classes assigned here.", future: "Yearly plan copy: copy last year's plan to the new session in one tap.",
  },
  accessKeys: {
    name: "Access Keys", icon: FiLock, tagline: "Decide who can sign in and what each role may do.",
    what: "Create user accounts and switch them on or off. Tick boxes decide what every role can do - menus and buttons change at once.", who: [IT], steps: ["Users: add a person, choose the role.", "Permissions: tick or untick a box.", "Switch an account to Inactive to stop sign-in."], nb: "The IT Head always has every permission.", future: "Passwords will be stored safely on the server and sign-in can use SMS codes.",
  },
  markBlueprint: {
    name: "Mark Blueprint", icon: FiGrid, tagline: "Design how every subject's marks are built.",
    what: "For each class and group: full marks, pass marks (45 and 33), parts (Objective, Subjective, Practical, Monthly), conversion percent, joint subjects and the 4th-subject rule. Copy, edit and print the chart.",
    who: [IT], steps: ["Open a blueprint or press Copy to start from an existing one.", "Change subjects, marks and parts.", "Press 'Fill 33 pass marks' to compute the 33 set.", "Press Save. Use 'Chart' to print."], nb: "New subject after marks entry? Add it here - students show 'Incomplete' until marks are entered.", future: "Version history: see who changed a blueprint and restore an older one.",
  },
  examPlanner: { name: "Exam Planner", icon: FiCalendar, tagline: "Decide which exams each class has and how much each counts.", what: "Class I-IX: First, Second, Final. Class X: First, Second, Pre-Test, Final Test, then SSC. Change exams and weights any time.", who: [IT], steps: ["Open a scheme.", "Add, remove or change exams and weights.", "Make sure school exams add to 100.", "Save."], nb: "Class X weights 20/20/25/35 are a suggestion.", future: "Exam routine and seat plan can attach to each exam." },
  subjectMap: { name: "Subject Map", icon: FiBookOpen, tagline: "Which subjects each class and group studies.", what: "Main, optional and 4th-subject roles for every class and group.", who: [IT], steps: ["Open a map or Add.", "Add subjects and choose the role.", "Save."], nb: "'main or fourth' = counted as main unless the student picks it as 4th.", future: "Elective subject limits per group." },
  subjectLibrary: { name: "Subject Library", icon: FiList, tagline: "The master list of all subjects and Board codes.", what: "Add or correct a subject. The code is also its ID.", who: [IT], steps: ["Press Add course.", "Type code and name.", "Choose type and save."], nb: "Use Board codes (Math 109).", future: "Bangla names and Board syllabus links." },
  gradeBook: { name: "Grade Book", icon: FiAward, tagline: "Marks range to grade and grade point.", what: "Separate tables for the 45 rule, the 33 rule and the final GPA letter.", who: [IT], steps: ["Open a table.", "Edit rows (from marks, letter, grade point).", "Save."], nb: "A mark below the last row is F.", future: "Different tables for primary and secondary if the school needs them." },
  schoolLists: { name: "School Lists", icon: FiDatabase, tagline: "Classes, versions, groups, shifts, sections, sessions.", what: "The small lists the whole system depends on. Add Section C or a new Shift in seconds.", who: [IT], steps: ["Open a list.", "Press Add or Edit.", "Save."], nb: "Deleting something already used may hide students from lists.", future: "Campus (branch) specific lists." },
  statusCodes: { name: "Status Codes", icon: FiTag, tagline: "Absent, Withheld, Transferred... and what each does.", what: "Codes a teacher can choose instead of marks.", who: [IT], steps: ["Add or edit a code.", "Choose the effect (zero marks).", "Save."], nb: "Codes AB, EX, WH, EXP, TR give 0 marks and 0 GP.", future: "Auto-fill from the Absent Notification module." },
  ruleStudio: {
    name: "Rule Studio", icon: FiSliders, tagline: "Change any rule, number or formula yourself.",
    what: "Numbers (pass percent, grace limit), formulas with a test box, and IF-THEN conditions for promotion, SSC eligibility and report flags. No developer needed when the management changes a rule.",
    who: [IT], steps: ["Numbers tab: change a value, press Save.", "Formulas tab: edit, type test numbers, check the answer, Save.", "Conditions tab: edit IF and THEN lines, Save.", "Calculate again to see new results."], nb: "Use 'Reset to original' if you are unsure.", future: "Rule history with 'who changed what' and one-tap restore.",
  },
  nameStudio: { name: "Name Studio", icon: FiTag, tagline: "Rename any menu, title or column.", what: "Type a new name (for example in Bangla) and it changes everywhere.", who: [IT], steps: ["Search the name.", "Type the new name.", "Press Save names."], nb: "Empty box = original name.", future: "Full Bangla language pack." },
  fieldBuilder: { name: "Field Builder", icon: FiLayers, tagline: "Add a new information column - no developer.", what: "Add a field to Students, Teachers or Courses. It appears on forms, lists, Excel export and import.", who: [IT], steps: ["Press Add custom field.", "Choose where, name and type.", "Save - it appears at once."], nb: "Keys start with cf_ and cannot change later.", future: "Fields for Parents and Sections." },
  parentConnect: {
    name: "Parent Connect", icon: FiSend, tagline: "Message a whole class in one go.",
    what: "Choose class, section and who to message (parents, students or both). Templates fill in the student's name and exam automatically.", who: [IT, PR, T], steps: ["Choose class and section.", "Choose a template or write a message.", "Check the example.", "Press Send."], nb: "The SMS gateway is not connected yet - messages are saved in the log.", future: "Connect an SMS provider to really send. See Future Plan.",
  },
  helpDesk: { name: "Help Desk", icon: FiLifeBuoy, tagline: "Describe a problem. The IT team answers here.", what: "Create a ticket, follow replies and see when it is solved.", who: [IT, T, PR, ST, PA], steps: ["Press New ticket.", "Describe what happened.", "Come back to read the reply."], nb: "Write which page you were on.", future: "Photo attachment and WhatsApp alert." },
  changeTrail: { name: "Change Trail", icon: FiActivity, tagline: "Who changed what and when - always on record.", what: "Every create, edit and delete is written automatically and kept for 5 years.", who: [IT, EA, PR], steps: ["Filter by place or action.", "Search a name or record.", "Export to Excel."], nb: "The trail cannot be edited.", future: "Stored on the server with yearly archive." },
  safeBox: { name: "Safe Box", icon: FiShield, tagline: "Profile, password, school details and backups.", what: "Change your password. The IT Head edits school details and downloads or restores a full backup.", who: [IT, T, PR, ST], steps: ["Change password if needed.", "IT Head: edit school information.", "IT Head: Download backup before big changes."], nb: "Daily automatic backups arrive with the server version.", future: "Cloud backup every night." },
  howTo: { name: "How-To Guide", icon: FiHelpCircle, tagline: "Every feature explained in simple steps.", what: "Names, purpose, steps and notes for all features.", who: [IT, T, PR, ST], steps: ["Search a feature.", "Read the steps."], nb: "Each page also has a small 'How to use' box at the top.", future: "Video guides." },
  futurePlan: { name: "Future Plan", icon: FiCompass, tagline: "What is ready, what comes next and what we need from the school.", what: "Clear instructions for going live: the school's checklist, the backend steps and later ideas.", who: [IT], steps: ["Read 'What the school must give'.", "Tick items as they are done.", "Give the 'Developer steps' to the backend developer."], nb: "Nothing here stops you from using the system today.", future: "" },
  approvals: { name: "Approval Center", icon: FiInbox, tagline: "Everything waiting for a decision.", what: "Extra time, corrections, grace marks and special pass in one place with counts.", who: [IT, EA, PR], steps: ["Open a card with a number.", "Approve or reject."], nb: "A number on a card means items are waiting.", future: "" },
  setupCenter: { name: "Setup Center", icon: FiDatabase, tagline: "Everything that defines how the school's results work.", what: "Mark Blueprint, Exam Planner, Subject Map, Grade Book and the small lists.", who: [IT], steps: ["Choose a card.", "Change what you need.", "Save."], nb: "Changes apply the next time a result is calculated.", future: "" },
  customizeCenter: { name: "Customize Center", icon: FiSliders, tagline: "Make the system fit the school, not the other way round.", what: "Rule Studio, Name Studio, Field Builder and Access Keys.", who: [IT], steps: ["Choose a card.", "Change what you need.", "Save."], nb: "Everything can be changed again later.", future: "" },
  myResults: { name: "My Results", icon: FiAward, tagline: "Your published results, any time.", what: "Open a result to see every subject and grade. Print or save as PDF.", who: [ST, PA], steps: ["Choose an exam.", "Read your subjects and grades.", "Press Print or save as PDF."], nb: "Only signed and published results are shown.", future: "Result notification by SMS." },
  callSchool: { name: "Call School", icon: FiPhone, tagline: "One tap to call the class teacher or the office.", what: "Call buttons for the class teacher and the school office.", who: [ST, PA], steps: ["Press Call."], nb: "On a phone it opens the dialer.", future: "Message the class teacher inside the app." },
};

// URL piece -> feature (used by PageHeader to show the brand name, tagline and How to use box)
export const SEGMENT_FEATURE = {
  exams: "examJourney", results: "resultBoard", reports: "reportShelf", ssc: "sscPathway", "year-end": "promotionDesk", extensions: "extraTime", extension: "extraTime",
  corrections: "correctionDesk", grace: "graceDesk", "special-pass": "passSwitch", classes: "classExplorer", students: "studentBook", teachers: "teacherDesk", planner: "teacherPlanner",
  entry: "marksDesk", attendance: "attendanceBook", "my-class": "resultBoard", sms: "parentConnect", support: "helpDesk", audit: "changeTrail", settings: "safeBox", rules: "ruleStudio",
  labels: "nameStudio", permissions: "accessKeys", setup: "setupCenter", customize: "customizeCenter", approvals: "approvals", guide: "howTo", lists: "schoolLists", future: "futurePlan", markchart: "markBlueprint", contact: "callSchool",
};
export const ENTITY_FEATURE = { courses: "subjectLibrary", curriculum: "subjectMap", markDistributions: "markBlueprint", examSchemes: "examPlanner", exams: "examPlanner", gradeTables: "gradeBook", students: "studentBook", teachers: "teacherDesk", users: "accessKeys", batches: "teacherPlanner", customFields: "fieldBuilder", smsTemplates: "parentConnect", boardResults: "sscPathway", statusCodes: "statusCodes" };

export function featureKeyForPath(pathname) {
  const parts = pathname.split("/").filter(Boolean).slice(2);
  const [a, b] = parts;
  if (!a) return null;
  if (a === "data") return ENTITY_FEATURE[b] || "schoolLists";
  if (a === "students") return b === "import" ? "easyImport" : b === "curriculum" ? "subjectPicker" : "studentBook";
  if (a === "results" && b === "view") return "transcript";
  return SEGMENT_FEATURE[a] || null;
}

// Hub pages (big-card menus). card = [featureKey, route, permission]
export const HUBS = {
  approvals: [["extraTime", "extensions", "extension.approve|extension.recommend"], ["correctionDesk", "corrections", "correction.approve"], ["graceDesk", "grace", "grace.entry|grace.approve"], ["passSwitch", "special-pass", "results.view"]],
  setup: [["markBlueprint", "data/markDistributions", "setup.manage"], ["examPlanner", "data/examSchemes", "setup.manage"], ["subjectMap", "data/curriculum", "setup.manage"], ["subjectLibrary", "data/courses", "setup.manage"], ["gradeBook", "data/gradeTables", "setup.manage"], ["subjectPicker", "students/curriculum", "students.manage"], ["statusCodes", "data/statusCodes", "customize.manage"], ["schoolLists", "lists", "setup.manage"]],
  customize: [["ruleStudio", "rules", "customize.manage"], ["nameStudio", "labels", "customize.manage"], ["fieldBuilder", "data/customFields", "customize.manage"], ["accessKeys", "permissions", "permissions.manage"]],
};
