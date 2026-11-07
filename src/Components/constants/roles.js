export const ROLES = {
  IT_HEAD: "it_head", IT_ADMIN: "it_admin", EXAM_AUTHORITY: "exam_authority", PRINCIPAL: "principal",
  VICE_PRINCIPAL: "vice_principal", TEACHER: "teacher", STUDENT: "student", PARENT: "parent",
};
export const ROLE_LABELS = {
  it_head: "IT Head", it_admin: "IT Admin", exam_authority: "Exam Authority", principal: "Principal",
  vice_principal: "Vice Principal", teacher: "Teacher", student: "Student", parent: "Parent",
};
export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));
export const ROLE_HOME_ROUTE = {
  it_head: "/app/it-head/dashboard", it_admin: "/app/it-head/dashboard", exam_authority: "/app/authority/dashboard",
  principal: "/app/authority/dashboard", vice_principal: "/app/authority/dashboard", teacher: "/app/teacher/dashboard",
  student: "/app/student/dashboard", parent: "/app/student/dashboard",
};
export const MODULE_ROLES = {
  itHead: [ROLES.IT_HEAD, ROLES.IT_ADMIN],
  authority: [ROLES.EXAM_AUTHORITY, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL],
  teacher: [ROLES.TEACHER],
  student: [ROLES.STUDENT, ROLES.PARENT],
};
