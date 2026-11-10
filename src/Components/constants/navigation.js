// Menus. Names and icons come from config/brand.js, so renaming a feature there renames the menu too.
// item: { feature, to, perm?, label? }.  perm can be "a|b" (any of them).
const it = (feature, to, perm, label) => ({ feature, to, perm, label });
const HOME = it("home", "dashboard");

export const NAV = {
  itHead: [
    { group: null, items: [HOME] },
    { group: "Exams", items: [it("examJourney", "exams", "results.view"), it("resultBoard", "results", "results.view"), it("reportShelf", "reports", "reports.view"), it("sscPathway", "ssc", "board.manage"), it("promotionDesk", "year-end", "yearend.prepare")] },
    { group: "School", items: [it("classExplorer", "classes", "results.view"), it("studentBook", "data/students", "students.manage"), it("teacherDesk", "teachers", "users.manage"), it("teacherPlanner", "planner", "batches.manage")] },
    { group: "Manage", items: [it("approvals", "approvals", "extension.recommend"), it("setupCenter", "setup", "setup.manage"), it("customizeCenter", "customize", "customize.manage"), it("easyImport", "students/import", "students.manage")] },
    { group: "Help", items: [it("helpDesk", "support"), it("howTo", "guide"), it("futurePlan", "future", "customize.manage")] },
    { group: "System", items: [it("changeTrail", "audit", "audit.view"), it("safeBox", "settings")] },
  ],
  teacher: [
    { group: null, items: [HOME] },
    { group: "My work", items: [it("marksDesk", "entry", "entry.marks"), it("attendanceBook", "attendance", "attendance.entry"), it("extraTime", "extension", "extension.request"), it("correctionDesk", "corrections", "correction.request")] },
    { group: "My school", items: [it("classExplorer", "classes", "results.view"), it("resultBoard", "my-class", "results.view", "Class Results"), it("reportShelf", "reports", "reports.view"), it("parentConnect", "sms", "sms.send")] },
    { group: "Help", items: [it("helpDesk", "support"), it("howTo", "guide"), it("safeBox", "settings", null, "My Profile")] },
  ],
  authority: [
    { group: null, items: [HOME] },
    { group: "Exams", items: [it("examJourney", "exams", "results.view"), it("resultBoard", "results", "results.view"), it("reportShelf", "reports", "reports.view"), it("sscPathway", "ssc", "board.manage")] },
    { group: "School", items: [it("classExplorer", "classes", "results.view"), it("parentConnect", "sms", "sms.send")] },
    { group: "Decide", items: [it("approvals", "approvals"), it("promotionDesk", "year-end", "yearend.approve")] },
    { group: "Help", items: [it("helpDesk", "support"), it("howTo", "guide"), it("changeTrail", "audit", "audit.view"), it("safeBox", "settings", null, "My Profile")] },
  ],
  student: [
    { group: null, items: [HOME] },
    { group: "Me", items: [it("myResults", "results"), it("sscPathway", "ssc", null, "SSC Result"), it("callSchool", "contact")] },
    { group: "Help", items: [it("helpDesk", "support"), it("howTo", "guide"), it("safeBox", "settings", null, "My Profile")] },
  ],
};

// Phone bottom bar: the four things people use most (+ a Menu button added by the layout).
export const BOTTOM = {
  itHead: [HOME, it("examJourney", "exams"), it("resultBoard", "results"), it("classExplorer", "classes")],
  teacher: [HOME, it("marksDesk", "entry"), it("attendanceBook", "attendance"), it("classExplorer", "classes")],
  authority: [HOME, it("examJourney", "exams"), it("approvals", "approvals"), it("resultBoard", "results")],
  student: [HOME, it("myResults", "results"), it("callSchool", "contact"), it("helpDesk", "support")],
};
