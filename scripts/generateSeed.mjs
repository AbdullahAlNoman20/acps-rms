// Generates all sample JSON data into public/data (run: npm run seed).
// Every collection here is what a backend developer should later serve from a REST API.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "data");
mkdirSync(OUT, { recursive: true });
const write = (name, data) => writeFileSync(join(OUT, `${name}.json`), JSON.stringify(data, null, 1));

// ---------- deterministic random ----------
let seed = 20261106;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

// ---------- master data ----------
const PROGRAMS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const VERSIONS = ["Bangla", "English"];
const SECTIONS = ["A", "B"];
write("branches", [{ id: "main", name: "Main Branch", address: "Dhaka Cantonment, Dhaka-1206" }]);
write("versions", VERSIONS.map((n) => ({ id: n, name: n })));
write("programs", PROGRAMS.map((n, i) => ({ id: n, name: n, order: i + 1, hasGroup: i >= 8 ? "Yes" : "No", nextProgram: PROGRAMS[i + 1] || "Passed Out" })));
write("groups", ["General", "Science", "Commerce", "Arts"].map((n) => ({ id: n, name: n })));
write("shifts", [{ id: "Morning", name: "Morning", startTime: "07:30", endTime: "12:30" }, { id: "Day", name: "Day", startTime: "12:45", endTime: "17:30" }]);
write("sections", SECTIONS.map((n) => ({ id: n, name: n })));
write("sessions", [
  { id: "2026", name: "2026", startDate: "2026-01-01", endDate: "2026-12-31", isCurrent: "Yes" },
  { id: "2025", name: "2025", startDate: "2025-01-01", endDate: "2025-12-31", isCurrent: "No" },
]);

// ---------- courses ----------
const C = (code, name, type = "Compulsory", hasPractical = "No") => ({ id: code, code, name, nameBn: "", type, hasPractical });
const courses = [
  C("P01", "Bangla (Primary)"), C("P02", "English (Primary)"), C("P03", "Mathematics (Primary)"), C("P04", "Science (Primary)"), C("P05", "Bangladesh & Global Studies (Primary)"),
  C("P06", "Islam & Moral Education (Primary)"), C("P07", "Hindu Religion & Moral Education (Primary)"), C("P08", "Buddhist Religion & Moral Education (Primary)"), C("P09", "Christian Religion & Moral Education (Primary)"),
  C("101", "Bangla 1st Paper"), C("102", "Bangla 2nd Paper"), C("107", "English 1st Paper"), C("108", "English 2nd Paper"), C("109", "Mathematics"),
  C("111", "Islam & Moral Education"), C("112", "Hindu Religion & Moral Education"), C("113", "Buddhist Religion & Moral Education"), C("114", "Christian Religion & Moral Education"),
  C("154", "ICT", "Compulsory", "Yes"), C("127", "General Science"), C("150", "Bangladesh & Global Studies"),
  C("136", "Physics", "Compulsory", "Yes"), C("137", "Chemistry", "Compulsory", "Yes"), C("138", "Biology", "Optional", "Yes"), C("126", "Higher Mathematics", "Optional", "Yes"),
  C("146", "Accounting"), C("143", "Business Entrepreneurship"), C("152", "Finance & Banking"),
  C("153", "History of Bangladesh & World Civilization"), C("110", "Geography & Environment"), C("141", "Economics"),
  C("134", "Agriculture Studies", "Optional", "Yes"), C("151", "Home Science", "Optional", "Yes"),
  C("147", "Physical Education, Health & Sports", "Continuous"), C("M01", "Life & Livelihood", "Continuous"), C("M02", "Arts & Culture", "Continuous"), C("CE", "Career Education", "Continuous"),
];
write("courses", courses);
const cname = Object.fromEntries(courses.map((c) => [c.code, c.name]));

// ---------- mark distribution (from the school's ERP chart, Class IX Science) ----------
const k = (key, label, exam, pr, pass, pass33) => ({ key, label, exam, pr, pass, pass33 });
const NP = () => [k("obj", "Objective", 30, 100, 14, 10), k("subj", "Subjective", 70, 85.7143, 31, 23), k("mt", "Monthly test", 20, 50, 0, 0)];
const PR = () => [k("obj", "Objective", 25, 100, 11, 8), k("subj", "Subjective", 50, 80, 22, 17), k("prac", "Practical", 25, 100, 12, 8), k("mt", "Monthly test", 20, 50, 0, 0)];
const ICTC = () => [k("obj", "Objective", 25, 100, 11, 8), k("prac", "Practical", 25, 100, 12, 8)];
const CAC = () => [k("ca", "Continuous assessment", 50, 100, 0, 0)];
const PRIM = () => [k("wr", "Written", 80, 100, 36, 27), k("mt", "Monthly test", 20, 100, 9, 7)];
const R = (code, comps, o = {}) => ({
  code, name: cname[code], fullMark: 100, passMark: 45, passMark33: 33, mj: 1, role: "main", religion: "",
  j: "", jo: "", jp: "", jp33: "", jointName: "", isEffective: "Yes", components: comps, ...o,
});
const RELIG = (codes, mk) => [["Islam", codes[0]], ["Hindu", codes[1]], ["Buddhist", codes[2]], ["Christian", codes[3]]].map(([rel, c]) => R(c, mk(), { religion: rel }));
const bangla = (comps = NP) => [
  R("101", NP().map((c) => ({ ...c, pass: 0, pass33: 0 })), { passMark: 0, passMark33: 0, j: "J-BAN", jo: 1, jointName: "Bangla" }),
  R("102", NP().map((c) => (c.key === "obj" ? { ...c, pass: 28, pass33: 20 } : c.key === "subj" ? { ...c, pass: 62, pass33: 46 } : c)), { passMark: 0, passMark33: 0, j: "J-BAN", jo: 2, jp: 90, jp33: 66, jointName: "Bangla" }),
];
const english = () => [
  R("107", [k("subj", "Subjective", 100, 90, 0, 0), k("mt", "Monthly test", 20, 50, 0, 0)], { passMark: 0, passMark33: 0, j: "J-ENG", jo: 1, jointName: "English" }),
  R("108", [k("subj", "Subjective", 100, 90, 90, 66), k("mt", "Monthly test", 20, 50, 0, 0)], { passMark: 0, passMark33: 0, j: "J-ENG", jo: 2, jp: 90, jp33: 66, jointName: "English" }),
];
const ICT = () => R("154", ICTC(), { fullMark: 50, passMark: 23, passMark33: 17, mj: 2 });
const CA = (c) => R(c, CAC(), { fullMark: 50, passMark: 0, passMark33: 0, mj: 2, isEffective: "No" });
const RELCODES = ["111", "112", "113", "114"];

const dist = (id, name, programs, group, gpaDivision, rows) => ({ id, name, programs, group, gpaDivision, deduct4th: 2, failFor4th: "No", note: "Edit any number here. Sample values follow the school's ERP chart.", courses: rows });
const distributions = [
  dist("md-I-II", "Class I-II", ["I", "II"], "General", 3, [R("P01", PRIM()), R("P02", PRIM()), R("P03", PRIM())]),
  dist("md-III-V", "Class III-V", ["III", "IV", "V"], "General", 6, [R("P01", PRIM()), R("P02", PRIM()), R("P03", PRIM()), R("P04", PRIM()), R("P05", PRIM()), ...RELIG(["P06", "P07", "P08", "P09"], PRIM)]),
  dist("md-VI-VIII", "Class VI-VIII", ["VI", "VII", "VIII"], "General", 7, [...bangla(), ...english(), R("109", NP()), R("127", NP()), R("150", NP()), ICT(), ...RELIG(RELCODES, NP), CA("147"), CA("M01"), CA("M02")]),
  dist("md-IX-X-Science", "Class IX-X Science", ["IX", "X"], "Science", 9, [
    ...bangla(), ...english(), R("109", NP()), ...RELIG(RELCODES, NP), ICT(), R("150", NP()),
    R("136", PR()), R("137", PR()), R("138", PR(), { role: "mainOrFourth" }), R("126", PR(), { role: "mainOrFourth" }), CA("CE"),
  ]),
  dist("md-IX-X-Commerce", "Class IX-X Commerce", ["IX", "X"], "Commerce", 9, [
    ...bangla(), ...english(), R("109", NP()), ...RELIG(RELCODES, NP), ICT(), R("146", NP()), R("143", NP()), R("152", NP()), R("127", NP()),
    R("134", PR(), { role: "fourthOnly" }), R("151", PR(), { role: "fourthOnly" }), CA("CE"),
  ]),
  dist("md-IX-X-Arts", "Class IX-X Arts", ["IX", "X"], "Arts", 9, [
    ...bangla(), ...english(), R("109", NP()), ...RELIG(RELCODES, NP), ICT(), R("153", NP()), R("110", NP()), R("141", NP()), R("127", NP()),
    R("134", PR(), { role: "fourthOnly" }), R("151", PR(), { role: "fourthOnly" }), CA("CE"),
  ]),
];
write("markDistributions", distributions);
write("curriculum", distributions.flatMap((d) => d.programs.map((p) => ({
  id: `cur-${p}-${d.group}`, program: p, group: d.group, note: "Subjects of this class and group",
  courses: d.courses.map((c) => ({ code: c.code, role: c.role, religion: c.religion })),
}))));

// ---------- grading ----------
write("gradeTables", [
  { id: "standard", name: "Standard grade table (pass rule 45)", rows: [{ min: 80, letter: "A+", gp: 5 }, { min: 70, letter: "A", gp: 4 }, { min: 60, letter: "A-", gp: 3.5 }, { min: 50, letter: "B", gp: 3 }, { min: 45, letter: "C", gp: 2 }] },
  { id: "special", name: "Special grade table (pass rule 33)", rows: [{ min: 80, letter: "A+", gp: 5 }, { min: 70, letter: "A", gp: 4 }, { min: 60, letter: "A-", gp: 3.5 }, { min: 50, letter: "B", gp: 3 }, { min: 33, letter: "C", gp: 2 }] },
  { id: "gpaLetters", name: "Overall GPA to letter (min GPA)", rows: [{ min: 5, letter: "A+", gp: 0 }, { min: 4, letter: "A", gp: 0 }, { min: 3.5, letter: "A-", gp: 0 }, { min: 3, letter: "B", gp: 0 }, { min: 2, letter: "C", gp: 0 }, { min: 0, letter: "F", gp: 0 }] },
]);
write("statusCodes", [
  { id: "AB", code: "AB", label: "Absent", effect: "zero", note: "Marks and GP become 0" },
  { id: "EX", code: "EX", label: "Exempted", effect: "zero", note: "Marks and GP become 0 (decision of the school)" },
  { id: "WH", code: "WH", label: "Withheld", effect: "zero", note: "Result withheld" },
  { id: "EXP", code: "EXP", label: "Expelled", effect: "zero", note: "Student expelled" },
  { id: "TR", code: "TR", label: "Transferred", effect: "zero", note: "Student transferred" },
]);

// ---------- rules ----------
write("ruleParams", [
  { id: "passStandard", key: "passStandard", label: "Standard pass percent", value: 45, unit: "%", note: "Used for aggregate results and as the default pass mark." },
  { id: "passSpecial", key: "passSpecial", label: "Special pass percent", value: 33, unit: "%", note: "Applied to a student when the 33 rule is switched on." },
  { id: "gpaCap", key: "gpaCap", label: "Maximum GPA", value: 5, unit: "", note: "GPA never goes above this." },
  { id: "roundDecimals", key: "roundDecimals", label: "Decimal places (round half-up)", value: 2, unit: "", note: "For marks and GPA." },
  { id: "graceMaxMarks", key: "graceMaxMarks", label: "Maximum grace marks per student", value: 3, unit: "marks", note: "Assumption - change as the management decides." },
  { id: "graceMaxSubjects", key: "graceMaxSubjects", label: "Grace allowed in subjects", value: 1, unit: "subject", note: "Assumption." },
  { id: "minAttendance", key: "minAttendance", label: "Minimum attendance", value: 50, unit: "%", note: "Needed to move from one term to the next." },
  { id: "entryDays", key: "entryDays", label: "Marks entry window", value: 15, unit: "days", note: "Default days teachers get after an exam." },
  { id: "maxExtensions", key: "maxExtensions", label: "Maximum extensions per exam", value: 2, unit: "times", note: "IT Head recommends, Principal approves." },
  { id: "tieBreak", key: "tieBreak", label: "Merit tie-break subjects (in order)", value: "Mathematics,English,Bangla", unit: "", note: "Used when total marks are equal." },
]);
write("ruleFormulas", [
  { id: "componentConvert", key: "componentConvert", label: "Component marks after conversion", expr: "raw * pr / 100", vars: "raw, pr", note: "raw = marks obtained, pr = PR% from Mark Distribution." },
  { id: "scaleTo100", key: "scaleTo100", label: "Subject total on 100 scale", expr: "total * mj", vars: "total, mj, full", note: "mj = multiply-by (ICT 50 marks uses 2)." },
  { id: "fourthBonus", key: "fourthBonus", label: "4th subject bonus point", expr: "max(gp - deduct, 0)", vars: "gp, deduct", note: "Only the part above the deduct value is added." },
  { id: "gpa", key: "gpa", label: "GPA", expr: "min(cap, (sumGp + bonus) / divisor)", vars: "sumGp, bonus, divisor, cap", note: "divisor = No of subjects for GPA division." },
  { id: "aggregatePart", key: "aggregatePart", label: "Aggregate part of one exam", expr: "value * weight / 100", vars: "value, weight", note: "Weights come from the Exam Scheme." },
]);
const cond = (id, scope, label, when, thenAction, thenValue) => ({ id, scope, label, enabled: "Yes", when, then: { action: thenAction, value: thenValue } });
write("ruleConditions", [
  cond("pr-1", "promotion", "Class X has no promotion", [{ field: "program", op: "=", value: "X" }], "decision", "Passed Out"),
  cond("pr-2", "promotion", "More than 1 failed subject: repeat", [{ field: "failedCount", op: ">", value: "1" }], "decision", "Repeat"),
  cond("pr-3", "promotion", "Exactly 1 failed subject: re-exam", [{ field: "failedCount", op: "=", value: "1" }], "decision", "Re-exam"),
  cond("pr-4", "promotion", "Low attendance: hold", [{ field: "attendancePercent", op: "<", value: "50" }], "decision", "Hold"),
  cond("ssc-1", "ssc", "Failed the Final Test: not eligible for SSC", [{ field: "finalTestPassed", op: "=", value: "0" }], "eligibility", "Not eligible"),
  cond("ssc-2", "ssc", "Attendance below 50: not eligible for SSC", [{ field: "attendancePercent", op: "<", value: "50" }], "eligibility", "Not eligible"),
  cond("rs-1", "result", "Mark students on the 33 rule", [{ field: "passRule", op: "=", value: "33" }], "flag", "33 rule applied"),
  cond("rs-2", "result", "Flag low attendance", [{ field: "attendancePercent", op: "<", value: "50" }], "flag", "Low attendance"),
]);

// ---------- exams ----------
const day = (s) => s;
write("examSchemes", [
  { id: "standard", name: "Standard (Class I-IX)", programs: PROGRAMS.slice(0, 9), method: "Weighted", note: "First 25% + Second 25% + Final 50%", exams: [
    { key: "first", name: "First Term", type: "school", weight: 25, include: "Yes" }, { key: "second", name: "Second Term", type: "school", weight: 25, include: "Yes" }, { key: "final", name: "Final Term", type: "school", weight: 50, include: "Yes" } ] },
  { id: "class10", name: "Class X (SSC route)", programs: ["X"], method: "Weighted", note: "Four school exams, then the SSC Board Exam. Weights are an assumption.", exams: [
    { key: "first", name: "First Term", type: "school", weight: 20, include: "Yes" }, { key: "second", name: "Second Term", type: "school", weight: 20, include: "Yes" },
    { key: "pretest", name: "Pre-Test", type: "school", weight: 25, include: "Yes" }, { key: "finaltest", name: "Final Test", type: "school", weight: 35, include: "Yes" },
    { key: "ssc", name: "SSC (Board Exam)", type: "board", weight: 0, include: "No" } ] },
]);
const EX = (key, name, programs, status, entryStart, entryEnd, extra = {}) => ({ id: `2026-${key}`, session: "2026", key, name, type: "school", programs, status, entryStart: day(entryStart), entryEnd: day(entryEnd), extensionsUsed: 0, note: "", signatures: [], ...extra });
const ALL = PROGRAMS, P1_9 = PROGRAMS.slice(0, 9);
write("exams", [
  EX("first", "First Term", ALL, "published", "2026-03-20", "2026-04-04", { signatures: [{ role: "vice_principal", name: "Mrs. Rokeya Sultana", at: "2026-04-12", action: "reviewed" }, { role: "principal", name: "Lt Col Byzid Mohammad Tareq Junaed", at: "2026-04-14", action: "signed" }] }),
  EX("second", "Second Term", ALL, "published", "2026-07-10", "2026-07-25", { signatures: [{ role: "vice_principal", name: "Mrs. Rokeya Sultana", at: "2026-08-02", action: "reviewed" }, { role: "principal", name: "Lt Col Byzid Mohammad Tareq Junaed", at: "2026-08-03", action: "signed" }] }),
  EX("final", "Final Term", P1_9, "entry_open", "2026-11-02", "2026-11-17", { extensionsUsed: 0 }),
  EX("pretest", "Pre-Test", ["X"], "published", "2026-09-05", "2026-09-20", { signatures: [{ role: "vice_principal", name: "Mrs. Rokeya Sultana", at: "2026-09-28", action: "reviewed" }, { role: "principal", name: "Lt Col Byzid Mohammad Tareq Junaed", at: "2026-09-29", action: "signed" }] }),
  EX("finaltest", "Final Test", ["X"], "sent", "2026-10-15", "2026-10-30", { note: "Sent to Principal/VP on 2 Nov 2026" }),
  EX("ssc", "SSC (Board Exam)", ["X"], "board", "2027-02-01", "2027-05-30", { type: "board", note: "Board result is entered by the IT Head after the Board publishes it." }),
]);

// ---------- people ----------
const MALE = [["Rahim", "রহিম"], ["Karim", "করিম"], ["Hasan", "হাসান"], ["Imran", "ইমরান"], ["Tanvir", "তানভীর"], ["Sakib", "সাকিব"], ["Nayeem", "নাঈম"], ["Fahim", "ফাহিম"], ["Arif", "আরিফ"], ["Mahin", "মাহিন"], ["Rafi", "রাফি"], ["Zubayer", "জুবায়ের"]];
const FEMALE = [["Nusrat", "নুসরাত"], ["Tasnim", "তাসনিম"], ["Sumaiya", "সুমাইয়া"], ["Ayesha", "আয়েশা"], ["Maliha", "মালিহা"], ["Farzana", "ফারজানা"], ["Anika", "আনিকা"], ["Rumana", "রুমানা"], ["Sadia", "সাদিয়া"], ["Nabila", "নাবিলা"], ["Tuba", "তুবা"], ["Mim", "মিম"]];
const SUR = [["Uddin", "উদ্দিন"], ["Ahmed", "আহমেদ"], ["Hossain", "হোসেন"], ["Islam", "ইসলাম"], ["Khan", "খান"], ["Chowdhury", "চৌধুরী"], ["Rahman", "রহমান"], ["Sarker", "সরকার"], ["Mia", "মিয়া"], ["Akter", "আক্তার"]];
const religionOf = () => { const r = rnd(); return r < 0.8 ? "Islam" : r < 0.92 ? "Hindu" : r < 0.96 ? "Buddhist" : "Christian"; };
const BLOOD = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const teachers = [
  ["T01", "Md. Abdul Karim", "Assistant Teacher (Mathematics)"], ["T02", "Md. Nurul Islam", "Assistant Teacher (Bangla)"], ["T03", "Mrs. Farhana Yasmin", "Assistant Teacher (English)"],
  ["T04", "Mrs. Shirin Akter", "Senior Teacher (Science)"], ["T05", "Md. Rafiqul Hasan", "Assistant Teacher (Religion and Social Science)"], ["T06", "Mr. Kamal Hossain", "Assistant Teacher (ICT and Business Studies)"],
  ["T07", "Mrs. Nasrin Sultana", "Assistant Teacher (Life Skills)"], ["T08", "Md. Shahidul Alam", "Assistant Teacher (Humanities)"],
].map(([id, name, designation], i) => ({ id, name, designation, phone: `01711-0000${10 + i}`, email: `teacher${i + 1}@acps.edu.bd`, userId: `U-T${i + 1}` }));
write("teachers", teachers);
const TEACHER_OF = { "109": "T01", "126": "T01", P03: "T01", "101": "T02", "102": "T02", P01: "T02", "107": "T03", "108": "T03", P02: "T03", "136": "T04", "137": "T04", "138": "T04", "127": "T04", P04: "T04",
  "111": "T05", "112": "T05", "113": "T05", "114": "T05", "150": "T05", P05: "T05", P06: "T05", P07: "T05", P08: "T05", P09: "T05", "154": "T06", "146": "T06", "143": "T06", "152": "T06", "134": "T06",
  "147": "T07", M01: "T07", M02: "T07", CE: "T07", "153": "T08", "110": "T08", "141": "T08", "151": "T08" };

// ---------- students ----------
const students = [];
let sid = 260001;
const dobFor = (prog) => `${2026 - 5 - (PROGRAMS.indexOf(prog) + 1) - (rnd() < 0.5 ? 0 : 1)}-${String(1 + Math.floor(rnd() * 12)).padStart(2, "0")}-${String(1 + Math.floor(rnd() * 27)).padStart(2, "0")}`;
for (const prog of PROGRAMS) for (const version of VERSIONS) for (const section of SECTIONS) for (let r = 1; r <= 5; r++) {
  const female = rnd() < 0.45; const [fn, fnb] = pick(female ? FEMALE : MALE); const [sn, snb] = pick(SUR);
  const [fa] = pick(MALE); const [mo] = pick(FEMALE);
  let group = "General";
  if (prog === "IX" || prog === "X") group = section === "A" ? ["Science", "Science", "Science", "Commerce", "Arts"][r - 1] : ["Science", "Science", "Commerce", "Commerce", "Arts"][r - 1];
  const fourth = group === "Science" ? (rnd() < 0.7 ? "126" : "138") : group === "General" ? "" : (rnd() < 0.5 ? "134" : "151");
  students.push({
    id: String(sid++), roll: r, name: `Md. ${fn} ${sn}`.replace("Md. ", female ? "Mst. " : "Md. "), nameBn: `${female ? "মোছা." : "মো."} ${fnb} ${snb}`,
    program: prog, version, group, section, shift: section === "A" ? "Morning" : "Day", session: "2026", gender: female ? "Female" : "Male", religion: religionOf(),
    dob: dobFor(prog), father: `Md. ${fa} ${sn}`, mother: `Mst. ${mo} Begum`, guardianMobile: `01700-${String(100000 + students.length).slice(1)}`,
    address: `House ${1 + Math.floor(rnd() * 60)}, Road ${1 + Math.floor(rnd() * 12)}, Dhaka Cantonment, Dhaka-1206`,
    fourthSubject: fourth, passRule: "45", passRuleReason: "", status: "Active", custom: { cf_blood: pick(BLOOD), cf_scholarship: rnd() < 0.1 ? "Yes" : "No" },
    _ability: rnd() < 0.08 ? 0.36 + rnd() * 0.1 : 0.58 + rnd() * 0.38,
  });
}
// demo students (fixed ids so demo logins work)
const demoStudent = students.find((s) => s.program === "X" && s.version === "Bangla" && s.section === "A" && s.group === "Science");
const demoStudent2 = students.find((s) => s.program === "IX" && s.version === "Bangla" && s.section === "A" && s.group === "Science");
demoStudent.name = "Md. Rahim Uddin"; demoStudent.nameBn = "মো. রহিম উদ্দিন"; demoStudent.gender = "Male"; demoStudent.religion = "Islam"; demoStudent._ability = 0.82;
demoStudent2.name = "Mst. Nusrat Jahan"; demoStudent2.nameBn = "মোছা. নুসরাত জাহান"; demoStudent2.gender = "Female"; demoStudent2.religion = "Islam"; demoStudent2._ability = 0.7;
// two students on the special 33 rule (they would fail under 45)
const weak = students.filter((s) => s._ability < 0.47 && (s.program === "IX" || s.program === "VIII"));
weak.slice(0, 2).forEach((s) => { s.passRule = "33"; s.passRuleReason = "Approved by Exam Authority (demo)"; s._ability = 0.42; });
// alumni with SSC results
const alumni = [];
for (let i = 0; i < 6; i++) {
  const female = i % 2; const [fn] = pick(female ? FEMALE : MALE); const [sn] = pick(SUR);
  alumni.push({ id: String(250001 + i), roll: i + 1, name: `${female ? "Mst." : "Md."} ${fn} ${sn}`, nameBn: "", program: "X", version: "Bangla", group: ["Science", "Commerce", "Arts"][i % 3], section: "A", shift: "Morning", session: "2025",
    gender: female ? "Female" : "Male", religion: "Islam", dob: "2010-05-1" + i, father: `Md. ${pick(MALE)[0]} ${sn}`, mother: `Mst. ${pick(FEMALE)[0]} Begum`, guardianMobile: `01800-00000${i}`, address: "Dhaka Cantonment, Dhaka-1206",
    fourthSubject: "", passRule: "45", passRuleReason: "", status: "Passed Out", custom: { cf_blood: pick(BLOOD), cf_scholarship: "No" } });
}
write("students", [...students, ...alumni].map(({ _ability, ...s }) => s));

// ---------- users ----------
const user = (id, name, email, role, extra = {}) => ({ id, name, email, password: "Demo@123", role, status: "Active", avatarColor: pick(["#087A49", "#B01616", "#D6287B", "#C99A0E", "#06603A"]), ...extra });
write("users", [
  user("U-ITH", "Md. Anisur Rahman", "ithead@acps.edu.bd", "it_head"), user("U-ITA", "Mr. Sohel Rana", "itadmin@acps.edu.bd", "it_admin"),
  user("U-EXA", "Mr. Jahangir Alam", "examauthority@acps.edu.bd", "exam_authority"), user("U-PRI", "Lt Col Byzid Mohammad Tareq Junaed", "principal@acps.edu.bd", "principal"),
  user("U-VP", "Mrs. Rokeya Sultana", "vp@acps.edu.bd", "vice_principal"),
  ...teachers.map((t, i) => user(t.userId, t.name, t.email, "teacher", { teacherId: t.id })),
  user("U-S1", demoStudent.name, "student1@acps.edu.bd", "student", { studentId: demoStudent.id }), user("U-S2", demoStudent2.name, "student2@acps.edu.bd", "student", { studentId: demoStudent2.id }),
  user("U-P1", demoStudent.father, "parent1@acps.edu.bd", "parent", { studentId: demoStudent.id }),
]);

// ---------- batches (teacher <-> class/section/subject) ----------
const batches = []; let bn = 1;
const classSections = [];
for (const prog of PROGRAMS) for (const version of VERSIONS) for (const section of SECTIONS) classSections.push({ prog, version, section });
classSections.forEach((cs, i) => {
  const groups = [...new Set(students.filter((s) => s.program === cs.prog && s.version === cs.version && s.section === cs.section).map((s) => s.group))];
  const isDemoClass = cs.prog === "IX" && cs.version === "Bangla" && cs.section === "A";
  batches.push({ id: `B${bn++}`, teacherId: isDemoClass ? "T01" : teachers[(i + 1) % 8].id, program: cs.prog, version: cs.version, section: cs.section, group: "All", courseCode: "*", isClassTeacher: "Yes", canEnter: "Yes", grantUntil: "" });
  for (const g of groups) {
    const d = distributions.find((x) => x.programs.includes(cs.prog) && (x.group === "General" || x.group === g));
    const codes = [...new Set(d.courses.map((c) => c.code))];
    for (const code of codes) {
      const c = d.courses.find((x) => x.code === code);
      const studs = students.filter((s) => s.program === cs.prog && s.version === cs.version && s.section === cs.section && s.group === g);
      if (c.religion && !studs.some((s) => s.religion === c.religion)) continue;
      if (c.role === "fourthOnly" && !studs.some((s) => s.fourthSubject === code)) continue;
      batches.push({ id: `B${bn++}`, teacherId: TEACHER_OF[code], program: cs.prog, version: cs.version, section: cs.section, group: g, courseCode: code, isClassTeacher: "No", canEnter: "Yes", grantUntil: "" });
    }
  }
});
{ const g = batches.find((b) => b.teacherId === "T04" && b.courseCode === "136"); if (g) g.grantUntil = "2026-11-30"; }
writeFileSync(join(OUT, "batches.json"), JSON.stringify(batches));

// ---------- marks ----------
const ST = distributions;
const subjectRows = (s) => {
  const d = ST.find((x) => x.programs.includes(s.program) && (x.group === "General" || x.group === s.group));
  return d.courses.filter((c) => (!c.religion || c.religion === s.religion) && (c.role !== "fourthOnly" || c.code === s.fourthSubject));
};
const marks = [];
const genMarks = (examId, s, onlyCode) => {
  for (const c of subjectRows(s)) {
    if (onlyCode && c.code !== onlyCode) continue;
    const comps = {};
    for (const cp of c.components) comps[cp.key] = Math.round(clamp(s._ability + (rnd() - 0.5) * 0.24, 0.15, 1) * cp.exam * 2) / 2;
    let status = "";
    if (rnd() < 0.004 && c.components.length > 2) status = "AB";
    marks.push({ id: `${examId}|${s.id}|${c.code}`, examId, studentId: s.id, courseCode: c.code, comps: status ? Object.fromEntries(Object.keys(comps).map((x) => [x, 0])) : comps, status });
  }
};
const attendance = [];
const att = (examId, s, wd) => {
  const low = s._ability < 0.40 && rnd() < 0.6;
  const present = low ? Math.round(wd * 0.43) : Math.round(wd * (0.72 + rnd() * 0.27));
  attendance.push({ id: `${examId}|${s.id}`, examId, studentId: s.id, workingDays: wd, present, remarks: pick(["Good", "Good", "Satisfactory", "Excellent", "Need improvement"]) });
};
for (const s of students) {
  for (const key of ["first", "second"]) { genMarks(`2026-${key}`, s); att(`2026-${key}`, s, key === "first" ? 70 : 73); }
  if (s.program === "X") for (const key of ["pretest", "finaltest"]) { genMarks(`2026-${key}`, s); att(`2026-${key}`, s, key === "pretest" ? 68 : 72); }
}
// Final Term (entry open): one draft batch and one submitted batch
const submissions = [];
const draftStuds = students.filter((s) => s.program === "IX" && s.version === "Bangla" && s.section === "A");
draftStuds.forEach((s) => genMarks("2026-final", s, "109"));
const bDraft = batches.find((b) => b.program === "IX" && b.version === "Bangla" && b.section === "A" && b.courseCode === "109" && b.group === "Science");
submissions.push({ id: `2026-final|${bDraft.id}`, examId: "2026-final", batchId: bDraft.id, status: "draft", updatedAt: "2026-11-04" });
const bSub = batches.find((b) => b.program === "VI" && b.version === "Bangla" && b.section === "A" && b.courseCode === "109");
students.filter((s) => s.program === "VI" && s.version === "Bangla" && s.section === "A").forEach((s) => genMarks("2026-final", s, "109"));
submissions.push({ id: `2026-final|${bSub.id}`, examId: "2026-final", batchId: bSub.id, status: "submitted", updatedAt: "2026-11-05" });
writeFileSync(join(OUT, "marks.json"), JSON.stringify(marks));
write("submissions", submissions);
write("attendance", attendance);

// ---------- workflow samples ----------
write("extensions", [
  { id: "EXT-1", examId: "2026-final", teacherId: "T01", reason: "Class XI practical week clashed with marks entry; need more days.", days: 3, status: "requested", requestedAt: "2026-11-04", note: "" },
  { id: "EXT-2", examId: "2026-final", teacherId: "T04", reason: "Science fair preparation.", days: 2, status: "recommended", requestedAt: "2026-11-03", note: "Recommended by IT Head" },
]);
const m0 = marks.find((m) => m.examId === "2026-second" && m.studentId === demoStudent2.id && m.courseCode === "109");
write("corrections", [
  { id: "COR-1", examId: "2026-second", studentId: demoStudent2.id, courseCode: "109", component: "subj", oldValue: m0.comps.subj, newValue: Math.min(70, m0.comps.subj + 4), reason: "Addition mistake found while checking the answer script.", teacherId: "T01", itHeadApproved: "Yes", authorityApproved: "", status: "pending", createdAt: "2026-11-03" },
  { id: "COR-2", examId: "2026-first", studentId: demoStudent.id, courseCode: "109", component: "obj", oldValue: 20, newValue: 22, reason: "Objective sheet re-checked.", teacherId: "T01", itHeadApproved: "", authorityApproved: "", status: "pending", createdAt: "2026-11-05" },
]);
const weakStud = students.find((s) => s.passRule === "33");
write("grace", [
  { id: "GR-1", examId: "2026-second", studentId: demoStudent2.id, courseCode: "137", marks: 2, reason: "Marks within 2 of the pass mark.", status: "pending", createdAt: "2026-11-05" },
  { id: "GR-2", examId: "2026-second", studentId: (weakStud || demoStudent2).id, courseCode: "109", marks: 1, reason: "Approved by Exam Authority.", status: "approved", createdAt: "2026-08-05" },
]);
write("smsTemplates", [
  { id: "SMS-1", name: "Result published", text: "Dear Guardian, the {exam} result of {name} (Class {class}-{section}) is published. Please log in to view it. - ACPS" },
  { id: "SMS-2", name: "Low attendance", text: "Dear Guardian, {name} (Class {class}-{section}) has low attendance. Please contact the class teacher. - ACPS" },
  { id: "SMS-3", name: "Exam notice", text: "Dear Guardian, the {exam} of Class {class} will start soon. Please check the routine. - ACPS" },
]);
write("smsLog", [
  { id: "LOG-1", at: "2026-08-04 10:15", by: "Md. Anisur Rahman", audience: "Parent", program: "X", section: "A", count: 10, text: "Dear Guardian, the Second Term result is published." },
  { id: "LOG-2", at: "2026-09-30 09:40", by: "Mrs. Rokeya Sultana", audience: "Parent", program: "X", section: "B", count: 10, text: "Dear Guardian, the Pre-Test result is published." },
]);
write("tickets", [
  { id: "TK-1", title: "Cannot see Final Term entry page", details: "I am not able to open the entry page for Class IX Mathematics.", priority: "high", status: "open", createdBy: "Md. Abdul Karim", role: "teacher", createdAt: "2026-11-05", replies: [] },
  { id: "TK-2", title: "Student roll is wrong", details: "Roll of one student in Class VII-B is wrong.", priority: "normal", status: "in_progress", createdBy: "Mrs. Nasrin Sultana", role: "teacher", createdAt: "2026-11-02", replies: [{ by: "Mr. Sohel Rana", at: "2026-11-03", text: "We are checking it." }] },
  { id: "TK-3", title: "Download the result PDF", details: "How do I save my result as a PDF?", priority: "low", status: "resolved", createdBy: "Md. Rahim Uddin", role: "student", createdAt: "2026-10-20", replies: [{ by: "Mr. Sohel Rana", at: "2026-10-21", text: "Open your result and press Print, then choose Save as PDF." }] },
]);
write("audit", [
  { id: "AU-1", at: "2026-11-02 09:10", user: "Md. Anisur Rahman", role: "it_head", action: "update", entity: "exams", ref: "2026-final", detail: "Opened marks entry window" },
  { id: "AU-2", at: "2026-11-02 14:30", user: "Md. Anisur Rahman", role: "it_head", action: "update", entity: "exams", ref: "2026-finaltest", detail: "Sent to authority" },
  { id: "AU-3", at: "2026-11-03 11:05", user: "Md. Abdul Karim", role: "teacher", action: "create", entity: "corrections", ref: "COR-1", detail: "Correction requested" },
  { id: "AU-4", at: "2026-11-05 16:20", user: "Md. Abdul Karim", role: "teacher", action: "update", entity: "submissions", ref: "2026-final", detail: "Draft saved" },
]);
write("boardResults", alumni.map((a, i) => ({
  id: `BR-${i + 1}`, studentId: a.id, roll: 100200 + i, registration: `20180${9000 + i}`, year: "2025", group: a.group, gpa: [5, 4.72, 4.33, 3.89, 4.11, 5][i], status: "Passed",
  subjects: [{ code: "101", name: "Bangla", letter: "A+", gp: 5 }, { code: "107", name: "English", letter: "A", gp: 4 }, { code: "109", name: "Mathematics", letter: "A+", gp: 5 }, { code: "154", name: "ICT", letter: "A+", gp: 5 }],
})));

// ---------- customisation ----------
write("labels", [
  { id: "students.title", text: "Students" },
  { id: "nav.dashboard", text: "Dashboard" },
]);
write("customFields", [
  { id: "CF-1", entity: "students", key: "cf_blood", label: "Blood group", type: "select", options: BLOOD.join(","), required: "No" },
  { id: "CF-2", entity: "students", key: "cf_scholarship", label: "Scholarship", type: "yesno", options: "", required: "No" },
  { id: "CF-3", entity: "teachers", key: "cf_joined", label: "Joining date", type: "date", options: "", required: "No" },
]);
write("settings", [{
  id: "main", schoolName: "Adamjee Cantonment Public School", schoolNameBn: "আদমজী ক্যান্টনমেন্ট পাবলিক স্কুল", address: "Dhaka Cantonment, Dhaka-1206", phone: "02-9834876", website: "www.acps.edu.bd", email: "info@acps.edu.bd",
  principalName: "Lt Col Byzid Mohammad Tareq Junaed", currentSession: "2026", officePhone: "02-9834876", smsGateway: "Not connected yet (messages are saved in the SMS log)", checklist: {},
}]);
write("yearEnd", [{ id: "YE-2025", session: "2025", status: "rolled", preparedAt: "2025-12-20", approvedBy: "Lt Col Byzid Mohammad Tareq Junaed", note: "Last year's rollover (sample)." }]);

// ---------- permissions ----------
const ROLE_KEYS = ["it_head", "it_admin", "exam_authority", "principal", "vice_principal", "teacher", "student", "parent"];
const P = (key, label, flags) => ({ id: key, key, label, roles: Object.fromEntries(ROLE_KEYS.map((r, i) => [r, flags[i] === "Y"])) });
write("permissions", [
  P("setup.manage", "Setup (class, course, mark distribution, grades, exam schemes)", "Y-------"), P("customize.manage", "Rules, formulas, labels and custom fields", "Y-------"),
  P("users.manage", "Users and teachers", "Y-------"), P("permissions.manage", "Grant or revoke permissions", "Y-------"), P("batches.manage", "Teacher batch assignment", "Y-------"),
  P("students.manage", "Students, import and curriculum", "Y-------"), P("entry.window", "Open, close and set marks entry window", "Y-------"),
  P("extension.request", "Ask for more entry time", "-----Y--"), P("extension.recommend", "Recommend an extension", "Y-------"), P("extension.approve", "Approve an extension", "---Y----"),
  P("entry.marks", "Enter marks", "-----Y--"), P("attendance.entry", "Attendance and remarks (class teacher)", "-----Y--"), P("correction.request", "Ask for a marks correction", "-----Y--"),
  P("correction.approve", "Approve a marks correction", "Y-Y-----"), P("passrule.set", "Switch a student to the 33 pass rule", "Y-------"), P("grace.entry", "Enter grace marks", "Y-------"),
  P("grace.approve", "Approve grace marks", "--Y-----"), P("calc.run", "Run calculation", "Y-------"), P("results.verify", "Verify and send to authority", "Y-------"),
  P("results.review", "Review results (VP / Principal)", "---YY---"), P("results.sign", "Sign results (Principal)", "---Y----"), P("results.publish", "Publish results", "Y-------"),
  P("results.view", "View results", "YYYYYYYY"), P("reports.view", "Reports", "Y-YYYY--"), P("sms.send", "Send SMS", "Y--Y-Y--"),
  P("support.create", "Create a support ticket", "YYYYYYYY"), P("support.manage", "Manage support tickets", "YY------"), P("audit.view", "View audit log", "YYYY----"),
  P("yearend.prepare", "Prepare year-end promotion", "Y-------"), P("yearend.approve", "Approve year-end rollover", "---Y----"), P("board.manage", "SSC board results", "Y-Y-----"),
]);
console.log("Seed written:", { students: students.length + alumni.length, marks: marks.length, batches: batches.length, attendance: attendance.length });
