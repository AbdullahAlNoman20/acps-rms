// ONE schema per data list. CrudPage builds the list page, the add/edit page, search, filters,
// Excel export, custom fields and audit logging from these definitions. To add a new list: add a schema here.
import { ROLE_OPTIONS } from "./roles";
import { EXAM_STATUS_OPTIONS } from "./examStatus";

const from = (collection, extra = {}) => ({ collection, ...extra });
const YN = ["Yes", "No"];
const RELIGIONS = ["Islam", "Hindu", "Buddhist", "Christian"];
const courseOpt = from("courses", { value: "code", labelTpl: "{code} - {name}" });
const text = (key, label, o = {}) => ({ key, label, type: "text", ...o });
const num = (key, label, o = {}) => ({ key, label, type: "number", ...o });
const sel = (key, label, options, o = {}) => ({ key, label, type: "select", options, ...o });
const selFrom = (key, label, collection, o = {}) => ({ key, label, type: "select", optionsFrom: from(collection, o.of), ...o, of: undefined });

const simple = (title, single, note, extraFields = [], extraCols = []) => ({
  title, single, note, perm: "setup.manage", group: "Academic lists",
  columns: ["name", ...extraCols], fields: [text("name", `${single} name`, { required: true }), ...extraFields],
});

export const ENTITIES = {
  branches: { ...simple("Branches", "Branch", "Normally one branch. Add another if the school opens a new campus.", [text("address", "Address")], ["address"]) },
  versions: simple("Versions", "Version", "Medium of teaching, for example Bangla and English. You can add a new version here."),
  programs: { ...simple("Classes (Programs)", "Class", "Class I to X. 'Next class' is used in Year-end promotion. Type Passed Out for the last class.", [num("order", "Order", { required: true }), sel("hasGroup", "Has groups (Science / Commerce / Arts)?", YN), text("nextProgram", "Next class")], ["order", "hasGroup", "nextProgram"]) },
  groups: simple("Groups", "Group", "General is used for classes without groups. Add a new group if the school starts one."),
  shifts: simple("Shifts", "Shift", "Morning, Day or any new shift.", [{ key: "startTime", label: "Start time", type: "time" }, { key: "endTime", label: "End time", type: "time" }], ["startTime", "endTime"]),
  sections: simple("Sections", "Section", "Section A, B ... Add C when needed."),
  sessions: { ...simple("Sessions", "Session", "Mark the running session as current. Year-end creates the next one.", [{ key: "startDate", label: "Start date", type: "date" }, { key: "endDate", label: "End date", type: "date" }, sel("isCurrent", "Current session?", YN)], ["startDate", "endDate", "isCurrent"]) },
  courses: {
    title: "Courses (Subjects)", single: "Course", collection: "courses", perm: "setup.manage", group: "Course setup", canCopy: false,
    note: "Course code is the Board code (for example Mathematics = 109). It is also the ID of the course, so choose it carefully. Primary classes use P01, P02...",
    columns: ["code", "name", "type", "hasPractical"], searchKeys: ["code", "name"],
    fields: [text("code", "Course code", { required: true, readOnlyOnEdit: true }), text("name", "Course name", { required: true }), text("nameBn", "Name in Bangla"),
      sel("type", "Type", ["Compulsory", "Optional", "Continuous"], { required: true, help: "Continuous = continuous assessment (not counted in GPA)." }), sel("hasPractical", "Has practical?", YN)],
    beforeSave: (r) => ({ ...r, id: r.code }),
  },
  statusCodes: {
    title: "Status codes", single: "Status code", collection: "statusCodes", perm: "customize.manage", group: "Course setup",
    note: "Codes teachers can choose instead of marks (Absent, Withheld...). 'zero' means marks and GP become 0.",
    columns: ["code", "label", "effect", "note"], fields: [text("code", "Code", { required: true, readOnlyOnEdit: true }), text("label", "Meaning", { required: true }), sel("effect", "Effect on result", ["zero", "exclude"], { required: true }), text("note", "Note")],
    beforeSave: (r) => ({ ...r, id: r.code }),
  },
  students: {
    title: "Students", single: "Student", collection: "students", perm: "students.manage", group: "People", exportName: "students", pageSize: 20,
    note: "Add, correct or search a student here. To add many students at once use 'Import students'. To switch a student to the 33 pass rule use 'Special pass (33)'.",
    searchKeys: ["id", "name", "guardianMobile"],
    filters: [{ key: "program", label: "Class", optionsFrom: from("programs") }, { key: "version", label: "Version", optionsFrom: from("versions") }, { key: "section", label: "Section", optionsFrom: from("sections") }, { key: "status", label: "Status", options: ["Active", "Passed Out", "TC", "Inactive"] }],
    columns: ["id", "roll", "name", "program", "version", "section", "group", "passRule", "status"],
    fields: [
      text("id", "Student ID", { required: true, readOnlyOnEdit: true, help: "Permanent. It never changes, even in the next session." }), num("roll", "Roll (this session)", { required: true }),
      text("name", "Name (English)", { required: true }), text("nameBn", "Name (Bangla)"),
      selFrom("program", "Class", "programs", { required: true }), selFrom("version", "Version", "versions", { required: true }), selFrom("group", "Group", "groups", { required: true }),
      selFrom("section", "Section", "sections", { required: true }), selFrom("shift", "Shift", "shifts"), selFrom("session", "Session", "sessions", { required: true }),
      sel("gender", "Gender", ["Male", "Female"]), sel("religion", "Religion", RELIGIONS, { required: true, help: "Decides which Religious Studies subject the student has." }),
      { key: "dob", label: "Date of birth", type: "date" }, text("father", "Father's name"), text("mother", "Mother's name"), text("guardianMobile", "Guardian mobile (used for SMS and Call)"),
      { key: "address", label: "Address", type: "textarea" },
      { key: "fourthSubject", label: "4th subject", type: "select", optionsFrom: courseOpt, allowBlank: true, help: "Class IX-X only. Science: Higher Math or Biology. Others: Agriculture or Home Science." },
      sel("passRule", "Pass rule", ["45", "33"], { required: true, help: "45 for everyone. Use 33 only for a student the school decides to pass at 33." }), text("passRuleReason", "Reason for pass rule"),
      sel("status", "Status", ["Active", "Passed Out", "TC", "Inactive"], { required: true }),
    ],
  },
  teachers: {
    title: "Teachers", single: "Teacher", collection: "teachers", perm: "users.manage", group: "People", note: "Teacher details. A teacher logs in with a User account (add one in Users).",
    columns: ["name", "designation", "phone", "email"], searchKeys: ["name", "email"],
    fields: [text("name", "Name", { required: true }), text("designation", "Designation"), text("phone", "Phone"), text("email", "Email")],
  },
  users: {
    title: "Users", single: "User", collection: "users", perm: "users.manage", group: "People", note: "Login accounts. Switch an account to Inactive to stop that person from signing in. For a teacher choose the Teacher record; for a student/parent type the Student ID.",
    columns: ["name", "email", "role", "status"], searchKeys: ["name", "email"],
    fields: [text("name", "Name", { required: true }), text("email", "Email", { required: true }), { key: "password", label: "Password", type: "password", required: true, help: "Demo only. The backend must store a hashed password." },
      { key: "role", label: "Role", type: "select", options: ROLE_OPTIONS, required: true }, selFrom("teacherId", "Teacher record", "teachers", { allowBlank: true }),
      text("studentId", "Student ID (for student / parent)"), sel("status", "Status", ["Active", "Inactive"], { required: true }), text("avatarColor", "Avatar color (hex)")],
  },
  batches: {
    title: "Teacher batches", single: "Batch", collection: "batches", perm: "batches.manage", group: "People", pageSize: 20,
    note: "A batch tells the system which teacher enters marks for which class, section and subject. Use * as course for the class teacher of a section.",
    filters: [{ key: "program", label: "Class", optionsFrom: from("programs") }, { key: "version", label: "Version", optionsFrom: from("versions") }, { key: "section", label: "Section", optionsFrom: from("sections") }, { key: "teacherId", label: "Teacher", optionsFrom: from("teachers") }],
    columns: ["teacherId", "program", "version", "section", "group", "courseCode", "isClassTeacher"],
    fields: [selFrom("teacherId", "Teacher", "teachers", { required: true }), selFrom("program", "Class", "programs", { required: true }), selFrom("version", "Version", "versions", { required: true }), selFrom("section", "Section", "sections", { required: true }),
      sel("group", "Group", ["All", "General", "Science", "Commerce", "Arts"], { required: true }), { key: "courseCode", label: "Course", type: "select", optionsFrom: courseOpt, extraOptions: [{ value: "*", label: "* (class teacher)" }], required: true }, sel("isClassTeacher", "Class teacher?", YN)],
  },
  customFields: {
    title: "Custom fields", single: "Custom field", collection: "customFields", perm: "customize.manage", group: "Customize",
    note: "Add a new information column to Students, Teachers or Courses without a developer. It appears on the form, the list, Excel export and import automatically.",
    columns: ["entity", "key", "label", "type", "required"],
    fields: [sel("entity", "Add to", ["students", "teachers", "courses"], { required: true }), text("key", "Key (letters, start with cf_)", { required: true, readOnlyOnEdit: true, placeholder: "cf_hobby" }), text("label", "Label shown to users", { required: true }),
      sel("type", "Type", ["text", "number", "date", "select", "yesno"], { required: true }), text("options", "Choices (for 'select', separate with commas)"), sel("required", "Required?", YN)],
  },
  smsTemplates: {
    title: "SMS templates", single: "Template", collection: "smsTemplates", perm: "sms.send", group: "Communicate", note: "Words in {braces} are replaced for each student: {name} {class} {section} {exam}.",
    columns: ["name", "text"], fields: [text("name", "Template name", { required: true }), { key: "text", label: "Message", type: "textarea", required: true }],
  },
  boardResults: {
    title: "SSC board results", single: "Board result", collection: "boardResults", perm: "board.manage", group: "Exams", note: "Type the SSC result given by the Board for each Class X student. The student sees it in the Student portal.",
    columns: ["studentId", "roll", "registration", "year", "group", "gpa", "status"], searchKeys: ["studentId", "registration"],
    fields: [{ key: "studentId", label: "Student", type: "select", optionsFrom: from("students", { value: "id", labelTpl: "{id} - {name}" }), required: true }, text("roll", "Board roll"), text("registration", "Registration no"), text("year", "Exam year"),
      sel("group", "Group", ["Science", "Commerce", "Arts"]), num("gpa", "GPA", { min: 0, max: 5 }), sel("status", "Status", ["Passed", "Failed", "Pending"], { required: true }),
      { key: "subjects", label: "Subject results", type: "rows", addLabel: "Add subject", rowTitle: "Subject", columns: [{ key: "code", label: "Code", type: "text" }, { key: "name", label: "Subject", type: "text" }, { key: "letter", label: "Grade", type: "text" }, { key: "gp", label: "GP", type: "number" }] }],
  },
  examSchemes: {
    title: "Exam schemes", single: "Exam scheme", collection: "examSchemes", perm: "setup.manage", group: "Exams", canCopy: true,
    note: "A scheme says which exams a class has and how much each counts. Class I-IX: First, Second, Final. Class X: First, Second, Pre-Test, Final Test, then the SSC Board exam. Weights of school exams should add up to 100.",
    columns: ["name", "programs", "method", "note"],
    fields: [text("name", "Scheme name", { required: true }), { key: "programs", label: "Classes", type: "multi", optionsFrom: from("programs") }, sel("method", "How to combine", ["Weighted", "Average", "Best of N"], { required: true }), text("note", "Note"),
      { key: "exams", label: "Exams in this scheme", type: "rows", addLabel: "Add exam", rowTitle: "Exam", columns: [text("key", "Short key", { help: "first, second, final, pretest..." }), text("name", "Exam name"), sel("type", "Type", ["school", "board"]), num("weight", "Weight %"), sel("include", "Count in total?", YN)] }],
  },
  exams: {
    title: "Exam list (this session)", single: "Exam", collection: "exams", perm: "setup.manage", group: "Exams", note: "Use the Exams page to run an exam step by step. Here you can add a new exam (for the next session) or correct its details.",
    columns: ["name", "key", "type", "status", "entryStart", "entryEnd"],
    fields: [text("session", "Session", { required: true }), text("key", "Short key", { required: true, readOnlyOnEdit: true }), text("name", "Exam name", { required: true }), sel("type", "Type", ["school", "board"], { required: true }),
      { key: "programs", label: "Classes", type: "multi", optionsFrom: from("programs") }, { key: "status", label: "Status", type: "select", options: EXAM_STATUS_OPTIONS, required: true },
      { key: "entryStart", label: "Entry start", type: "date" }, { key: "entryEnd", label: "Entry end", type: "date" }, text("note", "Note")],
    beforeSave: (r) => ({ ...r, id: `${r.session}-${r.key}`, extensionsUsed: r.extensionsUsed || 0, signatures: r.signatures || [] }),
  },
  gradeTables: {
    title: "Grade tables", single: "Grade table", collection: "gradeTables", perm: "setup.manage", group: "Course setup",
    note: "Marks range to letter grade and grade point. 'Standard' is used for pass rule 45, 'Special' for pass rule 33. 'gpaLetters' turns the final GPA into a letter. A mark lower than the last row is F.",
    columns: ["name", "id"], fields: [text("name", "Table name", { required: true }), { key: "rows", label: "Rows (marks from this value and above)", type: "rows", addLabel: "Add grade", rowTitle: "Grade", columns: [num("min", "From marks"), text("letter", "Letter"), num("gp", "Grade point")] }],
    canDelete: false,
  },
  curriculum: {
    title: "Curriculum", single: "Curriculum", collection: "curriculum", perm: "setup.manage", group: "Course setup", canCopy: true,
    note: "Which subjects a class (and group) studies. 'main' = always counted, 'mainOrFourth' = counted as main unless the student picks it as 4th subject, 'fourthOnly' = only for students who pick it as 4th subject.",
    columns: ["program", "group", "note"], filters: [{ key: "program", label: "Class", optionsFrom: from("programs") }],
    fields: [selFrom("program", "Class", "programs", { required: true }), selFrom("group", "Group", "groups", { required: true }), text("note", "Note"),
      { key: "courses", label: "Subjects", type: "rows", addLabel: "Add subject", rowTitle: "Subject", columns: [{ key: "code", label: "Subject", type: "select", optionsFrom: courseOpt, required: true }, sel("role", "Role", ["main", "mainOrFourth", "fourthOnly"], { required: true }), sel("religion", "Only for religion", RELIGIONS)] }],
    beforeSave: (r) => ({ ...r, id: r.id || `cur-${r.program}-${r.group}` }),
  },
  markDistributions: {
    title: "Mark distribution", single: "Mark distribution", collection: "markDistributions", perm: "setup.manage", group: "Course setup", canCopy: true,
    note: "The most important setup. For every subject: full marks, pass marks (45 rule and 33 rule), and its parts (Objective, Subjective, Practical, Monthly test...). PR% means how many percent of the raw marks count (raw x PR / 100). Joint subjects (Bangla 1st + 2nd) share a Joint code and a joint pass mark.",
    columns: ["name", "programs", "group", "gpaDivision"],
    formActions: [{ label: "Fill 33 pass marks from percent", run: (form, lookups) => {
      const pct = Number((lookups.ruleParams || []).find((p) => p.key === "passSpecial")?.value ?? 33);
      const c = (n) => Math.ceil((Number(n) * pct) / 100);
      return { ...form, courses: (form.courses || []).map((r) => ({ ...r, passMark33: r.passMark > 0 ? c(r.fullMark) : 0, jp33: r.jp ? c(Number(r.jp) / 0.45) : r.jp33,
        components: (r.components || []).map((x) => ({ ...x, pass33: x.pass > 0 ? c(x.exam) : 0 })) })) };
    } }],
    fields: [text("name", "Name", { required: true }), { key: "programs", label: "Classes", type: "multi", optionsFrom: from("programs") }, selFrom("group", "Group", "groups", { required: true }),
      num("gpaDivision", "No of subjects for GPA division", { required: true }), num("deduct4th", "Deduct from 4th subject"), sel("failFor4th", "Fail the student if 4th subject fails?", YN), text("note", "Note"),
      { key: "courses", label: "Subjects", type: "rows", addLabel: "Add subject", rowTitle: "Subject", columns: [
        { key: "code", label: "Course", type: "select", optionsFrom: courseOpt, required: true }, text("name", "Name on report"), num("fullMark", "Full marks"), num("passMark", "Pass mark (45 rule)"), num("passMark33", "Pass mark (33 rule)"),
        num("mj", "Multiply by (M.J)"), sel("role", "Role", ["main", "mainOrFourth", "fourthOnly"]), sel("religion", "Only for religion", RELIGIONS), text("j", "Joint code"), num("jo", "Joint order"), num("jp", "Joint pass (45)"), num("jp33", "Joint pass (33)"),
        text("jointName", "Joint name"), sel("isEffective", "Count in GPA?", YN),
        { key: "components", label: "Parts of this subject", type: "rows", addLabel: "Add part", rowTitle: "Part", columns: [text("key", "Key"), text("label", "Name"), num("exam", "Exam marks"), num("pr", "PR %"), num("pass", "Pass (45)"), num("pass33", "Pass (33)")] }] }],
  },
};

export const ENTITY_GROUPS = ["Academic lists", "Course setup", "Exams", "People", "Customize", "Communicate"];
