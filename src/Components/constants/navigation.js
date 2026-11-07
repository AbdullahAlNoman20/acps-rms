// Sidebar menus. Add a line here (and a route in the module's *Routes.jsx) to add a page.
// perm: item is shown only if the role has this permission (IT Head can change permissions).
import {
  FiHome, FiGrid, FiBookOpen, FiUsers, FiUser, FiSettings, FiSliders, FiFileText, FiCheckSquare, FiClock, FiMessageSquare, FiBarChart2, FiAward,
  FiLayers, FiEdit3, FiTag, FiShield, FiDatabase, FiUpload, FiSend, FiLifeBuoy, FiActivity, FiPercent, FiList, FiRepeat, FiCheckCircle,
  FiTrendingUp, FiClipboard, FiLock, FiPhone, FiEye, FiUserCheck, FiCalendar, FiFlag,
} from "react-icons/fi";

const common = (extra = {}) => ({ to: "support", label: "Support tickets", icon: FiLifeBuoy, ...extra });

export const NAV = {
  itHead: [
    { group: null, items: [{ to: "dashboard", label: "Dashboard", icon: FiHome }] },
    { group: "Exams and results", items: [
      { to: "exams", label: "Exams (step by step)", icon: FiClipboard, perm: "results.view" }, { to: "results", label: "Results", icon: FiAward, perm: "results.view" },
      { to: "reports", label: "Reports", icon: FiBarChart2, perm: "reports.view" }, { to: "ssc", label: "Class X and SSC", icon: FiFlag, perm: "board.manage" },
      { to: "year-end", label: "Year-end promotion", icon: FiTrendingUp, perm: "yearend.prepare" } ] },
    { group: "Approvals", items: [
      { to: "extensions", label: "Time extensions", icon: FiClock, perm: "extension.recommend" }, { to: "corrections", label: "Marks corrections", icon: FiEdit3, perm: "correction.approve" },
      { to: "grace", label: "Grace marks", icon: FiPercent, perm: "grace.entry" }, { to: "special-pass", label: "Special pass (33)", icon: FiCheckCircle, perm: "passrule.set" } ] },
    { group: "People", items: [
      { to: "data/students", label: "Students", icon: FiUsers, perm: "students.manage" }, { to: "students/import", label: "Import students", icon: FiUpload, perm: "students.manage" },
      { to: "students/curriculum", label: "Assign 4th subject", icon: FiLayers, perm: "students.manage" }, { to: "data/teachers", label: "Teachers", icon: FiUser, perm: "users.manage" },
      { to: "data/batches", label: "Teacher batches", icon: FiUserCheck, perm: "batches.manage" }, { to: "data/users", label: "Users", icon: FiUsers, perm: "users.manage" },
      { to: "permissions", label: "Permissions", icon: FiLock, perm: "permissions.manage" } ] },
    { group: "Setup", items: [
      { to: "data/examSchemes", label: "Exam schemes", icon: FiCalendar, perm: "setup.manage" }, { to: "data/markDistributions", label: "Mark distribution", icon: FiGrid, perm: "setup.manage" },
      { to: "data/curriculum", label: "Curriculum", icon: FiBookOpen, perm: "setup.manage" }, { to: "data/courses", label: "Courses", icon: FiList, perm: "setup.manage" },
      { to: "data/gradeTables", label: "Grade tables", icon: FiAward, perm: "setup.manage" }, { to: "setup", label: "Other lists", icon: FiDatabase, perm: "setup.manage" } ] },
    { group: "Customize", items: [
      { to: "rules", label: "Rules and formulas", icon: FiSliders, perm: "customize.manage" }, { to: "labels", label: "Names and labels", icon: FiTag, perm: "customize.manage" },
      { to: "data/customFields", label: "Custom fields", icon: FiLayers, perm: "customize.manage" } ] },
    { group: "Communicate", items: [{ to: "sms", label: "SMS", icon: FiSend, perm: "sms.send" }, common()] },
    { group: "System", items: [{ to: "audit", label: "Audit log", icon: FiActivity, perm: "audit.view" }, { to: "settings", label: "Settings and backup", icon: FiSettings }] },
  ],
  teacher: [
    { group: null, items: [{ to: "dashboard", label: "Dashboard", icon: FiHome }] },
    { group: "My work", items: [
      { to: "entry", label: "Enter marks", icon: FiEdit3, perm: "entry.marks" }, { to: "attendance", label: "Attendance and remarks", icon: FiCheckSquare, perm: "attendance.entry" },
      { to: "extension", label: "Ask for more time", icon: FiClock, perm: "extension.request" }, { to: "corrections", label: "Marks correction", icon: FiRepeat, perm: "correction.request" } ] },
    { group: "My class", items: [{ to: "my-class", label: "Class results", icon: FiAward, perm: "results.view" }, { to: "reports", label: "Reports", icon: FiBarChart2, perm: "reports.view" }, { to: "sms", label: "SMS to parents", icon: FiSend, perm: "sms.send" }] },
    { group: "Help", items: [common(), { to: "settings", label: "My profile", icon: FiSettings }] },
  ],
  authority: [
    { group: null, items: [{ to: "dashboard", label: "Dashboard", icon: FiHome }] },
    { group: "Check and sign", items: [
      { to: "exams", label: "Exams to review", icon: FiClipboard, perm: "results.view" }, { to: "results", label: "Results", icon: FiAward, perm: "results.view" },
      { to: "reports", label: "Reports", icon: FiBarChart2, perm: "reports.view" }, { to: "ssc", label: "Class X and SSC", icon: FiFlag, perm: "board.manage" } ] },
    { group: "Approvals", items: [
      { to: "extensions", label: "Time extensions", icon: FiClock, perm: "extension.approve" }, { to: "corrections", label: "Marks corrections", icon: FiEdit3, perm: "correction.approve" },
      { to: "grace", label: "Grace marks", icon: FiPercent, perm: "grace.approve" }, { to: "special-pass", label: "Special pass (33)", icon: FiCheckCircle, perm: "results.view" },
      { to: "year-end", label: "Year-end rollover", icon: FiTrendingUp, perm: "yearend.approve" } ] },
    { group: "Other", items: [{ to: "sms", label: "SMS", icon: FiSend, perm: "sms.send" }, { to: "audit", label: "Audit log", icon: FiActivity, perm: "audit.view" }, common(), { to: "settings", label: "My profile", icon: FiSettings }] },
  ],
  student: [
    { group: null, items: [{ to: "dashboard", label: "Dashboard", icon: FiHome }] },
    { group: "My result", items: [{ to: "results", label: "Results", icon: FiAward }, { to: "ssc", label: "SSC result", icon: FiFlag }] },
    { group: "Help", items: [{ to: "contact", label: "Call school", icon: FiPhone }, common(), { to: "settings", label: "My profile", icon: FiSettings }] },
  ],
};
